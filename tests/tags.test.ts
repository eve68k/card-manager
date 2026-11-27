import { describe, expect, it } from "vite-plus/test";
import { formatTags, parseTags } from "../src/tags";

describe("parseTags", () => {
  it("半角カンマ・読点・空白で区切る", () => {
    expect(parseTags("Rust, Go、登壇者　懇親会\tSRE")).toEqual([
      "Rust",
      "Go",
      "登壇者",
      "懇親会",
      "SRE",
    ]);
  });

  it("先頭の#を取り除く", () => {
    expect(parseTags("#Rust ##Go")).toEqual(["Rust", "Go"]);
  });

  it("空要素と重複を除き、最初に現れた順を保つ", () => {
    expect(parseTags(" , Rust,,Go, Rust #Go ")).toEqual(["Rust", "Go"]);
  });

  it("空白だけの入力では空配列を返す", () => {
    expect(parseTags("   ")).toEqual([]);
  });

  it("長すぎるタグ名は50文字で切り詰める", () => {
    expect(parseTags("a".repeat(60))).toEqual(["a".repeat(50)]);
  });

  it("formatTagsで整形した文字列を元のタグに戻せる", () => {
    const tags = ["Rust", "登壇者"];
    expect(parseTags(formatTags(tags))).toEqual(tags);
  });
});
