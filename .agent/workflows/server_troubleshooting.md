---
description: Guide de diagnostic rapide et résolution des pannes du serveur VPS (CPU, RAM, PM2, Systemd et PostgreSQL)
---

# Guide de Diagnostic & Dépannage VPS Hetzner

Ce workflow fournit une procédure pas-à-pas pour identifier et résoudre rapidement les pannes courantes sur le serveur de production (surcharge CPU/RAM, conflits de ports, crashs PM2, ou dysfonctionnements Nginx/PostgreSQL).

---

## 1. Diagnostic Initial Rapid

En cas de lenteur extrême du site, de `ChunkLoadError` répétés ou d'inaccessibilité du site, exécutez ces commandes depuis la machine locale pour analyser l'état du serveur :

```powershell
# Connexion SSH rapide pour auditer le système (CPU, RAM, Disque, PM2)
ssh -o BatchMode=yes -o ConnectTimeout=5 djiss@46.62.243.117 "echo '--- SYSTEM & UPTIME ---'; uptime; echo '--- DISQUE (Espace disponible) ---'; df -h /; echo '--- MEMOIRE (RAM & Swap) ---'; free -h; echo '--- PM2 PROCESS LIST ---'; pm2 status"
```

### Grille d'évaluation des alertes :
* **Espace Disque > 90%** : Le serveur ne peut plus écrire ses fichiers logs et risque de bloquer Nginx ou PostgreSQL.
* **Mémoire Swap saturée / RAM disponible < 100 Mo** : Risque d'OOM Killer (le système tue de force Next.js pour libérer de la RAM).
* **Processus PM2 avec de nombreux restarts (↺ > 50)** : L'application plante et redémarre en boucle.
* **CPU à 100%** : Un processus est bloqué ou en conflit.

---

## 2. Résoudre les Conflits de Port (Erreur EADDRINUSE)

L'erreur la plus fréquente survient lorsqu'un service système (comme `chat-api`) est démarré via **Systemd** et que **PM2** tente également de le démarrer sous un autre nom, provoquant une boucle infinie de crashs.

### Étape 1 : Identifier le port en conflit
Savoir quel processus écoute sur le port problématique :
```bash
# Remplacer 9475 ou 3005 par le port en conflit
ssh djiss@46.62.243.117 "ss -lptn | grep 9475"
```
*Si aucun nom de processus ne s'affiche, le port est détenu par un processus appartenant à l'utilisateur `root`.*

### Étape 2 : Identifier le propriétaire (si root/système)
```bash
ssh djiss@46.62.243.117 "ps -ef | grep -E 'node|npm|next'"
```

### Étape 3 : Résoudre le doublon
* Si le service doit tourner via **Systemd** (comme le chat-server) :
  ```bash
  # Supprimer le doublon dans PM2 pour stopper la boucle infinie
  ssh djiss@46.62.243.117 "pm2 delete chat-backend && pm2 save"
  ```
* Si le service doit tourner via **PM2** (comme Next.js) :
  ```bash
  # Redémarrer proprement le processus PM2
  ssh djiss@46.62.243.117 "pm2 reload courstrompette"
  ```

---

## 3. Gestion & Maintenance des Services

### A. Le Serveur de Chat (Systemd)
Le serveur de chat est configuré comme un service système indépendant géré par Ubuntu. **N'utilisez jamais PM2 pour le gérer.**

* **Vérifier s'il fonctionne :**
  ```bash
  ssh djiss@46.62.243.117 "systemctl status chat-api"
  ```
* **Redémarrer le chat (nécessite d'intervenir via sudo/root si nécessaire) :**
  ```bash
  ssh djiss@46.62.243.117 "sudo systemctl restart chat-api"
  ```
* **Consulter les logs du chat :**
  ```bash
  ssh djiss@46.62.243.117 "sudo journalctl -u chat-api -n 100 --no-pager"
  ```

### B. Le Site Web Principal (PM2)
Le site `courstrompette.fr` tourne sous PM2.

* **Consulter les logs d'erreurs en direct :**
  ```bash
  ssh djiss@46.62.243.117 "pm2 logs courstrompette --lines 100 --nostream"
  ```
* **Redémarrage sans coupure (Zero-Downtime) :**
  ```bash
  ssh djiss@46.62.243.117 "pm2 reload courstrompette"
  ```

---

## 4. Vérification de la Base de Données (PostgreSQL)

La base de données tourne sous PostgreSQL. Elle est autonome et sécurisée contre les pannes applicatives.

* **Vérifier que PostgreSQL est actif et accepte les connexions :**
  ```bash
  ssh djiss@46.62.243.117 "systemctl status postgresql | grep Active; pg_isready"
  ```
* **Faire une sauvegarde rapide de la base de données :**
  ```bash
  # Crée un fichier de sauvegarde SQL horodaté dans le dossier de l'utilisateur djiss
  ssh djiss@46.62.243.117 "pg_dump -U djiss -d courstrompette > ~/backup_courstrompette_\$(date +%F_%R).sql"
  ```

---

## 5. Dépannage Client : ChunkLoadError & Cache

Si un utilisateur ou un élève rencontre des écrans blancs ou des erreurs `ChunkLoadError` juste après une mise à jour :
1. **La cause** : Son navigateur utilise une ancienne version de la page web qui fait référence à des fichiers temporaires JS écrasés ou rechargés différemment.
2. **La solution** : Lui demander de forcer le rechargement de la page pour vider le cache local :
   * **Windows/Linux** : `Ctrl + F5` ou `Ctrl + Shift + R`
   * **Mac / Safari** : `Cmd + Shift + R` (ou maintenir la touche `Option` tout en cliquant sur l'icône de rafraîchissement).
