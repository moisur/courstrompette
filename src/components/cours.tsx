/* eslint-disable react/no-unescaped-entities */


import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Globe, Users, GraduationCap, Mic, HeadphonesIcon, BookOpenIcon, ZapIcon } from 'lucide-react'
import { AnimatedListDemo } from './Animated-list-jc'
import Image from 'next/image';
import questionImage from '../../public/questions.webp'
import profImage from '@/../public/prof-trompette.jpg'
import profMat from '@/../public/prof.webp'
import jc from '@/../public/jc.png'
import jc1 from "@/../public/jc1.png"
import pkoi from '@/../public/pkoi.webp'
import ze from '@/../public/ZE.webp'
import content from "@/../public/content.webp"

export default function Cours() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showExitPopup, setShowExitPopup] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true)
    }, 20000)

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      setShowExitPopup(true)
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return (
    <div className="font-sans text-gray-800">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="#" className="pl-2 font-bold text-2xl bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">

            
            JC Trompette</a>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <ul className={`md:flex ${isMenuOpen ? 'block' : 'hidden'} absolute md:relative top-full left-0 right-0 bg-white md:bg-transparent`}>
            <li><a href="#about" className="block px-4 py-2 hover:text-orange-500">À propos</a></li>
            <li><a href="#method" className="block px-4 py-2 hover:text-orange-500">La méthode JC</a></li>
            <li><a href="#testimonials" className="block px-4 py-2 hover:text-orange-500">Témoignages</a></li>
            <li><a href="#faq" className="block px-4 py-2 hover:text-orange-500">FAQ</a></li>
            <li><a href="#contact" className="block px-4 py-2 hover:text-orange-500">Contact</a></li>
          </ul>
        </div>
      </nav>

      <header className="relative min-h-screen flex items-center justify-center text-white text-center px-4 pt-16">
        <Carousel className="w-full h-full absolute top-0 left-0" opts={{ loop: true }}>
          <CarouselContent>
            <CarouselItem>
              <div className="w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/4087991/pexels-photo-4087991.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
            </CarouselItem>
            <CarouselItem>
              <div className="w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('image1.jpg')" }} />
            </CarouselItem>
            <CarouselItem>
              <div className="w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1246437/pexels-photo-1246437.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
        <div className="relative z-20 max-w-4xl">
          <h1 className="text-2xl md:text-6xl sm:text-xl text-font-bold mb-4 shadow-text">90 Jours pour devenir <br /> un virtuose de la Trompette</h1>
          <p className="text-xl md:text-2xl mb-8 shadow-text">Débutants, Passionnés, Amateurs ?<br /> Je m'adresse à vous🫵</p>
          <a href="#booking" className="inline-block text-3xl bg-slate-200 text-orange-500  py-3 px-6 rounded-full text-center transition duration-300 ease-in-out hover:bg-slate-300 hover:font-medium">
            Apprennez la trompette dès maintenant
          </a>
          <p className='mt-4 text-xl md:text-xl mb-8 shadow-text'>(Votre premier cours est gratuit)</p>
        </div>
      </header>

      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Ma méthode Révolutionne l'Apprentissage de la  
            <span className="pl-2  bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              Trompette
            </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <img
                src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                alt="Trompette en gros plan"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="w-full md:w-1/2 md:pl-8">
              <p className="text-lg mb-4">Imaginez-vous jouant votre morceau préféré en 90 jours même si vous n'avez jamais touché une trompette de votre vie. <br /><br /> Ça paraît fou ? Pourtant c'est possible, mes élèves l'ont fait.</p>
              <p className="text-lg">À chaque étape de votre apprentissage, je vous accompagne. Préparez-vous à vivre une expérience musicale extraordinaire !</p>
              <p className="text-lg mt-2">Ok, ok ok ... ça a l'air cool tout ça, mais c'est qui JC ?</p>
            </div>
          </div>
        </div>
      </section>

      <section id="who-am-i" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">  Qui   est le         
            <span className="pl-2  bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              fameux JC ?
            </span>       
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <Image
                src={jc1} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
            </div>
            <div className="w-full md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-semibold mb-4">Je m'appelle Jean-Christophe Yervant j'ai 38 ans et depuis 2006 je suis passionné de trompette !</h3>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <Music className="mr-4 text-orange-500" />
                      <span>20 ans d'expérience en tant que trompettiste en pur autodidacte</span>
                    </li>
                    <li className="flex items-center">
                      <Globe className="mr-4 text-orange-500" />
                      <span>Tournées en Pologne, Allemagne, Belgique, Espagne, Pays Bas et dans la France entière</span>
                    </li>
                    <li className="flex items-center">
                      <Mic className="mr-4 text-orange-500" />
                      <span>Des centaines de spectacles de rue -hack sous côté pour apprendre la musique-</span>
                    </li>
                    <li className="flex items-center">
                      <Users className="mr-4 text-orange-500" />
                      <span>27 élèves déjà transformés grâce à ma méthode unique (et ce chiffre ne fait que grandir)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="who-am-i" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12"> Je n'ai jamais trouvé un seul professeur 
      
            <span className="pl-2  bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            professeur
            </span>       qui me convenait. 
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <Image
                src={questionImage} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
            </div>
            <div className="w-full md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-semibold mb-4">Leur problème commun ? <br /> <br /> Ils jouent tous plus ou moins bien bien mais ne savent PAS comment l’expliquer. <br />(Ce qui est problématique pour enseigner...) </h3>
              <p className="text-lg mt-6">
 
