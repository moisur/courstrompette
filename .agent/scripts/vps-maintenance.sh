#!/bin/bash

# Configuration
THRESHOLD=85
ADMIN_EMAIL="ton-email@example.com"
LOG_FILE="/var/log/vps-maintenance.log"

echo "--- Maintenance du $(date) ---" >> $LOG_FILE

# 1. Vérification de l'espace disque
CURRENT_USAGE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')

if [ "$CURRENT_USAGE" -gt "$THRESHOLD" ]; then
    echo "ATTENTION : Espace disque à ${CURRENT_USAGE}%" >> $LOG_FILE
    # Ici tu pourrais ajouter un envoi de mail ou une notification
fi

# 2. Nettoyage des logs PM2 (pour éviter le crash silencieux)
echo "Nettoyage des logs PM2..." >> $LOG_FILE
pm2 flush

# 3. Nettoyage du cache npm
echo "Nettoyage du cache npm..." >> $LOG_FILE
npm cache clean --force

# 4. Nettoyage des vieux packages apt
echo "Nettoyage apt..." >> $LOG_FILE
apt-get autoremove -y
apt-get autoclean

echo "Maintenance terminée." >> $LOG_FILE
