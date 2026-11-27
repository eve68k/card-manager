import { Link, type ErrorPageProps } from "@void/react";

export default function ErrorPage({ error }: ErrorPageProps) {
  return (
    <section className="empty-page">
      <h1>{error.status}</h1>
      <p>{error.message}</p>
      <Link href="/">一覧に戻る</Link>
    </section>
  );
}
