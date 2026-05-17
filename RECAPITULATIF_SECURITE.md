# Recapitulatif securite - courstrompette

Date: 2026-05-11

## Resume executif

Le projet dispose deja de plusieurs protections importantes: espace admin protege par cookie HTTP-only signe, middleware Next.js sur `/admin` et `/api/admin`, endpoint cron URSSAF protege par secret, headers de securite globaux, validation du formulaire de contact, honeypot antispam et limitation de tentatives en memoire.

Les points a traiter en priorite sont le durcissement des secrets et mots de passe, la persistance des rate limits hors memoire, la verification des dependances npm, et le durcissement serveur cote VPS/Nginx si l'application est exposee hors Vercel.

## Protections deja en place

### Administration

- Les routes `/admin/*` sont protegees par `src/middleware.ts`.
- Les routes `/api/admin/*` sont protegees par le meme middleware.
- La session admin utilise le cookie `courstrompette_admin_session`.
- Le cookie admin est `httpOnly`, `sameSite: strict`, `secure` en production, avec une duree de vie de 12 heures.
- Le token admin est signe en HMAC SHA-256 via Web Crypto.
- La page de connexion admin est en `robots: noindex`.
- Les redirections apres connexion sont limitees aux chemins commencant par `/admin`, ce qui reduit le risque d'open redirect.
- Les tentatives de connexion admin sont limitees a 10 essais sur 10 minutes par IP.

### API et cron

- `/api/cron/urssaf-sync` exige `CRON_SECRET` via `Authorization: Bearer ...` ou `x-cron-secret`.
- Les routes systeme sensibles, comme `/api/admin/system/health`, exigent une session admin.
- Les erreurs URSSAF sont gerees sans renvoyer de stack trace brute.

### Formulaire de contact

- Validation des champs nom, email, telephone, experience et longueur du message.
- Honeypot via le champ `company`.
- Rate limit de 5 requetes sur 10 minutes par IP.
- Echappement HTML des donnees utilisateur avant insertion dans les emails HTML.
- Configuration SMTP lue depuis les variables d'environnement.

### Headers HTTP

`next.config.mjs` applique des headers globaux utiles:

- `Strict-Transport-Security`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Permitted-Cross-Domain-Policies: none`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`
- `Permissions-Policy`
- `Content-Security-Policy`
- `poweredByHeader: false`

## Risques et limites identifies

### Priorite haute

1. Les rate limits admin et contact sont stockes en memoire Node.js.
   - Limite: ils disparaissent au redemarrage et ne sont pas partages entre plusieurs instances.
   - Action recommandee: utiliser Redis, Upstash, Postgres, ou un rate limit Nginx/Cloudflare en amont.

2. Le mot de passe admin est compare en clair avec `ADMIN_PASSWORD`.
   - Limite: si `.env` fuit, le mot de passe est directement compromis.
   - Action recommandee: stocker un hash bcrypt/argon2 dans `ADMIN_PASSWORD_HASH`, puis comparer avec `bcrypt.compare`.

3. Les secrets doivent etre longs et uniques.
   - Variables critiques: `ADMIN_SESSION_SECRET`, `CRON_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, `SMTP_PASS`, variables URSSAF.
   - Action recommandee: minimum 32 octets aleatoires pour les secrets de session, cron et JWT.

4. Verification npm non confirmee dans ce recapitulatif.
   - Action recommandee: executer `npm audit --omit=dev`, puis traiter les failles exploitables en production.

### Priorite moyenne

1. La comparaison de signature admin n'est pas strictement constant-time.
   - Fichier: `src/lib/admin-auth.ts`
   - Impact: risque faible dans ce contexte, mais ameliorable.
   - Action recommandee: utiliser une comparaison constant-time compatible runtime cible, ou verifier via `crypto.subtle.verify`.

2. La Content Security Policy autorise `'unsafe-inline'` et `'unsafe-eval'`.
   - Impact: necessaire parfois avec Next.js/dev/libs, mais moins strict en production.
   - Action recommandee: tester une CSP plus stricte en production, idealement avec nonces/hashes si possible.

3. `Permissions-Policy` autorise `microphone=(self)`.
   - Impact: coherent si l'app utilise l'accordeur ou une fonctionnalite audio.
   - Action recommandee: conserver seulement si indispensable.

4. Le fallback `dev_secret_only` existe pour les JWT hors production.
   - Fichier: `src/lib/auth/tokens.ts`
   - Impact: acceptable en dev, dangereux si `NODE_ENV` est mal configure.
   - Action recommandee: verifier que `NODE_ENV=production` est bien applique sur le serveur.

5. Les endpoints publics de contact reposent sur un rate limit applicatif simple.
   - Action recommandee: ajouter une protection amont Nginx/Cloudflare et surveiller les volumes.

### Priorite basse

1. Plusieurs textes affichent des caracteres mal encodes dans `src/app/login/page.tsx`.
   - Impact: qualite UX, pas une faille directe.
   - Action recommandee: corriger l'encodage UTF-8.

2. La dependance `fs: 0.0.1-security` est presente.
   - Impact: package placeholder generalement inutile dans un projet Node moderne.
   - Action recommandee: verifier si elle est necessaire; sinon la retirer.

## Checklist production

- [ ] `NODE_ENV=production` confirme sur le serveur.
- [ ] HTTPS actif et redirection HTTP vers HTTPS active.
- [ ] `ADMIN_SESSION_SECRET` aleatoire, long et unique.
- [ ] `ADMIN_PASSWORD` remplace par un hash ou par un secret stocke dans un gestionnaire adapte.
- [ ] `CRON_SECRET` aleatoire, long et non reutilise ailleurs.
- [ ] `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` definis en production si l'ancien portail eleve reste actif.
- [ ] `.env`, `.env.local` et dumps SQL absents du depot Git distant.
- [ ] `npm audit --omit=dev` execute et resultat documente.
- [ ] Rate limiting Nginx/Cloudflare active sur `/login`, `/api/contact`, `/api/cron/*`.
- [ ] Fail2Ban ou equivalent actif sur le VPS si exposition directe.
- [ ] Backups Postgres testes en restauration, pas seulement crees.
- [ ] Logs applicatifs surveilles pour 401/429/500 anormaux.

## Commandes utiles

```powershell
npm audit --omit=dev
npm run build
npx tsc --noEmit --incremental false
```

Sur le VPS, adapter selon l'installation:

```bash
sudo nginx -t
sudo systemctl status nginx
pm2 status
pm2 logs courstrompette --lines 100
```

## Actions recommandees dans l'ordre

1. Lancer un audit npm et corriger les failles production.
2. Remplacer le mot de passe admin en clair par un hash.
3. Externaliser les rate limits ou ajouter une couche Nginx/Cloudflare.
4. Verifier la configuration production: `NODE_ENV`, HTTPS, secrets, backups.
5. Tester la CSP stricte sur staging avant production.

