# Conventions de Base de Données (Prisma)

Cette règle définit les standards de nommage et de structure pour le schéma Prisma afin de garantir une base de données SQL propre, performante et cohérente avec le code TypeScript.

## 1. Nommage des Tables et des Champs

Nous suivons une séparation stricte entre le monde TypeScript (CamelCase) et le monde SQL (Snake Case).

### Règles de base
- **Modèles (Tables)** : Utilisez le **PascalCase** au singulier en TS (ex: `CoursePack`). Mappez vers du **snake_case** au pluriel via `@@map` (ex: `@@map("course_packs")`).
- **Champs (Colonnes)** : Utilisez le **camelCase** en TS (ex: `createdAt`). Mappez systématiquement vers du **snake_case** via `@map` (ex: `@map("created_at")`).
- **Enums** : Utilisez le **PascalCase** pour le nom de l'Enum et le **UPPER_SNAKE_CASE** pour les valeurs.

### ✅ Exemple Complet
```prisma
model StudentProfile {
  id        String   @id @default(uuid())
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  birthDate DateTime? @map("birth_date")
  
  status    UserStatus @default(ACTIVE)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("student_profiles")
}

enum UserStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

---

## 2. Relations et Intégrité

### Clés Étrangères
- Nommez les champs de clé étrangère avec le suffixe `Id` (ex: `studentId`).
- Mappez toujours la clé étrangère en snake_case (ex: `@map("student_id")`).

### Actions de Suppression (`onDelete`)
- Utilisez `Cascade` uniquement si la suppression du parent doit entraîner la suppression logique des enfants (ex: `Student` -> `Lessons`).
- Utilisez `SetNull` si l'enfant doit survivre mais perdre sa référence (ex: `User` -> `Student` si on veut garder l'historique de l'étudiant sans compte utilisateur).

### Indexation
- Ajoutez des index sur les colonnes fréquemment utilisées dans les clauses `where` ou `orderBy`.
- Nommez vos index explicitement pour faciliter la maintenance SQL : `@@index([studentId], map: "idx_lessons_student_id")`.

---

## 3. Types de Données Spécifiques

### Décimaux (Argent)
- Pour tout ce qui touche à l'argent, utilisez le type `Decimal` et non `Float` pour éviter les erreurs d'arrondi binaire.
- Dans le code TS, manipulez-les via la classe `Prisma.Decimal`.

### Dates
- Utilisez toujours `DateTime` pour les horodatages.
- Pour les dates de naissance ou dates sans heure, stockez en `DateTime` mais normalisez à minuit (00:00:00) dans les services.

---

## 4. Maintenance et Migrations

### Règles de Migration
1. **Pas de modification manuelle du SQL** : Toutes les modifications doivent passer par `npx prisma migrate dev`.
2. **Migrations Réversibles** : Assurez-vous que vos changements ne cassent pas les données existantes.
3. **Valeurs par défaut** : Lors de l'ajout d'une colonne obligatoire, fournissez une valeur par défaut ou gérez la migration en deux étapes (ajout nullable -> remplissage -> passage en non-nullable).

---

## Pourquoi cette règle ?
1. **Interopérabilité** : Le snake_case est le standard universel en SQL, facilitant l'usage d'outils tiers de BI ou de reporting.
2. **Lisibilité TS** : Le camelCase est le standard JavaScript/TypeScript. `@map` permet d'avoir le meilleur des deux mondes.
3. **Performance** : Une stratégie d'indexation claire évite les "Table Scans" coûteux en production.
4. **Sécurité des données** : L'utilisation de `Decimal` est impérative pour la précision financière.
