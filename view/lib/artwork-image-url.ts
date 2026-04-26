const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1"]);

function siteBaseUrls(): URL[] {
  const out: URL[] = [];
  for (const key of ["NEXT_PUBLIC_APP_URL", "NEXTAUTH_URL"] as const) {
    const raw = process.env[key]?.trim();
    if (!raw) continue;
    try {
      out.push(new URL(raw.startsWith("http") ? raw : `https://${raw}`));
    } catch {
      /* ignore */
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      out.push(new URL(`https://${vercel}`));
    } catch {
      /* ignore */
    }
  }
  return out;
}

function loopbackSamePort(a: URL, b: URL): boolean {
  if (!LOOPBACK.has(a.hostname) || !LOOPBACK.has(b.hostname)) return false;
  return a.port === b.port;
}

function isSameSiteImage(url: URL, bases: URL[]): boolean {
  for (const b of bases) {
    if (url.origin === b.origin) return true;
    if (loopbackSamePort(url, b)) return true;
  }
  return false;
}

/**
 * Приводит абсолютные URL того же сайта к пути `/…`, чтобы `next/image`
 * обрабатывал их как локальные файлы из `public/` без `remotePatterns`.
 */
export function normalizeArtworkImageUrl(url: string): string {
  const t = url.trim();
  if (!t || t.startsWith("/") || !/^https?:\/\//i.test(t)) return t;
  try {
    const u = new URL(t);
    if (isSameSiteImage(u, siteBaseUrls())) {
      return `${u.pathname}${u.search}`;
    }
  } catch {
    /* ignore */
  }
  return t;
}

/** Полный `http(s)` URL (в т.ч. внешний CDN) — для `next/image` нужен `unoptimized` без remotePatterns. */
export function isRemoteHttpImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src.trim());
}

/**
 * Только внешние `http(s)` без `remotePatterns` — обход оптимизатора.
 * Пути вида `/uploads/…` идут через `/_next/image` как локальные (как в конфиге Next по умолчанию).
 */
export function shouldUseUnoptimizedNextImage(src: string): boolean {
  return isRemoteHttpImageSrc(src);
}
