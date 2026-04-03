import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight, Download, FileText, Info, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // We assume this exists based on homepage components
import { HeroSection } from '@/components/home/HeroSection';

export const metadata: Metadata = {
  title: 'Service à la personne (Urssaf / DGFiP) | Cours de Trompette',
  description: "Comprenez le fonctionnement de l'Avance immédiate du crédit d'impôt : Urssaf pour l'activation et les paiements, DGFiP pour la partie fiscale, avec Jean-Christophe Yervant comme interlocuteur principal.",
};

export default function ServiceALaPersonnePage() {
  return (
    <main className="relative min-h-screen bg-white">

      <HeroSection
        title={
          <>
            L&apos;Avance immédiate, un service
            <br />
            proposé par l&apos;<span className="font-semibold text-amber-100">Urssaf</span> en lien avec la <span className="font-semibold text-amber-100">DGFiP</span>
          </>
        }
        subtitle="Un crédit d'impôt de 50% appliqué immédiatement sur vos cours de trompette à domicile. Jean-Christophe Yervant reste votre interlocuteur principal, pendant que l'Urssaf et la DGFiP gèrent le dispositif administratif et fiscal."
      />

      {/* SECTION 1: HERO / INTRO (Style: Prestige Header) */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-100/50 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">

          {/* En-tête de Prestige */}
          <div className="text-center mb-16 space-y-6 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
              Service à la personne
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
              L&apos;Avance immédiate, un service <br className="hidden md:block" />
              proposé par l&apos;<span className="italic text-amber-600">Urssaf</span> en lien avec la <span className="italic text-amber-600">DGFiP</span>
            </h1>
            <div className="w-24 h-1.5 bg-amber-600 rounded-full mx-auto opacity-30" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Colonne Contenu */}
            <div className="space-y-10 lg:order-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="space-y-8">
                {/* Key Statement */}
                <div className="relative">
                  <div className="absolute -left-4 top-2 w-1 h-16 bg-amber-500 rounded-full" />
                  <p className="text-xl md:text-2xl font-serif text-stone-800 leading-relaxed italic pl-6">
                    L&apos;Avance immédiate est un service <strong className="font-bold text-stone-900">optionnel et gratuit</strong> qui permet la déduction immédiate de votre crédit d&apos;impôt de 50%.
                  </p>
                </div>

                <div className="space-y-6 text-stone-600 text-lg font-light leading-relaxed">
                  <p>
                    Lors du paiement de votre facture à votre organisme prestataire de services, vous ne réglez que la moitié du montant. L&apos;Urssaf opère le service, et la DGFiP prend ensuite cette avance en compte dans votre situation fiscale.
                  </p>

                  {/* Highlights Card */}
                  <div className="bg-stone-50 border-none shadow-inner p-8 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700" />
                    <p className="font-medium text-stone-800 relative z-10 text-lg">
                      Concrètement, pour une dépense de 200 € de services à la personne, l&apos;Urssaf ne prélèvera plus que les 100 € de reste à payer.
                    </p>
                    <p className="mt-4 text-stone-600 relative z-10">
                      <strong className="text-stone-900">Jean-Christophe Yervant</strong> répercutera donc cet allègement dans les factures qu&apos;il vous soumettra, et reste votre interlocuteur principal pour la mise en place comme pour le suivi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Visuelle */}
            <div className="relative group lg:order-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="absolute -top-6 -right-6 w-full h-full border-2 border-stone-200 rounded-[2.5rem] -z-10" />
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] bg-white p-12 flex items-center justify-center min-h-[300px]">
                <Image
                  src="/sap/logo-urssaf.jpg"
                  alt="Logo Urssaf - Au service de notre protection sociale"
                  width={300}
                  height={100}
                  priority
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: COMMENT CA MARCHE (Style: ProblemSection inversé) */}
      <section className="py-16 md:py-32 bg-stone-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-stone-100/50 -skew-x-12 translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">

            {/* Vidéo à gauche */}
            <div className="lg:col-span-5 relative animate-fade-in-up">
              <div className="absolute -inset-4 border border-stone-200 rounded-[2.5rem] -z-10" />
              <div className="absolute inset-4 border border-amber-200/30 rounded-[1.5rem] translate-x-4 translate-y-4 -z-10" />

              <div className="rounded-[2rem] overflow-hidden shadow-2xl relative bg-stone-900 aspect-square md:aspect-auto md:h-[600px] flex items-center">
                <video
                  src="/sap/motion-design.mp4"
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Texte à droite */}
            <div className="lg:col-span-7">
              <div className="mb-12 animate-fade-in-up">
                <span className="text-amber-700 font-medium tracking-[0.2em] text-sm uppercase mb-4 block">
                  Les étapes
                </span>
                <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight mb-6">
                  Comment ça marche ? <br />
                  <span className="italic text-stone-500">Rien de plus simple.</span>
                </h2>
                <div className="w-20 h-1 bg-amber-600 rounded-full opacity-60" />
              </div>

              <div className="space-y-6 text-lg font-light text-stone-600 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <p>
                  Jean-Christophe Yervant reste votre interlocuteur principal : il vous accompagne pour la mise en place du dispositif, puis pour son suivi au quotidien.
                </p>
                <div className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
                  <p>
                    Avec votre autorisation, <strong className="text-stone-900 font-medium">Jean-Christophe Yervant</strong> transmet à l&apos;Urssaf les informations nécessaires à l&apos;ouverture du service. Ensuite, vous recevez une notification de l&apos;Urssaf vous invitant à activer votre compte sur un site dédié : {' '}
                    <a href="https://www.particulier.urssaf.fr" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline underline-offset-4 font-medium transition-colors">
                      www.particulier.urssaf.fr
                    </a>.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700">Votre contact</p>
                    <p className="mt-2 text-xl font-serif text-stone-900">Jean-Christophe Yervant</p>
                    <p className="mt-3 text-base font-light text-stone-600">
                      Je vous explique le dispositif, je vous accompagne dans les démarches et je reste votre point de contact si vous avez la moindre question.
                    </p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700">Rôle Urssaf</p>
                    <p className="mt-2 text-xl font-serif text-stone-900">Activation et paiement</p>
                    <p className="mt-3 text-base font-light text-stone-600">
                      L&apos;Urssaf gère l&apos;activation du service, reçoit les demandes de paiement et ne prélève que votre reste à charge après déduction de l&apos;avance immédiate.
                    </p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700">Rôle DGFiP</p>
                    <p className="mt-2 text-xl font-serif text-stone-900">Traitement fiscal</p>
                    <p className="mt-3 text-base font-light text-stone-600">
                      La DGFiP prend en compte l&apos;avance immédiate dans votre déclaration de revenus et lors du calcul définitif de votre impôt.
                    </p>
                  </div>
                </div>
                <p>
                  Une fois l&apos;avance immédiate activée, <strong className="text-stone-900">Jean-Christophe Yervant</strong> vous adresse les demandes de paiement via l&apos;Urssaf après les prestations réalisées à votre domicile. <strong className="text-stone-900 font-medium bg-amber-100 px-1">Vous avez un délai de 48h pour les valider ou les contester.</strong>
                </p>
                <p>
                  En un coup d&apos;oeil et à tout moment, vous pouvez visualiser depuis votre compte en ligne le crédit d&apos;impôt consommé ainsi que le montant encore disponible pour l&apos;année en cours. La DGFiP réintègre ensuite cette avance dans votre déclaration et dans le calcul final de votre impôt.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: RESSOURCES A TELECHARGER (Style: Cards Grid) */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-4xl font-serif text-stone-900 leading-tight">
              Ressources & <span className="italic text-amber-600">Documents</span>
            </h2>
            <div className="w-24 h-1.5 bg-amber-600 rounded-full mx-auto opacity-30" />
            <p className="text-stone-500 font-light text-lg max-w-2xl mx-auto">
              Téléchargez la documentation officielle de l&apos;Urssaf pour tout savoir sur l&apos;Avance immédiate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            <a href="/sap/faq.pdf" target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="h-full border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-amber-200/20 hover:border-amber-200 transition-all duration-500 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="text-4xl p-4 rounded-2xl bg-amber-50 text-amber-600 shadow-md group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 flex items-center justify-center w-20 h-20">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif text-stone-900 group-hover:text-amber-800 transition-colors">Foire aux questions</h3>
                  <p className="text-stone-600 font-light text-sm">Le document d&apos;aide officiel (PDF).</p>
                </CardContent>
              </Card>
            </a>

            <a href="/sap/depliant.pdf" target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="h-full border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-amber-200/20 hover:border-amber-200 transition-all duration-500 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="text-4xl p-4 rounded-2xl bg-amber-50 text-amber-600 shadow-md group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 flex items-center justify-center w-20 h-20">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif text-stone-900 group-hover:text-amber-800 transition-colors">Dépliant promotionnel</h3>
                  <p className="text-stone-600 font-light text-sm">Synthèse du dispositif (PDF).</p>
                </CardContent>
              </Card>
            </a>

            <a href="/sap/infographie.pdf" target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="h-full border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-amber-200/20 hover:border-amber-200 transition-all duration-500 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="text-4xl p-4 rounded-2xl bg-amber-50 text-amber-600 shadow-md group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 flex items-center justify-center w-20 h-20">
                    <Info className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif text-stone-900 group-hover:text-amber-800 transition-colors">L&apos;Infographie</h3>
                  <p className="text-stone-600 font-light text-sm">Les étapes visuelles (PDF).</p>
                </CardContent>
              </Card>
            </a>

            <a href="/sap/affiche.pdf" target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="h-full border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-amber-200/20 hover:border-amber-200 transition-all duration-500 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="text-4xl p-4 rounded-2xl bg-amber-50 text-amber-600 shadow-md group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 flex items-center justify-center w-20 h-20">
                    <Download className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif text-stone-900 group-hover:text-amber-800 transition-colors">Affiche d&apos;information</h3>
                  <p className="text-stone-600 font-light text-sm">Affiche officielle A3 (PDF).</p>
                </CardContent>
              </Card>
            </a>

          </div>

          <div className="mt-16 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in-up">
            <div>
              <h3 className="text-2xl font-serif text-stone-900 mb-2">Plafonds de crédit d&apos;impôt</h3>
              <p className="text-stone-600 font-light">Consultez le site officiel des impôts pour connaître les limites annuelles du dispositif.</p>
            </div>
            <a
              href="https://www.impots.gouv.fr/portail/particulier/emploi-domicile"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-stone-900 text-white font-medium py-4 px-8 rounded-full hover:bg-stone-800 transition-colors shrink-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
            >
              Voir sur impots.gouv.fr <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <p className="text-center text-stone-500 font-medium tracking-wide text-sm uppercase mt-16">
            Jean-Christophe Yervant reste votre interlocuteur principal : l&apos;Urssaf et la DGFiP interviennent uniquement pour le traitement administratif et fiscal du dispositif.
          </p>
        </div>
      </section>

    </main>
  );
}
