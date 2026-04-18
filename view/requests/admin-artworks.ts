import type { z } from "zod";

import {
  createArtworkSchema,
  patchArtworkSchema,
} from "view/lib/artwork-payload";

import { adminApi } from "./client";

/** Минимальные поля из GET /api/admin/artworks для админ-UI. */
export type AdminArtworkSummary = {
  slug: string;
  title: string;
  section: string;
  isCollectionComposite: boolean;
  aspectRatio: string | null;
  widthCm: number | null;
  heightCm: number | null;
  collectionSeriesKey: string | null;
  images: { url: string; sortOrder: number }[];
};

export async function fetchAdminArtworksList(): Promise<AdminArtworkSummary[]> {
  const { data } = await adminApi.get<{ data: AdminArtworkSummary[] }>(
    "/api/admin/artworks",
  );
  return data.data;
}

export type AdminCreateArtworkPayload = z.input<typeof createArtworkSchema>;
export type AdminPatchArtworkPayload = z.input<typeof patchArtworkSchema>;

export async function createAdminArtwork(
  payload: AdminCreateArtworkPayload,
): Promise<void> {
  await adminApi.post("/api/admin/artworks", payload);
}

export async function patchAdminArtwork(
  slug: string,
  patch: AdminPatchArtworkPayload,
): Promise<void> {
  await adminApi.patch(
    `/api/admin/artworks/${encodeURIComponent(slug)}`,
    patch,
  );
}

export async function deleteAdminArtwork(slug: string): Promise<void> {
  await adminApi.delete(`/api/admin/artworks/${encodeURIComponent(slug)}`);
}

/** Загрузка файла в `/public/uploads/artworks`; возвращает публичный URL или `null`. */
export async function uploadAdminArtworkFile(
  file: File,
): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await adminApi.post<{ url?: string }>(
    "/api/admin/upload",
    fd,
  );
  return data.url ?? null;
}
