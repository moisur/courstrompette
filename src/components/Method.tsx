/* eslint-disable react/no-unescaped-entities */


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket, faBrain, faUsers } from '@fortawesome/free-solid-svg-icons'

export default function Component() {
  const methods = [
    {
      icon: <FontAwesomeIcon icon={faRocket} className="w-16 h-16 text-orange-500" />,
      title: "Apprentissage progressif",
      description: "Mon approche unique vous propulse de débutant à musicien accompli en un temps record. Votre premier morceau est à porté de main !"
    },
    {
      icon: <FontAwesomeIcon icon={faBrain} className="w-16 h-16 text-orange-500" />,
      title: "Clarté Mentale",
      description: "Découvrez les secrets méconnus des pros pour transformer le trac en super-pouvoir et jouer avec une confiance inébranlable."
    },
    {
      icon: <FontAwesomeIcon icon={faUsers} className="w-16 h-16 text-orange-500" />,
      title: "Des dizaines d'elèves déjà formés",
      description: "Rejoignez une famille de passionnés de trompette qui vous soutiendront et vous inspireront à chaque étape de votre aventure musicale."
    }
  ]


  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16">
          La méthode Z2G : 
        </h2>
        <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-16">Jouez votre premier morceau en 10 séances</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {methods.map((method, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-6">
                {method.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {method.title}
              </h3>
              <p className="text-gray-600">
                {method.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}