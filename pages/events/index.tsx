import { Form, Link, useForm } from "@void/react";
import { useState } from "react";
import { routeUrl } from "void/routes";
import { EventFields, emptyEventForm } from "../../src/components/EventFields";
import { formatDate } from "../../src/format";
import type { Props } from "./index.server";

function todayInJapan(): string {
  // sv-SE ロケールは YYYY-MM-DD 形式で出力されるので、date input の値にそのまま使える
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

export default function EventsPage({ events }: Props) {
  const [creating, setCreating] = useState(false);
  const form = useForm("/events", emptyEventForm, {
    resetOnSuccess: true,
    onSuccess: () => setCreating(false),
  });

  return (
    <>
      <div className="page-heading">
        <h1>イベント</h1>
        {!creating && (
          <button
            type="button"
            className="button primary small"
            onClick={() => {
              if (!form.data.date) form.setData("date", todayInJapan());
              setCreating(true);
            }}
          >
            ＋ 追加
          </button>
        )}
      </div>

      {creating && (
        <Form form={form} className="form panel">
          <EventFields
            idPrefix="new-event"
            data={form.data}
            errors={form.errors}
            setField={(key, value) => form.setData(key, value)}
          />
          <div className="form-actions">
            <button type="button" className="button" onClick={() => setCreating(false)}>
              キャンセル
            </button>
            <button type="submit" className="button primary" disabled={form.pending}>
              作成する
            </button>
          </div>
        </Form>
      )}

      {events.length === 0 ? (
        <p className="empty">まだイベントはありません。</p>
      ) : (
        <ul className="card-list">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={routeUrl("/events/[id]", { params: { id: event.id } })}
                className="card"
                prefetch
              >
                <span className="card-title">{event.name}</span>
                <span className="card-meta">
                  {[formatDate(event.date), event.place].filter(Boolean).join(" / ")}
                </span>
                <span className="card-sub">{event.contactCount}人</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
