/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, User, Bot } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useBooking } from "@/context/BookingContext"

type Message = {
  id: number
  type: 'bot' | 'user'
  content: string
  options?: string[]
}

const introMessages = [
  "👋 Bonjour ! Je suis l'assistant virtuel de JC.",
  "Apprenez à jouer de la trompette facilement grâce à la méthode JC !"
]

const initialOptions = [
  "En savoir plus sur la méthode JC",
  "Tarifs des cours",
  "Réserver un cours gratuit",
  "Témoignages d'élèves"
]

const botResponses = {
  "en savoir plus sur la méthode JC": {
    content: "La méthode JC(JC) est une approche unique qui vous permet de jouer votre premier morceau en seulement 10 séances ! Voici les points clés :",
    options: [
      "Apprentissage progressif",
      "Clarté mentale",
      "Techniques uniques",
      "Retour au menu principal"
    ]
  },
  "apprentissage progressif": {
    content: "Notre approche vous propulse de débutant à musicien accompli en un temps record. Vous apprendrez le rythme, la pose du son, la maîtrise des graves et des aigus, et bien plus encore !",
    options: ["En savoir plus sur la méthode JC", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "clarté mentale": {
    content: "Découvrez les secrets pour transformer le trac en super-pouvoir et jouer avec une confiance inébranlable. Nous travaillons sur l'équilibre entre détente et énergie pour produire un son parfait.",
    options: ["En savoir plus sur la méthode JC", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "techniques uniques": {
    content: "Apprenez des techniques uniques comme ne pas écouter votre propre son, ignorer le feedback, et jouer sans partitions. Ces astuces vous feront progresser 3 fois plus vite qu'avec les méthodes traditionnelles.",
    options: ["En savoir plus sur la méthode JC", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "tarifs des cours": {
    content: "Voici nos tarifs pour les cours de trompette :",
    options: [
      "Cours à l'unité",
      "Forfait 5 séances",
      "Forfait 10 séances",
      "Cours découverte gratuit",
      "Retour au menu principal"
    ]
  },
  "cours à l'unité": {
    content: "Le prix d'une séance individuelle est de 40€. C'est idéal si vous voulez essayer la méthode JC ou si vous préférez une flexibilité maximale.",
    options: ["Voir les autres forfaits", "Réserver un cours", "Retour au menu principal"]
  },
  "forfait 5 séances": {
    content: "Le forfait 5 séances bénéficie d'une réduction de 5%. Le prix total est de 190€, soit 38€ par séance. C'est parfait pour débuter et faire des progrès significatifs.",
    options: ["Voir les autres forfaits", "Réserver ce forfait", "Retour au menu principal"]
  },
  "forfait 10 séances": {
    content: "Notre forfait le plus populaire ! 10 séances avec une réduction de 10%. Le prix total est de 360€, soit 36€ par séance. C'est l'idéal pour maîtriser la méthode JCet jouer votre premier morceau.",
    options: ["Voir les autres forfaits", "Réserver ce forfait", "Retour au menu principal"]
  },
  "cours découverte gratuit": {
    content: "Votre premier cours est totalement gratuit ! C'est l'occasion parfaite de découvrir la méthode JCet de voir si elle vous convient.",
    options: ["Réserver un cours gratuit", "Voir les tarifs", "Retour au menu principal"]
  },
  "réserver un cours gratuit": {
    content: "Excellent choix ! Je vais vous rediriger vers le calendrier de JC pour que vous puissiez choisir un créneau qui vous convient pour votre cours découverte gratuit.",
    options: ["Voir les disponibilités", "Retour au menu principal"]
  },
  "témoignages d'élèves": {
    content: "Voici ce que disent nos élèves satisfaits :",
    options: [
      "Sophie, 28 ans",
      "Thomas, 41 ans",
      "Léa, 22 ans",
      "Retour au menu principal"
    ]
  },
  "sophie, 28 ans": {
    content: "\"Grâce à JC, j'ai réalisé mon rêve de jouer sur une scène avec mon copain en seulement 6 mois. La méthode JCa changé ma vie !\"",
    options: ["Voir d'autres témoignages", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "thomas, 41 ans": {
    content: "\"À 40 ans, je pensais que c'était trop tard. JC m'a prouvé le contraire. En 10 séances, je jouais déjà mes premiers morceaux !\"",
    options: ["Voir d'autres témoignages", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "léa, 22 ans": {
    content: "\"JC ne m'a pas seulement appris à jouer, il m'a appris à ressentir la musique. Chaque leçon est une révélation. Je vis mon rêve éveillé !\"",
    options: ["Voir d'autres témoignages", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "retour au menu principal": {
    content: "Bien sûr ! Comment puis-je vous aider ?",
    options: initialOptions
  },
  "voir les disponibilités": {
    content: "J'ai ouvert le calendrier de JC dans un nouvel onglet. Vous pouvez y choisir le créneau qui vous convient le mieux pour votre cours découverte gratuit. Avez-vous besoin d'autre chose ?",
    options: initialOptions
  },
  "voir les autres forfaits": {
    content: "Voici nos différentes options de cours :",
    options: ["Cours à l'unité", "Forfait 5 séances", "Forfait 10 séances", "Retour au menu principal"]
  },
  "réserver un cours": {
    content: "Parfait ! Je vais vous rediriger vers notre page de réservation pour un cours à l'unité. Vous pourrez y choisir la date et l'heure qui vous conviennent.",
    options: ["Voir les disponibilités", "Retour au menu principal"]
  },
  "réserver ce forfait": {
    content: "Excellent choix ! Je vais vous rediriger vers notre page de réservation. Vous pourrez y sélectionner votre forfait et choisir vos dates de cours.",
    options: ["Voir les disponibilités", "Retour au menu principal"]
  }
}

const HIDDEN_CHATBOT_ROUTES = ['/accordeur', '/logiciel', '/pianoenligne']

const MotionDiv = motion.div as any;

export default function Chatbot() {
  const pathname = usePathname()
  const { isOpen: isBookingModalOpen } = useBooking();
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [lastBotMessageId, setLastBotMessageId] = useState<number | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isInvitationDismissed, setIsInvitationDismissed] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const allMessages = [
        ...introMessages.map((content, index) => ({
          id: index + 1,
          type: 'bot' as const,
          content,
        }))
      ]
      setMessages(allMessages)
      setLastBotMessageId(allMessages.length)

      setTimeout(() => {
        setMessages(prev => [...prev!, {
          id: (prev?.length ?? 0) + 1,
          type: 'bot',
          content: "Comment puis-je vous aider aujourd'hui ?",
          options: initialOptions,
        }]);
        setLastBotMessageId(prev => (prev ?? 0) + 1)
      }, 1000)
    }
  }, [isOpen, messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }

  const handleSendMessage = (message: string) => {
    const newUserMessage: Message = { id: messages.length + 1, type: 'user', content: message }
    setMessages(prev => [...prev, newUserMessage])
    setInputValue('')
    setIsThinking(true)
    scrollToBottom()

    setTimeout(() => {
      setIsThinking(false)
      let botResponse: Message = { id: messages.length + 2, type: 'bot', content: '' }

      const responseKey = message.toLowerCase() as keyof typeof botResponses;
      if (responseKey in botResponses) {
        botResponse = { ...botResponses[responseKey], id: messages.length + 2, type: 'bot' };
      } else {
        botResponse = {
          id: messages.length + 2,
          type: 'bot',
          content: "Je suis désolé, je n'ai pas compris votre demande. Puis-je vous aider avec l'un de ces sujets ?",
          options: initialOptions,
        };
      }

      setMessages(prev => [...prev, botResponse])
      setLastBotMessageId(botResponse.id)
      scrollToBottom()
    }, 1000)
  }

  const handleOptionClick = (option: string) => {
    handleSendMessage(option)

    if (option.toLowerCase() === "voir les disponibilités") {
      window.open('https://calendly.com/yervantj', '_blank', 'noopener,noreferrer')
    }
  }

  // Cacher le chatbot quand le modal de réservation est ouvert
  const isHiddenOnCurrentRoute = HIDDEN_CHATBOT_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  )

  if (isBookingModalOpen || isHiddenOnCurrentRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-[calc(100vw-2rem)] w-full sm:w-auto flex flex-col items-end">

      {/* Invitation Bubble */}
      {!isOpen && messages.length === 0 && !isInvitationDismissed && (
        <div className="mb-4 bg-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-xl border border-stone-100 max-w-[220px] relative">
          <button
            onClick={() => setIsInvitationDismissed(true)}
            aria-label="Fermer l'invitation"
            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-900 shadow-sm z-20"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm text-stone-700 font-medium pr-2">
            Une question sur la méthode ? Je suis là ! 👋
          </p>
        </div>
      )}

      <AnimatePresence>
        {!isOpen && (
          <MotionDiv
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              aria-label="Ouvrir le chat"
              className="relative rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all"
            >
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              {/* Status dot */}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-stone-900 rounded-full"></span>
            </Button>
          </MotionDiv>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
          >
            <div className="w-full sm:w-[400px]">
            <Card className="h-[calc(100vh-6rem)] sm:h-[600px] flex flex-col shadow-2xl overflow-hidden rounded-3xl border-stone-200">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between bg-stone-900 text-white p-5 rounded-t-3xl border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent">
                      <span className="text-2xl">🎺</span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-stone-900 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-lg text-stone-50">Assistant JC</h3>
                    <p className="text-xs text-stone-400">Répond instantanément</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>

              <CardContent className="flex-grow overflow-hidden p-0 bg-stone-50/50 relative">
                <ScrollArea className="h-full px-5 py-6" ref={scrollAreaRef}>
                  <div className="space-y-6 pb-4">
                    {messages.map((message) => (
                      <MotionDiv
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.type === 'user'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-stone-200 text-stone-600'
                            }`}>
                            {message.type === 'user' ? <User size={14} /> : <Bot size={16} />}
                          </div>

                          <div className={`flex flex-col gap-2 max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'
                            }`}>
                            <div
                              className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${message.type === 'user'
                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-tr-none'
                                : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'
                                }`}
                            >
                              {message.content}
                            </div>

                            {/* Options / Quick Replies */}
                              {message.options && message.id === lastBotMessageId && (
                                <MotionDiv
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {message.options.map((option, optionIndex) => (
                                    <button
                                      key={optionIndex}
                                      onClick={() => handleOptionClick(option)}
                                      className="px-4 py-2 text-sm bg-white border border-stone-200 text-stone-600 rounded-xl hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all duration-200 shadow-sm text-left"
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              </MotionDiv>
                            )}
                          </div>
                        </div>
                      </MotionDiv>
                    ))}

                      {isThinking && (
                        <MotionDiv
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center">
                            <Bot size={16} />
                          </div>
                          <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 min-w-[60px]">
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                        </MotionDiv>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-4 bg-white border-t border-stone-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (inputValue.trim()) handleSendMessage(inputValue)
                  }}
                  className="relative w-full flex items-center gap-2"
                >
                  <Input
                    placeholder="Écrivez votre message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-grow pl-5 pr-12 py-6 rounded-full bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim()}
                    className={`absolute right-2 w-8 h-8 rounded-full transition-all duration-300 ${inputValue.trim()
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
