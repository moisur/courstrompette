"use client";

import { useState } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InscriptionParticulierSchema, InscriptionParticulierDTO } from "@/lib/urssaf/schema";
import { getFriendlyErrorMessage } from "@/lib/urssaf/errors";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, ChevronRight, User, MapPin, Landmark, Phone, Mail } from "lucide-react";

interface UrssafEnrollmentFormProps {
  studentId: string;
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  onSuccess?: () => void;
}

type UrssafApiValidationError = {
  code?: string;
  message?: string;
  description?: string;
};

type SubmitErrorItem = {
  message: string;
  detail?: string;
};

const URSSAF_FIELD_ERROR_MAP: Record<string, Path<InscriptionParticulierDTO>[]> = {
  ERR_DATE_NAISSANCE_FUTUR: ["dateNaissance"],
  ERR_LIEU_NAISSANCE_OBLIGATOIRE: ["lieuNaissance.communeNaissance.libelleCommune"],
  ERREUR_LIEU_NAISSANCE_DEPT: ["lieuNaissance.departementNaissance"],
  ERREUR_LIEU_NAISSANCE_DEPT_FORMAT: ["lieuNaissance.departementNaissance"],
  ERR_LIEU_NAISSANCE_COMN: ["lieuNaissance.communeNaissance.codeCommune"],
  ERREUR_LIEU_NAISSANCE_PAYS: [
    "lieuNaissance.codePaysNaissance",
    "lieuNaissance.departementNaissance",
    "lieuNaissance.communeNaissance.codeCommune",
  ],
  ERREUR_LIEU_NAISSANCE_INVALIDE: ["lieuNaissance.communeNaissance.libelleCommune"],
  ERR_CONTACT: [
    "adresseMail",
    "numeroTelephonePortable",
    "adressePostale.libelleVoie",
    "adressePostale.codePostal",
    "adressePostale.libelleCommune",
    "adressePostale.codeCommune",
  ],
  ERR_CONTACT_ADRESSE_TYPE_VOIE: ["adressePostale.codeTypeVoie"],
  ERR_CONTACT_ADRESSE_TYPEVOIE: ["adressePostale.codeTypeVoie"],
  ERR_CONTACT_ADRESSE_LETTRE_VOIE: ["adressePostale.lettreVoie"],
  ERR_CONTACT_ADRESSE_LIBELLEVOIE: ["adressePostale.libelleVoie"],
  ERR_CONTACT_ADRESSE_INFORMATION_SUPPLEMENTAIRE: [
    "adressePostale.libelleVoie",
    "adressePostale.complement",
    "adressePostale.lieuDit",
  ],
  ERR_CONTACT_ADRESSE_COMMUNE: [
    "adressePostale.libelleCommune",
    "adressePostale.codeCommune",
    "adressePostale.codePostal",
  ],
  ERR_COORDONNEES_BANCAIRES: [
    "coordonneeBancaire.bic",
    "coordonneeBancaire.iban",
    "coordonneeBancaire.titulaire",
  ],
  ERREUR_REFERENCE_PARTICULIER_EXISTANTE_TYPE: ["adresseMail", "numeroTelephonePortable"],
  ERREUR_VALIDATION: [
    "dateNaissance",
    "lieuNaissance.departementNaissance",
    "lieuNaissance.communeNaissance.codeCommune",
    "lieuNaissance.communeNaissance.libelleCommune",
    "adresseMail",
    "numeroTelephonePortable",
    "adressePostale.codeTypeVoie",
    "adressePostale.libelleVoie",
    "adressePostale.codePostal",
    "adressePostale.codeCommune",
    "coordonneeBancaire.bic",
    "coordonneeBancaire.iban",
  ],
};

