# Cours Magistral : Migration de Production (Next.js + Nginx + PM2)

Ce guide est un manuel complet détaillant la migration du site `courstrompette.fr` depuis Vercel vers une infrastructure dédiée chez Hetzner. Il est conçu pour servir de référence technique, allant des bases fondamentales aux concepts d'ingénierie avancés.

---

## Sommaire
1. [L'Infrastructure (Le Hardware & Réseau)](#1-linfrastructure)
2. [L'Application & PM2 (Gestion des Processus)](#2-lapplication--pm2)
3. [Nginx : Le Reverse Proxy (Le Coeur du Serveur)](#3-nginx--le-reverse-proxy)
4. [Le Système DNS (L'Aiguillage Mondial)](#4-le-système-dns)
5. [La Sécurité SSL/HTTPS (Le Cadenas)](#5-la-sécurité-sslhttps)
6. [La Stratégie SEO (Le Déménagement Invisible)](#6-la-stratégie-seo)
7. [Next.js en Self-Hosting vs Vercel](#7-nextjs-en-self-hosting-vs-vercel)
8. [Maintenance & Monitoring Professionnel](#8-maintenance--monitoring)

---

## 1. L'Infrastructure
Nous utilisons un **VPS (Virtual Private Server)** chez Hetzner (IP: `46.62.243.117`).

### Les Concepts de Base
- **Serveur Dédié vs VPS** : Un VPS est une "partie" d'un gros serveur physique découpée par logiciel. C'est plus flexible et moins cher qu'un serveur entier.
- **Le Concept Multi-App** : Un serveur peut héberger des dizaines de sites. Pour les différencier, on utilise des **Ports**.
- **La Stratégie des Ports** : Le port 80 (HTTP) est la porte d'entrée publique. Mais derrière, chaque application a son bureau privé :
  - **Courstrompette** : **Port 3005**
  - *Gladiateurs* : Autre port
  - *Dream-API* : Autre port

---

## 2. L'Application & PM2
PM2 (Process Manager 2) est l'outil qui maintient votre code en vie.

### 🟢 Les Bases (Déploiement)
1. **Git** : On télécharge le code depuis le dépôt central dans `/var/www/courstrompette`.
2. **Build** : `npm run build` compile le code pour le rendre ultra-performant.
3. **PM2 Start** : On lance l'app avec `pm2 start npm --name "courstrompette" -- start -- -p 3005`.

### 🎓 Niveau Avancé (Ingénierie de Production)
- **Persistance** : Si le serveur redémarre (MAJ système), PM2 relance vos apps automatiquement (via la commande `pm2 save`).
- **Graceful Shutdown** : PM2 n'arrête pas l'app brutalement. Il envoie un signal `SIGINT` (interruption propre) pour laisser à Next.js le temps de finir les requêtes en cours avant de libérer la mémoire.
- **Modes de fonctionnement** :
    - **Mode Fork** : L'app tourne sur un seul fil (thread). Simple et fiable.
    - **Mode Cluster** : L'app est clonée sur tous les cœurs du CPU (ex: 4 fois) pour diviser la charge de travail.
- **Zero-Downtime** : La commande `pm2 reload` permet de redémarrer l'app sans que les visiteurs ne s'en aperçoivent (les anciennes instances s'arrêtent seulement quand les nouvelles sont prêtes).

---

## 3. Nginx : Le Reverse Proxy
C'est la pièce maîtresse du serveur. C'est le "réceptionniste" qui accueille les visiteurs.

### 🟢 Les Bases (Le rôle de Proxy)
Le visiteur tape `courstrompette.fr` (Port 80). Nginx reçoit la demande, regarde sa liste, et "passe le relais" à l'application interne qui attend sur le port 3005. Cela s'appelle un **Reverse Proxy**.

### 🎓 Niveau Avancé (Architecture & Performance)
- **Gestion des Fichiers de Configuration** :
    - `/etc/nginx/sites-available/` : Le dossier où on écrit les règles (la zone de brouillon).
    - `/etc/nginx/sites-enabled/` : Le dossier actif. On utilise des **liens symboliques** (raccourcis) pour lier les deux. On active/désactive un site en ajoutant/supprimant le lien sans toucher au fichier source.
- **Proxy Buffering** : Nginx lit la réponse de Next.js très vite, la stocke dans sa RAM (buffer), et l'envoie au client. Cela libère Next.js immédiatement pour la requête suivante.
- **Proxy Headers** : Nginx injecte des informations cruciales dans la requête :
    - `X-Real-IP` : Transmet la vraie adresse IP du visiteur à l'application.
    - `Host` : Dit à l'application quel nom de domaine a été utilisé.
- **Événementiel (Event-driven)** : Contrairement aux vieux serveurs, Nginx ne crée pas un processus gourmand par visiteur. Il gère des milliers de connexions en "asynchrone", ce qui consomme très peu de RAM.

---

## 4. Le Système DNS
Le DNS (Domain Name System) est l'annuaire du web.

- **Record A** : Lie directement un nom (`courstrompette.fr`) à une IP (`46.62.243.117`).
- **Record CNAME** : Un "alias". Le `www` pointe vers le domaine principal pour éviter de doubler les configurations.
- **TTL (Time To Live)** : Le temps pendant lequel les fournisseurs d'accès gardent l'adresse en mémoire avant de demander à nouveau au DNS.

---

## 5. La Sécurité SSL/HTTPS
Grâce à **Certbot** et **Let's Encrypt**, nous avons sécurisé les échanges.

- **Le Certificat** : Une preuve mathématique que vous êtes bien `courstrompette.fr`.
- **SSL Termination** : C'est Nginx qui gère le déchiffrement du "cadenas". L'application Next.js reçoit ensuite du trafic clair et rapide. Cela économise les ressources de l'application.

---

## 6. La Stratégie SEO
Le but est de garder vos positions sur Google après le déménagement.

- **La Redirection 301** : C'est l'ordre de "redirection permanente". Google comprend que l'ancienne adresse (lecoledes1.com) est "fusionnée" avec la nouvelle.
- **Le Changement d'adresse (GSC)** : On informe officiellement les algorithmes de Google que le site a déménagé. Cela accélère le transfert de autorité (PageRank).

---

## 7. Next.js en Self-Hosting vs Vercel
- **Node.js Persistant** : Sur votre serveur, l'application est toujours "chaude" et démarrée. Sur Vercel, elle peut être "endormie" (Cold Start) si personne ne visite le site.
- **ISR (Incremental Static Regeneration)** : Votre serveur génère des fichiers HTML statiques dans le dossier `.next/server` dès qu'un contenu change, ce qui rend le site ultra-rapide.

---

## 8. Maintenance & Monitoring
Un administrateur serveur surveille la santé de ses outils :
- **PM2 monit** : Interface en temps réel pour voir la consommation de RAM et de CPU.
- **Logs Nginx** : `/var/log/nginx/access.log` (qui vient) et `error.log` (pourquoi ça plante).
- **Aide-mémoire Mise à jour** :
```bash
git pull              # 1. On récupère le nouveau code
npm run build         # 2. On compile pour la production
pm2 reload courstrompette  # 3. On applique sans coupure (Zero-downtime)
```

**Bravo ! Vous avez maintenant une vision complète de l'architecture d'un site web moderne en production.** 🎺💡✨
