import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Charge les variables d'environnement depuis le fichier .env.production s'il existe
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

const hash = process.env.ADMIN_PASSWORD_HASH;

console.log('=== Diagnostic ADMIN_PASSWORD_HASH ===');
if (!hash) {
  console.error('ERREUR: La variable ADMIN_PASSWORD_HASH n\'est pas définie dans .env.production.');
  process.exit(1);
}

console.log(`Longueur du hash : ${hash.length} caractères`);
console.log(`Début du hash : "${hash.substring(0, 10)}..."`);

if (hash.startsWith('$2a$10$') || hash.startsWith('$2b$10$')) {
  console.log('✅ Le hash commence bien par un préfixe bcrypt correct ($2a$10$ ou $2b$10$).');
} else {
  console.warn('⚠️ AVERTISSEMENT : Le hash ne semble pas avoir le format bcrypt standard ($2a$10$ ou $2b$10$).');
  console.warn('Vérifiez que le hash dans .env.production n\'a pas été tronqué par un problème d\'expansion de variable shell (p.ex. si vous n\'avez pas utilisé de guillemets simples).');
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('\nPour tester une comparaison de mot de passe, exécutez :');
  console.log('node scripts/verify-hash.js "votre_mot_de_passe"');
} else {
  const plainPassword = args[0];
  console.log(`\nComparaison avec le mot de passe fourni...`);
  try {
    const match = bcrypt.compareSync(plainPassword, hash);
    if (match) {
      console.log('✅ SUCCÈS : Le mot de passe correspond PARFAITEMENT au hash !');
    } else {
      console.error('❌ ÉCHEC : Le mot de passe ne correspond pas au hash.');
    }
  } catch (error) {
    console.error('❌ ERREUR lors de la comparaison bcrypt :', error.message);
  }
}
