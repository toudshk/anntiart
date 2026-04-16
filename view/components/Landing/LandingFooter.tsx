export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-zinc-200/80 bg-pastel-gray-50 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
      <p>© {year}</p>
      <p className="mt-2">
        made by{" "}
        <a
          href="https://t.me/toudshke"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-700 underline decoration-zinc-400/70 underline-offset-2 transition hover:text-zinc-900 hover:decoration-zinc-600 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-zinc-200 dark:hover:decoration-zinc-400"
        >
          toudshke
        </a>
      </p>
    </footer>
  );
}
