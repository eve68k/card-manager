import { z } from "zod";
import { SOCIAL_SERVICE_IDS } from "./social";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "名前を入力してください").max(100),
  affiliation: z.string().trim().max(200),
  memo: z.string().trim().max(5000),
  tags: z.string().max(500),
  eventIds: z.array(z.number().int().positive()).max(100),
  socialLinks: z
    .array(
      z.object({
        service: z.enum(SOCIAL_SERVICE_IDS),
        handle: z.string().trim().max(300),
      }),
    )
    .max(20),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

export const eventInputSchema = z.object({
  name: z.string().trim().min(1, "イベント名を入力してください").max(200),
  // 日付入力を空にしたまま送れるよう、空文字は null として受け付ける
  date: z
    .string()
    .trim()
    .refine((v) => v === "" || DATE_PATTERN.test(v), "日付の形式が正しくありません")
    .transform((v) => (v === "" ? null : v)),
  place: z.string().trim().max(200),
});

export type EventInput = z.infer<typeof eventInputSchema>;

export const contactSearchSchema = z.object({
  q: z.string().trim().max(200).optional(),
  tag: z.string().trim().max(50).optional(),
  event: z.coerce.number().int().positive().optional(),
});

export type ContactSearch = z.infer<typeof contactSearchSchema>;

export const idParamSchema = z.coerce.number().int().positive();
