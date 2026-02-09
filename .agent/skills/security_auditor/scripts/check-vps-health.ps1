param (
    [string]$User = "root",
    [string]$Ip = "46.62.243.117"
)

Write-Host "🔌 Connexion au VPS ($User@$Ip)..." -ForegroundColor Cyan

$commands = @(
    "echo '--- SYSTEM ---'",
    "uname -a",
    "uptime",
    "echo '--- MEMORY ---'",
    "free -h",
    "echo '--- DISK ---'",
    "df -h /",
    "echo '--- PORTS (Listening) ---'",
    "ss -plnt", 
    "echo '--- FIREWALL (UFW) ---'",
    "ufw status",
    "echo '--- NGINX ---'",
    "systemctl status nginx | grep Active",
    "echo '--- PM2 ---'",
    "pm2 status"
)

$remoteCommand = $commands -join "; "

# Exécution de la commande SSH
# Note: Cela suppose que la clé SSH est configurée.
ssh -o BatchMode=yes -o ConnectTimeout=5 $User@$Ip $remoteCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la connexion SSH. Vérifiez vos clés ou l'adresse IP." -ForegroundColor Red
} else {
    Write-Host "`n✅ Audit VPS terminé." -ForegroundColor Green
}
