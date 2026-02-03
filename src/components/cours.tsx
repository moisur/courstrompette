'use client';

import { useState, useEffect } from 'react';
import { useBooking } from "@/context/BookingContext";
import { ArrowRight } from "lucide-react";


// Home sections
import {
  HeroSection,
  AboutMethodSection,
  ProblemSection,
  TeacherSection,
  BiographySection,
  StorySection,
  WhyMethodSection,
  MethodFeaturesSection,
  TestimonialsSection,
  GuaranteeSection,
  DisappearSection,
  FAQSection,
  NotVirtuosoSection,
  IntermediateSection,
  MasterclassSection,
} from '@/components/home';

// Existing components
import Method from './Method';
import Mission from './Mission';
import Puissance from './Puissance';
import TrumpetPricingPage from './TrumpetPricingPage';
import AccessoiresTrompette from './blog/AccessoireRecommandes';
import Formulaire from './Formulaire';

// Shared components
import { Popup } from '@/components/shared';
import InlineCTA from '@/components/blog/InlineCTA';
import LocalMap from '@/components/seo/LocalMap';

export default function Cours({
  locationTitle,
  introContent,
  locationName,
  zipCode
}: {
  locationTitle?: React.ReactNode;
  introContent?: React.ReactNode;
  locationName?: string;
  zipCode?: string;
}) {
  const { openModal, isOpen } = useBooking();
  const [showPopup, setShowPopup] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownExitPopup, setHasShownExitPopup] = useState(false);

  // Fermer les popups quand le modal de réservation est ouvert
  useEffect(() => {
    if (isOpen) {
      setShowPopup(false);
      setShowExitPopup(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Ne pas afficher le popup si le modal est déjà ouvert
      if (!isOpen) {
        setShowPopup(true);
      }
    }, 20000);

    const handleMouseLeave = (event: MouseEvent) => {
      // Ne pas afficher le popup si le modal est déjà ouvert
      if (event.clientY <= 0 && !hasShownExitPopup && !isOpen) {
        setShowExitPopup(true);
        setHasShownExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShownExitPopup, isOpen]);


  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <HeroSection title={locationTitle} />

      {/* Local Introduction (Dynamic) */}
      {introContent && (
        <div className="bg-stone-50 border-y border-stone-100">
          <div className="container mx-auto px-6 py-12 max-w-4xl">
            {introContent}
          </div>
        </div>
      )}

      {/* About the Method */}
      <AboutMethodSection />

      {/* Method Component (existing) */}
      <Method />

      {/* Problem Section */}
      <ProblemSection />
      {/* Custom CTA: Before Masterclass */}
      <div className="container mx-auto px-6 max-w-4xl my-8 md:my-12">
        <div className="bg-white border border-stone-100 rounded-[2rem] p-6 md:p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden space-y-6">
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

          <h2 className="text-2xl md:text-3xl font-serif text-stone-900 leading-tight relative z-10">
            Vous en avez marre de stagner ? <br className="hidden md:block" />
            <span className="italic text-amber-600">Vous êtes au bon endroit.</span>
          </h2>

          <div className="space-y-6 relative z-10">
            <p className="text-lg text-stone-700 font-medium">
              Je peux changer le cours de votre vie musicale.
            </p>

            <div>
              <button
                onClick={openModal}
                className="inline-flex items-center bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3 px-8 rounded-full border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all duration-300 transform hover:-translate-y-1 group"
              >
                Coaching Personnalisé
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <p className="text-base text-stone-500 font-light max-w-2xl mx-auto leading-relaxed">
              Sans la bonne méthode, on stagne. Mon objectif est de vous remettre sur la bonne voie.
            </p>
          </div>
        </div>
      </div>
      {/* Teacher Section */}
      <TeacherSection />

      {/* Biography Section */}
      <BiographySection />

      {/* NEW: Not Virtuoso Section - Key differentiator */}
      <NotVirtuosoSection />

      {/* Story Section */}
      <StorySection />

      {/* Mission Component (existing) */}
      <Mission />

      {/* Why Method Section */}
      <WhyMethodSection />

      {/* Method Features Section */}
      <MethodFeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA 1: Before Intermediate */}
      <div className="container mx-auto px-6 max-w-6xl">
        <InlineCTA
          text={<span>Vous maîtrisez les bases ? <span className="italic text-amber-600">Passez à la vitesse supérieure !</span></span>}
          buttonText="Je veux progresser"
        />
      </div>

      {/* NEW: Intermediate Section - For 3-5 years experience */}
      <IntermediateSection />

      {/* Guarantee Section */}
      <GuaranteeSection />

      {/* Puissance Component (existing) */}
      <Puissance />

      {/* Disappear Section */}
      <DisappearSection />

      {/* Pricing */}
      <TrumpetPricingPage />

      {/* Custom CTA: Before Masterclass */}
      <div className="container mx-auto px-6 max-w-4xl my-8 md:my-12">
        <div className="bg-white border border-stone-100 rounded-[2rem] p-6 md:p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden space-y-6">
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

          <h2 className="text-2xl md:text-3xl font-serif text-stone-900 leading-tight relative z-10">
            Vous en avez marre de stagner ? <br className="hidden md:block" />
            <span className="italic text-amber-600">Vous êtes au bon endroit.</span>
          </h2>

          <div className="space-y-6 relative z-10">
            <p className="text-lg text-stone-700 font-medium">
              Je peux changer le cours de votre vie musicale.
            </p>

            <div>
              <button
                onClick={openModal}
                className="inline-flex items-center bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3 px-8 rounded-full border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all duration-300 transform hover:-translate-y-1 group"
              >
                Coaching Personnalisé
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <p className="text-base text-stone-500 font-light max-w-2xl mx-auto leading-relaxed">
              Sans la bonne méthode, on stagne. Mon objectif est de vous remettre sur la bonne voie.
            </p>
          </div>
        </div>
      </div>

      {/* NEW: Masterclass Section */}
      <MasterclassSection />

      {/* Local Map Signal (Dynamic) */}
      {locationName && <LocalMap locationName={locationName} zipCode={zipCode} />}

      {/* Accessories */}
      <AccessoiresTrompette />

      {/* Booking Form */}
      <Formulaire />

      {/* FAQ Section */}
      <FAQSection locationName={locationName} />

      {/* Elfsight Widget */}
      <div
        className="elfsight-app-bb687b25-4aa4-4b59-bb2b-16fd7b98a74d"
        data-elfsight-app-lazy
      />

      {/* Timer Popup */}
      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title="☝️ Ne manquez pas cette opportunité !"
        description="Réservez votre cours gratuit maintenant et commencez votre voyage musical dès aujourd'hui."
        ctaText="Réserver mon cours gratuit !"
      />

      {/* Exit Intent Popup */}
      <Popup
        isOpen={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        title="☝️ Attendez !"
        description="Êtes-vous sûr de vouloir partir ? Si vous réservez maintenant, votre premier cours est GRATUIT !"
        ctaText="Rester et réserver mon cours"
      />
    </div>
  );
}
