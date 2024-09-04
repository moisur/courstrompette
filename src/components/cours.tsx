/* eslint-disable react/no-unescaped-entities */


import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Globe, Users, Mic, HeadphonesIcon, BookOpenIcon, ZapIcon } from 'lucide-react'
import { AnimatedListDemo } from './Animated-list-jc'
import Mission from './Mission'
import Method from './Method'
import Formulaire from './Formulaire'
import Footer from './Footer'
import Puissance from './Puissance'
import Image from 'next/image';
import questionImage from '../../public/1.jpg'
import profMat from '@/../public/2.jpg'

import jc from '@/../public/jc.jpg'
import jc1 from "@/../public/jc.jpg"
import pkoi from '@/../public/3.jpeg'
import ze from '@/../public/ZE.webp'

export default function Cours() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showExitPopup, setShowExitPopup] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true)
    }, 20000)

    const handleMouseLeave = (event: MouseEvent) => {
      // Trigger popup only when the mouse leaves the top of the window
      if (event.clientY <= 0) {
        setShowExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);


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
          <h1 className="text-2xl md:text-6xl sm:text-xl font-extrabold mb-4 shadow-text">Jouez votre premier morceau<br /> en 10 séances</h1>
          <p className="text-xl md:text-2xl mt-8 mb-8 shadow-text">Débutants, Passionnés, Amateurs ?<br /> Apprenenez la trompette facilement grâce à la méthode Z2G</p>
          <a href="#booking" className="inline-block text-2xl mt-6 bg-slate-200 text-orange-500 font-semibold py-3 px-6 rounded-full text-center transition duration-300 ease-in-out hover:bg-slate-300">
           Jouez votre premier morceau !
          </a>
          <p className='mt-4 text-xl md:text-xl mb-8 shadow-text'>(Votre premier cours est gratuit)</p>
        </div>
      </header>

      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">La méthode Z2G Révolutionne l'Apprentissage de la  
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
              <p className="text-lg mb-4">Imaginez-vous jouant votre premier morceau en 10 séances même si vous n'avez jamais touché une trompette de votre vie. <br /><br /> Ça paraît fou ? Pourtant c'est possible, mes élèves l'ont fait.</p>
              <p className="text-lg">À chaque étape de votre apprentissage, je suis là pour vous guider. Vous empécher de faire mauvaise route (et de perdre beaucoup de temps) !</p>
              <p className="text-lg mt-2"> Vous vous dites sûrement que 10 séances c'est court, et vous vous demandez, mais c'est qui ce fameux JC ?</p>
            </div>
          </div>
        </div>
      </section>


      <Method />
      <section id="who-am-i" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
Vous en avez marre de jouer vos gammes sans jamais avoir             <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              de vrais résultats  ? !
            </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-2/3 md:pr-8">
              <p className="text-lg mt-6">
                <h3 className="text-2xl font-semibold mb-4">Pratique Stagnante</h3>
                <p className="text-lg mb-4" >
                    Malgré des heures de pratique, vous constatez peu ou pas de progrès dans votre jeu de trompette.
                </p>
 
                <h3 className="text-2xl font-semibold mb-4">Confusion Technique</h3>
                <p className="text-lg">
                    Les embouchures, les gammes et les doigtés semblent être en langage codé, difficile à décrypter.
                </p>
                <h3 className="text-2xl font-semibold mb-4">C'est normal.</h3>
                Tout le monde passe par là quand il n'a pas un bon professeur !
                Mon objectif est simple : vous aider à apprécier la trompette sans prise de tête et vous permettre de jouer votre premier morceau en à peine 10 séances. <br /> <br />

                Mon approche couvre tout, du rythme à l'improvisation, en passant par la maîtrise des graves et des aigus, l'écoute, la lecture de partition et bien plus encore. <br /><br />
                Vous n'avez plus à vous perdre dans les détails techniques, je vous fournis les outils et la boussole nécessaires pour avancer avec assurance.
              </p>
            </div>
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
          </div>
        </div>
      </section>
      <section id="who-am-i" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12"> Trouver un bon  
      
            <span className="pl-2  bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            professeur de trompette
            </span>  est difficile. 
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
              <p className="text-lg mt-6">Pourquoi ? <br /> <br /> La plupart des professeurs jouent tous plus ou moins bien mais n'ont aucune idée de comment ils le font. <br /> En d'autres termes ils n'ont aucune méthode. <br /><br />(Ce qui est problématique pour enseigner...) </p>
              <p className="text-lg mt-6">
                
              Quand j'ai commencé il n'y en avait aucun ... j'ai du me débrouiller par moi-même pour apprendre la trompette. 
              <br /><br />
              Les bons trompettiste sont rares. Mais il y'a plus rare encore ... <br />
              Les bons professeurs !! <br /><br />
              Et c'est exactement ce qui m'a poussé à créer la méthode Zone de Génie !

              </p>
            </div>
          </div>
        </div>
      </section>


      <section id="who-am-i" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Qui est le
            <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              fameux JC ?
            </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-2/3 md:pr-8">
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
                src={profMat}
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} 
                height={300} 
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
            </div>
            <div className="w-full md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-semibold mb-4">J'ai découvert ma passion pour l'enseignement de la trompette <br />en aidant le meilleur ami de mon  petit frère.        </h3>
              <p className="text-lg mt-6"> 
                
              En l'aidant , j’ai compris que j'avais un don pour enseigner la trompette. <br />
              Plus je lui donnais mes secrets, plus il apprenait rapidement <br /> <br />
              Incroyable de voir qu'en quelque séances il réussissait à faire ce que j'ai mis des années à réussir. <br /> Tout ça grâce à la méthode Z2G <br /> <br />
              C’est difficile de trouver un prof qui ne t’apprend pas à jouer à l’envers. <br />
              C’est pourquoi j’ai décidé de créer ma propre méthode. <br /><br />

              </p>
            </div>
          </div>
        </div>
      </section>


      <Mission />
      <section id="why-method" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pourquoi choisir 
            <span className="pl-2 bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              la méthode Z2G ?
            </span>
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 md:pr-8">
              <Image
                src={pkoi} // Utilisation de l'image importée
                alt="cours de trompette paris"
                className="rounded-lg shadow-lg w-full h-auto"
                width={500} // Définir la largeur de l'image
                height={300} // Définir la hauteur de l'image
                layout="responsive" // Ajuster la taille de l'image à son conteneur
              />
            </div>
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-2xl font-semibold mb-4">
                En voulant tout faire seul, on se retrouve souvent à ne pas progresser.
              </h3>
              <p className="text-lg mt-6">
                J'ai vécu cela au début. C’était frustrant de ne pas trouver un professeur pour m’aiguiller. Têtu, j'ai décidé de tout faire tout seul. Je connais bien ce chemin semé d'embûches !<br /><br />
                Mais franchement qu'est ce que j'aurais aimé trouver un JC moi aussi ...<br />
                Quelqu'un de patient, professionnel, passionné et qui en plus a des tips incroyables !<br /> <br />
                C’est pourquoi j'ai créé une méthode pour vous équiper des outils nécessaires afin que vous puissiez avancer et d'une boussole pour vous y retrouver.<br /> <br />
                La méthode Zone de génie réinvente l’apprentissage de la trompette.
              </p>
            </div>
          </div>
        </div>
      </section>



      <section id="method" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">La méthode Z2G : Votre Passeport pour l'
            <span className="pl-2 pr-2   bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
             Excellence 
            </span>            
            en 90 Jours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <HeadphonesIcon className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Écoute et Observation</h3>
                <p>La méthode Z2G vous empéche de faire des erreurs, dès que quelquechose cloche je le vois immédiatement. Et je vous permets de corriger le tir à la seconde prêt.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <ZapIcon className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Équilibre ZEN et Énergie</h3>
                <p>La méthode Z2G est un équilibre subtil entre détente et explosion. Vous saurez enfin comment utiliser votre corps pour produire un son parfait.</p>
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


      <section id="testimonials" className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-16 md:text-4xl font-bold text-center">Mes  
            <span className="pl-2 pr-2   bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            élèves
            </span>peuvent vous le confirmer : 
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">"Grâce à JC, j'ai réalisé mon rêve de jouer sur une scène avec mon copain en seulement 6 mois. La méthode Z2G a changé ma vie !"</p>
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
                <p className="font-semibold">Léa D., 22 ans - Joue de la trompette avec plaisir grâce à La Méthode Z2G</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="guarantee" className="bg=[#F97316]  text-black py-20">

        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ma Garantie "Satisfaction ou Remboursé"</h2>
          <p className="text-xl mb-8">Si vous ne jouez pas votre premier morceau complet en 90 jours, je vous rembourse intégralement, sans discuter.</p>
          <a href="#booking" className="inline-block bg-slate-200 text-orange-500 font-semibold py-3 px-6 rounded-full text-center transition duration-300 ease-in-out hover:bg-slate-300">
            Réservez Votre Cours Gratuit
          </a>
        </div>
        </section>

      <Puissance />
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

      <Formulaire />

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


      <Footer />
      <div
        className="elfsight-app-bb687b25-4aa4-4b59-bb2b-16fd7b98a74d"
        data-elfsight-app-lazy
      ></div>
 {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <button onClick={() => setShowPopup(false)} className="float-right text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">☝️ Ne manquez pas cette opportunité !</h2>
            <p className="mb-4">Réservez votre cours gratuit maintenant et commencez votre voyage musical dès aujourd'hui.</p>
            <a
              href="#booking"
              className="block w-full bg-orange-500 text-white text-center font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
              onClick={() => setShowPopup(false)}
            >
              Réserver mon cours gratuit !
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
            <h2 className="text-2xl font-bold mb-4">☝️ Attendez !</h2>
            <p className="mb-4">
              Êtes-vous sûr de vouloir partir ? <br />
              Si vous réservez maintenant, votre premier cours est GRATUIT !
            </p>
            <a
              href="#booking"
              className="block w-full bg-orange-500 text-white text-center font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
              onClick={() => setShowExitPopup(false)}
            >
              Rester et réserver mon cours
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .shadow-text {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}