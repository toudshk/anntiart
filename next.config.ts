import type { NextConfig } from "next";

/** Хосты для полных URL в `next/image` (через запятую, без схемы). */
function imageRemoteHostnames(): string[] {
  const hosts = new Set<string>();
  const list =
    process.env.NEXT_IMAGE_ALLOWED_HOSTS ?? process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS;
  if (list) {
    for (const h of list.split(",")) {
      const t = h.trim();
      if (t) hosts.add(t);
    }
  }
  for (const key of ["NEXT_PUBLIC_APP_URL", "NEXTAUTH_URL"] as const) {
    const raw = process.env[key];
    if (!raw) continue;
    try {
      const { hostname } = new URL(raw);
      if (hostname) hosts.add(hostname);
    } catch {
      /* ignore invalid URL */
    }
  }
  return [...hosts];
}

function imageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
  for (const hostname of imageRemoteHostnames()) {
    patterns.push({ protocol: "https", hostname, pathname: "/**" });
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      patterns.push({ protocol: "http", hostname, pathname: "/**" });
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {},
  images: {
    remotePatterns: imageRemotePatterns(),
    /**
     * Явно разрешаем файлы из `public/uploads` для `/_next/image` (Next 16+).
     * Без этого при частичной/кастомной конфигурации `localPatterns` оптимизатор
     * может отвечать 400 «url parameter is not allowed».
     */
    localPatterns: [{ pathname: "/uploads/**", search: "" }],
  },
};

export default nextConfig;
