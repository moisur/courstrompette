"use client";

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { ConfettiButton } from "@/components/magicui/confetti";
import { CheckCircle2, User, Mail, Phone, Trophy } from "lucide-react"; // Optionnel: pour les icônes

interface FormulaireProps {
  isModal?: boolean;
}

const Formulaire: React.FC<FormulaireProps> = ({ isModal }) => {
  const [state, handleSubmit] = useForm("xdkngnbl");

  // Message de succès stylisé
  if (state.succeeded) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Message envoyé !</h3>
        <p className="text-gray-500 max-w-xs">
          Super, votre demande a bien été reçue. Je vous recontacte très rapidement.
        </p>
      </div>
    );
  }

  const inputStyles = "w-full pl-4 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 outline-none text-gray-800 placeholder:text-gray-400";
  const labelStyles = "block text-sm font-semibold text-gray-700 mb-1.5 ml-1";

  const Content = (
    <form className="max-w-lg mx-auto w-full space-y-5" onSubmit={handleSubmit}>

      {/* Nom */}
      <div>
        <label htmlFor="name" className={labelStyles}>Nom complet</label>
        <div className="relative">
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Jean Dupont"
            className={inputStyles}
            required
          />
          {/* Exemple d'icône positionnée en absolute si tu veux (nécessite pl-10 sur l'input) */}
        </div>
        <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-500 text-sm mt-1" />
      </div>

      {/* Email & Téléphone (Grid sur grand écran) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelStyles}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="jean@exemple.com"
            className={inputStyles}
            required
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm mt-1" />
        </div>

        <div>
          <label htmlFor="phone" className={labelStyles}>Téléphone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="06 12 34 56 78"
            className={inputStyles}
            required
          />
          <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-red-500 text-sm mt-1" />
        </div>
      </div>

      {/* Expérience */}
      <div>
        <label htmlFor="experience" className={labelStyles}>Niveau d&apos;expérience</label>
        <div className="relative">
          <select
            id="experience"
            name="experience"
            className={`${inputStyles} appearance-none cursor-pointer`}
            required
            defaultValue=""
          >
            <option value="" disabled>Sélectionnez votre niveau</option>
            <option value="beginner">Débutant total</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>
          {/* Petite flèche custom CSS pour remplacer celle du navigateur moche */}
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
          </div>
        </div>
        <ValidationError prefix="Experience" field="experience" errors={state.errors} className="text-red-500 text-sm mt-1" />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelStyles}>Message (optionnel)</label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="J&apos;aimerais savoir si..."
          className={`${inputStyles} resize-none`}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-sm mt-1" />
      </div>

      <div className="pt-2">
        <ConfettiButton
          type="submit"
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/30 transform transition hover:-translate-y-0.5"
          disabled={state.submitting}
        >
          {state.submitting ? "Envoi en cours..." : "Réserver Mon Cours Gratuit"}
        </ConfettiButton>
        <p className="text-xs text-center text-gray-400 mt-3">
          Aucun engagement requis. Vos données restent confidentielles.
        </p>
      </div>
    </form>
  );

  if (isModal) {
    return Content;
  }

  // Version Section de page (hors modal)
  return (
    <section id="booking" className="bg-white py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Réservez Votre <span className="text-orange-600">Cours Gratuit</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Rejoignez-nous pour une séance découverte inoubliable.
            </p>
          </div>
          {Content}
        </div>
      </div>
    </section>
  );
};

export default Formulaire;