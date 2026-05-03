export const URSSAF_ERRORS: Record<string, { short: string; description: string }> = {
  ERR_DATE_FUTUR: {
    short: "La date est dans le futur",
    description: "Erreur si la période d'emploi de la Demande de Paiement est dans le futur."
  },
  ERR_DATE_PAIEMENT_AVANT_EXP: {
    short: "La date de paiement est antérieure",
    description: "La date de paiement est antérieure à la date de lancement de l'expérimentation."
  },
  ERR_PERIODE_EMPLOI_MOIS_NON_UNIQUE: {
    short: "Période d'emploi sur deux mois",
    description: "La période d'emploi de la demande de paiement est sur deux mois calendaires."
  },
  ERR_DATE_FIN_AVANT_DATE_DEB: {
    short: "Date de fin inférieure à la date de début",
    description: "La date de fin de période est inférieure à la date de début de période d'emploi."
  },
  ERR_MONTANT_ACOMPTE: {
    short: "Acompte trop élevé",
    description: "Le montant de l'acompte est supérieur à 50 % du montant total de la facture."
  },
  ERR_TOTAL_PRESTATIONS: {
    short: "Problème sur le montant total",
    description: "Le montant total des listes de prestation est différent du montant total de la facture."
  },
  ERR_CODE_NATURE: {
    short: "Code nature inconnu",
    description: "Le code nature doit être connu du référentiel des natures."
  },
  ERR_CODE_ACTIVITE: {
    short: "Code activité inconnu",
    description: "Le code activité doit être connu du référentiel des activités."
  },
  ERR_CODE_ACTIVITE_NATURE: {
    short: "Activité non rattachée à cette nature",
    description: "Le code activité n'est pas rattaché à cette nature."
  },
  ERR_FORMAT_VALEUR: {
    short: "Problème de décimales",
    description: "La valeur doit comporter deux décimales au maximum."
  },
  ERR_MNT_PREST_HT_TVA: {
    short: "Montant prestation HT ou TVA incorrect",
    description: "Le montant prestation HT + TVA doit être égal au montant TTC."
  },
  ERR_MNT_PREST_TTC: {
    short: "Montant prestation TTC incorrect",
    description: "Le montant prestation TTC n'est pas égal à la quantité * montant unitaire."
  },
  ERR_NBRE_PREST_MAX: {
    short: "Nombre maximum de factures dépassé",
    description: "Le nombre maximum de transmission de factures a été dépassé (limite à 10)."
  },
  ERR_VALEUR_NEGATIVE: {
    short: "Valeur négative",
    description: "La valeur doit être positive."
  },
  ERR_PARTICULIER_INCONNU: {
    short: "Particulier inconnu",
    description: "L'identifiant du particulier n'est pas reconnu ou la date de naissance ne correspond pas."
  },
  ERR_PRESTATAIRE_EMETTEUR_INCONNU: {
    short: "Prestataire émetteur inconnu",
    description: "Aucun tiers de prestation connu pour l'identifiant."
  },
  ERR_LIEN_PARTICULIER_PRESTATAIRE: {
    short: "Aucun lien Particulier/Prestataire",
    description: "Vérifiez que le particulier a activé son compte et que la date d'emploi est valide."
  },
  ERR_PRESTATAIRE_FACTURATION_INCONNU: {
    short: "Prestataire facturation inconnu",
    description: "Aucun tiers de prestation connu pour l'identifiant de facturation."
  },
  ERR_FACTURE_DOUBLON: {
    short: "Facture en doublon",
    description: "La référence de la facture est déjà existante."
  },
  ERR_CRITERE_RECHERCHE_VIDE: {
    short: "Critère de recherche vide",
    description: "Au minimum un critère de recherche doit être renseigné."
  },
  ERR_NBRE_MAX_RESULTAT: {
    short: "Trop de résultats",
    description: "Veuillez affiner votre recherche."
  },
  ERR_RECHERCHE_VIDE: {
    short: "Aucun résultat",
    description: "Aucune demande de paiement ne correspond aux critères de recherche."
  },
  ERR_DGFIP_R2P_INCONNU: {
    short: "Identification DGFiP échouée",
    description: "Aucun SPI ne correspond à la personne après l'appel à l'API DGFiP R2P, vérifier l'état civil communiqué."
  },
  ERR_DGFIP_IMPOTPART_INCONNU: {
    short: "Situation fiscale invalide",
    description: "Les informations disponibles sur la situation fiscale ne permettent pas d'activer le service. Le particulier doit avoir déjà fait une déclaration de revenus."
  },
  ERR_ECV_PARTICULIERS_EXISTENT: {
    short: "Conflit : Plusieurs particuliers existants",
    description: "Erreur technique : Plusieurs comptes coexistent pour le même particulier."
  },
  ERREUR_REFERENCE_PARTICULIER_EXISTANTE_TYPE: {
    short: "Référence particulière existe déjà",
    description: "La référence particulier existe déjà. Le couple email / téléphone doit être unique."
  },
  ERR_DATE_NAISSANCE_FUTUR: {
    short: "Date de naissance invalide",
    description: "La date de naissance est dans le futur."
  },
  ERR_LIEU_NAISSANCE_OBLIGATOIRE: {
    short: "Commune de naissance requise",
    description: "Le libellé de la commune de naissance doit être renseigné."
  },
  ERREUR_LIEU_NAISSANCE_DEPT: {
    short: "Code INSEE département invalide",
    description: "Le Code INSEE du département de naissance est obligatoire quand le pays est la France."
  },
  ERREUR_LIEU_NAISSANCE_DEPT_FORMAT: {
    short: "Format code INSEE département erroné",
    description: "Le format du code INSEE du département à la date de naissance est erroné."
  },
  ERR_LIEU_NAISSANCE_COMN: {
    short: "Code INSEE commune invalide",
    description: "Le Code INSEE de la commune de naissance est obligatoire quand le pays est la France."
  },
  ERREUR_LIEU_NAISSANCE_PAYS: {
    short: "Contradiction du lieu de naissance",
    description: "Code département ou commune présent en présence d'un lieu de naissance à l'étranger."
  },
  ERREUR_LIEU_NAISSANCE_OBLIGATOIRE: {
    short: "Lieu de naissance obligatoire",
    description: "Absence de la propriété lieu de naissance."
  },
  ERREUR_LIEU_NAISSANCE_INVALIDE: {
    short: "Lieu de naissance invalide",
    description: "Le libellé doit être alphanumérique sans point-virgule."
  },
  ERR_CONTACT: {
    short: "Erreur de contact",
    description: "Des informations concernant le téléphone, mail ou adresse ne sont pas complètes ou invalides."
  },
  ERR_CONTACT_ADRESSE_TYPE_VOIE: {
    short: "Type de voie introuvable",
    description: "Le type de voie renseigné est introuvable."
  },
  ERR_CONTACT_ADRESSE_TYPEVOIE: {
    short: "Type de voie requis avec le libellé",
    description: "Un type de voie doit être sélectionné si un libellé est renseigné."
  },
  ERR_CONTACT_ADRESSE_LETTRE_VOIE: {
    short: "Lettre de voie introuvable",
    description: "La Lettre de voie renseignée est introuvable."
  },
  ERR_CONTACT_ADRESSE_LIBELLEVOIE: {
    short: "Libellé de voie requis avec le type",
    description: "Un libellé doit être renseigné si un type de voie est sélectionné."
  },
  ERR_CONTACT_ADRESSE_INFORMATION_SUPPLEMENTAIRE: {
    short: "Adresse incomplète",
    description: "Type de voie et libellé ou complément d'adresse ou lieu dit non renseigné."
  },
  ERR_CONTACT_ADRESSE_COMMUNE: {
    short: "Commune introuvable",
    description: "La commune renseignée est introuvable."
  },
  ERR_COORDONNEES_BANCAIRES: {
    short: "Coordonnées bancaires invalides",
    description: "Le BIC ou l'IBAN est invalide."
  },
  ERR_COMPTE_BLOQUE: {
    short: "Compte bloqué (inscription)",
    description: "Le compte du particulier a été bloqué (ex: impôts). L'inscription ne pourra pas aboutir."
  },
  ERR_CMPT_BLOQUE: {
    short: "Compte bloqué (paiement)",
    description: "Le compte du particulier a été bloqué. La demande de paiement ne pourra pas aboutir."
  },
  ERR_RECHERCHE_PARTICULIER: {
    short: "Particulier inconnu (recherche)",
    description: "Aucun particulier ne correspond, ou le particulier a rompu son association."
  },
  ERR_FORMAT_NUMINTERVENANT: {
    short: "Format numéro NOVA/SIRET incorrect",
    description: "Le format du numéro Nova ou le SIRET transmis est incorrect."
  },
  ERR_NUMINTERVENANT_MANQUANT: {
    short: "Numéro NOVA/SIRET manquant",
    description: "Il manque le numéro NOVA ou le SIRET de l'intervenant."
  },
  ERR_NUMINTERVENANT_BLOQUE: {
    short: "SIRET bloqué",
    description: "L'intervenant associé au SIRET n'a pas l'accès autorisé."
  },
  ERR_MANDAT_ECHU: {
    short: "Mandat échu",
    description: "Le mandat SEPA du particulier arrive à échéance."
  },
  ERREUR_GARANTIE_FINANCIERE_NON_CONFORME: {
    short: "Garantie financière non conforme",
    description: "Le montant n'est pas conforme ou la garantie est arrivée à échéance."
  },
  ERR_ACOMPTE_BLOQUE: {
    short: "Saisie d'acompte bloquée",
    description: "Aucune autorisation de saisie d'acompte n'est délivrée."
  },
  ERR_LIEN_TIERS_PRESTATION_PARTICULIER_EXISTE: {
    short: "Lien déjà existant",
    description: "Il existe déjà un lien entre le prestataire et le particulier."
  },
  ERR_LIEN_TIERS_PRESTATION_PARTICULIER: {
    short: "Erreur d'association",
    description: "Erreur lors de l'association entre le prestataire et le particulier."
  },
  ERREUR_VALIDATION: {
    short: "Erreur de saisie",
    description: "Les informations envoyées ne respectent pas les formats attendus (erreurs de validation)."
  }
};

export function getFriendlyErrorMessage(apiCode: string, originalMessage: string): string {
  const mapped = URSSAF_ERRORS[apiCode];
  if (mapped) {
    return `${mapped.short} - ${mapped.description}`;
  }
  return originalMessage || apiCode || "Une erreur inattendue est survenue au sein de l'API URSSAF.";
}
