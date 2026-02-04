$criticalFiles = Get-ChildItem -Path "src" -Recurse -Include *Section.tsx, page.tsx

Write-Host "--- Vérification de l'attribut Priority ---" -ForegroundColor Cyan

foreach ($file in $criticalFiles) {
    if ($file.Name -match "Hero|Header|Banner") {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "<Image" -and -not $content -match "priority") {
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            Write-Host "[ALERTE] PrioritÃ© manquante dans : $relativePath" -ForegroundColor Red
        } elseif ($content -match "<Image") {
            Write-Host "[OK] $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "--- Vérification terminée ---" -ForegroundColor Cyan
