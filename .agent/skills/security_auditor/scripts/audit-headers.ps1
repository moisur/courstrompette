param (
    [string]$Url = "https://courstrompette.fr"
)

Write-Host "🔍 Audit des en-têtes de sécurité pour : $Url (via curl.exe)" -ForegroundColor Cyan

try {
    # Utilisation de curl.exe pour éviter les alias PowerShell et les problèmes de proxy
    $output = curl.exe -I -s $Url
    
    if ($LASTEXITCODE -ne 0) {
        throw "Erreur lors de l'exécution de curl.exe"
    }

    $securityHeaders = @(
        "Strict-Transport-Security",
        "Content-Security-Policy",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "X-Permitted-Cross-Domain-Policies"
    )

    Write-Host "`n--- Résultats de l'audit ---" -ForegroundColor Gray

    foreach ($header in $securityHeaders) {
        if ($output -match "(?i)$header") {
            $line = $output | Select-String "(?i)$header"
            Write-Host "✅ $header : $($line.ToString().Trim())" -ForegroundColor Green
        } else {
            Write-Host "❌ $header MANQUANT" -ForegroundColor Red
        }
    }

    # Vérification Server "hiding"
    if ($output -match "Server:.*\d") {
        $serverLine = $output | Select-String "Server:"
        Write-Host "⚠️  Header 'Server' exposé avec version : $($serverLine.ToString().Trim())" -ForegroundColor Yellow
    } elseif ($output -match "Server:") {
        Write-Host "✅ Header 'Server' masqué (Version cachée)" -ForegroundColor Green
    }
    
    # Vérification Powered-By
    if ($output -match "X-Powered-By") {
        $poweredLine = $output | Select-String "X-Powered-By"
        Write-Host "❌ Header 'X-Powered-By' exposé : $($poweredLine.ToString().Trim())" -ForegroundColor Red
    } else {
        Write-Host "✅ Header 'X-Powered-By' masqué" -ForegroundColor Green
    }

    # Vérification NextJS Cache
    if ($output -match "x-nextjs-cache") {
        Write-Host "⚠️  Header 'x-nextjs-cache' encore visible" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Header 'x-nextjs-cache' masqué" -ForegroundColor Green
    }

} catch {
    Write-Host "Erreur lors de l'audit : $_" -ForegroundColor Red
}
