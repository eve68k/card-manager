import { Link } from "@void/react";
import type { ReactNode } from "react";
import "./style.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="app-header">
        <Link href="/" className="app-title">
          名刺管理
        </Link>
        <nav className="app-nav">
          <Link href="/">人物</Link>
          <Link href="/events" activeMatch="prefix">
            イベント
          </Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
