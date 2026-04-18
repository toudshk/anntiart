import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { requireAdminResponse } from "view/lib/require-admin";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export async function POST(req: Request) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Ожидается multipart/form-data" },
      { status: 400 },
    );
  }

  const form = await req.formData();
  const entry = form.get("file");
  if (!entry || !(entry instanceof File)) {
    return NextResponse.json({ error: "Нет файла (поле file)" }, { status: 400 });
  }

  if (entry.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Файл слишком большой (макс. 15 МБ)" },
      { status: 400 },
    );
  }

  const mime = entry.type.split(";")[0]?.trim().toLowerCase() ?? "";
  const ext = ALLOWED.get(mime);
  if (!ext) {
    return NextResponse.json(
      { error: "Допустимы только JPEG, PNG, WebP, GIF" },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await entry.arrayBuffer());
  const relDir = path.join("public", "uploads", "artworks");
  const absDir = path.join(process.cwd(), relDir);
  await mkdir(absDir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const absPath = path.join(absDir, filename);
  await writeFile(absPath, buf);

  const url = `/uploads/artworks/${filename}`;
  return NextResponse.json({ url });
}
