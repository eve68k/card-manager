import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";

export default defineConfig({
  plugins: [voidPlugin(), voidReact({ react: { compiler: true } })],
  fmt: {
    // Void と drizzle-kit が再生成するファイル。整形すると生成のたびに差分が出る
    ignorePatterns: ["void.lock.json", "db/migrations/**"],
  },
});
