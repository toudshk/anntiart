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
