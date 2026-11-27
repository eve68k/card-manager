import { contactEvents, contacts, contactTags, events, socialLinks, tags } from "@schema";
import {
  and,
  asc,
  type BatchItem,
  count,
  db,
  desc,
  eq,
  exists,
  inArray,
  or,
  sql,
  type SQL,
  type SQLWrapper,
} from "void/db";
import type { ContactInput, ContactSearch, EventInput } from "./schemas";
import { normalizeHandle } from "./social";
import { parseTags } from "./tags";

// D1 はひとつの文で束縛できる値が 100 個までなので、IN 句に渡す ID はこの単位で分けて問い合わせる
const MAX_BOUND_PARAMS = 90;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function contains(column: SQLWrapper, keyword: string): SQL {
  return sql`${column} LIKE ${`%${escapeLike(keyword)}%`} ESCAPE '\\'`;
}

async function runBatch(statements: BatchItem<"sqlite">[]): Promise<void> {
  const [first, ...rest] = statements;
  if (first) await db.batch([first, ...rest]);
}

// ---- contacts ----

export type ContactSummary = Awaited<ReturnType<typeof listContacts>>[number];

export async function listContacts(search: ContactSearch) {
  const conditions: SQL[] = [];

  if (search.q) {
    const keywords = search.q.split(/\s+/).filter(Boolean);
    for (const keyword of keywords) {
      const matched = or(
        contains(contacts.name, keyword),
        contains(contacts.affiliation, keyword),
        contains(contacts.memo, keyword),
        exists(
          db
            .select({ one: sql`1` })
            .from(contactTags)
            .innerJoin(tags, eq(tags.id, contactTags.tagId))
            .where(and(eq(contactTags.contactId, contacts.id), contains(tags.name, keyword))),
        ),
        exists(
          db
            .select({ one: sql`1` })
            .from(socialLinks)
            .where(
              and(eq(socialLinks.contactId, contacts.id), contains(socialLinks.handle, keyword)),
            ),
        ),
        exists(
          db
            .select({ one: sql`1` })
            .from(contactEvents)
            .innerJoin(events, eq(events.id, contactEvents.eventId))
            .where(and(eq(contactEvents.contactId, contacts.id), contains(events.name, keyword))),
        ),
      );
      if (matched) conditions.push(matched);
    }
  }

  if (search.tag) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(contactTags)
          .innerJoin(tags, eq(tags.id, contactTags.tagId))
          .where(and(eq(contactTags.contactId, contacts.id), eq(tags.name, search.tag))),
      ),
    );
  }

  if (search.event) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(contactEvents)
          .where(
            and(eq(contactEvents.contactId, contacts.id), eq(contactEvents.eventId, search.event)),
          ),
      ),
    );
  }

  const rows = await db
    .select({ id: contacts.id, name: contacts.name, affiliation: contacts.affiliation })
    .from(contacts)
    .where(and(...conditions))
    .orderBy(desc(contacts.updatedAt), desc(contacts.id));

  const tagsByContact = new Map<number, string[]>();
  const eventsByContact = new Map<number, string[]>();
  for (const ids of chunk(
    rows.map((r) => r.id),
    MAX_BOUND_PARAMS,
  )) {
    const [tagRows, eventRows] = await Promise.all([
      db
        .select({ contactId: contactTags.contactId, name: tags.name })
        .from(contactTags)
        .innerJoin(tags, eq(tags.id, contactTags.tagId))
        .where(inArray(contactTags.contactId, ids))
        .orderBy(asc(tags.name)),
      db
        .select({ contactId: contactEvents.contactId, name: events.name })
        .from(contactEvents)
        .innerJoin(events, eq(events.id, contactEvents.eventId))
        .where(inArray(contactEvents.contactId, ids))
        .orderBy(sql`${events.date} IS NULL`, desc(events.date), desc(events.id)),
    ]);
    for (const { contactId, name } of tagRows) {
      tagsByContact.set(contactId, [...(tagsByContact.get(contactId) ?? []), name]);
    }
    for (const { contactId, name } of eventRows) {
      eventsByContact.set(contactId, [...(eventsByContact.get(contactId) ?? []), name]);
    }
  }

  return rows.map((row) => ({
    ...row,
    tags: tagsByContact.get(row.id) ?? [],
    events: eventsByContact.get(row.id) ?? [],
  }));
}

export async function getContact(id: number) {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
  if (!contact) return null;

  const [tagRows, eventRows, linkRows] = await Promise.all([
    db
      .select({ name: tags.name })
      .from(contactTags)
      .innerJoin(tags, eq(tags.id, contactTags.tagId))
      .where(eq(contactTags.contactId, id))
      .orderBy(asc(tags.name)),
    db
      .select({ id: events.id, name: events.name, date: events.date, place: events.place })
      .from(contactEvents)
      .innerJoin(events, eq(events.id, contactEvents.eventId))
      .where(eq(contactEvents.contactId, id))
      .orderBy(sql`${events.date} IS NULL`, desc(events.date), desc(events.id)),
    db
      .select({ service: socialLinks.service, handle: socialLinks.handle })
      .from(socialLinks)
      .where(eq(socialLinks.contactId, id))
      .orderBy(asc(socialLinks.id)),
  ]);

  return {
    ...contact,
    tags: tagRows.map((t) => t.name),
    events: eventRows,
    socialLinks: linkRows,
  };
}