Inspiré par le grand Miles Davis, Maurice André et Wynton Marsalis, je me suis débrouillé par moi-même pour apprendre la trompette. 
<br /> <br />(D’ailleurs Miles lui-même était une brèle au début) <br /><br />
J’ai fait TOUTES les erreurs possibles et imaginables. <br />
J’ai perdu DES ANNÉES à corriger et rectifier le tir. <br /><br />
 
Mais sans le savoir, j’ai développé une vision à 360° de l’apprentissage de la trompette.
</p>
            </div>
          </div>
        </div>
      </section>

      
      <section id="who-am-i" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Vous vous demandez comment enfin trouver <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          ZE professeur ? !  </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <Image
                src={ze} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
            </div>
            <div className="w-full md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-semibold mb-4"> C'est normal. </h3>
              <p className="text-lg mt-6">
              Et c'est pour faire face à cette  difficulté de trouver des  vrais bons professeurs, que j'ai décidé de créer ma propre méthode. <br /> <br /> Mon objectif est simple : vous aider à apprécier la trompette sans prise de tête et vous permettre de jouer des morceaux en seulement 90 jours.

                
                Mon approche couvre tout, du rythme à l'improvisation, en passant par la maîtrise des graves et des aigus, l'écoute, la lecture de partition et bien plus encore. <br /><br />Vous n'avez plus à vous perdre dans les détails techniques ; je vous fournis les outils et la boussole nécessaires pour avancer avec assurance.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="who-am-i" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Après avoir enseigné les mathématiques       <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          pendant plus de 15 ans...   </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <Image
                src={profMat} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
            </div>
            <div className="w-full md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-semibold mb-4">J'ai découvert ma passion pour l'enseignement de la trompette <br />en aidant le meilleur ami de mon  petit frère.        </h3>
              <p className="text-lg mt-6"> 
                
              En aidant le petit frère d’un pote, j’ai compris que je kiffais donner des cours de musique. <br />
Avant ça, j’ai été prof de maths pendant +10 ans. <br /> <br />
Le problème aujourd’hui ? <br /><br />
 Les bons trompettiste sont rares. Mais il y'a plus rare encore ... <br />
Les bons professeurs sont quasi inexistants. <br /><br />

(Dans ma vie j’ai eu la chance d’écouter 3 trompettistes d’exception) <br /><br />
C’est difficile de trouver un prof qui ne t’apprend pas à jouer à l’envers. <br />
C’est pourquoi j’ai décidé de créer ma propre méthode. <br /><br />

              </p>
            </div>
          </div>
        </div>
      </section>


      <section id="mission" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ma mission ?
            <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              Vous accompagner à kiffer la trompette
            </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-2xl font-semibold mb-4">
                Le goal ultime ?
              </h3>
              <p className="text-lg mt-6">
                <strong> Jouer des morceaux en 90 jours.</strong>
                <br /><br /> Voici les aspects clés que nous aborderons ensemble :
              </p>
              <ul className="list-disc list-inside mt-4 text-lg space-y-2">
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/clock--v1.png" alt="Icône rythme" className="mr-3"/>
                  Rythme
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/speaker.png" alt="Icône son" className="mr-3"/>
                  Pose du son
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/tuning.png" alt="Icône réglage" className="mr-3"/>
                  Maîtrise des graves & des aigus
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/ear.png" alt="Icône écoute" className="mr-3"/>
                  Écoute
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/notes.png" alt="Icône note" className="mr-3"/>
                  Jouer une note juste
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/speed.png" alt="Icône vitesse" className="mr-3"/>
                  Vitesse
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/fingers.png" alt="Icône doigté" className="mr-3"/>
                  Doigtés
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/reading.png" alt="Icône partition" className="mr-3"/>
                  Lecture de partition
                </li>
                <li className="flex items-center">
                  <img src="https://img.icons8.com/ios-filled/24/000000/improvisation.png" alt="Icône improvisation" className="mr-3"/>
                  Improvisation
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2 md:pl-8">
            <Image
                src={jc} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />            </div>
          </div>
        </div>
      </section>

      <section id="why-method" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pourquoi choisir <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            ma méthode ?
            </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-2xl font-semibold mb-4">
              En voulant tout faire seul, on se retrouve souvent à ne pas progresser. </h3>
              <p className="text-lg mt-6">J'ai vécu cela au début. C’était frustrant de ne pas trouver un professeur pour m’aiguiller. Têtu, j'ai décidé de tout faire tout seul. Je connais bien ce chemin semé d'embûches !
                <br /><br />
                J’ai fait TOUTES les erreurs possibles et imaginables. <br />
