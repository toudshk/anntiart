/** Транслитерация кириллицы (рус.) в латиницу для URL-slug. */
const CYR: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const MAX_SLUG = 120;

const MIN_SLUG_LEN = 2;

/** Slug из названия: латиница, цифры, дефисы; пустая строка, если нечего взять. */
export function slugFromTitle(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (!lower) return "";

  let out = "";
  for (const ch of lower) {
    const tr = CYR[ch];
    if (tr !== undefined) {
      out += tr;
      continue;
    }
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      continue;
    }
    if (/[\s\-_–—.,:;!?()[\]{}«»"']/.test(ch)) {
      out += "-";
    }
  }

  return out
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG);
}

function stableSuffix(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 6).padStart(6, "0");
}

/** Гарантирует slug длиной ≥ 2 для API и маршрутов админки. */
export function resolveArtworkSlug(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";

  const base = slugFromTitle(trimmed);
  if (base.length >= MIN_SLUG_LEN) return base;
  if (base.length === 1) return `${base}${base}`;
  return `work-${stableSuffix(trimmed)}`.slice(0, MAX_SLUG);
}
