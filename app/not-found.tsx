import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Такой страницы нет — вернитесь в галерею.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-pastel-hero dark:bg-[#12161c]">
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-16 text-center sm:max-w-xl">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
          Галерея Анны Тихоненко
        </p>

        <figure className="relative mt-7 aspect-[9/16] h-[min(38vh,17.5rem)] w-auto max-w-[min(72vw,11rem)] overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100/80 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] sm:h-[min(42vh,19rem)] sm:max-w-[12.5rem] dark:border-zinc-600/80 dark:bg-zinc-900/50 dark:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)]">
          <video
            className="h-full w-full object-contain object-center brightness-[1.12] contrast-[1.04] saturate-[1.06] dark:brightness-[1.18] dark:contrast-[1.06]"
            src="/videos/404.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
          <figcaption className="sr-only">Декоративное видео на странице ошибки</figcaption>
        </figure>

        <h1 className="mt-8 text-6xl font-semibold tracking-tight text-zinc-900 sm:text-7xl dark:text-zinc-50">
          404
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
          Этого полотна в экспозиции нет — возможно, адрес сменился или строка
          набрана с опечаткой. Зато главная всегда открыта.
        </p>
        <Link
          href="/"
          className="mt-9 rounded-md border border-zinc-300 bg-zinc-100/90 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-200/90 dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
