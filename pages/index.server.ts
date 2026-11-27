import { defineHandler, defineHead, type InferProps } from "void";
import { getEvent, listContacts, listTags } from "../src/repository";
import { contactSearchSchema } from "../src/schemas";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler.withValidator({
  query: contactSearchSchema,
})(async (_c, { query }) => {
  const [contacts, tags, event] = await Promise.all([
    listContacts(query),
    listTags(),
    query.event ? getEvent(query.event) : null,
  ]);
  return { contacts, tags, search: query, event };
});

export const head = defineHead(() => ({ title: "人物" }));
