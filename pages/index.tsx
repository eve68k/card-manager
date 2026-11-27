import { Link, useRouter } from "@void/react";
import { useState } from "react";
import { ContactList } from "../src/components/ContactList";
import type { Props } from "./index.server";

export default function ContactsPage({ contacts, tags, search, event }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(search.q ?? "");
  const filtered = Boolean(search.q || search.tag || search.event);

  const visit = (next: { q?: string; tag?: string; event?: number }) => {
    const query: Record<string, string> = {};
    if (next.q) query.q = next.q;
    if (next.tag) query.tag = next.tag;
    if (next.event) query.event = String(next.event);
    // 一文字ごとに履歴が積まれると戻るボタンで検索前に戻れなくなるため置き換える
    void router.visit({ pathname: "/", query }, { replace: true, preserveScroll: true });
  };

  return (
    <>
      <form
        className="search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          visit({ ...search, q: keyword.trim() });
        }}
      >
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="名前・所属・メモ・タグ・SNSで検索"
          aria-label="検索キーワード"
          enterKeyHint="search"
        />
        <button type="submit" className="button">
          検索
        </button>
      </form>

      {tags.length > 0 && (
        <div className="chips scroll" aria-label="タグで絞り込む">
          {tags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              className="chip"
              aria-pressed={search.tag === tag.name}
              onClick={() =>
                visit({ ...search, tag: search.tag === tag.name ? undefined : tag.name })
              }
            >
              #{tag.name} <small>{tag.count}</small>
            </button>
          ))}
        </div>
      )}

      {filtered && (
        <p className="filter-summary">
          {event && <span>イベント: {event.name} </span>}
          {search.tag && <span>タグ: #{search.tag} </span>}
          {search.q && <span>「{search.q}」 </span>}
          {contacts.length}件
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setKeyword("");
              visit({});
            }}
          >
            条件をクリア
          </button>
        </p>
      )}

      {contacts.length === 0 ? (
        <p className="empty">
          {filtered ? "該当する人はいません。" : "まだ誰も登録されていません。"}
        </p>
      ) : (
        <ContactList contacts={contacts} />
      )}

      <Link href="/contacts/new" className="fab" aria-label="人物を追加">
        ＋
      </Link>
    </>
  );
}
