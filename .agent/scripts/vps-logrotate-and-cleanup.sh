#!/bin/bash
# Script de maintenance et nettoyage VPS pour courstrompette
set -e

echo "=== 1. Désactivation et arrêt du service chat-api ==="
if systemctl list-units --type=service | grep -q "chat-api"; then
  echo "Arrêt du service chat-api..."
  sudo systemctl stop chat-api || true
  echo "Désactivation du service chat-api..."
  sudo systemctl disable chat-api || true
  echo "✅ Service chat-api arrêté et désactivé avec succès."
else
  echo "Le service chat-api n'a pas été trouvé ou est déjà désactivé."
fi

echo -e "\n=== 2. Installation et configuration de pm2-logrotate ==="
if command -v pm2 &> /dev/null; then
  echo "Installation de pm2-logrotate..."
  pm2 install pm2-logrotate || true
  
  echo "Configuration des limites de logs..."
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 5
  
  echo "✅ pm2-logrotate configuré : max size = 10M, retention = 5 fichiers."
else
  echo "⚠️ PM2 n'est pas installé ou inaccessible dans le PATH actuel."
fi

echo -e "\n=== 3. Libération de mémoire cache système ==="
echo "Nettoyage du cache npm..."
npm cache clean --force || true

echo "Nettoyage du cache de build résiduel..."
rm -rf /home/djiss/courstrompette_build_* || true

echo "=== VPS Cleaned & Optimized! ==="