export function UrssafEnrollmentForm({ studentId, initialData, onSuccess }: UrssafEnrollmentFormProps) {
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitErrors, setSubmitErrors] = useState<SubmitErrorItem[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lastRequestPayload, setLastRequestPayload] = useState<Record<string, unknown> | null>(null);
  const [lastResponsePayload, setLastResponsePayload] = useState<unknown>(null);
  const [lastResponseStatus, setLastResponseStatus] = useState<number | null>(null);

  // Split name if possible for defaults
  const nameParts = initialData?.name?.split(' ') || [];
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : "";
  const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : "";

  const form = useForm<InscriptionParticulierDTO>({
    resolver: zodResolver(InscriptionParticulierSchema),
    defaultValues: {
      civilite: "1",
      nomNaissance: lastName.toUpperCase(),
      nomUsage: "",
      prenoms: firstName.toUpperCase(),
      dateNaissance: "",
      lieuNaissance: {
        codePaysNaissance: "99100",
        departementNaissance: "",
        communeNaissance: {
          codeCommune: "",
          libelleCommune: ""
        }
      },
      numeroTelephonePortable: initialData?.phone || "",
      adresseMail: initialData?.email || "",
      adressePostale: {
        numeroVoie: "",
        lettreVoie: "",
        codeTypeVoie: "",
        libelleVoie: "",
        complement: "",
        lieuDit: "",
        libelleCommune: "",
        codeCommune: "",
        codePostal: "",
        codePays: "99100" 
      },
      coordonneeBancaire: {
        bic: "",
        iban: "",
        titulaire: initialData?.name?.toUpperCase() || ""
      }
    },
    mode: "onBlur"
  });

  function buildSandboxPayload(): InscriptionParticulierDTO {
    const normalizedPhone = (initialData?.phone || "").replace(/\D/g, "");
    const sandboxPhone = /^(06|07)\d{8}$/.test(normalizedPhone) ? normalizedPhone : "0605040302";
    const sandboxEmail = initialData?.email?.trim() || `sandbox+${studentId.slice(0, 8)}@courstrompette.fr`;
    const prenoms = (firstName || "JEAN").toUpperCase();
    const nomNaissance = (lastName || "TEST").toUpperCase();
    const titulaire = `M ${prenoms} ${nomNaissance}`.trim().slice(0, 100);

    return {
      civilite: "1",
      nomNaissance,
      nomUsage: "CLIENT",
      prenoms,
      dateNaissance: "1980-03-29",
      lieuNaissance: {
        codePaysNaissance: "99100",
        departementNaissance: "044",
        communeNaissance: {
          codeCommune: "109",
          libelleCommune: "NANTES",
        },
      },
      numeroTelephonePortable: sandboxPhone,
      adresseMail: sandboxEmail,
      adressePostale: {
        numeroVoie: "1",
        lettreVoie: "",
        codeTypeVoie: "R",
        libelleVoie: "DE LA PAIX",
        complement: "",
        lieuDit: "",
        libelleCommune: "NANTES",
        codeCommune: "44109",
        codePostal: "44000",
        codePays: "99100",
      },
      coordonneeBancaire: {
        bic: "BNPAFRPP",
        iban: "FR7630004000031234567890143",
        titulaire,
      },
    };
  }

  function applySandboxPrefill() {
    form.reset(buildSandboxPayload());
    setSubmitState("idle");
    setSubmitErrors([]);
    setLastRequestPayload(null);
    setLastResponsePayload(null);
    setLastResponseStatus(null);
  }

  function normalizeApiFieldPath(rawFieldPath: string): Path<InscriptionParticulierDTO> | null {
    const normalized = rawFieldPath
      .replace(/^inputParticulier\./, "")
      .replace(/\[\d+\]\./g, ".")
      .trim();

    const allowedPaths = new Set<Path<InscriptionParticulierDTO>>([
      "civilite",
      "nomNaissance",
      "nomUsage",
      "prenoms",
      "dateNaissance",
      "lieuNaissance.codePaysNaissance",
      "lieuNaissance.departementNaissance",
      "lieuNaissance.communeNaissance.codeCommune",
      "lieuNaissance.communeNaissance.libelleCommune",
      "numeroTelephonePortable",
      "adresseMail",
      "adressePostale.numeroVoie",
      "adressePostale.lettreVoie",
      "adressePostale.codeTypeVoie",
      "adressePostale.libelleVoie",
      "adressePostale.complement",
      "adressePostale.lieuDit",
      "adressePostale.libelleCommune",
      "adressePostale.codeCommune",
      "adressePostale.codePostal",
      "adressePostale.codePays",
      "coordonneeBancaire.bic",
      "coordonneeBancaire.iban",
      "coordonneeBancaire.titulaire",
    ]);

    return allowedPaths.has(normalized as Path<InscriptionParticulierDTO>)
      ? (normalized as Path<InscriptionParticulierDTO>)
      : null;
  }

  function extractFieldPathFromValidationMessage(message?: string) {
    if (!message) return null;

    const fieldMatch = message.match(/champ\s+([a-zA-Z0-9_.[\]]+)\s*:/i);
    if (!fieldMatch) return null;

    return normalizeApiFieldPath(fieldMatch[1]);
  }

  function applyServerFieldErrors(errors: UrssafApiValidationError[]) {
    const touchedFields: Path<InscriptionParticulierDTO>[] = [];

    for (const apiError of errors) {
      const code = apiError.code || "";
      const message = getFriendlyErrorMessage(code, apiError.message || apiError.description || "Erreur URSSAF");
      const fieldFromMessage = extractFieldPathFromValidationMessage(apiError.message);
      const mappedFields = fieldFromMessage ? [fieldFromMessage] : (URSSAF_FIELD_ERROR_MAP[code] || []);

      for (const field of mappedFields) {
        if (!touchedFields.includes(field)) {
          touchedFields.push(field);
          form.setError(field, {
            type: "server",
            message,
          });
        }
      }
    }

    if (touchedFields[0]) {
      setTimeout(() => form.setFocus(touchedFields[0]), 0);
    }
  }

  const onSubmit = async (data: InscriptionParticulierDTO) => {
    setSubmitState('loading');
    setSubmitErrors([]);
    form.clearErrors();
    setClientId(null);
    setLastResponsePayload(null);
    setLastResponseStatus(null);

    const payload = {
      ...data,
      dateNaissance: new Date(data.dateNaissance).toISOString(),
      nomUsage: data.nomUsage || undefined,
      lieuNaissance: {
        ...data.lieuNaissance,
        communeNaissance: data.lieuNaissance.codePaysNaissance === '99100' 
          ? data.lieuNaissance.communeNaissance 
          : undefined,
        departementNaissance: data.lieuNaissance.codePaysNaissance === '99100'
          ? data.lieuNaissance.departementNaissance
          : undefined
      },
      adressePostale: {
        ...data.adressePostale,
        numeroVoie: data.adressePostale.numeroVoie || undefined,
        lettreVoie: data.adressePostale.lettreVoie || undefined,
        codeTypeVoie: data.adressePostale.codeTypeVoie || undefined,
        libelleVoie: data.adressePostale.libelleVoie || undefined,
        complement: data.adressePostale.complement || undefined,
        lieuDit: data.adressePostale.lieuDit || undefined,
      }
    };

    setLastRequestPayload(payload);

    try {
      const res = await fetch(`/api/admin/students/${studentId}/urssaf/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      setLastResponseStatus(res.status);
      setLastResponsePayload(resData);

      if (!res.ok) {
        if (Array.isArray(resData)) {
          applyServerFieldErrors(resData as UrssafApiValidationError[]);
          const mappedErrors = resData.map(e => ({
            message: getFriendlyErrorMessage(e.code, e.message),
            detail: e.description || e.message
          }));
          setSubmitErrors(mappedErrors);
        } else {
           if (resData?.code === "ERREUR_VALIDATION" || resData?.error === "Erreur de saisie") {
             applyServerFieldErrors([
               {
                 code: resData?.code || "ERREUR_VALIDATION",
                 message: resData?.message || resData?.error,
                 description: resData?.description || resData?.details,
               },
             ]);
           }
           setSubmitErrors([{
             message:
               (resData?.code && resData?.message
                 ? getFriendlyErrorMessage(resData.code, resData.message)
                 : resData?.message || resData?.error || "Erreur lors de l'inscription"),
             detail: resData?.description || resData?.details
           }]);
        }
        setSubmitState('error');
        return;
      }

      setSubmitState('success');
      setClientId(resData.idClient);
      onSuccess?.();
    } catch (err: any) {
      setSubmitState('error');
      setLastResponsePayload({ error: err.message || "Une erreur systeme est survenue" });
      setLastResponseStatus(null);
      setSubmitErrors([{ message: err.message || 'Une erreur système est survenue' }]);
    }
  };

  const isFrance = form.watch('lieuNaissance.codePaysNaissance') === '99100';

  if (submitState === 'success') {
    return (
      <div className="p-8 text-center bg-green-50 rounded-3xl border border-green-100">
        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-black text-green-900 mb-2">Inscription Réussie</h3>
        <p className="text-green-700 leading-relaxed mb-6">
          L&apos;élève est désormais inscrit au service Avance Immédiate.<br/>
          ID Client URSSAF : <span className="font-mono bg-white px-2 py-0.5 rounded border border-green-200">{clientId}</span>
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full border-green-200 text-green-700 hover:bg-green-100">
          Fermer et actualiser
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 items-start">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
          <AlertCircle size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900">Information Importante</p>
          <p className="text-xs text-amber-700 leading-relaxed mt-1">
            L&apos;inscription d&apos;un particulier à l&apos;Avance Immédiate via l&apos;API API-EDI nécessite des informations d&apos;état civil précises.
            Assurez-vous que l&apos;élève a déjà effectué au moins une déclaration de revenus en France.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={applySandboxPrefill}
                className="rounded-full border-amber-200 bg-white text-amber-800 hover:bg-amber-100"
              >
                Pre-remplir un dossier sandbox
              </Button>
              <p className="text-[11px] leading-6 text-amber-700">
                Ce bouton remplit tout le formulaire avec un cas fictif compatible sandbox. Ajustez seulement l&apos;email
                si vous voulez utiliser une adresse precise.
              </p>
            </div>
          </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          
          {/* IDENTITÉ */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <User size={18} className="text-amber-600" />
              <h3 className="font-black text-stone-900 uppercase tracking-tighter">Identité de l&apos;élève</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="civilite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Civilité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-stone-200">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">M. (Masculin)</SelectItem>
                        <SelectItem value="2">Mme (Féminin)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nomNaissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Nom de naissance</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="MARTIN" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Prénoms</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="JEAN ERIC" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dateNaissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Date de Naissance (YYYY-MM-DD)</FormLabel>
                    <FormControl><Input type="date" className="rounded-xl border-stone-200" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adresseMail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Email de contact</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                        <Input className="rounded-xl border-stone-200 pl-9" placeholder="nom@email.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* NAISSANCE */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <MapPin size={18} className="text-amber-600" />
              <h3 className="font-black text-stone-900 uppercase tracking-tighter">Lieu de Naissance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="lieuNaissance.codePaysNaissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code Pays (INSEE)</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={5} placeholder="99100" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              {isFrance && (
                <>
                  <FormField
                    control={form.control}
                    name="lieuNaissance.departementNaissance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Département</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={3} placeholder="075" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lieuNaissance.communeNaissance.codeCommune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code Commune</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={3} placeholder="056" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lieuNaissance.communeNaissance.libelleCommune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Ville Naissance</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="PARIS 15" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>

          {/* ADRESSE RÉSIDENCE */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <MapPin size={18} className="text-amber-600" />
              <h3 className="font-black text-stone-900 uppercase tracking-tighter">Adresse de Résidence</h3>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="adressePostale.numeroVoie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-stone-400">N°</FormLabel>
                      <FormControl><Input className="rounded-xl border-stone-200 font-mono" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-9 lg:col-span-4">
                <FormField
                  control={form.control}
                  name="adressePostale.codeTypeVoie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-stone-400">Type Voie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-stone-200">
                            <SelectValue placeholder="Type de voie..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[280px]">
                          <SelectItem value="R">R — Rue</SelectItem>
                          <SelectItem value="AV">AV — Avenue</SelectItem>
                          <SelectItem value="BD">BD — Boulevard</SelectItem>
                          <SelectItem value="ALL">ALL — Allée</SelectItem>
                          <SelectItem value="CH">CH — Chemin</SelectItem>
                          <SelectItem value="PL">PL — Place</SelectItem>
                          <SelectItem value="IMP">IMP — Impasse</SelectItem>
                          <SelectItem value="RTE">RTE — Route</SelectItem>
                          <SelectItem value="PAS">PAS — Passage</SelectItem>
                          <SelectItem value="SQ">SQ — Square</SelectItem>
                          <SelectItem value="Q">Q — Quai</SelectItem>
                          <SelectItem value="CRS">CRS — Cours</SelectItem>
                          <SelectItem value="FG">FG — Faubourg</SelectItem>
                          <SelectItem value="LOT">LOT — Lotissement</SelectItem>
                          <SelectItem value="RES">RES — Résidence</SelectItem>
                          <SelectItem value="CL">CL — Clos</SelectItem>
                          <SelectItem value="BAT">BAT — Bâtiment</SelectItem>
                          <SelectItem value="C">C — Carrefour</SelectItem>
                          <SelectItem value="CHE">CHE — Cheminement</SelectItem>
                          <SelectItem value="CI">CI — Cité</SelectItem>
                          <SelectItem value="COR">COR — Corniche</SelectItem>
                          <SelectItem value="DOM">DOM — Domaine</SelectItem>
                          <SelectItem value="ESP">ESP — Esplanade</SelectItem>
                          <SelectItem value="GR">GR — Grande Rue</SelectItem>
                          <SelectItem value="HAM">HAM — Hameau</SelectItem>
                          <SelectItem value="LD">LD — Lieu-dit</SelectItem>
                          <SelectItem value="MTE">MTE — Montée</SelectItem>
                          <SelectItem value="PAR">PAR — Parc</SelectItem>
                          <SelectItem value="PRO">PRO — Promenade</SelectItem>
                          <SelectItem value="SEN">SEN — Sentier</SelectItem>
                          <SelectItem value="TRA">TRA — Traverse</SelectItem>
                          <SelectItem value="VIA">VIA — Via</SelectItem>
                          <SelectItem value="VO">VO — Voie</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <FormField
                  control={form.control}
                  name="adressePostale.libelleVoie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-stone-400">Libellé Voie</FormLabel>
                      <FormControl><Input className="rounded-xl border-stone-200" placeholder="DE LA PAIX" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="adressePostale.codePostal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code Postal</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={5} placeholder="75015" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adressePostale.libelleCommune"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Commune</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="PARIS" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adressePostale.codeCommune"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code INSEE Commune</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={5} placeholder="75115" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="adressePostale.codePays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code INSEE Pays</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={5} placeholder="99100" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="numeroTelephonePortable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Téléphone Portable</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                        <Input className="rounded-xl border-stone-200 pl-9" placeholder="+336..." {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* BANQUE */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Landmark size={18} className="text-amber-600" />
              <h3 className="font-black text-stone-900 uppercase tracking-tighter">Coordonnées Bancaires</h3>
            </div>

            <FormField
              control={form.control}
              name="coordonneeBancaire.titulaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-stone-400">Titulaire du compte</FormLabel>
                  <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="JEAN MARTIN" {...field} /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="coordonneeBancaire.bic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code BIC</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 font-mono uppercase" placeholder="BNPAFRPP" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coordonneeBancaire.iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-stone-400">IBAN</FormLabel>
                    <FormControl><Input className="rounded-xl border-stone-200 font-mono uppercase" placeholder="FR76..." {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-6">
            {submitState === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={18} />
                  <p className="text-sm font-black uppercase tracking-tight">Erreur d&apos;inscription URSSAF</p>
                </div>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  {submitErrors.map((err, i) => (
                    <li key={i}><strong>{err.message}</strong> {err.detail && <span className="opacity-70">({err.detail})</span>}</li>
                  ))}
                </ul>
              </div>
            )}

            {(lastRequestPayload || lastResponsePayload !== null) && (
              <div className="mb-6 space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-stone-900">Debug M010</p>
                  <p className="mt-1 text-xs leading-6 text-stone-500">
                    Vous voyez ici le JSON exact envoye par l&apos;app et la reponse brute de l&apos;API URSSAF.
                  </p>
                </div>

                {lastRequestPayload ? (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-stone-400">Payload envoye</p>
                    <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs leading-6 text-stone-700">
                      {JSON.stringify(lastRequestPayload, null, 2)}
                    </pre>
                  </div>
                ) : null}

                {lastResponsePayload !== null ? (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-stone-400">
                      Reponse URSSAF {lastResponseStatus ? `(HTTP ${lastResponseStatus})` : ""}
                    </p>
                    <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs leading-6 text-stone-700">
                      {JSON.stringify(lastResponsePayload, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={submitState === 'loading'}
              className="w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest shadow-lg shadow-amber-200"
            >
              {submitState === 'loading' ? "Transmission en cours..." : "Inscrire à l'Avance Immédiate"}
              {submitState !== 'loading' && <ChevronRight className="ml-2" size={18} />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
