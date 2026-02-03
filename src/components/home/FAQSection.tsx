import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

interface FAQSectionProps {
    locationName?: string;
}

export function FAQSection({ locationName }: FAQSectionProps) {
    const faqItems = [
        {
            question: "Comment se passe une séance ?",
            answer: (
                <>
                    Les séances durent 45 minutes et se divisent en 3 phases :
                    <ul className="mt-3 space-y-2 text-stone-600">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            Échauffement
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            Pose de son (technique, rythme)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            Apprentissage de morceau
                        </li>
                    </ul>
                </>
            )
        },
        {
            question: "Combien ça coûte ?",
            answer: "40€ la séance. Forfait -10% pour les 10 séances, soit 360€ au lieu de 400€."
        },
        {
            question: locationName ? `Où se déroulent les cours à ${locationName} ?` : "Où se déroulent les cours ?",
            answer: locationName
                ? `Je me déplace directement chez vous à ${locationName} ou dans votre secteur. C'est l'avantage du cours particulier : pas de stress de transport, on travaille dans votre environnement.`
                : "Les cours ont lieu chez moi, dans le 11ème arrondissement de Paris. Mes voisins sont habitués !"
        },
        {
            question: "Je joue depuis plusieurs années, est-ce pour moi ?",
            answer: "Absolument ! Beaucoup de mes élèves ont 3-5 ans d'expérience. Ma spécialité est justement de diagnostiquer les blocages que les méthodes classiques ne voient pas."
        },
        {
            question: "Proposes-tu des masterclass ou cours en groupe ?",
            answer: "Oui ! Je propose des sessions en petit groupe pour travailler des thématiques précises (range, endurance, improvisation). Contactez-moi pour les prochaines dates."
        }
    ];
    return (
        <section id="faq" className="py-12 md:py-24 bg-stone-50">
            <div className="container mx-auto px-6 max-w-3xl">

                {/* En-tête */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
                        <HelpCircle className="w-8 h-8 text-amber-700" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4">
                        Questions <span className="italic text-stone-500">fréquentes</span>
                    </h2>
                    <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full opacity-60"></div>
                </div>

                {/* FAQ Accordion */}
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqItems.map((item, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index + 1}`}
                            className="bg-white rounded-xl border-none shadow-sm px-6"
                        >
                            <AccordionTrigger className="text-lg font-medium text-stone-900 hover:text-amber-700 py-6">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-stone-600 pb-6 leading-relaxed">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
