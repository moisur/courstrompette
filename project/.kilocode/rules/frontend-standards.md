# Standards Frontend (React, Tailwind & Components)

Cette règle définit les conventions pour le développement de l'interface utilisateur, l'utilisation de Tailwind CSS et la structure des composants React.

## 1. Structure des Composants ([`src/components/`](src/components/))

Nous utilisons une approche modulaire pour les composants.
- **Composants UI** : Situés dans [`src/components/ui/`](src/components/ui/), ce sont des composants atomiques (boutons, inputs) souvent générés par Shadcn UI. Ils ne contiennent pas de logique métier.
- **Composants de Domaine** : Situés dans des sous-dossiers thématiques (ex: [`src/components/student/`](src/components/student/)). Ils peuvent contenir de la logique spécifique à une entité.
- **Features** : Pour les composants complexes avec beaucoup de logique et de hooks, utilisez [`src/features/`](src/features/).

---

## 2. Utilisation de Tailwind CSS

Tailwind est notre outil principal pour le styling.
- **Ordre des classes** : Suivez l'ordre logique (Layout -> Box Model -> Typography -> Visuals -> Misc).
- **Variantes** : Utilisez `cn()` (de [`src/lib/utils.ts`](src/lib/utils.ts)) pour fusionner conditionnellement des classes.
- **Responsivité** : Utilisez les préfixes `sm:`, `md:`, `lg:` de manière systématique.

### ✅ Exemple : Bouton Personnalisé
```tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function MyButton({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition-colors font-medium",
        variant === 'primary' ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300",
        className
      )}
      {...props}
    />
  );
}
```

---

## 3. Gestion de l'État et Hooks

### Hooks Personnalisés
- Extraire la logique complexe de récupération de données ou de gestion de formulaires dans des hooks dédiés.
- Nommez-les toujours avec le préfixe `use` (ex: `useStudentDetail`).

### Server vs Client Components
- Par défaut, utilisez des **Server Components** pour la récupération de données initiale.
- Utilisez `"use client"` uniquement pour les composants nécessitant de l'interactivité (états, effets, événements).

---

## 4. Formulaires et Validation

- Utilisez **React Hook Form** combiné avec **Zod** pour la gestion des formulaires.
- Affichez toujours des messages d'erreur clairs via le composant `FormError` ou des Toasts.

---

## 5. Accessibilité (a11y)

- Utilisez les balises sémantiques appropriées (`main`, `nav`, `section`, `article`).
- Assurez-vous que les éléments interactifs sont accessibles au clavier et possèdent des labels ARIA si nécessaire.

---

## Pourquoi ces règles ?
1. **Consistance Visuelle** : Garantir que l'application a un look uniforme.
2. **Performance** : Minimiser le bundle JS en utilisant au maximum les Server Components.
3. **Maintenabilité** : Faciliter la relecture du code CSS grâce à Tailwind et l'organisation modulaire.
