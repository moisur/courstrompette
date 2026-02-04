$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx

Write-Host "--- Analyse du Layout Shift (CLS) ---" -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Recherche des balises Image
    $matches = [regex]::Matches($content, '<Image[^>]*>')
    
    foreach ($match in $matches) {
        $tag = $match.Value
        
        # Un tag Image doit soit avoir width/height, soit fill
        if (-not ($tag -match "width=" -and $tag -match "height=") -and -not ($tag -match "fill")) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            Write-Host "[RISQUE CLS] Attributs de dimension manquants dans : $relativePath" -ForegroundColor Yellow
            Write-Host "  Tag: $tag"
        }
    }
}

Write-Host "--- Analyse terminÃ©e ---" -ForegroundColor Cyan
