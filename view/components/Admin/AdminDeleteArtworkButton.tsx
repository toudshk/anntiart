"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import { apiErrorMessage, deleteAdminArtwork } from "view/requests";

const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-red-300/90 bg-white px-3.5 py-1.5 text-sm font-medium text-red-800 shadow-xs transition hover:border-red-400 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/55 dark:bg-zinc-900/80 dark:text-red-200 dark:hover:bg-red-950/35";

type Props = {
  slug: string;
  title: string;
};

export function AdminDeleteArtworkButton({ slug, title }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Удалить «${title}»? Запись исчезнет с сайта.`)) return;
    setBusy(true);
    try {
      await deleteAdminArtwork(slug);
      router.refresh();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDelete}
      className={btnDanger}
    >
      {busy ? "Удаление…" : "Удалить"}
    </button>
  );
}
