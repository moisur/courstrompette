---
description: Analyser et optimiser la performance du site
---

1. Lancer l'analyse des images
// turbo
2. powershell -File .agent/skills/performance_optimizer/scripts/analyze-images.ps1

3. Lancer l'analyse du Layout Shift (CLS)
// turbo
4. powershell -File .agent/skills/performance_optimizer/scripts/check-layout-shift.ps1

5. Optimiser automatiquement les images restantes (JPG/PNG -> WebP)
// turbo
6. powershell -File .agent/skills/performance_optimizer/scripts/optimize-images.ps1

7. VÃ©rifier les prioritÃ©s LCP
// turbo
8. powershell -File .agent/skills/performance_optimizer/scripts/check-priority.ps1

9. VÃ©rifier le build
// turbo
10. npm run build

11. Si des problèmes sont détectés, convertir les images lourdes en WebP et ajouter l'attribut `priority` aux images critiques.
