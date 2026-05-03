"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/client-api";
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Landmark, 
  Loader2, 
  Mail, 
  MapPin, 
  Phone, 
  User, 
  Music2 
} from "lucide-react";
import { InscriptionParticulierSchema, InscriptionParticulierDTO } from "@/lib/urssaf/schema";
import { getFriendlyErrorMessage } from "@/lib/urssaf/errors";

// Extended schema to include courstrompette specific fields
const FullOnboardingSchema = z.object({
  // Student part
  studentRate: z.string().min(1, "Le tarif est requis"),
  courseDay: z.string().optional(),
  courseHour: z.string().optional(),
  notes: z.string().optional(),
  address: z.string().optional(),
  // URSSAF part - we spread it
  urssaf: InscriptionParticulierSchema
});

type FullOnboardingDTO = z.infer<typeof FullOnboardingSchema>;

interface NewUrssafStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void | Promise<void>;
}

export function NewUrssafStudentDialog({ open, onOpenChange, onCreated }: NewUrssafStudentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ studentId: string; urssafClientId: string } | null>(null);
  const [serverErrors, setServerErrors] = useState<{ message: string; detail?: string }[]>([]);

  const form = useForm<FullOnboardingDTO>({
    resolver: zodResolver(FullOnboardingSchema),
    defaultValues: {
      studentRate: "40",
      courseDay: "",
      courseHour: "",
      notes: "",
      address: "",
      urssaf: {
        civilite: "1",
        nomNaissance: "",
        nomUsage: "",
        prenoms: "",
        dateNaissance: "",
        lieuNaissance: {
          codePaysNaissance: "99100",
          departementNaissance: "",
          communeNaissance: {
            codeCommune: "",
            libelleCommune: ""
          }
        },
        numeroTelephonePortable: "",
        adresseMail: "",
        adressePostale: {
          numeroVoie: "",
          lettreVoie: "",
          codeTypeVoie: "R",
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
          titulaire: ""
        }
      }
    }
  });

  const onSubmit = async (data: FullOnboardingDTO) => {
    setIsSubmitting(true);
    setServerErrors([]);
    
    try {
      const response = await fetch("/api/admin/students/urssaf-full-enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentData: {
            rate: data.studentRate,
            courseDay: data.courseDay,
            courseHour: data.courseHour,
            notes: data.notes,
            address: data.address,
          },
          urssafData: data.urssaf
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (Array.isArray(result.error)) {
          // URSSAF validation errors
          setServerErrors(result.error.map((e: any) => ({
            message: getFriendlyErrorMessage(e.code, e.message),
            detail: e.description
          })));
        } else {
          setServerErrors([{ message: result.error || "Une erreur est survenue" }]);
        }
        return;
      }

      setSuccessData({ studentId: result.studentId, urssafClientId: result.urssafClientId });
      toast({
        title: "Élève créé et inscrit ! ✅",
        description: `ID URSSAF : ${result.urssafClientId}`,
      });
      await onCreated();
      
    } catch (error: any) {
      setServerErrors([{ message: error.message || "Erreur de connexion" }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFrance = form.watch('urssaf.lieuNaissance.codePaysNaissance') === '99100';

  if (successData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md border-stone-200">
           <div className="p-8 text-center bg-emerald-50 rounded-3xl border border-emerald-100">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-emerald-900 mb-2">Opération Réussie</h3>
            <p className="text-emerald-700 leading-relaxed mb-6">
              L&apos;élève a été créé et inscrit au service Avance Immédiate.<br/>
              ID Client URSSAF : <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">{successData.urssafClientId}</span>
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Terminer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0 border-stone-200">
        <DialogHeader className="p-6 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Landmark size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-stone-900 leading-none">
                Nouvel élève URSSAF (Direct M010)
              </DialogTitle>
              <p className="text-sm text-stone-500 mt-2">
                Remplissez les informations ci-dessous pour créer l&apos;élève et l&apos;inscrire à l&apos;Avance Immédiate en un clic.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-stone-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 pb-12">
              
              {/* SECTION COURSTROMPETTE */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <Music2 size={18} className="text-blue-600" />
                  <h3 className="font-black text-stone-900 uppercase tracking-tighter">Infos Cours</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="studentRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Tarif (€)</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Jour</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200" placeholder="Lundi" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Heure</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200" placeholder="18h30" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Adresse Interne</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200" placeholder="Paris 11e" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-stone-400">Notes Internes</FormLabel>
                      <FormControl><Textarea className="rounded-xl border-stone-200 min-h-[60px]" placeholder="Précisez ici les attentes de l'élève..." {...field} /></FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION URSSAF IDENTITÉ */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <User size={18} className="text-amber-600" />
                  <h3 className="font-black text-stone-900 uppercase tracking-tighter">État Civil (URSSAF)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="urssaf.civilite"
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
                    name="urssaf.nomNaissance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Nom de naissance</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="DURAND" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urssaf.prenoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Prénoms</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="ERIC ANTOINE" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="urssaf.dateNaissance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Date de Naissance</FormLabel>
                        <FormControl><Input type="date" className="rounded-xl border-stone-200" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urssaf.adresseMail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Email URSSAF</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                            <Input className="rounded-xl border-stone-200 pl-9" placeholder="jean@email.fr" {...field} />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="urssaf.lieuNaissance.codePaysNaissance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code Pays INSEE</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={5} placeholder="99100" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  {isFrance && (
                    <>
                      <FormField
                        control={form.control}
                        name="urssaf.lieuNaissance.departementNaissance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-stone-400">Dép.</FormLabel>
                            <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={3} placeholder="069" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="urssaf.lieuNaissance.communeNaissance.codeCommune"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code Comm.</FormLabel>
                            <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={3} placeholder="101" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="urssaf.lieuNaissance.communeNaissance.libelleCommune"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-stone-400">Ville</FormLabel>
                            <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="LYON" {...field} /></FormControl>
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
                  <h3 className="font-black text-stone-900 uppercase tracking-tighter">Adresse URSSAF</h3>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="urssaf.adressePostale.numeroVoie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-stone-400">N°</FormLabel>
                          <FormControl><Input className="rounded-xl border-stone-200" placeholder="8" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="urssaf.adressePostale.codeTypeVoie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-stone-400">Type</FormLabel>
                          <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="R" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="urssaf.adressePostale.libelleVoie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-stone-400">Libellé Voie</FormLabel>
                          <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="du Soleil" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="urssaf.adressePostale.codePostal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">CP</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={5} placeholder="69001" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urssaf.adressePostale.libelleCommune"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Commune</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="LYON 01" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="urssaf.adressePostale.codeCommune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Code INSEE Commune</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 font-mono" maxLength={5} placeholder="69101" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urssaf.numeroTelephonePortable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">Portable Portable</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                            <Input className="rounded-xl border-stone-200 pl-9" placeholder="0605..." {...field} />
                          </div>
                        </FormControl>
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
                  name="urssaf.coordonneeBancaire.titulaire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-stone-400">Titulaire</FormLabel>
                      <FormControl><Input className="rounded-xl border-stone-200 uppercase" placeholder="JEANNE MARTIN" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="urssaf.coordonneeBancaire.bic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">BIC</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 font-mono uppercase" placeholder="BNPAFRPP" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urssaf.coordonneeBancaire.iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-stone-400">IBAN</FormLabel>
                        <FormControl><Input className="rounded-xl border-stone-200 font-mono uppercase" placeholder="FR76..." {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ERRORS */}
              {serverErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={18} />
                    <p className="text-sm font-black uppercase tracking-tight">Erreurs rencontrées</p>
                  </div>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    {serverErrors.map((err, i) => (
                      <li key={i}><strong>{err.message}</strong> {err.detail && <span className="opacity-70">({err.detail})</span>}</li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="p-6 border-t border-stone-100 bg-stone-50/50 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full border-stone-200">
            Annuler
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transmission...
              </>
            ) : (
              <>
                Créer l&apos;élève et Inscrire (M010)
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
