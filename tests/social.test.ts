import { describe, expect, it } from "vite-plus/test";
import { displayHandle, normalizeHandle, socialLabel, socialUrl } from "../src/social";

describe("normalizeHandle", () => {
  it("先頭の@を取り除く", () => {
    expect(normalizeHandle("x", "@example")).toBe("example");
  });

  it("貼り付けられたプロフィールURLからハンドルを取り出す", () => {
    expect(normalizeHandle("x", "https://x.com/example?s=20")).toBe("example");
    expect(normalizeHandle("github", "https://github.com/example/repo")).toBe("example");
    expect(normalizeHandle("bluesky", "https://bsky.app/profile/example.bsky.social")).toBe(
      "example.bsky.social",
    );
  });

  it("XではtwitterのURLも受け付ける", () => {
    expect(normalizeHandle("x", "https://twitter.com/example")).toBe("example");
  });

  it("wwwの有無にかかわらずURLを受け付ける", () => {
    expect(normalizeHandle("facebook", "facebook.com/example")).toBe("example");
    expect(normalizeHandle("facebook", "https://www.facebook.com/example")).toBe("example");
  });

  it("Webサイトの値は前後の空白以外そのまま保持する", () => {
    expect(normalizeHandle("website", "  https://example.com/about  ")).toBe(
      "https://example.com/about",
    );
  });
});

describe("socialUrl", () => {
  it("対応サービスではプロフィールURLを組み立てる", () => {
    expect(socialUrl("x", "example")).toBe("https://x.com/example");
    expect(socialUrl("linkedin", "example")).toBe("https://www.linkedin.com/in/example");
  });

  it("ハンドルをパーセントエンコードしてパスを変えられないようにする", () => {
    expect(socialUrl("github", "../evil")).toBe("https://github.com/..%2Fevil");
  });

  it("スキームのないWebサイトにはhttpsを補う", () => {
    expect(socialUrl("website", "example.com")).toBe("https://example.com/");
  });

  it("Webサイトでは危険なスキームのURLを返さない", () => {
    for (const input of ["javascript:alert(1)", "data:text/html,hi", "JAVASCRIPT://x"]) {
      const url = socialUrl("website", input);
      expect(url === null || url.startsWith("https://")).toBe(true);
    }
  });

  it("対応していないサービスではnullを返す", () => {
    expect(socialUrl("myspace", "example")).toBeNull();
  });
});

describe("表示用ヘルパー", () => {
  it("ハンドルは@付き、Webサイトはスキームなしで表示する", () => {
    expect(displayHandle("x", "example")).toBe("@example");
    expect(displayHandle("website", "https://example.com")).toBe("example.com");
  });

  it("対応していないサービスはIDをそのままラベルにする", () => {
    expect(socialLabel("github")).toBe("GitHub");
    expect(socialLabel("myspace")).toBe("myspace");
  });
});
