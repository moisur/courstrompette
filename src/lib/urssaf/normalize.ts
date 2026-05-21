import type { InscriptionParticulierDTO } from "@/lib/urssaf/schema";

function splitFrenchCommuneInseeCode(codeCommune: string) {
  const code = codeCommune.trim().toUpperCase();

  if (!/^[0-9A-Z]{5}$/.test(code)) {
    return null;
  }

  if (/^(97|98)[0-9A-Z]{3}$/.test(code)) {
    return {
      departementNaissance: code.slice(0, 3),
      codeCommune: code.slice(3),
    };
  }

  return {
    departementNaissance: code.slice(0, 2).padStart(3, "0"),
    codeCommune: code.slice(2),
  };
}

export function normalizeUrssafBirthPlace<T extends InscriptionParticulierDTO>(data: T): T {
  if (data.lieuNaissance.codePaysNaissance !== "99100") {
    return data;
  }

  const communeNaissance = data.lieuNaissance.communeNaissance;
  const split = communeNaissance?.codeCommune
    ? splitFrenchCommuneInseeCode(communeNaissance.codeCommune)
    : null;

  if (!communeNaissance || !split) {
    return data;
  }

  return {
    ...data,
    lieuNaissance: {
      ...data.lieuNaissance,
      departementNaissance: split.departementNaissance,
      communeNaissance: {
        ...communeNaissance,
        codeCommune: split.codeCommune,
      },
    },
  };
}
