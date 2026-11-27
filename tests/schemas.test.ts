import { describe, expect, it } from "vite-plus/test";
import { contactInputSchema, eventInputSchema } from "../src/schemas";

const validContact = {
  name: " 山田 花子 ",
  affiliation: "",
  memo: "",
  tags: "",
  eventIds: [1],
  socialLinks: [{ service: "x", handle: "@hanako" }],
};

describe("contactInputSchema", () => {
  it("正しい入力を受け付け、名前の前後の空白を取り除く", () => {
    const result = contactInputSchema.parse(validContact);
    expect(result.name).toBe("山田 花子");
  });

  it("空白だけの名前は受け付けない", () => {
    expect(contactInputSchema.safeParse({ ...validContact, name: "   " }).success).toBe(false);
  });

  it("対応していないSNSサービスは受け付けない", () => {
    const input = { ...validContact, socialLinks: [{ service: "myspace", handle: "a" }] };
    expect(contactInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("eventInputSchema", () => {
  it("空の日付は日付なしとして扱う", () => {
    expect(eventInputSchema.parse({ name: "Meetup", date: "", place: "" }).date).toBeNull();
  });

  it("YYYY-MM-DD形式の日付はそのまま保持する", () => {
    expect(eventInputSchema.parse({ name: "Meetup", date: "2026-11-27", place: "" }).date).toBe(
      "2026-11-27",
    );
  });

  it("それ以外の形式の日付は受け付けない", () => {
    expect(
      eventInputSchema.safeParse({ name: "Meetup", date: "2026/11/27", place: "" }).success,
    ).toBe(false);
  });
});
