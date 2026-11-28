import { Form, useForm } from "@void/react";
import { ContactFields, emptyContactForm } from "../../src/components/ContactFields";
import type { Props } from "./new.server";

export default function NewContactPage({ events }: Props) {
  const form = useForm("/contacts/new", emptyContactForm);

  return (
    <>
      <h1>人物を追加</h1>
      <Form form={form} className="form">
        <ContactFields
          data={form.data}
          errors={form.errors}
          setField={(key, value) => form.setData(key, value)}
          events={events}
        />
        <div className="form-actions">
          <button type="submit" className="button primary" disabled={form.pending}>
            登録する
          </button>
        </div>
      </Form>
    </>
  );
}
