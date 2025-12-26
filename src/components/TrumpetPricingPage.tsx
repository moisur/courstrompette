"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/app/lib/utils"

type PricingCardProps = {
  title: string
  price: number
  description: string
  features: string[]
  actionLabel: string
  popular?: boolean
  discount?: number
}

const PricingCard = ({ title, price, description, features, actionLabel, popular, discount }: PricingCardProps) => (
  <Card
    className={cn(
      "w-full max-w-sm flex flex-col justify-between transition-all duration-500 rounded-[2.5rem] overflow-hidden relative",
      popular
        ? "border-[3px] border-stone-900 bg-white scale-105 shadow-[12px_12px_0px_0px_rgba(251,191,36,1)] z-10"
        : "border-2 border-stone-900 bg-white hover:shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] shadow-[4px_4px_0px_0px_rgba(28,25,23,0.1)]"
    )}
  >
    {popular && (
      <div className="bg-amber-500 text-stone-900 text-[11px] font-black py-2.5 text-center uppercase tracking-[0.2em] border-b-[3px] border-stone-900">
        Recommandé pour progresser
      </div>
    )}

    <div>
      <CardHeader className={cn(
        "pb-8 text-center relative z-10",
        popular ? "pt-8" : "pt-12"
      )}>
        <CardTitle className="text-3xl font-serif text-stone-900 mb-2">
          {title}
        </CardTitle>

        <div className="flex flex-col items-center gap-2 mt-6">
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-serif font-light text-stone-900 tracking-tighter">
              {price}€
            </span>
            <span className="text-stone-400 font-light italic">
              / leçon
            </span>
          </div>

          {discount && (
            <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-black rounded-full border-2 border-amber-200 uppercase tracking-wider animate-pulse-slow">
              Économisez {discount}€ sur le pack
            </div>
          )}
        </div>

        <CardDescription className="pt-8 text-stone-500 italic font-light leading-relaxed px-4">
          &ldquo;{description}&rdquo;
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-10 pb-10 relative z-10">
        {features.map((feature: string) => (
          <div key={feature} className="flex items-start gap-4 group/item">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 group-hover/item:bg-amber-100 transition-colors mt-0.5">
              <Check className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-[15px] text-stone-600 font-light leading-snug text-left">
              {feature}
            </span>
          </div>
        ))}
      </CardContent>
    </div>

    <CardFooter className="pt-0 pb-12 px-10 relative z-10">
      <a
        href="#booking"
        className={cn(
          "w-full py-5 px-6 rounded-full font-bold text-center border-2 border-stone-900 transition-all duration-300 flex items-center justify-center gap-3 group/btn text-lg",
          popular
            ? "bg-amber-500 text-stone-900 hover:bg-amber-400 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]"
            : "bg-white text-stone-900 hover:bg-stone-50 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]"
        )}
      >
        <span>{actionLabel}</span>
      </a>
    </CardFooter>
  </Card>
)

const TrumpetPricingPage: React.FC = () => {
  const plans = [
    {
      title: "Cours à l'unité",
      price: 40,
      description: "La liberté totale pour explorer votre potentiel sans engagement immédiat.",
      features: ["Agenda flexible", "Support digital inclus", "Idéal pour une remise en forme"],
      actionLabel: "Réserver une séance",
    },
    {
      title: "Forfait Transformation",
      price: 36,
      description: "Le parcours d'excellence pour une métamorphose profonde de votre jeu.",
      features: ["Garantie +3 notes de tessiture", "Plan d'entraînement sur-mesure", "Accompagnement prioritaire", "Pack de 10 séances"],
      actionLabel: "Démarrer ma transformation",
      popular: true,
      discount: 40,
    },
    {
      title: "Forfait Élan",
      price: 38,
      description: "Un souffle décisif pour franchir votre premier palier technique majeur.",
      features: ["Suivi hebdomadaire rigoureux", "Analyse vidéo personnalisée", "Pack de 5 séances"],
      actionLabel: "Prendre de l'élan",
      discount: 10,
    },
  ]

  return (
    <section id="pricing" className="py-12 md:py-24 bg-white relative overflow-hidden">
      {/* Decorative background halos */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stone-100 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* En-tête de Prestige */}
        <div className="text-center mb-12 md:mb-24 space-y-8">
          <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm font-bold px-5 py-2 rounded-full tracking-widest uppercase">
            Formules & Investissement
          </span>
          <h2 className="text-5xl md:text-7xl font-serif text-stone-900 leading-tight">
            Investissez dans votre <span className="italic text-amber-600">talent</span>
          </h2>
          <div className="w-32 h-1.5 bg-amber-600 rounded-full mx-auto opacity-20" />
          <p className="text-2xl text-stone-500 max-w-3xl mx-auto font-light leading-relaxed italic">
            &ldquo;Des formules d&apos;exception conçues pour transformer votre jeu et libérer votre plein potentiel musical.&rdquo;
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-12 items-stretch pt-8">
          {plans.map((plan) => (
            <PricingCard key={plan.title} {...plan} />
          ))}
        </div>

        {/* Note de confiance */}
        <div className="mt-24 pt-12 border-t border-stone-100 flex flex-col items-center gap-8">
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-sm uppercase tracking-[0.4em] font-black text-stone-900">Cours découverte offert</span>
            <div className="hidden md:block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm uppercase tracking-[0.4em] font-black text-stone-900">Paiement sécurisé</span>
          </div>
          <p className="text-stone-400 text-base italic font-light max-w-xl text-center">
            Notre collaboration commence par un appel stratégique offert pour définir vos objectifs précis.
          </p>
        </div>
      </div>
    </section>
  )
}

export default TrumpetPricingPage