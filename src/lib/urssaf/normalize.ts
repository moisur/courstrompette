import type { InscriptionParticulierDTO } from "@/lib/urssaf/schema";

function padFrenchDepartmentCode(departementNaissance?: string) {
  const code = (departementNaissance || "").trim().toUpperCase();
  if (!code) return code;
  if (/^\d{1,2}$/.test(code) || /^[0-9][AB]$/.test(code)) {
    return code.padStart(3, "0");
  }
  return code;
}

function splitFrenchCommuneInseeCode(codeCommune: string) {
  const code = codeCommune.trim().toUpperCase();

  if (!/^[0-9A-Z]{5}$/.test(code)) {
    return null;
  }

  // DOM-TOM: 97101 → département 971, commune 001 (API: exactement 3 chiffres)
  if (/^(97|98)[0-9A-Z]{3}$/.test(code)) {
    return {
      departementNaissance: code.slice(0, 3),
      codeCommune: code.slice(3).padStart(3, "0"),
    };
  }

  // Métropole / Corse: 37261 → 037 + 261 ; 2A004 → 02A + 004
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

  const rawCodeCommune = communeNaissance?.codeCommune?.trim() ?? "";
  const nextCodeCommune = split?.codeCommune
    ?? (/^\d{1,2}$/.test(rawCodeCommune) ? rawCodeCommune.padStart(3, "0") : communeNaissance?.codeCommune);

  return {
    ...data,
    lieuNaissance: {
      ...data.lieuNaissance,
      departementNaissance: split?.departementNaissance
        ?? padFrenchDepartmentCode(data.lieuNaissance.departementNaissance),
      communeNaissance: communeNaissance
        ? {
            ...communeNaissance,
            codeCommune: nextCodeCommune,
          }
        : communeNaissance,
    },
  };
}
