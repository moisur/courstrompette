# Synchronisation Mobile & API

L'application mobile dépend directement de l'API Next.js. Il est crucial de maintenir la synchronisation entre les deux.

## Règles
- Lors de la modification d'une route API ou d'un type de réponse, mettez à jour [`mobile/src/lib/api.ts`](mobile/src/lib/api.ts).
- Utilisez des interfaces TypeScript claires pour les réponses API afin qu'elles puissent être copiées/partagées si nécessaire.
- Vérifiez que les types dans `mobile/src/lib/api.ts` correspondent aux sérialiseurs de [`src/lib/serializers.ts`](src/lib/serializers.ts).

## Exemple
Si vous ajoutez un champ `phoneNumber` à un étudiant :
1. Modifiez le Prisma Schema.
2. Modifiez le sérialiseur `serializeStudent`.
3. Mettez à jour l'interface `StudentItem` dans [`mobile/src/lib/api.ts`](mobile/src/lib/api.ts).
