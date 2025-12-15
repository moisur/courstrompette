/* eslint-disable react/no-unescaped-entities */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus, faMusic, faArrowTrendUp, faHeadphones, faCheck,
  faBolt, faHand, faBookOpen, faMagicWandSparkles
} from '@fortawesome/free-solid-svg-icons'

export default function Mission() {
  const aspects = [
    { icon: faPlus, label: 'Rythme' },
    { icon: faMusic, label: 'Pose du son' },
    { icon: faArrowTrendUp, label: 'Maîtrise des graves & des aigus' },
    { icon: faHeadphones, label: 'Écoute' },
    { icon: faCheck, label: 'Jouer une note juste' },
    { icon: faBolt, label: 'Vitesse' },
    { icon: faHand, label: 'Doigtés' },
    { icon: faBookOpen, label: 'Lecture de partition' },
    { icon: faMagicWandSparkles, label: 'Improvisation' },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Ma mission est claire 👇
          <span className="block mt-2  bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            Vous accompagner à jouer de la trompette
          </span>
        </h2>
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-semibold mb-6 text-center">Le promesse ultime ?</h3>
          <p className="text-2xl font-bold text-center mb-12 text-orange-700">
            Jouer des morceaux en <em>10 séances</em>.
          </p>
          <p className="text-xl mb-8 text-center">
            Voici les aspects clés que nous aborderons ensemble :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aspects.map((aspect, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
                <FontAwesomeIcon icon={aspect.icon} className="text-4xl text-orange-500 mb-4" />
                <h4 className="text-lg font-semibold mb-2">{aspect.label}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}