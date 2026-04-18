-- Выполнить в SQL-редакторе панели хостинга под владельцем БД / суперпользователем,
-- если `bun run prisma:push` падает с: must be owner of table Artwork
--
-- После успешного выполнения снова: bun run prisma:push
-- (должен пройти или сообщить, что схема уже совпадает)

ALTER TABLE "Artwork" ADD COLUMN IF NOT EXISTS "isCollectionComposite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Artwork" ADD COLUMN IF NOT EXISTS "hotspotX" DOUBLE PRECISION;
ALTER TABLE "Artwork" ADD COLUMN IF NOT EXISTS "hotspotY" DOUBLE PRECISION;
ALTER TABLE "Artwork" ADD COLUMN IF NOT EXISTS "hotspotW" DOUBLE PRECISION;
ALTER TABLE "Artwork" ADD COLUMN IF NOT EXISTS "hotspotH" DOUBLE PRECISION;
ALTER TABLE "Artwork" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Опционально: чтобы дальнейшие `prisma db push` под пользователем приложения проходили без ошибки владельца:
-- ALTER TABLE "Artwork" OWNER TO anna;
-- (подставь имя пользователя из DATABASE_URL)
