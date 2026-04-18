"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Неверный email или пароль");
      return;
    }
    window.location.href = "/admin";
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-pastel-hero px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-zinc-300/80 bg-white/90 p-6 shadow-[0_24px_52px_-24px_rgba(15,23,42,0.4)]"
      >
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Вход в админку</h1>
        <p className="mt-1 text-sm text-zinc-600">Anntiart</p>
        <div className="mt-4 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-300 focus:ring-2"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-300 focus:ring-2"
          />
        </div>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-md border border-zinc-900 bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Проверяем..." : "Войти"}
        </button>
      </form>
    </main>
  );
}
