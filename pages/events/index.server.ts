import { defineHandler, defineHead, type InferProps } from "void";
import { createEvent, listEvents } from "../../src/repository";
import { eventInputSchema } from "../../src/schemas";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  return { events: await listEvents() };
});

export const action = defineHandler.withValidator({
  body: eventInputSchema,
})(async (_c, { body }) => {
  await createEvent(body);
});

export const head = defineHead(() => ({ title: "イベント" }));
