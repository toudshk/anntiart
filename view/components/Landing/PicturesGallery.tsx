 "use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

import {
  PICTURE_ITEMS,
  type PictureItem,
} from "view/constants/pictures";

import { FramedPicture } from "./FramedPicture";
import { WorksGallery3D } from "./WorksGallery3D";

gsap.registerPlugin(ScrollTrigger);

const WORKS = PICTURE_ITEMS.filter((item) => item.section === "works");
const COLLECTION = PICTURE_ITEMS.filter((item) => item.section === "collection");
const COLLECTION_MAIN =
  COLLECTION.find((item) => item.id === "collection-interesting-positions") ??
  null;
const COLLECTION_RELATED = COLLECTION.filter(
  (item) => item.id !== "collection-interesting-positions",
);

type WorkMeta = {
  title: string;
  medium: string;
  text: string;
  price?: string;
};

const WORKS_META: Record<string, WorkMeta> = {
  "white-girl": {
    title: "Невыносимая тяжесть воспоминаний",
    medium: "Масло, холст 50×80",
    text:
      "Невыносимая тяжесть воспоминаний, которые просыпаются прежде, чем я усну, и подавляют своим присутствием.",
    price: "120.000₽",
  },
  "black-girl": {
    title: "Личное",
    medium: "Масло, холст 30×40",
    text:
      "О бережности к своему внутреннему миру. Не всё ценное нуждается в том, чтобы быть увиденным или разделённым. Личное становится хрупким, когда его выносят наружу, поэтому оно требует защиты. Дерево символизирует внутреннее счастье героини. Она скрывает его, не желая демонстрировать.",
    price: "20.000₽",
  },
  "black-girl-2": {
    title: "Дар ночи",
    medium: "Масло, холст 30×40",
    text:
      "Картина «Дар ночи» символизирует момент появления идеи или мысли, которая приходит внезапно и тихо, чаще всего в ночное время. Ночь показана тёмной фигурой как источник вдохновения — безличная сила, передающая этот дар.",
    price: "35.000₽",
  },
  "red-girl": {
    title: "Без названия",
    medium: "Картина маслом, холст 60×90",
    text: "Описание будет добавлено позже.",
  },
  "white-girls": {
    title: "Пора",
    medium: "Масло, холст 120×50",
    text:
      "Картина с двояким смыслом о жизни и сне. О том, что пришло время уходить, двигаться вперёд. Время отпустить тяготы, перестать сопротивляться, бороться. Пора просыпаться. Растворяющиеся фигуры символизируют тех, кто принял свой путь и движется к свету, счастью, будущему. Неповторимые рисунки берёз как разнообразие воспоминаний, прожитые моменты, индивидуальный опыт, который формирует человека, но остаётся позади, когда приходит время идти дальше. Над взглядом главной героини я работала несколько дней. Мне было важно добиться того, чтобы она именно смотрела на зрителя, ожидая, когда он примет решение идти с ними.",
    price: "200.000₽",
  },
  "black-girls": {
    title: "Стремление",
    medium: "Холст 100×110",
    text:
      "Картина о постепенном достижении цели. Три девушки схожи между собой по одежде и волосам, потому что все они являются частями одной личности. Каждая часть олицетворяет этап, на котором находится. Дерево лимона — главный ориентир героини. Собирая плоды, она достигает своей цели.",
    price: "120.000₽",
  },
  "black-girl-3": {
    title: "Мысль",
    medium: "Холст 100×50",
    text:
      "Изображена мысль, поделенная на условно логическую часть и воодушевлённо-мечтательную. Когда одновременно говорят сердце и мозг.",
    price: "70.000₽",
  },
  "white-girl-2": {
    title: "Смотреть — не значит видеть",
    medium: "Масло, холст 100×60",
    text:
      "Восприятие может быть поверхностным, может глубоким. Можно просто замечать происходящее, не вникая и не откликаясь на него, а можно по-настоящему воспринимать, осознавать, чувствовать и внутренне участвовать. Картина о разнице между автоматическим наблюдением и внимательным, осмысленным присутствием. Истинное «видеть» связано не столько с глазами, сколько с внутренним переживанием и пониманием.",
    price: "200.000₽",
  },
};

