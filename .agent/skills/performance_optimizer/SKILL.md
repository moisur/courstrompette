---
name: performance_optimizer
description: Outils et instructions pour maintenir un score Lighthouse > 90 et un LCP < 2.5s.
---

# Skill: Performance Optimizer 🚀

Ce skill est conçu pour maintenir l'application courstrompette.fr au sommet de sa forme en termes de rapidité.

## Principes Fondamentaux
1. **Zéro Image Lourde** : Toutes les images doivent être en WebP et < 200 Ko pour les bannières, < 10 Ko pour les icônes/avatars.
2. **LCP Priority** : L'image principale de chaque page (Hero) doit TOUJOURS avoir l'attribut `priority`.
3. **Lazy Loading** : Les composants non critiques (Chatbot, widgets Amazon en bas de page) doivent être chargés en différé (`next/dynamic` avec `ssr: false`).
4. **Resized Assets** : Utiliser l'attribut `sizes` pour éviter de télécharger des images desktop sur mobile.
5. **Layout Stability (CLS)** : Toujours spécifier `width` et `height` ou utiliser `fill` avec un conteneur à ratio fixe pour éviter les sauts de mise en page.
6. **Polices (Fonts)** : Utiliser `next/font` avec `display: 'swap'` pour garantir que le texte est lisible avant le chargement complet de la police.

## Outils Inclus
- `scripts/analyze-images.ps1` : Scan le dossier `public/` et liste les fichiers qui dépassent les quotas.
- `scripts/optimize-images.ps1` : Convertit automatiquement les JPG/PNG en WebP haute performance.
- `scripts/check-priority.ps1` : Analyse les fichiers `.tsx` pour s'assurer que les images critiques sont prioritaires.
- `scripts/check-layout-shift.ps1` : Détecte les balises Image qui risquent de provoquer des sauts de mise en page.

## Comment utiliser ce skill
Lorsqu'un utilisateur signale une lenteur ou après l'ajout d'une nouvelle page :
1. Exécuter le scan d'images pour vérifier si des assets non optimisés ont été introduits.
2. Utiliser Google Lighthouse pour identifier le nouvel élément qui bloque le thread principal.
3. Appliquer les correctifs de redimensionnement et de format (WebP).
