# Développeur Full-Stack React / Next.js

## Résumé

Développeur passionné et hautement qualifié, spécialisé dans la conception et la réalisation d'applications web modernes et performantes avec Next.js, React et TypeScript. L'analyse du projet "Trumpeeett" démontre une expertise approfondie dans la création de solutions full-stack complexes, allant de l'architecture d'API RESTful avec MongoDB à la construction d'interfaces utilisateur dynamiques, réactives et centrées sur l'expérience utilisateur avec `shadcn/ui` et Tailwind CSS.

---

## Compétences Techniques

*   **Frontend**:
    *   Frameworks/Librairies : **React (v19), Next.js (v15)**
    *   Langages : **TypeScript**, JavaScript (ES6+), HTML5, CSS3
    *   UI/Styling : **Shadcn/UI**, **Tailwind CSS**, Radix UI, `clsx`, `tailwind-merge`
    *   State Management : Maîtrise des hooks React (`useState`, `useEffect`, `useContext`, `useCallback`)
    *   Librairies Notables : `lucide-react` (icônes), `date-fns` (manipulation de dates)

*   **Backend**:
    *   Environnement : **Node.js** (via les API Routes de Next.js)
    *   Base de données : **MongoDB** (avec le driver `mongodb`)
    *   Architecture : **API RESTful**

*   **Tooling & DevOps**:
    *   Gestion de paquets : `pnpm`, `npm`
    *   Linting/Qualité : `ESLint`, `TypeScript`
    *   Développement : VS Code, Git

*   **Spécificités Notables**:
    *   **Génération de PDF côté client** : Utilisation de `html2pdf.js` avec des imports dynamiques pour optimiser les performances.
    *   **Typesafe** : Développement entièrement typé grâce à TypeScript pour une robustesse et une maintenabilité accrues.

---

## Projet Phare : "Trumpeeett" - Application de Gestion pour Professeur de Musique

Application web full-stack conçue pour simplifier la gestion administrative et financière d'un professeur de musique indépendant.

### Réalisations et Fonctionnalités Clés :

#### 1. **Architecture Full-Stack et API RESTful**
*   **Conception et Développement** : Mise en place de l'intégralité de l'application en utilisant l'écosystème Next.js.
*   **API Sécurisée** : Création de routes d'API RESTful robustes pour toutes les opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) sur les entités : élèves, cours, packs de cours et paiements.
*   **Interaction Base de Données** : Intégration directe avec MongoDB, avec une gestion optimisée des connexions pour les environnements de développement et de production, comme le montre le fichier [`src/lib/mongodb.ts`](src/lib/mongodb.ts).

#### 2. **Interface Utilisateur Riche et Expérience Fluide (UI/UX)**
*   **Dashboard Intégré** : Développement d'une page de détail par élève ([`src/app/students/[id]/page.tsx`](src/app/students/[id]/page.tsx)) agissant comme un véritable tableau de bord. Elle consolide les informations de contact, les statistiques financières (total dû, payé), l'historique des cours et la gestion des packs.
*   **Composants Réutilisables** : Utilisation intensive de `shadcn/ui` pour construire une interface cohérente et professionnelle avec des composants tels que `Card`, `Table`, `Dialog`, et `Toast` pour les notifications.
*   **Agenda Interactif** : Création d'un composant d'agenda hebdomadaire ([`src/app/agenda/page.tsx`](src/app/agenda/page.tsx)) affichant les cours planifiés, avec une logique avancée pour gérer et visualiser les superpositions d'événements.

#### 3. **Logique Métier Complexe et Gestion Financière**
*   **Système de Facturation et d'Attestation** :
    *   Mise en place d'un formulaire de génération de factures et d'attestations fiscales ([`src/components/invoice/InvoiceForm.tsx`](src/components/invoice/InvoiceForm.tsx)).
    *   **Génération de PDF à la volée** : Implémentation de la conversion HTML vers PDF côté client, permettant aux utilisateurs de télécharger des documents personnalisés et professionnels.
*   **Gestion des Paiements et des Packs** :
    *   Développement de la logique permettant de marquer les cours comme "payés", "non payés" ou "payés par un pack".
    *   Mise en œuvre d'un système de packs de cours prépayés avec décompte automatique des leçons restantes, offrant une flexibilité de paiement aux clients.

#### 4. **Qualité du Code, Performance et Maintenabilité**
*   **TypeScript de bout en bout** : Application stricte du typage ([`src/lib/types.ts`](src/lib/types.ts)) pour garantir la robustesse, faciliter la refactorisation et améliorer l'autocomplétion durant le développement.
*   **Optimisation des Performances** : Utilisation de l'import dynamique pour la librairie `html2pdf.js`, évitant de charger des ressources lourdes inutilement et améliorant le temps de chargement initial des pages.
*   **Code Asynchrone Moderne** : Emploi systématique de `async/await` et `Promise.all` pour une gestion efficace des opérations asynchrones, notamment lors des appels multiples à l'API pour rafraîchir les données.