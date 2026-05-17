@'
# TODO demain - Trumpeeeet (Web + Mobile + PostgreSQL)

## 1. Reprendre l’environnement
- Ouvrir PowerShell dans `C:\Users\jean-\Desktop\Trumpeeeet\project`
- Vérifier Node:
  - `node -v`
  - `npm -v`
  - `where.exe node`
- Si Node non détecté:
  - `$env:Path = "C:\nvm4w\nodejs;$env:Path"`

## 2. Installer + Prisma
- `npm install`
- `npm run prisma:generate`
- Vérifier `.env` (au minimum):
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `MONGODB_URI` (temporaire migration)

## 3. Base PostgreSQL
- `npm run prisma:deploy`
- `npm run prisma:seed-admin`
- `npm run db:migrate:mongo`

## 4. Vérification technique
- `npx tsc --noEmit`
- Corriger erreurs TS restantes
- `npm run build`

## 5. Tests API auth
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## 6. Tests API métier
- Créer élève
- Créer pack
- Créer cours payé/non payé
- Payer via pack
- Supprimer cours lié pack
- Supprimer pack
- Vérifier `/api/me/summary`

## 7. Finitions web
- Finaliser écran admin activation compte élève:
  - email
  - activation
  - reset mdp temporaire
- Vérifier redirection login/logout

## 8. Mobile Expo (MVP)
- `cd mobile`
- `npm install`
- `EXPO_PUBLIC_API_BASE_URL` à définir
- `npm run start`
- Tester login admin + login élève + logout

## 9. APK
- `npm run apk` (dans `mobile/`)
- Publier APK sur ton domaine

## 10. Déploiement Hetzner (sans Docker)
- `npm install`
- `npm run prisma:generate`
- `npm run prisma:deploy`
- `npm run prisma:seed-admin`
- `npm run build`
- Lancer avec PM2 + Nginx reverse proxy
- Mettre cron `pg_dump`

## Fichiers clés déjà modifiés
- `prisma/schema.prisma`
- `prisma/migrations/0001_init/migration.sql`
- `src/lib/auth/*`
- `src/lib/db.ts`
- `src/app/api/auth/*`
- `src/app/api/me/*`
- `src/app/api/students/*`
- `src/app/api/lessons/*`
- `scripts/migrate-mongo-to-postgres.ts`
- `scripts/seed-admin.ts`
- `mobile/*`
'@ | Set-Content -LiteralPath .\TODO_DEMAIN.md