function CollectionGrid({
  items,
  priorityFirst,
}: {
  items: PictureItem[];
  priorityFirst: boolean;
}) {
  return (
    <ul className="grid grid-cols-1 gap-14 overflow-visible sm:grid-cols-2 sm:gap-16 lg:grid-cols-3 lg:gap-12">
      {items.map((item, index) => (
        <li key={item.id} className="min-w-0 overflow-visible py-2">
          <FramedPicture
            src={item.src}
            alt={item.alt}
            aspectRatio={item.aspectRatio}
            priority={priorityFirst && index === 0}
          />
        </li>
      ))}
    </ul>
  );
}

type Hotspot = { x: number; y: number; w: number; h: number };

const COLLECTION_HOTSPOTS: Record<string, Hotspot> = {
  "collection-one": { x: 40, y: 7, w: 14, h: 15 },
  "collection-two": { x: 35, y: 25, w: 22, h: 15 },
  "collection-three": { x: 80, y: 44, w: 22, h: 15 },
  "collection-four": { x: 1, y: 43, w: 21, h: 14 },
  "collection-five": { x: 24, y: 48, w: 21, h: 17 },
};

function CollectionInteractive({
  main,
  related,
}: {
  main: PictureItem | null;
  related: PictureItem[];
}) {
  const [activeId, setActiveId] = useState<string>(
    related[0]?.id ?? "collection-one",
  );
  const rightPreviewRef = useRef<HTMLDivElement>(null);
  if (!main) return null;
  const activePicture =
    related.find((item) => item.id === activeId) ?? related[0] ?? null;
  const activeHotspot = COLLECTION_HOTSPOTS[activeId] ?? null;
  const activeIdx = Math.max(
    0,
    related.findIndex((item) => item.id === activeId),
  );

  useLayoutEffect(() => {
    const el = rightPreviewRef.current;
    if (!el) return;
    // Не анимируем transform/filter на родителе с next/image + fill — в части браузеров
    // слой с картинкой перестаёт композиться и остаётся «белый квадрат».
    gsap.fromTo(
      el,
      { opacity: 0.4 },
      {
        opacity: 1,
        duration: 0.38,
        ease: "power2.out",
      },
    );
  }, [activeId]);

  return (
    <div
      className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-zinc-200/90 bg-gradient-to-br from-white/85 via-pastel-gray-50/65 to-pastel-gray-100/55 p-6 shadow-[0_22px_48px_-28px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.65)] sm:p-8 dark:border-zinc-700/80 dark:from-zinc-900/75 dark:via-zinc-900/55 dark:to-zinc-950/45 dark:shadow-[0_22px_48px_-28px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-labelledby="collection-interactive-label"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-pastel-gray-200/35 blur-3xl dark:bg-zinc-600/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-pastel-beige-100/30 blur-3xl dark:bg-zinc-700/10"
        aria-hidden
      />

      <p id="collection-interactive-label" className="sr-only">
        Интерактивный просмотр серии «Черновики личности»: слева общая композиция, справа
        увеличенный фрагмент.
      </p>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 lg:gap-y-6">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Общая композиция
            </p>
            <span className="rounded-full border border-zinc-200/90 bg-white/60 px-2.5 py-0.5 text-[0.65rem] font-medium text-zinc-600 shadow-sm dark:border-zinc-600/80 dark:bg-zinc-800/70 dark:text-zinc-300">
              Наведите на работы
            </span>
          </div>

          <figure className="group relative overflow-hidden rounded-2xl border border-zinc-300/75 bg-zinc-100/40 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-white/50 dark:border-zinc-600/70 dark:bg-zinc-950/35 dark:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)] dark:ring-white/5">
            <div
              className="relative w-full cursor-pointer"
              style={{ aspectRatio: main.aspectRatio ?? "4/3" }}
            >
              <Image
                src={main.src}
                alt={main.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 62rem"
                className="object-cover transition-[filter] duration-500 group-hover:brightness-[1.02] pointer-events-none"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/10 via-transparent to-zinc-900/[0.07] dark:from-black/25 dark:to-black/10"
                aria-hidden
              />
              {related.map((item) => {
                const hs = COLLECTION_HOTSPOTS[item.id];
                if (!hs) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    aria-label={`Показать ${item.alt}`}
                    aria-current={item.id === activeId ? "true" : undefined}
                    className="absolute z-20 cursor-pointer rounded-xl transition-all duration-500 ease-out hover:scale-[1.03] hover:bg-white/16 focus-visible:scale-[1.03] focus-visible:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400/80 dark:focus-visible:outline-zinc-500"
                    style={{
                      left: `${hs.x}%`,
                      top: `${hs.y}%`,
                      width: `${hs.w}%`,
                      height: `${hs.h}%`,
                    }}
                  />
                );
              })}
              {activeHotspot ? (
                <span
                  key={activeId}
                  className="pointer-events-none absolute z-10 rounded-xl bg-white/16 shadow-[0_0_18px_rgba(255,255,255,0.42),0_12px_26px_-18px_rgba(15,23,42,0.45)] transition-all duration-700 ease-out animate-[pulse_4.8s_ease-in-out_infinite]"
                  style={{
                    left: `${activeHotspot.x + activeHotspot.w * 0.14}%`,
                    top: `${activeHotspot.y + activeHotspot.h * 0.14}%`,
                    width: `${activeHotspot.w * 0.72}%`,
                    height: `${activeHotspot.h * 0.72}%`,
                  }}
                />
              ) : null}
            </div>
            <figcaption className="sr-only">{main.alt}</figcaption>
          </figure>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Фрагмент
              </p>
              <p
                className="max-w-[20rem] text-base font-medium leading-snug tracking-tight text-zinc-900 dark:text-zinc-100"
                aria-live="polite"
              >
                {activePicture?.alt ?? "Выберите область слева"}
              </p>
            </div>
            <span className="shrink-0 tabular-nums rounded-lg border border-zinc-200/90 bg-white/55 px-2 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-600/80 dark:bg-zinc-800/60 dark:text-zinc-300">
              {activeIdx + 1}
              <span className="text-zinc-400 dark:text-zinc-500">/</span>
              {related.length}
            </span>
          </div>

          <figure className="relative w-full max-w-[min(100%,28rem)] shrink-0 overflow-hidden rounded-2xl border border-zinc-300/70 bg-gradient-to-b from-white/90 to-pastel-gray-50/80 p-1 shadow-[0_16px_36px_-22px_rgba(15,23,42,0.4)] dark:border-zinc-600/75 dark:from-zinc-800/90 dark:to-zinc-950/80 dark:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.55)] sm:p-1.5 lg:max-w-none">
            <div
              className="relative w-full overflow-hidden rounded-[0.85rem] ring-1 ring-inset ring-zinc-900/5 dark:ring-white/10"
              style={{ aspectRatio: "1/1" }}
            >
              {activePicture ? (
                <div
                  ref={rightPreviewRef}
                  className="relative h-full w-full"
                >
                  <Image
                    key={activePicture.src}
                    src={activePicture.src}
                    alt={activePicture.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 42vw, 36rem"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
            <figcaption className="sr-only">
              {activePicture?.alt ?? "Выбранная мини-картина серии"}
            </figcaption>
          </figure>

          <div className="flex flex-col gap-3 border-t border-zinc-200/70 pt-4 dark:border-zinc-600/50">
            <div
              className="flex flex-wrap items-center gap-2"
              aria-label="Фрагменты серии «Черновики личности»"
            >
              {related.map((item, idx) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    onMouseEnter={() => setActiveId(item.id)}
                    aria-pressed={isActive}
                    aria-label={`Показать фрагмент ${idx + 1}: ${item.alt}`}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? "scale-125 bg-zinc-900 shadow-[0_0_0_3px_rgba(24,24,27,0.12)] dark:bg-zinc-100 dark:shadow-[0_0_0_3px_rgba(255,255,255,0.14)]"
                        : "bg-zinc-300/95 hover:scale-110 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Наведите курсор на фрагменты слева или выберите точку ниже — справа
              откроется соответствующее полотно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PicturesGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const noteRef = useRef<HTMLElement>(null);
  const textLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeWork = WORKS[activeIndex] ?? WORKS[0];
  const activeMeta = useMemo(
    () =>
      WORKS_META[activeWork?.id] ?? {
        title: activeWork?.alt ?? "Работа",
        medium: "Масло, холст",
        text: "Описание будет добавлено позже.",
      },
    [activeWork],
  );
  const activeTextLines = useMemo(
    () =>
      activeMeta.text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [activeMeta.text],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const card = noteRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(card, {
        opacity: 0,
        y: 26,
        x: 16,
        filter: "blur(4px)",
      }, {
        opacity: 1,
        y: 0,
        x: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 72%",
          once: true,
          scroller: document.documentElement,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const card = noteRef.current;
    if (!card) return;
    textLineRefs.current.length = activeTextLines.length;
    const lines = textLineRefs.current.filter(Boolean) as HTMLParagraphElement[];
    gsap.fromTo(
      card,
      { opacity: 0.65, y: 8 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
    );
    if (lines.length) {
      gsap.fromTo(
        lines,
        { opacity: 0, y: 10, filter: "blur(2px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
        },
      );
    }
  }, [activeWork?.id, activeTextLines.length]);

  return (
    <section
      ref={rootRef}
      id="pictures-gallery"
      className="relative z-30 -mt-[min(37vh,19rem)] overflow-x-visible border-0 bg-[linear-gradient(180deg,#e0ded9_0%,#e7e4df_24%,#eceae7_56%,#f6f5f3_100%)] px-6 pb-20 pt-12 dark:bg-[linear-gradient(180deg,#f3f5f7_0%,#3b4249_18%,#242a31_40%,#161b21_62%,#0a0d11_100%)]"
      aria-labelledby="pictures-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[clamp(6rem,16vh,12rem)]"
        style={{
          background:
            "linear-gradient(180deg, #e0ded9 0%, rgba(224,222,217,0.9) 24%, rgba(212,209,203,0.45) 52%, rgba(212,209,203,0) 100%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-7xl overflow-x-visible overflow-y-visible pt-4">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8">
          <div>
            <WorksGallery3D item={activeWork ?? null} />
          </div>
          <aside
            data-art-note
            ref={noteRef}
            className="text-zinc-700 dark:text-zinc-300"
            aria-label={`Описание картины ${activeMeta.title}`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((v) => (v - 1 + WORKS.length) % WORKS.length)
                }
                className="rounded-md border border-zinc-300 bg-zinc-100/80 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
              >
                Назад
              </button>
              {WORKS.map((w, idx) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={
                    idx === activeIndex
                      ? "rounded-md border border-zinc-900 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "rounded-md border border-zinc-300 bg-zinc-100/80 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                  }
                >
                  {WORKS_META[w.id]?.title ?? w.id}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveIndex((v) => (v + 1) % WORKS.length)}
                className="rounded-md border border-zinc-300 bg-zinc-100/80 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
              >
                Вперёд
              </button>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {activeMeta.title}
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              {activeMeta.medium}
            </p>
            <div className="mt-2 space-y-1.5">
              {activeTextLines.map((line, idx) => (
                <p
                  key={`${activeWork?.id ?? "work"}-${idx}`}
                  ref={(el) => {
                    textLineRefs.current[idx] = el;
                  }}
                  className="text-sm leading-snug"
                >
                  {line}
                </p>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-20 border-t border-zinc-300/35 pt-16 dark:border-zinc-600/35">
          <header className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              Серия мини-картин
            </p>
            <h4
              className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[1.65rem] dark:text-zinc-50"
              id="collection-heading"
            >
              Черновики личности
            </h4>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Одна сцена на мольберте объединяет несколько эскизов — проведите курсором по
              композиции, чтобы увидеть каждую мини-картину отдельно.
            </p>
            <div
              className="mx-auto h-px w-12 bg-gradient-to-r from-transparent via-zinc-400/70 to-transparent dark:via-zinc-500/60"
              aria-hidden
            />
          </header>
          <CollectionInteractive main={COLLECTION_MAIN} related={COLLECTION_RELATED} />
        </div>
      </div>

    </section>
  );
}
