import { Form, Link, useForm } from "@void/react";
import { routeUrl } from "void/routes";
import { ContactFields, type ContactFormData } from "../../../src/components/ContactFields";
import { isSocialService } from "../../../src/social";
import type { Props } from "./edit.server";

export default function EditContactPage({ id, events, initial }: Props) {
  const initialData: ContactFormData = {
    ...initial,
    // 保存済みの値は登録時に検証済みだが、サービスの一覧から外したものが残っていても編集画面を壊さないよう除く
    socialLinks: initial.socialLinks.flatMap((link) =>
      isSocialService(link.service) ? [{ service: link.service, handle: link.handle }] : [],
    ),
  };
  const form = useForm("/contacts/[id]/edit", initialData, { params: { id: String(id) } });

  return (
    <>
      <h1>{initial.name} を編集</h1>
      <Form form={form} className="form">
        <ContactFields
          data={form.data}
          errors={form.errors}
          setField={(key, value) => form.setData(key, value)}
          events={events}
        />
        <div className="form-actions">
          <Link href={routeUrl("/contacts/[id]", { params: { id } })} className="button">
            キャンセル
          </Link>
          <button type="submit" className="button primary" disabled={form.pending}>
            保存する
          </button>
        </div>
      </Form>
    </>
  );
}
