"use client";

type Props = {
  mode: "create" | "edit";
  error: string | null;
  loading: boolean;
  onDelete: () => void;
};

export function ArtworkFormActions({
  mode,
  error,
  loading,
  onDelete,
}: Props) {
  return (
    <>
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-zinc-200/80 pt-4 dark:border-zinc-700/70">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_-16px_rgba(15,23,42,0.6)] transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Сохранение…" : "Сохранить"}
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="rounded-xl border border-rose-300 bg-white/85 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-800 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
          >
            Удалить
          </button>
        ) : null}
      </div>
    </>
  );
}
