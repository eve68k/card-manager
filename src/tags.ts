const TAG_SEPARATOR = /[,、，\s]+/;

const MAX_TAG_LENGTH = 50;

/**
 * 入力欄の文字列をタグ名の配列にする。
 * 先頭の # を外し、空要素と重複を除く。並び順は入力順を保つ。
 */
export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  for (const raw of input.split(TAG_SEPARATOR)) {
    const name = raw.replace(/^#+/, "").trim().slice(0, MAX_TAG_LENGTH);
    if (name) seen.add(name);
  }
  return [...seen];
}

export function formatTags(names: readonly string[]): string {
  return names.join(", ");
}
