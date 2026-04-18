"use client";

import { signOut } from "next-auth/react";

export function AdminSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
    >
      Выйти
    </button>
  );
}
