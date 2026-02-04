$maxSizeKB = 200
$publicDir = "public"

Write-Host "--- Optimisation Automatique des Images ---" -ForegroundColor Cyan

$files = Get-ChildItem -Path $publicDir -Recurse -Include *.jpg, *.jpeg, *.png

if ($files.Count -eq 0) {
    Write-Host "Aucune image JPG/PNG trouvÃ©e à convertir." -ForegroundColor Green
    return
}

foreach ($file in $files) {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    $output = $file.FullName -replace '\.(jpg|jpeg|png)$', '.webp'
    
    Write-Host "Optimisation de $($file.Name) ($sizeKB Ko)..." -ForegroundColor Yellow
    
    # Utilisation de ffmpeg pour la conversion
    & ffmpeg -i $file.FullName -q:v 75 $output -y | Out-Null
    
    if (Test-Path $output) {
        $newSizeKB = [math]::Round((Get-Item $output).Length / 1KB, 2)
        Write-Host "SuccÃ¨s : $($file.Name) -> $($newSizeKB) Ko" -ForegroundColor Green
        # Suppression de l'original aprÃ¨s conversion rÃ©ussie
        Remove-Item $file.FullName
    } else {
        Write-Host "Erreur lors de la conversion de $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "--- Fin de l'optimisation ---" -ForegroundColor Cyan