J’ai perdu DES ANNÉES à corriger et rectifier le tir.
<br /><br />
                C’est pourquoi j'ai créé une méthode pour vous équiper des outils nécessaires afin que vous puissiez avancer et d'une boussole pour vous y retrouver. La méthode JC, c’est la solution qui réinvente l’apprentissage de la trompette.
              </p>
            </div>
            <div className="w-full md:w-1/2 md:pl-8">
            <Image
                src={pkoi} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
            </div>
          </div>
        </div>
      </section>
      <section id="method" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">La méthode JC : Votre Passeport pour l'
            <span className="pl-2 pr-2   bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
             Excellence 
            </span>            
            en 90 Jours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <HeadphonesIcon className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Écoute et Observation</h3>
                <p>Je vois votre cerveau en marche. Je sens vos peurs. Je réponds aux questions que vous n'osez pas demander ou que n'arrivez pas à formuler.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <ZapIcon className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Équilibre ZEN et Énergie</h3>
                <p>Ma méthode est un équilibre subtil entre ZEN et énergie. Plus que du mindset, c'est énergétique.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <BookOpenIcon className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Techniques Uniques</h3>
                <p>N'écoutez PAS votre propre son. Ignorez le feedback. Concentrez vos forces. Apprenez à jouer sans partitions.</p>
              </CardContent>
            </Card>
            

          </div>
          <h3  className="mt-5 text-1xl md:text-2xl font-bold text-center">
            (Et ce n’est que 0.01% de ce que je vais vous apprendre)
            </h3>
        </div>
      </section>
      <section id="impact" className="bg-gray-100 py-20">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
      Une fois que vous aurez joué vos 
      <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">

      premiers morceaux... </span>
    </h2>
    <div className="flex flex-wrap items-center">
      <div className="w-full md:w-1/2 mb-8 md:mb-0 text-center">
        <img
          src="https://img.icons8.com/ios-filled/50/000000/confidence.png"
          alt="Icône confiance"
          className="mb-4 mx-auto"
        />
                      <h3 className="text-2xl font-semibold mb-4">
                      Que vous aurez impressionné vos amis et vos proches...
</h3>
        <p className="text-lg mt-6">
          <br /><br />
          Vous aurez la confiance en vous pour passer au niveau supérieur ! Et je sais de quoi je parle.
        </p>
      </div>
      <div className="w-full md:w-1/2 md:pl-8 text-center md:text-left">
             <Image
                src={content} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
      </div>
    </div>
  </div>
</section>


      <section id="testimonials" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Mes  
            <span className="pl-2 pr-2   bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            élèves
            </span>peuvent vous le confirmer : 
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">"Grâce à JC, j'ai réalisé mon rêve de jouer sur une scène avec mon copain en seulement 6 mois. La méthode JC a changé ma vie !"</p>
                <p className="font-semibold">Sophie L., 28 ans - De débutante à pro en 6 mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">"À 40 ans, je pensais que c'était trop tard. JC m'a prouvé le contraire. En 90 jours, je jouais déjà mes premiers morceaux ! ! !"</p>
                <p className="font-semibold">Thomas M., 41 ans - A surmonté ses doutes et brille sur scène</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">"JC ne m'a pas seulement appris à jouer, il m'a appris à ressentir la musique. Chaque leçon est une révélation. Je vis mon rêve éveillé !"</p>
                <p className="font-semibold">Léa D., 22 ans - Joue de la trompette avec plaisir grâce à La Méthode JC</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="method" className="bg-gray-100 py-20">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
      C’est la puissance de <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">la méthode que je vous offre</span>.
    </h2>
    <div className="flex flex-wrap items-center">
      <div className="w-full md:w-1/2 mb-8 md:mb-0">
        <img
          src="https://img.icons8.com/ios-filled/50/000000/lightning-bolt.png"
          alt="Icône puissance"
          className="mb-4 mx-auto"
        />
        <h3 className="text-2xl font-semibold mb-4">
          La méthode JC ?
        </h3>
        <p className="text-lg mt-6">
          <strong> 20 années d’expertise concentrées en une méthode.</strong>
          <br /><br />
          Puissante, elle vous fera progresser 3 fois plus vite qu'avec les méthodes traditionnelles. Pourquoi ?
          <br /><br />
          Parce que j’ai toujours adoré enseigner ce que je savais. J’ai ça dans le sang. Ma méthode est basée sur l’écoute et l’observation.
          <br /><br />
          Je vois votre cerveau en marche. Je sens vos peurs. Je réponds aux questions que vous n'osez pas demander ou que vous n’arrivez pas à formuler.
          <br /><br />
          Je suis passé par là ! Je connais tout ça par cœur. Éloignons-nous de l’angoisse. Concentrons-nous sur l’essentiel. Plus que du mindset, c’est énergétique. Ma méthode est un équilibre subtil entre ZEN et énergie.
        </p>
      </div>
      <div className="w-full md:w-1/2 md:pl-8 text-center md:text-left">
        <img
          src="https://img.icons8.com/ios-filled/50/000000/brain.png"
          alt="Icône cerveau"
          className="mb-4 mx-auto"
        />
      </div>
    </div>
  </div>
