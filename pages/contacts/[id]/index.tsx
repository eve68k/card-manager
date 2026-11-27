import { action, Link } from "@void/react";
import { routeUrl } from "void/routes";
import { ConfirmDeleteButton } from "../../../src/components/ConfirmDeleteButton";
import { formatDate } from "../../../src/format";
import { displayHandle, socialLabel, socialUrl } from "../../../src/social";
import type { Props } from "./index.server";

export default function ContactPage({ contact }: Props) {
  const params = { id: contact.id };

  return (
    <article className="detail">
      <header className="detail-header">
        <h1>{contact.name}</h1>
        {contact.affiliation && <p className="detail-sub">{contact.affiliation}</p>}
        {contact.tags.length > 0 && (
          <p className="chips">
            {contact.tags.map((tag) => (
              <Link key={tag} href="/" data={{ tag }} className="chip">
                #{tag}
              </Link>
            ))}
          </p>
        )}
      </header>

      {contact.memo && (
        <section className="detail-section">
          <h2>特徴・メモ</h2>
          <p className="memo">{contact.memo}</p>
        </section>
      )}

      {contact.events.length > 0 && (
        <section className="detail-section">
          <h2>出会ったイベント</h2>
          <ul className="plain-list">
            {contact.events.map((event) => (
              <li key={event.id}>
                <Link href={routeUrl("/events/[id]", { params: { id: event.id } })}>
                  {event.name}
                </Link>
                {event.date && <small> {formatDate(event.date)}</small>}
                {event.place && <small> / {event.place}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {contact.socialLinks.length > 0 && (
        <section className="detail-section">
          <h2>SNS・Web</h2>
          <ul className="plain-list">
            {contact.socialLinks.map((link, index) => {
              const url = socialUrl(link.service, link.handle);
              const text = displayHandle(link.service, link.handle);
              return (
                <li key={index}>
                  <span className="service-label">{socialLabel(link.service)}</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer noopener">
                      {text}
                    </a>
                  ) : (
                    text
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="detail-actions">
        <Link href={routeUrl("/contacts/[id]/edit", { params })} className="button primary">
          編集する
        </Link>
        <ConfirmDeleteButton
          label="削除"
          onConfirm={async () => {
            await action("/contacts/[id]?delete", { params: { id: String(contact.id) } });
          }}
        />
      </footer>
    </article>
  );
}
