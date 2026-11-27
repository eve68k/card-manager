export const SOCIAL_SERVICES = {
  x: { label: "X", baseUrl: "https://x.com/" },
  github: { label: "GitHub", baseUrl: "https://github.com/" },
  bluesky: { label: "Bluesky", baseUrl: "https://bsky.app/profile/" },
  facebook: { label: "Facebook", baseUrl: "https://www.facebook.com/" },
  linkedin: { label: "LinkedIn", baseUrl: "https://www.linkedin.com/in/" },
  website: { label: "Web", baseUrl: null },
} as const satisfies Record<string, { label: string; baseUrl: string | null }>;

export type SocialService = keyof typeof SOCIAL_SERVICES;

export const SOCIAL_SERVICE_IDS = Object.keys(SOCIAL_SERVICES) as [
  SocialService,
  ...SocialService[],
];

export function isSocialService(value: string): value is SocialService {
  return Object.hasOwn(SOCIAL_SERVICES, value);
}

/**
 * プロフィール URL や "@name" で貼り付けられても、保存するのはハンドルだけにそろえる。
 * website は URL そのものを保存する。
 */
export function normalizeHandle(service: SocialService, input: string): string {
  const trimmed = input.trim();
  const { baseUrl } = SOCIAL_SERVICES[service];
  if (baseUrl === null) return trimmed;

  const withoutScheme = trimmed.replace(/^https?:\/\//, "");
  const baseWithoutScheme = baseUrl.replace(/^https?:\/\//, "");
  const hostAliases = [baseWithoutScheme, baseWithoutScheme.replace(/^www\./, "")];
  if (service === "x") hostAliases.push("twitter.com/", "www.twitter.com/");

  for (const prefix of hostAliases) {
    if (withoutScheme.startsWith(prefix)) {
      return withoutScheme.slice(prefix.length).split(/[/?#]/)[0] ?? "";
    }
  }
  return trimmed.replace(/^@/, "");
}

/** javascript: などを href に入れないよう、http(s) 以外は null を返す */
export function socialUrl(service: string, handle: string): string | null {
  if (!isSocialService(service)) return null;
  const { baseUrl } = SOCIAL_SERVICES[service];
  if (baseUrl !== null) return baseUrl + encodeURIComponent(handle);

  const url = /^https?:\/\//i.test(handle) ? handle : `https://${handle}`;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

export function socialLabel(service: string): string {
  return isSocialService(service) ? SOCIAL_SERVICES[service].label : service;
}

export function displayHandle(service: string, handle: string): string {
  if (service === "website") return handle.replace(/^https?:\/\//, "");
  return `@${handle}`;
}
