/* eslint-disable react/no-unescaped-entities */


import { motion } from 'framer-motion'
import { Zap, Brain } from 'lucide-react'

export default function Puissance() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <section id="method" className="bg-gradient-to-b from-gray-50 to-gray-100 py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          {...fadeIn}
        >
          C'est la puissance de{' '}
          <span className="bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            la méthode que je vous offre
          </span>
        </motion.h2>
        <div className="flex flex-wrap items-center -mx-4">
          <motion.div 
            className="w-full md:w-1/2 px-4 mb-12 md:mb-0"
            {...fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <Zap className="w-10 h-10 text-orange-500 mr-4" />
                <h3 className="text-3xl font-semibold">La méthode Zone de Génie ?</h3>
              </div>
              <p className="text-xl text-orange-500 font-bold">
                  20 années d'expertise concentrées en une méthode.
                </p>
                <p className='mb-2 mt-2'>
                  Puissante, elle vous fera progresser <strong>3 fois plus vite</strong> qu'avec les méthodes traditionnelles. Pourquoi ?
                </p>
                <p className='mb-2 mt-2'>
                  Parce que j'ai toujours adoré <strong>enseigner</strong> ce que je savais. J'ai ça dans le sang. Ma méthode est basée sur <strong>l'écoute</strong> et <strong>l'observation</strong>.
                </p>
                <p className='mb-2 mt-2'>
                  Je vois votre cerveau en marche. Je sens vos peurs. Je réponds aux questions que vous n'osez pas demander ou que vous n'arrivez pas à formuler.
                </p>
                <p className='mb-2 mt-2'>
                  Je suis passé par là ! Je connais tout ça par cœur. Éloignons-nous de l'angoisse. Concentrons-nous sur <strong>l'essentiel</strong>. Plus que du mindset, c'est <strong>énergétique</strong>. Ma méthode est un équilibre subtil entre <strong>ZEN</strong> et <strong>énergie</strong>.
                </p>
            </div>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2 px-4"
            {...fadeIn}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 transform skew-y-6 shadow-lg rounded-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-xl p-8">
                <Brain className="w-16 h-16 text-orange-500 mb-6 mx-auto" />
                <blockquote className="text-xl italic text-center">
                  "La méthode JC, c'est l'art de transformer la complexité en simplicité, la peur en confiance, et le rêve en réalité."
                </blockquote>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}