import { Link } from "@void/react";
import { routeUrl } from "void/routes";

type Contact = {
  id: number;
  name: string;
  affiliation: string;
  tags: string[];
  events: string[];
};

export function ContactList({ contacts }: { contacts: readonly Contact[] }) {
  return (
    <ul className="card-list">
      {contacts.map((contact) => (
        <li key={contact.id}>
          <Link
            href={routeUrl("/contacts/[id]", { params: { id: contact.id } })}
            className="card"
            prefetch
          >
            <span className="card-title">{contact.name}</span>
            {contact.affiliation && <span className="card-sub">{contact.affiliation}</span>}
            {contact.events.length > 0 && (
              <span className="card-meta">
                {contact.events[0]}
                {contact.events.length > 1 && ` ほか${contact.events.length - 1}件`}
              </span>
            )}
            {contact.tags.length > 0 && (
              <span className="chips">
                {contact.tags.map((tag) => (
                  <span key={tag} className="chip">
                    #{tag}
                  </span>
                ))}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
