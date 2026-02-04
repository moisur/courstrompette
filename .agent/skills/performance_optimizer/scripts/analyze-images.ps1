$maxSizeKB = 200
$publicDir = "public"

Write-Host "--- Analyse des Images (Seuil: $maxSizeKB Ko) ---" -ForegroundColor Cyan

Get-ChildItem -Path $publicDir -Recurse -Include *.jpg, *.jpeg, *.png, *.webp, *.svg | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    $isWebP = $_.Extension -eq ".webp"
    
    if ($sizeKB -gt $maxSizeKB -or -not $isWebP) {
        $color = if ($sizeKB -gt $maxSizeKB) { "Red" } else { "Yellow" }
        Write-Host ("[{0}] {1} ({2} Ko)" -f ($_.Extension.ToUpper().Trim('.')), $_.FullName.Replace("$(Get-Location)\", ""), $sizeKB) -ForegroundColor $color
    }
}

Write-Host "--- Analyse terminée ---" -ForegroundColor Cyan
