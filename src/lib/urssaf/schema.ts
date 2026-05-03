import { z } from 'zod';

const regexName = /^[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+(([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ' \-])*)+([a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ])|(^[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ])$/;
const regexPhone = /^(0|\+33)[6-7]([0-9]{2}){4}$/;
const regexEmail = /^[a-zA-Z0-9+._\-]+(\.[a-zA-Z0-9+._\-]+)*@([a-zA-Z0-9\-]*[a-zA-Z0-9]\.)+[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$/;
const regexBic = /^[a-zA-Z]{6}[0-9a-zA-Z]{2}([0-9a-zA-Z]{3})?$/;
const regexIban = /^[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{4}[a-zA-Z0-9]{7}([a-zA-Z0-9]?){0,19}$/;

export const InscriptionParticulierSchema = z.object({
  civilite: z.enum(["1", "2"]),
  nomNaissance: z.string()
    .min(1, "Le nom de naissance est requis")
    .max(80, "Maximum 80 caractères")
    .regex(regexName, "Format de nom invalide (lettres accentuées, espaces, tirets, apostrophes uniquement)"),
  nomUsage: z.string()
    .max(80, "Maximum 80 caractères")
    .regex(regexName, "Format de nom d'usage invalide")
    .optional()
    .or(z.literal('')),
  prenoms: z.string()
    .min(1, "Le ou les prénoms sont requis")
    .max(80, "Maximum 80 caractères")
    .regex(regexName, "Format de prénoms invalide"),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),

  lieuNaissance: z.object({
    codePaysNaissance: z.string().length(5, "Code pays sur 5 caractères"),
    departementNaissance: z.string().length(3, "Code département sur 3 caractères").optional().or(z.literal('')),
    communeNaissance: z.object({
      codeCommune: z.string()
        .min(2, "Minimum 2 caractères")
        .max(3, "Maximum 3 caractères"),
      libelleCommune: z.string()
        .min(1, "Libellé de la commune requis")
        .max(50, "Maximum 50 caractères")
    }).optional()
  }).superRefine((val, ctx) => {
    if (val.codePaysNaissance === '99100') {
      if (!val.departementNaissance || val.departementNaissance === '') {
        ctx.addIssue({ code: 'custom', path: ['departementNaissance'], message: 'Requis pour une naissance en France' });
      }
      if (!val.communeNaissance?.codeCommune) {
        ctx.addIssue({ code: 'custom', path: ['communeNaissance', 'codeCommune'], message: 'Le code commune est requis pour la France' });
      }
      if (!val.communeNaissance?.libelleCommune) {
        ctx.addIssue({ code: 'custom', path: ['communeNaissance', 'libelleCommune'], message: 'Le libellé commune est requis pour la France' });
      }
    }
  }),

  numeroTelephonePortable: z.string()
    .min(1, "Le numéro de téléphone est requis")
    .regex(regexPhone, "Format: 06xxxxxxxx, 07xxxxxxxx ou +336xxxxxxxx"),
  adresseMail: z.string()
    .min(1, "L'adresse email est requise")
    .regex(regexEmail, "Format d'email invalide"),

  adressePostale: z.object({
    numeroVoie: z.string().max(4, "4 caractères max").optional().or(z.literal('')),
    lettreVoie: z.string().optional().or(z.literal('')),
    codeTypeVoie: z.string().optional().or(z.literal('')),
    libelleVoie: z.string().max(28, "28 caractères max").optional().or(z.literal('')),
    complement: z.string().max(38, "38 caractères max").optional().or(z.literal('')),
    lieuDit: z.string().max(38, "38 caractères max").optional().or(z.literal('')),
    libelleCommune: z.string().min(1, "La commune est requise").max(50, "50 caractères max"),
    codeCommune: z.string().length(5, "Le code commune INSEE (5 caractères) est requis"),
    codePostal: z.string().length(5, "Le code postal (5 chiffres) est requis"),
    codePays: z.string().length(5, "Le code pays INSEE (5 caractères) est requis")
  }).superRefine((val, ctx) => {
    const hasLibelle = val.libelleVoie && val.libelleVoie !== '';
    const hasComplement = val.complement && val.complement !== '';
    const hasLieuDit = val.lieuDit && val.lieuDit !== '';

    if (!hasLibelle && !hasComplement && !hasLieuDit) {
      ctx.addIssue({ code: 'custom', path: ['libelleVoie'], message: 'Libellé de la voie, complément ou lieu-dit obligatoire' });
    }
    if (val.numeroVoie && val.numeroVoie !== '' && !hasLibelle) {
      ctx.addIssue({ code: 'custom', path: ['libelleVoie'], message: 'Obligatoire si le numéro de voie est renseigné' });
    }
  }),

  coordonneeBancaire: z.object({
    bic: z.string().min(1, "Le BIC est requis").regex(regexBic, "Format BIC invalide"),
    iban: z.string().min(1, "L'IBAN est requis").regex(regexIban, "Format IBAN invalide"),
    titulaire: z.string().min(1, "Le nom du titulaire est requis").max(100, "100 caractères maximum")
  })
});

export type InscriptionParticulierDTO = z.infer<typeof InscriptionParticulierSchema>;
