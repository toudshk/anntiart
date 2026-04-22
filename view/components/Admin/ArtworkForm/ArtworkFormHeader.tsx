"use client";

type Props = {
  mode: "create" | "edit";
  isFragmentCreate: boolean;
  wantAutoSeriesKey: boolean;
  isCollection: boolean;
  fragmentSeriesKey: string;
  slug: string;
};

export function ArtworkFormHeader({
  mode,
  isFragmentCreate,
  wantAutoSeriesKey,
  isCollection,
  fragmentSeriesKey,
  slug,
}: Props) {
  return (
    <>
      <header className="space-y-2 border-b border-zinc-200/80 pb-4 dark:border-zinc-700/70">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Админка галереи
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {mode === "create" && isFragmentCreate
            ? "Новый фрагмент серии"
            : mode === "create" && wantAutoSeriesKey && isCollection
              ? "Новая серия"
              : mode === "create"
                ? "Новая работа"
                : "Редактирование работы"}
        </h1>
      </header>

      {mode === "create" && isFragmentCreate ? (
        <p className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-100">
          Ключ серии уже задан (
          <span className="font-mono font-medium">{fragmentSeriesKey}</span>) —
          совпадает с общей композицией. Ниже разметьте область этого кадра на
          превью композиции.
        </p>
      ) : null}

      {mode === "edit" ? (
        <p className="rounded-xl border border-zinc-200/85 bg-white/80 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-300">
          Slug: <span className="font-mono text-zinc-900 dark:text-zinc-100">{slug}</span>
        </p>
      ) : null}
    </>
  );
}