</section>

      <div className="flex flex-col md:flex-row w-full p-6">
      <div className="flex w-full md:w-1/2 items-center justify-center p-4 bg-gray-100 rounded-lg">
      <div className="max-w-sm items-center justify-center text-center">
        <span className="pointer-events-none z-10 h-full whitespace-pre-wrap bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-center text-6xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
        Voici tout ce que vous allez enfin voir disparaître
        </span>
      </div>

      </div>
      <div className="flex w-full md:w-1/2 items-center justify-center p-4">
        <AnimatedListDemo />
      </div>
    </div>
      <section id="guarantee" className="bg=[#F97316]  text-black py-20">

        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ma Garantie "Satisfaction ou Remboursé"</h2>
          <p className="text-xl mb-8">Si vous ne jouez pas votre premier morceau complet en 90 jours, je vous rembourse intégralement, sans discuter.</p>
          <a href="#booking" className="inline-block bg-slate-200 text-orange-500 font-semibold py-3 px-6 rounded-full text-center transition duration-300 ease-in-out hover:bg-slate-300">
            Réservez Votre Cours Gratuit
          </a>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl md:text-6xl font-bold text-center mb-12">F.A.Q.</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className='text-4xl'>Comment se passe une séance ?</AccordionTrigger>
              <AccordionContent className='text-2xl'>
                Les séances font 45 minutes et se divisent en 3 phases :
                <ul className="text-1xl list-disc list-inside ml-4 mt-2">
                  <li>Échauffement</li>
                  <li>Pose de son (technique, rythme)</li>
                  <li>Apprentissage de morceau</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className='text-4xl'>Ça m'intéresse, combien ça coûte ?</AccordionTrigger>
              <AccordionContent className='text-2xl'>
                35 € la séance. Forfait -10 % les 10 séances.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className='text-4xl'>On fait ça où ?</AccordionTrigger>
              <AccordionContent className='text-2xl'>
                Chez moi ! Mes voisins sont habitués.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section id="booking" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Réservez Votre Cours Gratuit</h2>
          <form className="max-w-lg mx-auto">
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2">Nom complet</label>
              <input type="text" id="name" className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2">Adresse e-mail</label>
              <input type="email" id="email" className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block mb-2">Numéro de téléphone</label>
              <input type="tel" id="phone" className="w-full px-3 py-2 border rounded" required />
            </div>
            <button type="submit" className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300">Réserver Mon Cours Gratuit</button>
          </form>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">JC Trompette</h3>
              <p>Révélez votre génie musical en 90 jours garantis</p>
            </div>
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Contact</h4>
              <p>Email: contact@jctrompette.com</p>
              <p>Téléphone: 06 XX XX XX XX</p>
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="text-lg font-semibold mb-2">Suivez-nous</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-orange-500">Facebook</a>
                <a href="#" className="hover:text-orange-500">Instagram</a>
                <a href="#" className="hover:text-orange-500">YouTube</a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2024 JC Trompette. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <button onClick={() => setShowPopup(false)} className="float-right text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Ne manquez pas cette opportunité !</h2>
            <p className="mb-4">Réservez votre cours gratuit maintenant et commencez votre voyage musical dès aujourd'hui.</p>
            <a href="#booking" className="block w-full bg-orange-500 text-white text-center font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300">
              Réserver mon cours gratuit
            </a>
          </div>
        </div>
      )}

      {showExitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <button onClick={() => setShowExitPopup(false)} className="float-right text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Attendez !</h2>
            <p className="mb-4">Êtes-vous sûr de vouloir partir ? Vous êtes à deux pas de révéler votre talent musical !</p>
            <a href="#booking" className="block w-full bg-orange-500 text-white text-center font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300">
              Rester et réserver mon cours
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .shadow-text {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  )
}