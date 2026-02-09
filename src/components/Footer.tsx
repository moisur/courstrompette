/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-white py-16">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

          {/* Adresse */}
          <a
            href="https://www.google.com/maps/place/9+rue+de+la+Fontaine+au+Roi,+75011+Paris,+France"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-center p-6 rounded-xl hover:bg-stone-800 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-stone-800 group-hover:bg-amber-500/10 mb-4 transition-colors">
              <MapPin className="w-6 h-6 text-stone-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Adresse</h3>
            <p className="text-stone-400">9 rue de la Fontaine au roi</p>
            <p className="text-stone-400">75011 Paris, France</p>
          </a>

          {/* Téléphone */}
          <a
            href="https://wa.me/33663738902"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-center p-6 rounded-xl hover:bg-stone-800 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-stone-800 group-hover:bg-amber-500/10 mb-4 transition-colors">
              <Phone className="w-6 h-6 text-stone-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Téléphone</h3>
            <p className="text-stone-400">06.63.73.89.02</p>
          </a>

          {/* Email */}
          <a
            href="mailto:yervantj@gmail.com"
            className="group text-center p-6 rounded-xl hover:bg-stone-800 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-stone-800 group-hover:bg-amber-500/10 mb-4 transition-colors">
              <Mail className="w-6 h-6 text-stone-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Email</h3>
            <p className="text-stone-400">yervantj@gmail.com</p>
          </a>

        </div>

        {/* Divider */}
        <div className="border-t border-stone-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-500 text-sm">
              © {new Date().getFullYear()} JC Trompette. Tous droits réservés.
            </p>
            <p className="text-stone-600 text-xs">
              <a href="/paris" className="hover:text-amber-500 transition-colors">Cours de trompette à Paris</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ContactSection;
