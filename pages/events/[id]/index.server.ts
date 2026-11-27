import { HTTPException } from "hono/http-exception";
import { defineHandler, defineHead, type InferProps } from "void";
import type { PageParams } from "void/routes";
import { deleteEvent, getEvent, listContacts, updateEvent } from "../../../src/repository";
import { eventInputSchema, idParamSchema } from "../../../src/schemas";

export type Props = InferProps<typeof loader>;

function eventId(params: PageParams<"/events/[id]">): number {
  const parsed = idParamSchema.safeParse(params.id);
  if (!parsed.success) throw new HTTPException(404);
  return parsed.data;
}

export const loader = defineHandler(async (c) => {
  const id = eventId(c.req.param() as PageParams<"/events/[id]">);
  const [event, contacts] = await Promise.all([getEvent(id), listContacts({ event: id })]);
  if (!event) throw new HTTPException(404);
  return { event, contacts };
});

export const actions = {
  update: defineHandler.withValidator({
    body: eventInputSchema,
  })(async (c, { body }) => {
    const id = eventId(c.req.param() as PageParams<"/events/[id]">);
    if (!(await updateEvent(id, body))) throw new HTTPException(404);
  }),

  // イベントを消しても人物は残し、紐づけだけが外れる
  delete: defineHandler(async (c) => {
    await deleteEvent(eventId(c.req.param() as PageParams<"/events/[id]">));
    return c.redirect("/events");
  }),
};

export const head = defineHead<Props>((_c, props) => ({ title: props.event.name }));
