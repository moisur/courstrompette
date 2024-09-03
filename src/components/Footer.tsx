import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const ContactSection: React.FC = () => {
  return (
    <section className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-around items-center text-center">
          
          {/* Adresse */}
          <a
            href="https://www.google.com/maps/place/9+rue+de+la+Fontaine+au+Roi,+75011+Paris,+France"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-1/3 mb-8 md:mb-0 hover:bg-gray-700 p-6 rounded-lg transition duration-300"
          >
            <FaMapMarkerAlt className="text-orange-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Adresse</h3>
            <p>9 rue de la Fontaine au roi</p>
            <p>75011 Paris, France</p>
          </a>

          {/* Téléphone */}
          <a
            href="https://wa.me/33663738902"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-1/3 mb-8 md:mb-0 hover:bg-gray-700 p-6 rounded-lg transition duration-300"
          >
            <FaPhoneAlt className="text-orange-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Téléphone</h3>
            <p>06.63.73.89.02</p>
          </a>

          {/* Email */}
          <a
            href="mailto:yervantj@gmail.com"
            className="w-full md:w-1/3 hover:bg-gray-700 p-6 rounded-lg transition duration-300"
          >
            <FaEnvelope className="text-orange-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <p>yervantj@gmail.com</p>
          </a>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
