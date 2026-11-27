import { defineHandler, defineHead, type InferProps } from "void";
import { routeUrl } from "void/routes";
import { z } from "zod";
import { createContact, listEvents } from "../../src/repository";
import { contactInputSchema } from "../../src/schemas";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler.withValidator({
  // イベント詳細の「この会で出会った人を追加」から来たときに、そのイベントを選択済みにする
  query: z.object({ event: z.coerce.number().int().positive().optional() }),
})(async (_c, { query }) => {
  const events = await listEvents();
  const preselected = events.some((e) => e.id === query.event) ? query.event : undefined;
  return { events, preselectedEventId: preselected ?? null };
});

export const action = defineHandler.withValidator({
  body: contactInputSchema,
})(async (c, { body }) => {
  const id = await createContact(body);
  return c.redirect(routeUrl("/contacts/[id]", { params: { id } }));
});

export const head = defineHead(() => ({ title: "人物を追加" }));
