param (
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "🚀 Git Push Automatisé..." -ForegroundColor Cyan

# Add all changes
Write-Host "1. Adding all files (git add .)..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "2. Committing: $Message" -ForegroundColor Yellow
git commit -m "$Message"

# Push
Write-Host "3. Pushing to remote..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Succès ! Changements poussés." -ForegroundColor Green
} else {
    Write-Host "❌ Une erreur est survenue lors du push." -ForegroundColor Red
}
