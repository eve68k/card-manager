import { HTTPException } from "hono/http-exception";
import { defineHandler, defineHead, type InferProps } from "void";
import { type PageParams, routeUrl } from "void/routes";
import { getContact, listEvents, updateContact } from "../../../src/repository";
import { contactInputSchema, idParamSchema } from "../../../src/schemas";
import { formatTags } from "../../../src/tags";

export type Props = InferProps<typeof loader>;

function contactId(params: PageParams<"/contacts/[id]/edit">): number {
  const parsed = idParamSchema.safeParse(params.id);
  if (!parsed.success) throw new HTTPException(404);
  return parsed.data;
}

export const loader = defineHandler(async (c) => {
  const id = contactId(c.req.param() as PageParams<"/contacts/[id]/edit">);
  const [contact, events] = await Promise.all([getContact(id), listEvents()]);
  if (!contact) throw new HTTPException(404);
  return {
    id,
    events,
    initial: {
      name: contact.name,
      affiliation: contact.affiliation,
      memo: contact.memo,
      tags: formatTags(contact.tags),
      eventIds: contact.events.map((e) => e.id),
      socialLinks: contact.socialLinks,
    },
  };
});

export const action = defineHandler.withValidator({
  body: contactInputSchema,
})(async (c, { body }) => {
  const id = contactId(c.req.param() as PageParams<"/contacts/[id]/edit">);
  if (!(await updateContact(id, body))) throw new HTTPException(404);
  return c.redirect(routeUrl("/contacts/[id]", { params: { id } }));
});

export const head = defineHead<Props>((_c, props) => ({ title: `${props.initial.name} を編集` }));
