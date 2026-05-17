# Validation des Données (Zod)

La validation rigoureuse des entrées est la première ligne de défense de l'application contre les données corrompues, les injections et les erreurs d'exécution.

## 1. Principes de Validation

Toute donnée provenant de l'extérieur (`Request body`, `Query parameters`, `URL parameters`) doit être considérée comme suspecte et validée via Zod.

### Règles de base
- **Localisation** : Définissez le schéma Zod en haut du fichier `route.ts` pour les routes simples, ou dans un fichier partagé si le schéma est réutilisé.
- **Méthode** : Utilisez toujours `safeParse()` au lieu de `parse()` pour éviter de lancer des exceptions non contrôlées et pour pouvoir formater l'erreur de retour.
- **Sanitisation** : Profitez de Zod pour transformer les données (ex: `.trim()`, `.toLowerCase()`).

---

## 2. Structure Type d'une Route API

```typescript
const updateStudentSchema = z.object({
  name: z.string().min(2, "Le nom est trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional().nullable(),
  rate: z.number().positive("Le tarif doit être positif"),
});

export async function PUT(request: Request) {
  const body = await request.json();
  const result = updateStudentSchema.safeParse(body);

  if (!result.success) {
    // Retourne une erreur 400 avec les détails de validation
    return Response.json({ 
      error: "Validation failed", 
      details: result.error.flatten().fieldErrors 
    }, { status: 400 });
  }

  const validatedData = result.data;
  // ... appel au service
}
```

---

## 3. Techniques Avancées

### Schémas Partagés
Pour maintenir la cohérence entre le Frontend et le Backend, exportez vos schémas.
[`src/lib/validations/student.ts`](src/lib/validations/student.ts)

### Coercion (Types Numériques dans les URLs)
Pour les paramètres de requête qui arrivent toujours sous forme de chaînes :
```typescript
const querySchema = z.object({
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});
```

### Refinements (Logique de Validation Complexe)
```typescript
const lessonSchema = z.object({
  date: z.string(),
  isPaid: z.boolean(),
  packId: z.string().optional(),
}).refine(data => !data.isPaid || (data.isPaid && data.packId), {
  message: "Un pack doit être spécifié si la leçon est marquée comme payée via pack",
  path: ["packId"]
});
```

---

## 4. Pourquoi Zod ?

1. **Type Safety** : Zod génère automatiquement les types TypeScript à partir des schémas (`z.infer<typeof schema>`).
2. **Maintenance** : Si une colonne change dans la base de données, la validation à l'entrée de l'API signalera immédiatement l'incohérence.
3. **UX** : Les messages d'erreur peuvent être directement affichés côté client (Mobile ou Web).

## ⚠️ À Éviter
- Utiliser `any` pour le corps de la requête.
- Faire des validations manuelles avec des `if (body.name === ...)` répétitifs.
- Ne pas valider les types optionnels (ex: oublier `.nullable()` si le champ peut être nul en DB).
