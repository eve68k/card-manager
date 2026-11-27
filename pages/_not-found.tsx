import { Link } from "@void/react";

export default function NotFoundPage() {
  return (
    <section className="empty-page">
      <h1>見つかりません</h1>
      <p>削除されたか、URL が間違っている可能性があります。</p>
      <Link href="/">一覧に戻る</Link>
    </section>
  );
}