async function ensureTagIds(names: readonly string[]): Promise<number[]> {
  if (names.length === 0) return [];
  const ids: number[] = [];
  for (const part of chunk(names, MAX_BOUND_PARAMS)) {
    await db
      .insert(tags)
      .values(part.map((name) => ({ name })))
      .onConflictDoNothing();
    const rows = await db.select({ id: tags.id }).from(tags).where(inArray(tags.name, part));
    ids.push(...rows.map((r) => r.id));
  }
  return ids;
}

/** 存在しないイベント ID が混ざっていると外部キー制約で一括書き込みごと失敗するため、先に絞り込む */
async function existingEventIds(ids: readonly number[]): Promise<number[]> {
  const unique = [...new Set(ids)];
  const result: number[] = [];
  for (const part of chunk(unique, MAX_BOUND_PARAMS)) {
    const rows = await db.select({ id: events.id }).from(events).where(inArray(events.id, part));
    result.push(...rows.map((r) => r.id));
  }
  return result;
}

function relationStatements(
  contactId: number,
  input: ContactInput,
  tagIds: readonly number[],
  eventIds: readonly number[],
): BatchItem<"sqlite">[] {
  const statements: BatchItem<"sqlite">[] = [];
  const links = input.socialLinks
    .map((link) => ({ service: link.service, handle: normalizeHandle(link.service, link.handle) }))
    .filter((link) => link.handle !== "");

  // 1 行につき 2 個の値を束縛するので、行数は上限の半分ずつに分ける
  for (const part of chunk(tagIds, MAX_BOUND_PARAMS / 2)) {
    statements.push(db.insert(contactTags).values(part.map((tagId) => ({ contactId, tagId }))));
  }
  for (const part of chunk(eventIds, MAX_BOUND_PARAMS / 2)) {
    statements.push(
      db.insert(contactEvents).values(part.map((eventId) => ({ contactId, eventId }))),
    );
  }
  if (links.length > 0) {
    statements.push(db.insert(socialLinks).values(links.map((link) => ({ contactId, ...link }))));
  }
  return statements;
}

export async function createContact(input: ContactInput): Promise<number> {
  const [tagIds, eventIds] = await Promise.all([
    ensureTagIds(parseTags(input.tags)),
    existingEventIds(input.eventIds),
  ]);
  const [created] = await db
    .insert(contacts)
    .values({ name: input.name, affiliation: input.affiliation, memo: input.memo })
    .returning({ id: contacts.id });
  if (!created) throw new Error("Failed to insert contact");

  await runBatch(relationStatements(created.id, input, tagIds, eventIds));
  return created.id;
}

export async function updateContact(id: number, input: ContactInput): Promise<boolean> {
  const [tagIds, eventIds] = await Promise.all([
    ensureTagIds(parseTags(input.tags)),
    existingEventIds(input.eventIds),
  ]);
  const [updated] = await db
    .update(contacts)
    .set({
      name: input.name,
      affiliation: input.affiliation,
      memo: input.memo,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id });
  if (!updated) return false;

  // 差分更新より全件入れ替えのほうが単純で、1 人あたりの関連は高々数十件なので十分速い
  await runBatch([
    db.delete(contactTags).where(eq(contactTags.contactId, id)),
    db.delete(contactEvents).where(eq(contactEvents.contactId, id)),
    db.delete(socialLinks).where(eq(socialLinks.contactId, id)),
    ...relationStatements(id, input, tagIds, eventIds),
  ]);
  await deleteUnusedTags();
  return true;
}

export async function deleteContact(id: number): Promise<void> {
  await db.delete(contacts).where(eq(contacts.id, id));
  await deleteUnusedTags();
}

async function deleteUnusedTags(): Promise<void> {
  await db
    .delete(tags)
    .where(sql`NOT EXISTS (SELECT 1 FROM ${contactTags} WHERE ${contactTags.tagId} = ${tags.id})`);
}

export async function listTags() {
  return db
    .select({ name: tags.name, count: count(contactTags.contactId) })
    .from(tags)
    .innerJoin(contactTags, eq(contactTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(desc(count(contactTags.contactId)), asc(tags.name));
}

// ---- events ----

export async function listEvents() {
  return db
    .select({
      id: events.id,
      name: events.name,
      date: events.date,
      place: events.place,
      contactCount: count(contactEvents.contactId),
    })
    .from(events)
    .leftJoin(contactEvents, eq(contactEvents.eventId, events.id))
    .groupBy(events.id)
    .orderBy(sql`${events.date} IS NULL`, desc(events.date), desc(events.id));
}

export async function getEvent(id: number) {
  const [event] = await db.select().from(events).where(eq(events.id, id));
  if (!event) return null;
  return event;
}

export async function createEvent(input: EventInput): Promise<number> {
  const [created] = await db.insert(events).values(input).returning({ id: events.id });
  if (!created) throw new Error("Failed to insert event");
  return created.id;
}

export async function updateEvent(id: number, input: EventInput): Promise<boolean> {
  const [updated] = await db
    .update(events)
    .set({ ...input, updatedAt: sql`(datetime('now'))` })
    .where(eq(events.id, id))
    .returning({ id: events.id });
  return updated !== undefined;
}

export async function deleteEvent(id: number): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
}
