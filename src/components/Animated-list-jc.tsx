"use client";

import { cn } from "@/app/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";

interface Item {
  name: string;
  description: string;
  icon: string;
  time: string;
}

let notifications = [
  {
    name: "Difficulté avec les notes aiguës",
    description: "Atteint en 6 mois",
    time: "Il y a 6 mois",
    icon: "🎺",
  },
  {
    name: "Embouchure instable",
    description: "Réglé dès la première séance",
    time: "Il y a 1 jour",
    icon: "🎵",
  },
  {
    name: "Problèmes de contrôle de respiration",
    description: "Amélioration après 2 mois de pratique",
    time: "Il y a 2 mois",
    icon: "💨",
  },
  {
    name: "Qualité de son inégale",
    description: "Corrigé après plusieurs répétitions",
    time: "Il y a 3 semaines",
    icon: "🔊",
  },
  {
    name: "Difficulté à maintenir le tempo",
    description: "Réglé en 3 séances",
    time: "Il y a 1 semaine",
    icon: "⏱️",
  },
  {
    name: "Problème de lecture des partitions",
    description: "Amélioration progressive en 4 mois",
    time: "Il y a 4 mois",
    icon: "📄",
  },
  {
    name: "Difficulté à jouer en groupe",
    description: "Progrès significatif après 5 répétitions",
    time: "Il y a 2 semaines",
    icon: "👥",
  },
  {
    name: "Manque d'endurance",
    description: "Résolu après un entraînement régulier de 3 mois",
    time: "Il y a 3 mois",
    icon: "💪",
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles - stone theme
        "bg-white border border-stone-100 shadow-sm hover:shadow-md",
      )}
    >
      <div className="flex flex-row items-center gap-4">
        <div
          className="flex size-11 items-center justify-center rounded-xl bg-stone-100"
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre font-medium text-stone-900">
            <span className="text-sm sm:text-base">{name}</span>
            <span className="mx-1.5 text-stone-300">·</span>
            <span className="text-xs text-stone-400 font-normal">{time}</span>
          </figcaption>
          <p className="text-sm text-stone-500 font-normal">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function AnimatedListDemo({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col p-6 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm",
        className,
      )}
    >
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  );
}
