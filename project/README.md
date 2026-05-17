# Trumpeeeet - Web + Mobile (Admin/Eleve)

Application de gestion eleves/cours/paiements manuels.

## Stack

- Web/API: Next.js 15
- DB: PostgreSQL + Prisma
- Auth: JWT access + refresh token (cookies HTTP-only + support Bearer pour mobile)
- Mobile: Expo React Native (`mobile/`)

## Prerequis

- Node.js 20+
- PostgreSQL 16+

## Variables d'environnement

Copier `.env.example` vers `.env` et renseigner:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@127.0.0.1:5432/trumpeeeett?schema=public
MONGODB_URI=mongodb://127.0.0.1:27017/trumpeeett
MONGODB_DB_NAME=trumpeeett
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-admin-password
APP_BASE_URL=https://your-domain.tld
```

## Installation

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed-admin
```

## Migration MongoDB -> PostgreSQL

```bash
npm run db:migrate:mongo
```

Le script est idempotent, conserve `legacy_mongo_id`, recalcule les packs, et peut seed l'admin si `ADMIN_EMAIL` et `ADMIN_PASSWORD` sont definis.

## Lancer le web

```bash
npm run dev
```

Connexion web: `/login`

## API principale

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET /api/auth/me`
- `GET/POST /api/students`
- `GET/PATCH/DELETE /api/students/:id`
- `GET /api/students/:id/lessons`
- `GET/POST /api/students/:id/packs`
- `DELETE /api/students/:id/packs/:packId`
- `POST /api/students/:id/update-payments`
- `GET/POST /api/lessons`
- `DELETE /api/lessons/:id`
- `GET /api/me/student-profile`
- `GET /api/me/lessons`
- `GET /api/me/packs`
- `GET /api/me/summary`

## Mobile (Expo)

Dans `mobile/`:

```bash
npm install
npm run start
```

Variable a definir:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-domain.tld
```

Build APK:

```bash
npm run apk
```

## Deploiement Hetzner (sans Docker)

- Exposer Next.js sur `127.0.0.1:3000` via PM2
- Nginx reverse proxy sur 80/443
- PostgreSQL local en `127.0.0.1:5432`
- Sauvegardes `pg_dump` quotidiennes
