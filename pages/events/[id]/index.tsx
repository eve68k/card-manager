import { action, Form, Link, useForm } from "@void/react";
import { useState } from "react";
import { ConfirmDeleteButton } from "../../../src/components/ConfirmDeleteButton";
import { ContactList } from "../../../src/components/ContactList";
import { EventFields } from "../../../src/components/EventFields";
import { formatDate } from "../../../src/format";
import type { Props } from "./index.server";

export default function EventPage({ event, contacts }: Props) {
  const [editing, setEditing] = useState(false);
  const params = { id: String(event.id) };
  const form = useForm(
    "/events/[id]?update",
    { name: event.name, date: event.date ?? "", place: event.place },
    { params, onSuccess: () => setEditing(false) },
  );

  return (
    <article className="detail">
      {editing ? (
        <Form form={form} className="form panel">
          <EventFields
            idPrefix="edit-event"
            data={form.data}
            errors={form.errors}
            setField={(key, value) => form.setData(key, value)}
          />
          <div className="form-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                form.reset();
                setEditing(false);
              }}
            >
              キャンセル
            </button>
            <button type="submit" className="button primary" disabled={form.pending}>
              保存する
            </button>
          </div>
        </Form>
      ) : (
        <header className="detail-header">
          <h1>{event.name}</h1>
          <p className="detail-sub">
            {[formatDate(event.date), event.place].filter(Boolean).join(" / ")}
          </p>
          <div className="detail-actions">
            <button type="button" className="button small" onClick={() => setEditing(true)}>
              編集
            </button>
            <ConfirmDeleteButton
              label="削除"
              onConfirm={async () => {
                await action("/events/[id]?delete", { params });
              }}
            />
          </div>
        </header>
      )}

      <section className="detail-section">
        <div className="page-heading">
          <h2>出会った人 ({contacts.length})</h2>
          <Link href="/contacts/new" data={{ event: event.id }} className="button primary small">
            ＋ 追加
          </Link>
        </div>
        {contacts.length === 0 ? (
          <p className="empty">まだ誰もいません。</p>
        ) : (
          <ContactList contacts={contacts} />
        )}
      </section>
    </article>
  );
}
