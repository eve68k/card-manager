import { useState } from "react";
import { formatDate } from "../format";
import { SOCIAL_SERVICE_IDS, SOCIAL_SERVICES, type SocialService } from "../social";

export type ContactFormData = {
  name: string;
  affiliation: string;
  memo: string;
  tags: string;
  eventIds: number[];
  socialLinks: { service: SocialService; handle: string }[];
};

export const emptyContactForm: ContactFormData = {
  name: "",
  affiliation: "",
  memo: "",
  tags: "",
  eventIds: [],
  socialLinks: [{ service: "x", handle: "" }],
};

type EventOption = { id: number; name: string; date: string | null };

const EVENT_FILTER_THRESHOLD = 8;

export function ContactFields({
  data,
  errors,
  setField,
  events,
}: {
  data: ContactFormData;
  errors: Partial<Record<string, string>>;
  setField: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  events: readonly EventOption[];
}) {
  const [eventFilter, setEventFilter] = useState("");
  const visibleEvents = eventFilter
    ? events.filter((e) => e.name.toLowerCase().includes(eventFilter.toLowerCase()))
    : events;

  const toggleEvent = (id: number, checked: boolean) => {
    setField("eventIds", checked ? [...data.eventIds, id] : data.eventIds.filter((v) => v !== id));
  };

  const updateLink = (index: number, patch: Partial<ContactFormData["socialLinks"][number]>) => {
    setField(
      "socialLinks",
      data.socialLinks.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  };

  return (
    <>
      <div className="field">
        <label htmlFor="contact-name">名前 *</label>
        <input
          id="contact-name"
          value={data.name}
          onChange={(e) => setField("name", e.target.value)}
          required
          maxLength={100}
          autoComplete="off"
        />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor="contact-affiliation">所属・肩書き</label>
        <input
          id="contact-affiliation"
          value={data.affiliation}
          onChange={(e) => setField("affiliation", e.target.value)}
          maxLength={200}
          autoComplete="off"
        />
      </div>

      <fieldset className="field">
        <legend>出会ったイベント</legend>
        {events.length === 0 ? (
          <p className="hint">イベントはまだありません。「イベント」タブから追加できます。</p>
        ) : (
          <>
            {events.length > EVENT_FILTER_THRESHOLD && (
              <input
                type="search"
                placeholder="イベントを絞り込む"
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                aria-label="イベントを絞り込む"
              />
            )}
            <div className="check-list">
              {visibleEvents.map((event) => (
                <label key={event.id} className="check-item">
                  <input
                    type="checkbox"
                    checked={data.eventIds.includes(event.id)}
                    onChange={(e) => toggleEvent(event.id, e.target.checked)}
                  />
                  <span>{event.name}</span>
                  {event.date && <small>{formatDate(event.date)}</small>}
                </label>
              ))}
            </div>
          </>
        )}
      </fieldset>

      <fieldset className="field">
        <legend>SNS・Web</legend>
        {data.socialLinks.map((link, index) => (
          <div key={index} className="link-row">
            <select
              value={link.service}
              onChange={(e) => updateLink(index, { service: e.target.value as SocialService })}
              aria-label="サービス"
            >
              {SOCIAL_SERVICE_IDS.map((id) => (
                <option key={id} value={id}>
                  {SOCIAL_SERVICES[id].label}
                </option>
              ))}
            </select>
            <input
              value={link.handle}
              onChange={(e) => updateLink(index, { handle: e.target.value })}
              placeholder={link.service === "website" ? "https://example.com" : "ID または URL"}
              aria-label="ID または URL"
              autoCapitalize="off"
              autoComplete="off"
              inputMode="url"
            />
            <button
              type="button"
              className="icon-button"
              aria-label="この行を削除"
              onClick={() =>
                setField(
                  "socialLinks",
                  data.socialLinks.filter((_, i) => i !== index),
                )
              }
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button small"
          onClick={() =>
            setField("socialLinks", [...data.socialLinks, { service: "x", handle: "" }])
          }
        >
          + 追加
        </button>
      </fieldset>

      <div className="field">
        <label htmlFor="contact-tags">タグ</label>
        <input
          id="contact-tags"
          value={data.tags}
          onChange={(e) => setField("tags", e.target.value)}
          placeholder="Rust, 登壇者, 懇親会"
          maxLength={500}
          autoComplete="off"
        />
        <p className="hint">カンマかスペースで区切ります</p>
      </div>

      <div className="field">
        <label htmlFor="contact-memo">特徴・メモ</label>
        <textarea
          id="contact-memo"
          value={data.memo}
          onChange={(e) => setField("memo", e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="話した内容、見た目の特徴、次に話したいことなど"
        />
      </div>
    </>
  );
}
