# Sécurité, Authentification & Autorisations

Ce document définit les standards de sécurité pour l'ensemble du projet (Web & Mobile). La sécurité ne doit jamais être une option et doit être implémentée au niveau le plus bas possible (API).

## 1. Protection des Routes API ([`src/app/api/`](src/app/api/))

Toutes les routes API, à l'exception de la route de login, doivent vérifier l'identité et les droits de l'utilisateur.

### Authentification Admin
La plupart des routes de gestion (élèves, leçons, packs) nécessitent un accès Administrateur.
- **Règle** : Utilisez [`requireAdminSession(request)`](src/lib/route-helpers.ts:5) au tout début de la fonction.
- **Gestion du retour** : Si la fonction retourne une instance de `Response`, elle doit être retournée immédiatement par la route.

```typescript
export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session; // Protection immédiate
  // ... logique
}
```

### Authentification Étudiant
Pour les routes spécifiques aux élèves (ex: `api/me/...`), nous devons vérifier que l'utilisateur est bien l'élève concerné.
- **Règle** : Utilisez `requireStudentSession(request)`.
- **Principe de moindre privilège** : Un étudiant ne doit jamais pouvoir accéder aux données d'un autre étudiant.

---

## 2. Gestion des Secrets et Environnement

### Variables d'Environnement
- **Règle** : Ne jamais commiter le fichier `.env`. Utilisez toujours `.env.example` pour documenter les variables nécessaires.
- **Validation** : Validez les variables d'environnement au démarrage de l'application (ex: via un schéma Zod dans un fichier `env.mjs`).

### Secrets Sensibles
- `JWT_SECRET` : Doit être une chaîne longue et complexe générée aléatoirement.
- `DATABASE_URL` : Ne doit jamais être exposée côté client (ne pas utiliser le préfixe `NEXT_PUBLIC_`).

---

## 3. Sécurité des Mots de Passe

### Stockage
- **Règle** : N'utilisez jamais de texte brut. Utilisez `bcryptjs` avec un "salt round" de 12 minimum.
- **Emplacement** : La logique de hachage doit se trouver dans [`src/lib/auth/security.ts`](src/lib/auth/security.ts).

### Politique de Changement
- Le champ `mustChangePassword` dans le modèle `User` doit être mis à `true` lors de la création d'un compte par un admin.
- L'utilisateur doit être redirigé vers une page de changement de mot de passe tant que ce flag est actif.

---

## 4. Protection contre les attaques communes

### CSRF & XSS
- Next.js gère une grande partie de ces protections nativement.
- **Règle** : N'utilisez `dangerouslySetInnerHTML` que si c'est absolument nécessaire et après avoir assaini (sanitize) le contenu.

### Rate Limiting
- Les routes sensibles (login, refresh token) doivent être limitées en nombre de requêtes pour éviter les attaques par force brute.

---

## 5. Audit et Logs

### Logs de Sécurité
- Chaque échec d'authentification doit être loggué (sans les mots de passe) pour identifier les tentatives d'intrusion.
- **Exemple** : `console.warn(`Failed login attempt for email: ${email}`)`.

---

## Pourquoi ces règles ?
1. **Confidentialité** : Les données des élèves (adresses, téléphones) sont sensibles.
2. **Intégrité** : Empêcher la modification non autorisée des paiements ou des leçons.
3. **Disponibilité** : Protéger l'API contre les abus qui pourraient ralentir le service.
