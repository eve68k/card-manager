import { defineHandler, defineHead, type InferProps } from "void";
import { routeUrl } from "void/routes";
import { createEvent, listEvents } from "../../src/repository";
import { eventInputSchema } from "../../src/schemas";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  return { events: await listEvents() };
});

export const action = defineHandler.withValidator({
  body: eventInputSchema,
})(async (c, { body }) => {
  const id = await createEvent(body);
  return c.redirect(routeUrl("/events/[id]", { params: { id } }));
});

export const head = defineHead(() => ({ title: "イベント" }));
