# Architecture API & Services (Next.js & Prisma)

Cette règle définit la structure de responsabilité entre les routes API et les services de logique métier. L'objectif est de garantir une base de code maintenable, testable et réutilisable.

## Principes Fondamentaux

Toute la logique métier complexe, les calculs, les validations de cohérence de données et les opérations sur la base de données doivent être extraits dans des services.

### 1. Responsabilités des Routes API ([`src/app/api/`](src/app/api/))
Les routes API agissent comme des contrôleurs légers. Leur rôle est limité à :
- **Extraction des données** : Récupérer les paramètres d'URL, les queries et le corps de la requête.
- **Authentification & Autorisation** : Vérifier si l'utilisateur a le droit d'accéder à la ressource.
- **Validation de surface** : Utiliser Zod pour vérifier que les types de données sont corrects.
- **Appel au service** : Déléguer l'exécution à une fonction de service.
- **Gestion des réponses** : Transformer le résultat du service en une réponse HTTP appropriée (200, 201, 400, 404, 500).

### 2. Responsabilités des Services ([`src/lib/services/`](src/lib/services/))
Les services sont le "cerveau" de l'application. Leur rôle inclut :
- **Logique métier** : Calculs, règles de gestion (ex: "un élève ne peut pas avoir deux leçons à la même heure").
- **Accès aux données** : Utilisation directe de Prisma pour lire ou modifier la base de données.
- **Transactions** : Utiliser `$transaction` pour garantir l'atomicité des opérations liées.
- **Gestion d'erreurs métier** : Lancer des erreurs spécifiques (ex: `PACK_NOT_FOUND`, `INSUFFICIENT_FUNDS`) que la route pourra interpréter.

---

## Règles de Codage Strictes

1. **Pas de `prisma.model.action()` dans les routes** : Interdiction totale d'utiliser l'instance Prisma directement dans les fichiers `route.ts`.
2. **Types d'entrée des services** : Définir des interfaces claires pour les arguments des fonctions de service. Ne pas passer l'objet `Request` complet au service.
3. **Réutilisabilité** : Un service doit pouvoir être appelé par une route API, mais aussi par un script de migration ou une tâche planifiée.
4. **Gestion des transactions** : Si une action entraîne plusieurs modifications (ex: créer une leçon ET décréter un pack), elles doivent être dans une transaction gérée par le service.

---

## Exemples Détaillés

### ✅ Recommandé : Séparation Claire

**Le Service :** [`src/lib/services/lesson-service.ts`](src/lib/services/lesson-service.ts)
```typescript
export async function createLesson(data: CreateLessonInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Logique métier : Vérifier le pack
    if (data.packId) {
      const pack = await tx.coursePack.findUnique({ where: { id: data.packId } });
      if (!pack || pack.remainingLessons <= 0) {
        throw new Error("INVALID_PACK");
      }
    }

    // 2. Opération DB
    const lesson = await tx.lesson.create({
      data: {
        studentId: data.studentId,
        date: new Date(data.date),
        amount: new Prisma.Decimal(data.amount),
        packId: data.packId,
      }
    });

    // 3. Effet secondaire atomique
    if (data.packId) {
      await tx.coursePack.update({
        where: { id: data.packId },
        data: { remainingLessons: { decrement: 1 } }
      });
    }

    return lesson;
  });
}
```

**La Route API :** [`src/app/api/lessons/route.ts`](src/app/api/lessons/route.ts)
```typescript
export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const body = await request.json();
  const parsed = createLessonSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid data");

  try {
    const lesson = await createLesson(parsed.data);
    return Response.json(serializeLesson(lesson));
  } catch (error: any) {
    if (error.message === "INVALID_PACK") {
      return badRequest("Le pack sélectionné est invalide ou épuisé");
    }
    return serverError("Erreur lors de la création");
  }
}
```

### ❌ À Éviter : Le "Fat Controller"
```typescript
// DANS src/app/api/lessons/route.ts
export async function POST(request: Request) {
  // MAUVAIS : La logique métier et Prisma sont mélangés ici
  const body = await request.json();
  const pack = await prisma.coursePack.findUnique({ ... }); // INTERDIT ICI
  if (pack.remaining > 0) {
     const lesson = await prisma.lesson.create({ ... }); // INTERDIT ICI
     // ... encore 20 lignes de code DB ...
  }
}
```

---

## Patterns Avancés

### Gestion des Erreurs
Utilisez des classes d'erreurs personnalisées pour une gestion plus fine :
```typescript
export class ServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

// Dans le service
throw new ServiceError("STUDENT_ARCHIVED", "Impossible d'ajouter une leçon à un étudiant archivé");
```

### Invalidation du Cache
Si vous utilisez du caching (ex: `unstable_cache` ou Redis), c'est le service qui doit être responsable de l'invalidation après une mutation.

```typescript
export async function updateStudent(id: string, data: any) {
  const updated = await prisma.student.update({ where: { id }, data });
  revalidateTag(`student-${id}`); // Invalidation Next.js
  return updated;
}
```

### Composition de Services
Un service peut appeler un autre service pour des opérations communes.
*Exemple : `StudentService.archive()` peut appeler `LessonService.cancelAllPending()`.*

---

## Pourquoi cette règle ?
1. **DRY (Don't Repeat Yourself)** : La logique de création d'une leçon peut être nécessaire dans l'interface admin, mais aussi lors d'un import CSV massif.
2. **Testabilité** : Il est beaucoup plus simple de tester une fonction pure dans `lesson-service.ts` que de mocker des objets `Request`/`Response` complexes.
3. **Lisibilité** : En ouvrant une route API, on doit comprendre en 3 secondes ce qu'elle fait techniquement. En ouvrant un service, on comprend ce qu'elle fait fonctionnellement.
4. **Maintenance Prisma** : Si on change de schéma de base de données, on ne modifie que les services, pas les 50 routes API du projet.
