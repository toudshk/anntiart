/** Ошибки подключения / аутентификации к Postgres (не «запись не найдена»). */
export function isDbConnectionError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  if (/Authentication failed against database/i.test(msg)) return true;
  if (/Can't reach database server/i.test(msg)) return true;
  if (/The provided database credentials are not valid/i.test(msg)) return true;
  if (/P1000|P1001|P1017|P1011/i.test(msg)) return true;
  if (/PrismaClientInitializationError/i.test(msg)) return true;
  if (/ECONNREFUSED/i.test(msg)) return true;
  return false;
}
