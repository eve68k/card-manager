/** YYYY-MM-DD を YYYY/MM/DD に。Date を経由するとタイムゾーンで日付がずれるため文字列のまま変換する */
export function formatDate(date: string | null): string {
  return date ? date.replaceAll("-", "/") : "";
}
