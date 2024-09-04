/* eslint-disable react/no-unescaped-entities */


import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { ConfettiButton } from "@/components/magicui/confetti";

const Formulaire: React.FC = () => {
  const [state, handleSubmit] = useForm("xdkngnbl");

  if (state.succeeded) {
    return <p className="text-center text-green-500 font-bold text-xl">Super votre mail à bien été envoyé je vous contact rapidement !</p>;
  }

  return (
    <section id="booking" className="bg-gray-100 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          Réservez Votre Cours Gratuit
        </h2>
        <form className="max-w-lg mx-auto" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 mb-2">Numéro de téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <ValidationError prefix="Phone" field="phone" errors={state.errors} />
          </div>
          <div className="mb-4">
            <label htmlFor="experience" className="block text-gray-700 mb-2">Niveau d'expérience</label>
            <select
              id="experience"
              name="experience"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Choisissez votre niveau</option>
              <option value="beginner">Débutant total</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
            <ValidationError prefix="Experience" field="experience" errors={state.errors} />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 mb-2">Message (optionnel)</label>
            <textarea
              id="message"
              name="message"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} />
          </div>
          <ConfettiButton
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
            disabled={state.submitting}
          >
            Réserver Mon Cours Gratuit
          </ConfettiButton>
        </form>
      </div>
    </section>
  );
};

export default Formulaire;
