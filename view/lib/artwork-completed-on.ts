/** Строка `ГГГГ-ММ-ДД` из поля `<input type="date">` или из Prisma `@db.Date`. */
export function formatDateOnlyForInput(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

/** Подпись для сайта из ISO `ГГГГ-ММ-ДД` без сдвига часового пояса. */
export function formatCompletedOnRu(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return isoDate;
  const [, y, mo, d] = m;
  return `${d}.${mo}.${y}`;
}
