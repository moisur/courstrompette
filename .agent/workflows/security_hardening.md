---
description: Sécurisation du serveur VPS Hetzner et de l'application Next.js
---

# Workflow de Sécurisation (Hetzner VPS)

Ce workflow vous guide pour auditer et renforcer la sécurité de votre serveur.

## 1. Audit Initial
Vérifiez l'état actuel du serveur avant de faire des modifications.

```powershell
./.agent/skills/security_auditor/scripts/check-vps-health.ps1
```

Vérifiez les en-têtes actuels (devrait échouer ou montrer des manquants).

```powershell
./.agent/skills/security_auditor/scripts/audit-headers.ps1
```

## 2. Hardening Application (Next.js)
Appliquez les headers de sécurité dans `next.config.mjs`.

// turbo
```powershell
# Cette étape sera faite via l'éditeur de code (déjà prévu dans le plan)
```

## 3. Hardening Serveur (SSH)
Connectez-vous au serveur (`ssh root@46.62.243.117`) et exécutez ces commandes :

### A. Mise à jour système
```bash
apt update && apt upgrade -y
```

### B. Configuration Firewall (UFW)
Autorisez uniquement le strict nécessaire (SSH, HTTP, HTTPS).
⚠️ **ATTENTION** : Ne fermez pas le port 22 (SSH) sinon vous serez bloqué dehors !

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### C. Masquer la version Nginx
Modifiez `/etc/nginx/nginx.conf` :
```nginx
http {
    # Supprime la version dans l'en-tête "Server"
    server_tokens off;
    
    # --- SECURITE DÉBUT ---
    # Rate Limiting : Limite à 10 requêtes/seconde par IP
    limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
    # --- SECURITE FIN ---
    ...
}
```

### D. Appliquer le Rate Limiting et masquer les en-têtes Next.js
Modifiez le fichier de votre site (ex: `/etc/nginx/sites-available/courstrompette.fr`) :
```nginx
server {
    ...
    location / {
        # Applique la limite (burst=20 autorise un pic)
        limit_req zone=mylimit burst=20 nodelay;
        
        # MASQUAGE DES EN-TÊTES TECHNIQUES
        proxy_hide_header x-nextjs-cache;
        proxy_hide_header x-powered-by; # Optionnel si déjà fait dans next.config.mjs
        
        proxy_pass http://localhost:3005;
        ...
    }
}
```
Puis testez et rechargez : `nginx -t && systemctl reload nginx`

### E. Nettoyage et Sécurisation du Firewall (UFW)
Ne laissez jamais le port 22 ouvert à tout le monde en IPv6.

1. **Autoriser le VPN Interne** (si installé sur le serveur) :
   ```bash
   sudo ufw allow from 10.7.0.0/24 to any port 22
   ```

2. **Autoriser GitHub Actions (via IPv4)** :
   ```bash
   sudo ufw allow 22/tcp
   ```
   *Note : Assurez-vous que **Fail2Ban** est actif pour protéger ce port ouvert.*

3. **Supprimer les règles dangereuses ou redondantes** :
   ```bash
   # Utiliser status numbered pour trouver les numéros
   sudo ufw status numbered
   sudo ufw delete [NUMERO]
   ```

## 4. Protection DDoS & WAF (Cloudflare)
Si vous avez ajouté le domaine à Cloudflare :
1. Activez le mode **"Under Attack"** si nécessaire.
2. Vérifiez que le **SSL/TLS** est en mode "Full (Strict)".
3. Activez les règles **WAF** de base (gratuites).

## 5. Audit Final
Relancez les audits pour valider.

```powershell
./.agent/skills/security_auditor/scripts/audit-headers.ps1
curl.exe -I https://courstrompette.fr
```
