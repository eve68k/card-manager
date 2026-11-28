import { defineHandler, defineHead, type InferProps } from "void";
import { routeUrl } from "void/routes";
import { createContact, listEvents } from "../../src/repository";
import { contactInputSchema } from "../../src/schemas";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  return { events: await listEvents() };
});

export const action = defineHandler.withValidator({
  body: contactInputSchema,
})(async (c, { body }) => {
  const id = await createContact(body);
  return c.redirect(routeUrl("/contacts/[id]", { params: { id } }));
});

export const head = defineHead(() => ({ title: "人物を追加" }));
