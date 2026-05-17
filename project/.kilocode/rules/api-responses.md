# Sérialisation & Réponses API

Pour éviter d'exposer des champs sensibles (comme `passwordHash`) ou des types complexes (comme `Decimal`), toutes les réponses API doivent être sérialisées.

## Règles
- Ne retournez jamais directement un objet retourné par Prisma.
- Utilisez les fonctions de sérialisation définies dans [`src/lib/serializers.ts`](src/lib/serializers.ts).
- Si un nouveau modèle est ajouté, créez une fonction de sérialisation correspondante.

## Exemple
### Recommandé
```typescript
const student = await getStudent(id);
return Response.json(serializeStudent(student));
```

### À éviter
```typescript
const student = await prisma.student.findUnique({ ... });
return Response.json(student); // Retourne potentiellement des champs non désirés
```
