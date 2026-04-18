import Link from "next/link";

import { AdminSignOut } from "view/components/Admin/AdminSignOut";

type Props = {
  /** Краткий текст из Prisma (без паролей); можно не передавать. */
  detail?: string;
};

export function AdminDatabaseError({ detail }: Props) {
  return (
    <div className="min-h-dvh bg-pastel-hero px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg rounded-xl border border-amber-200/90 bg-amber-50/90 p-6 text-amber-950 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        <h1 className="text-lg font-semibold">Нет подключения к базе данных</h1>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          Prisma не смог авторизоваться на сервере PostgreSQL. Обычно это значит, что в{" "}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs dark:bg-amber-900/60">
            DATABASE_URL
          </code>{" "}
          указаны неверные логин или пароль, или пароль с символами вроде{" "}
          <code className="text-xs">@ # % ^</code> не закодирован для URL.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm opacity-90">
          <li>Проверьте пользователя и пароль в панели хостинга БД.</li>
          <li>
            В строке подключения пароль должен быть в формате percent-encoding (например{" "}
            <code className="text-xs">^</code> → <code className="text-xs">%5E</code>).
          </li>
          <li>После правки <code className="text-xs">.env</code> перезапустите dev-сервер.</li>
        </ul>
        {detail ? (
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-amber-100/50 p-3 text-xs dark:bg-amber-900/30">
            {detail}
          </pre>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="text-sm font-medium text-amber-900 underline underline-offset-2 dark:text-amber-200"
          >
            Обновить страницу
          </Link>
          <AdminSignOut />
        </div>
      </div>
    </div>
  );
}
