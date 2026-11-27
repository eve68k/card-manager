import { sql } from "void/db";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "void/schema-d1";

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
};

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  affiliation: text("affiliation").notNull().default(""),
  memo: text("memo").notNull().default(""),
  ...timestamps,
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // 日付だけ扱えれば十分で、タイムゾーン変換による日付ずれを避けたいので YYYY-MM-DD 文字列で持つ
  date: text("date"),
  place: text("place").notNull().default(""),
  ...timestamps,
});

export const contactEvents = sqliteTable(
  "contact_events",
  {
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.contactId, t.eventId] }),
    index("contact_events_event_idx").on(t.eventId),
  ],
);

export const socialLinks = sqliteTable(
  "social_links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    service: text("service").notNull(),
    handle: text("handle").notNull(),
  },
  (t) => [index("social_links_contact_idx").on(t.contactId)],
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("tags_name_idx").on(t.name)],
);

export const contactTags = sqliteTable(
  "contact_tags",
  {
    contactId: integer("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.contactId, t.tagId] }),
    index("contact_tags_tag_idx").on(t.tagId),
  ],
);
