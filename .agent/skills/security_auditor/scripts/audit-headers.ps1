param (
    [string]$Url = "https://courstrompette.fr"
)

Write-Host "🔍 Audit des en-têtes de sécurité pour : $Url" -ForegroundColor Cyan

try {
    $request = Invoke-WebRequest -Uri $Url -Method Head -ErrorAction Stop
    $headers = $request.Headers

    $securityHeaders = @(
        "Strict-Transport-Security",
        "Content-Security-Policy",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "X-Permitted-Cross-Domain-Policies"
    )

    foreach ($header in $securityHeaders) {
        if ($headers.ContainsKey($header)) {
            Write-Host "✅ $header : $($headers[$header])" -ForegroundColor Green
        } else {
            Write-Host "❌ $header MANQUANT" -ForegroundColor Red
        }
    }

    # Vérification Server "hiding"
    if ($headers.ContainsKey("Server")) {
        Write-Host "⚠️  Header 'Server' exposé : $($headers["Server"])" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Header 'Server' masqué" -ForegroundColor Green
    }
    
    # Vérification Powered-By
     if ($headers.ContainsKey("X-Powered-By")) {
        Write-Host "❌ Header 'X-Powered-By' exposé : $($headers["X-Powered-By"])" -ForegroundColor Red
    } else {
        Write-Host "✅ Header 'X-Powered-By' masqué" -ForegroundColor Green
    }

} catch {
    Write-Host "Erreur lors de la connexion à $Url : $_" -ForegroundColor Red
}
