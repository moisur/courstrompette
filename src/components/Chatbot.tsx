/* eslint-disable react/no-unescaped-entities */


'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Calendar } from 'lucide-react'

type Message = {
  id: number
  type: 'bot' | 'user'
  content: string
  options?: string[]
}

const introMessages = [
  "👋 Bonjour ! Je suis l'assistant virtuel de JC.",
  "Apprenez à jouer de la trompette facilement grâce à la méthode Z2G !"
]

const initialOptions = [
  "En savoir plus sur la méthode Z2G",
  "Tarifs des cours",
  "Réserver un cours gratuit",
  "Témoignages d'élèves"
]

const botResponses = {
  "en savoir plus sur la méthode z2g": {
    content: "La méthode Z2G (Zone de Génie) est une approche unique qui vous permet de jouer votre premier morceau en seulement 10 séances ! Voici les points clés :",
    options: [
      "Apprentissage progressif",
      "Clarté mentale",
      "Techniques uniques",
      "Retour au menu principal"
    ]
  },
  "apprentissage progressif": {
    content: "Notre approche vous propulse de débutant à musicien accompli en un temps record. Vous apprendrez le rythme, la pose du son, la maîtrise des graves et des aigus, et bien plus encore !",
    options: ["En savoir plus sur la méthode Z2G", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "clarté mentale": {
    content: "Découvrez les secrets pour transformer le trac en super-pouvoir et jouer avec une confiance inébranlable. Nous travaillons sur l'équilibre entre détente et énergie pour produire un son parfait.",
    options: ["En savoir plus sur la méthode Z2G", "Réserver un cours gratuit", "Retour au menu principal"]
  },
  "techniques uniques": {
    content: "Apprenez des techniques uniques comme ne pas écouter votre propre son, ignorer le feedback, et jouer sans partitions. Ces astuces vous feront progresser 3 fois plus vite qu'avec les méthodes traditionnelles.",
    options: ["En savoir plus sur la méthode Z2G", "Réserver un cours gratuit", "Retour au menu principal"]
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
    content: "Le prix d'une séance individuelle est de 35€. C'est idéal si vous voulez essayer la méthode Z2G ou si vous préférez une flexibilité maximale.",
    options: ["Voir les autres forfaits", "Réserver un cours", "Retour au menu principal"]
  },
  "forfait 5 séances": {
    content: "Le forfait 5 séances bénéficie d'une réduction de 5%. Le prix total est de 166,25€, soit 33,25€ par séance. C'est parfait pour débuter et faire des progrès significatifs.",
    options: ["Voir les autres forfaits", "Réserver ce forfait", "Retour au menu principal"]
  },
  "forfait 10 séances": {
    content: "Notre forfait le plus populaire ! 10 séances avec une réduction de 10%. Le prix total est de 315€, soit 31,50€ par séance. C'est l'idéal pour maîtriser la méthode Z2G et jouer votre premier morceau.",
    options: ["Voir les autres forfaits", "Réserver ce forfait", "Retour au menu principal"]
  },
  "cours découverte gratuit": {
    content: "Votre premier cours est totalement gratuit ! C'est l'occasion parfaite de découvrir la méthode Z2G et de voir si elle vous convient.",
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
    content: "\"Grâce à JC, j'ai réalisé mon rêve de jouer sur une scène avec mon copain en seulement 6 mois. La méthode Z2G a changé ma vie !\"",
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

export default function Component() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [lastBotMessageId, setLastBotMessageId] = useState<number | null>(null)
  const [isThinking, setIsThinking] = useState(false)
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
      window.open('https://calendly.com/jctrompette', '_blank', 'noopener,noreferrer')
    }
  }
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] w-full sm:w-auto">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg"
            >
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full sm:w-96"
          >
            <Card className="h-[calc(100vh-2rem)] sm:h-[32rem] flex flex-col shadow-xl overflow-hidden rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-t-lg">
                <h3 className="font-semibold text-sm sm:text-base">Chat avec l'assistant de JC Trompette</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:text-white/80">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden p-4">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-4 ${
                        message.type === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <span
                        className={`inline-block p-2 rounded-lg text-sm sm:text-base ${
                          message.type === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </span>
                      {message.options && message.id === lastBotMessageId && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="mt-2 space-y-2 flex flex-wrap justify-start"
                        >
                          {message.options.map((option, optionIndex) => (
                            <Button
                              key={optionIndex}
                              variant="outline"
                              size="sm"
                              onClick={() => handleOptionClick(option)}
                              className="mr-2 mb-2 text-xs sm:text-sm rounded-full"
                            >
                              {option}
                            </Button>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 text-gray-500"
                    >
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </motion.div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (inputValue.trim()) handleSendMessage(inputValue)
                  }}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    placeholder="Tapez votre message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="text-sm sm:text-base rounded-full"
                  />
                  <Button type="submit" size="icon" className="rounded-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

