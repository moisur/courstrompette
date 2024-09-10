"use client";

import { cn } from "@/app/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "Difficulté avec les notes aiguës",
    description: "Atteint en 6 mois",
    time: "Il y a 6 mois",
    icon: "🎺",
    color: "#F97316",
  },
  {
    name: "Embouchure instable",
    description: "Réglé dès la première séance",
    time: "Il y a 1 jour",
    icon: "🎵",
    color: "#F97316",
  },
  {
    name: "Problèmes de contrôle de respiration",
    description: "Amélioration après 2 mois de pratique",
    time: "Il y a 2 mois",
    icon: "💨",
    color: "#F97316",
  },
  {
    name: "Qualité de son inégale",
    description: "Corrigé après plusieurs répétitions",
    time: "Il y a 3 semaines",
    icon: "🔊",
    color: "#F97316",
  },
  {
    name: "Difficulté à maintenir le tempo",
    description: "Réglé en 3 séances",
    time: "Il y a 1 semaine",
    icon: "⏱️",
    color: "#F97316",
  },
  {
    name: "Problème de lecture des partitions",
    description: "Amélioration progressive en 4 mois",
    time: "Il y a 4 mois",
    icon: "📄",
    color: "#F97316",
  },
  {
    name: "Difficulté à jouer en groupe",
    description: "Progrès significatif après 5 répétitions",
    time: "Il y a 2 semaines",
    icon: "👥",
    color: "#F97316",
  },
  {
    name: "Manque d'endurance",
    description: "Résolu après un entraînement régulier de 3 mois",
    time: "Il y a 3 mois",
    icon: "💪",
    color: "#F97316",
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
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
        "relative flex h-[500px] w-full flex-col p-6 overflow-hidden rounded-lg border bg-background md:shadow-xl",
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
