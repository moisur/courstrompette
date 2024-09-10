"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/app/lib/utils";

type PricingCardProps = {
  title: string
  price: number
  description: string
  features: string[]
  actionLabel: string
  popular?: boolean
  discount?: number
}

const PricingHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <section className="text-center mb-12">
    <h2 className="text-4xl font-bold bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">{title}</h2>
    <p className="text-xl pt-1">{subtitle}</p>
  </section>
)

const PricingCard = ({ title, price, description, features, actionLabel, popular, discount }: PricingCardProps) => (
  <Card
    className={cn(`w-full max-w-sm flex flex-col justify-between py-1 ${popular ? "border-[#F16] scale-105" : "border-zinc-200"} mx-auto`, {
      "shadow-lg": popular,
    })}>
    <div>
      <CardHeader className="pb-8 pt-4">
        <CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">{title}</CardTitle>
        <div className="flex items-baseline gap-1 mt-2">
          <h3 className="text-4xl font-bold">{price}€</h3>
          <span className="text-sm text-zinc-500">{popular ? "/forfait" : "/séance"}</span>
        </div>
        {discount && (
          <div className="mt-2 inline-block px-2.5 py-1 bg-gradient-to-r from-[#F16] to-[#F97316] text-white text-sm font-semibold rounded-full">
            Économisez {discount}€
          </div>
        )}
        <CardDescription className="pt-1.5 h-12">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {features.map((feature: string) => (
          <div key={feature} className="flex gap-2">
            <CheckCircle2 size={18} className="my-auto text-[#F16]" />
            <p className="pt-0.5 text-zinc-700 dark:text-zinc-300 text-sm">{feature}</p>
          </div>
        ))}
      </CardContent>
    </div>
    <CardFooter className="mt-2">
      <Button className="w-full bg-gradient-to-r from-[#F16] to-[#F97316] text-white hover:from-[#E05] hover:to-[#E86305]">
        {actionLabel}
      </Button>
    </CardFooter>
  </Card>
)

const TrumpetPricingPage: React.FC = () => {
  const plans = [
    {
      title: "Cours à l'unité",
      price: 35,
      description: "Flexibilité maximale pour tous les niveaux",
      features: ["Flexibilité maximale", "Idéal pour essayer", "Adapté à tous les niveaux"],
      actionLabel: "Réserver",
    },
    {
      title: "Forfait 10 séances",
      price: 315,
      description: "Progression optimale pour jouer votre premier morceau",
      features: ["10% de réduction", "Progression optimale", "Jouer votre premier morceau"],
      actionLabel: "Choisir ce forfait",
      popular: true,
      discount: 35,
    },
    {
      title: "Forfait 5 séances",
      price: 166.25,
      description: "Progression rapide avec suivi personnalisé",
      features: ["5% de réduction", "Progrès rapides", "Suivi personnalisé"],
      actionLabel: "Choisir ce forfait",
      discount: 8.75,
    },
  ]

  return (
    <div className="py-8 px-4">
      <PricingHeader title="Tarifs des cours de trompette" subtitle="Choisissez l'offre qui vous convient le mieux" />
      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        {plans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>
    </div>
  )
}

export default TrumpetPricingPage