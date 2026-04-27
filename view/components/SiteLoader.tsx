"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Минимум показа, чтобы не мигало при быстром кэше. */
const MIN_VISIBLE_MS = 900;
/**
 * Потолок ожидания: иначе при «вечной» загрузке шрифта/картинки/трекера `load` не сработает
 * и оверлей останется навсегда (часто у части пользователей с блокировками, медленной сетью).
 */
const MAX_WAIT_BOOTSTRAP_MS = 8_000;

export function SiteLoader() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const el = rootRef.current;
    if (!el) {
      document.body.style.overflow = "";
      return;
    }

    let cancelled = false;

    const finish = async () => {
      const started = performance.now();

      const fontsReady = (document.fonts?.ready ?? Promise.resolve()).catch(
        () => {
          /* отдельные шрифты/браузеры могут бросать или не резолвить ready */
        },
      );

      const windowLoaded = new Promise<void>((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", () => resolve(), { once: true });
      });

      const timeout = new Promise<void>((resolve) => {
        setTimeout(resolve, MAX_WAIT_BOOTSTRAP_MS);
      });

      await Promise.race([Promise.all([fontsReady, windowLoaded]), timeout]);

      const waitMore = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      await new Promise((r) => setTimeout(r, waitMore));
      if (cancelled) return;

      await gsap.to(el, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
      });
      if (cancelled) return;

      document.body.style.overflow = "";
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
      setVisible(false);
    };

    void finish();

    return () => {
      cancelled = true;
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#e0ded9_0%,#e7e4df_42%,#f2f1ee_100%)] text-zinc-900"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-pastel-gray-200/65 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-pastel-beige-100/55 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 px-6 text-center">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-zinc-500">
         осталось совсем чуть-чуть
        </p>
        {/* <p className="text-2xl font-semibold tracking-tight text-zinc-900">
       Загрузка
        </p> */}

        <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-zinc-300/75">
          <div
            className="h-full w-1/2 animate-[loader-slide_1.25s_ease-in-out_infinite] rounded-full bg-zinc-700"
            aria-hidden
          />
        </div>

        <p className="text-sm font-medium tracking-wide text-zinc-600">
          Загрузка…
        </p>
      </div>
    </div>
  );
}
