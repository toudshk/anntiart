# Anntiart

Сайт-галерея на `Next.js` с базовой backend-основой:

- `Postgres + Prisma` для данных
- `NextAuth (Credentials)` для входа в админку
- admin API для работ (`/api/admin/artworks`)

## Быстрый запуск

```bash
bun install
cp .env.example .env
```

Заполните `.env`:

- `DATABASE_URL` — если пароль содержит `^`, `#`, `@`, `%` и т.п., закодируйте их в URL (например в PowerShell: `[uri]::EscapeDataString('ваш_пароль')`) и подставьте в строку `postgresql://USER:ПАРОЛЬ@HOST:5432/DB`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`

Хэш пароля:

```bash
bun run auth:hash -- "your-password"
```

В `.env` каждый символ `$` в bcrypt-строке нужно экранировать как `\$` (иначе Next.js подставит «переменные» и хеш сломается).

Подготовить БД:

```bash
bun run prisma:generate
bun run prisma:push
```

Запуск:

```bash
bun run dev
```

## Админка

После входа (`/admin/login`) открывается **`/admin`**: список работ, добавление и редактирование.

Главная страница лендинга подтягивает **опубликованные** работы из БД. Если в какой‑то секции (`works` / `collection`) нет ни одной опубликованной записи, для неё используется прежний статический набор из `view/constants/pictures.ts`.

**Коллекция:** у каждой записи секции `collection` в форме задаются **ширина и высота (см)** — по ним считается aspect ratio для отображения. Для **общей композиции** включите «Общая композиция»; для **фрагментов** дополнительно укажите hotspot (x, y, w, h в процентах от композиции).

## API

- `GET /api/admin/artworks` — список (только admin)
- `POST /api/admin/artworks` — создать (только admin)
- `PATCH /api/admin/artworks/[slug]` — обновить (только admin)
- `DELETE /api/admin/artworks/[slug]` — удалить (только admin)
- `POST /api/admin/upload` — загрузка изображения, поле формы `file` (multipart), ответ `{ "url": "/uploads/artworks/…" }` (только admin; файлы пишутся в `public/uploads/artworks`)
- `/api/auth/*` — NextAuth

После изменения `schema.prisma` снова выполните `bun run prisma:push` (или миграцию).

## Prisma Studio

```bash
bun run prisma:studio
```
