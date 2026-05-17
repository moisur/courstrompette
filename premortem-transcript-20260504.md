# Premortem Transcript - JC Trompette
Date : 4 Mai 2026

## 🎯 Contexte du Projet
- **URSSAF :** Intégration de l'Avance Immédiate via API-EDI.
- **VPS :** Hébergement Hetzner, Next.js 15, Nginx, PM2.
- **Billing :** Flux Student -> Lesson -> Payment Request.

---

## 💀 Scénarios d'Échec (Analyses Profondes)

### 1. Intégration URSSAF : "L'impasse administrative"
**L'histoire :** Un étudiant s'inscrit, mais ses coordonnées bancaires sont refusées par l'URSSAF après 3 jours (statut "60"). Ton application ne reçoit pas de notification car tu n'as pas de Webhook (tu fais du polling). L'étudiant pense avoir payé, toi aussi. 2 mois plus tard, tu réalises que 400€ manquent à l'appel.
**Hypothèse :** La réponse immédiate de l'API (`200 OK`) garantit que le paiement sera effectué.
**Signal d'alerte :** Un nombre croissant de requêtes restant au statut "En attente de validation" pendant plus de 72h.

### 2. VPS Hetzner : "L'attaque par épuisement"
**L'histoire :** Une faille de sécurité mineure dans une dépendance npm permet à un bot d'envoyer des milliers de requêtes sur ton endpoint de recherche. PM2 tente de logger chaque erreur. Le CPU sature, le serveur devient inaccessible même en SSH (OOM Killer). Comme tu n'as pas configuré `fail2ban` ou de Rate Limiting strict au niveau Nginx, le serveur tombe en 5 minutes.
**Hypothèse :** "Personne ne va s'attaquer à un petit site de cours de trompette."
**Signal d'alerte :** Pics de CPU inexpliqués dans le monitoring Hetzner.

### 3. Workflow Billing : "La dérive des données"
**L'histoire :** Tu modifies le montant d'une leçon *après* l'avoir incluse dans une `UrssafPaymentRequest`. Ta DB affiche un total, mais l'URSSAF en prélève un autre. Lors de ton bilan comptable, rien ne correspond. Tu perds 3 jours à pointer chaque leçon manuellement.
**Hypothèse :** Les leçons sont immuables une fois la demande de paiement créée.
**Signal d'alerte :** Modifications de leçons ayant un `urssafPaymentRequestId` non nul.

---

## 🛡️ Plan Révisé (Actions Immédiates)

1. **Verrouillage Data :** Empêcher (via Prisma ou logique service) toute modification d'une leçon liée à une `urssafPaymentRequest`.
2. **Hardening VPS :** Appliquer le workflow `/security_hardening` (UFW, Rate Limit Nginx, Fail2Ban).
3. **Automatisation Sync :** Ne plus compter sur le clic bouton pour synchroniser. Ajouter une route API `/api/cron/sync-urssaf` protégée par un token secret.
4. **Validation UX :** Ajouter un "Check d'éligibilité" (Nationalité, Déclaration fiscale) dans le formulaire d'inscription.

---
*Fin du transcript.*
