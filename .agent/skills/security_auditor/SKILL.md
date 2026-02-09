---
name: security_auditor
description: Outils pour auditer la sécurité du serveur VPS et de l'application Next.js.
---

# Security Auditor Skill

Ce skill fournit des outils pour vérifier la posture de sécurité de l'infrastructure `courstrompette.fr`.

## Scripts

### `audit-headers.ps1`
Vérifie la présence des en-têtes de sécurité HTTP (HSTS, CSP, X-Frame-Options) et s'assure que les signatures techniques (`Server`, `X-Powered-By`, `x-nextjs-cache`) sont bien masquées. Utilise `curl.exe` pour une fiabilité maximale.

**Usage:**
```powershell
./scripts/audit-headers.ps1 -Url "https://courstrompette.fr"
```

### `check-vps-health.ps1`
Se connecte au serveur VPS via SSH pour récupérer un rapport d'état complet :
- OS & Kernel
- Utilisation CPU/RAM/Disque
- Services critiques (Nginx, PM2)
- Ports ouverts
- État du Firewall (UFW)

**Usage:**
```powershell
./scripts/check-vps-health.ps1 -User "root" -Ip "46.62.243.117"
```

## Vérifications Manuelles
- **SSL**: Vérifier la date d'expiration du certificat Let's Encrypt.
- **Fail2Ban**: Vérifier si le service est actif pour prévenir les brutes-force SSH.
