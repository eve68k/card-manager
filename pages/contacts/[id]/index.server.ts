import { HTTPException } from "hono/http-exception";
import { defineHandler, defineHead, type InferProps } from "void";
import type { PageParams } from "void/routes";
import { deleteContact, getContact } from "../../../src/repository";
import { idParamSchema } from "../../../src/schemas";

export type Props = InferProps<typeof loader>;

function contactId(params: PageParams<"/contacts/[id]">): number {
  const parsed = idParamSchema.safeParse(params.id);
  if (!parsed.success) throw new HTTPException(404);
  return parsed.data;
}

export const loader = defineHandler(async (c) => {
  const contact = await getContact(contactId(c.req.param() as PageParams<"/contacts/[id]">));
  if (!contact) throw new HTTPException(404);
  return { contact };
});

export const actions = {
  delete: defineHandler(async (c) => {
    await deleteContact(contactId(c.req.param() as PageParams<"/contacts/[id]">));
    return c.redirect("/");
  }),
};

export const head = defineHead<Props>((_c, props) => ({ title: props.contact.name }));
