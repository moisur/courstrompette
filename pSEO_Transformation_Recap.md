# Récapitulatif : Diagnostic SEO & Stratégie pSEO

Ce document résume l'état actuel de `courstrompette` et la trajectoire pour le transformer en moteur de croissance organique.

## 1. Diagnostic de l'Existant (SEO Score Card)

| Élément | État | Observation |
| :--- | :--- | :--- |
| **Bases Techniques** | ✅ OK | Titres, descriptions et sitemaps de base fonctionnels. |
| **Vitesse (Lighthouse)** | ⚠️ Moyen | Performance correcte mais perfectible via optimisation d'actifs. |
| **Canonicals** | ❌ Manquant | Pas de gestion dynamique centralisée (risque de duplicate). |
| **JSON-LD Dynamique** | ❌ Manquant | Schémas non spécifiques au contenu (FAQ, Course, etc.). |
| **Maillage Interne** | ❌ Statique | Liens "Articles Simples" sans intelligence thématique. |
| **Data Engine** | ❌ Manuel | Gestion par fichiers MD limitée pour la génération de masse. |

---

## 2. Le Plan de Transformation (10/10)

L'objectif est de passer d'un blog statique à une **infrastructure programmable**.

### Phase 1 : Audit & Refactoring (Clean Architecture)
- Modularisation des composants UI (Boutons, Cards, CTAs).
- Optimisation du script `markdown.ts` (système de cache).

### Phase 2 : Infrastructure pSEO (Le Moteur)
- **Data Engine** : Structure enrichie (stats locales, variétés d'instruments) pour un contenu unique.
- **Templates Robustes** : Affichage conditionnel (pas de trous si une donnée manque).

### Phase 3 : Optimisation Sémantique & Indexation
- **SEO Orchestrator** : Unités centrales pour Metadatas et Canonicals.
- **Sitemaps Partitionnés** : Plusieurs fichiers sitemap par thématique pour booster l'indexation par Google.
- **JSON-LD Factory** : Injection automatique de schémas riches.

### Phase 4 : Performance & Vitesse
- Configuration **ISR** (Incremental Static Regeneration) pour des pages ultra-rapides et fraîches.
- Lazy-loading intelligent et Critical CSS.

### Phase 5 : Maillage Interne Algorithmique
- **InternalLinker** : Script qui scanne le contenu pour créer des liens contextuels vers les pages piliers (Cocons sémantiques).

---

## 3. Stratégie Anti-Spam (Google Quality)
Pour éviter d'être perçu comme une "ferme de contenu" :
1. **Granularité** : Utilisation de variables réelles et spécifiques (écoles, prix, technicités).
2. **Logic de Variation** : Variation dynamique des structures de phrases (tokens synonymes).
3. **Budget de Crawl** : Déploiement progressif via les sitemaps partitionnés.

---
> **Prochaine étape :** Lancement de la Phase 1 (Refactoring technique).
