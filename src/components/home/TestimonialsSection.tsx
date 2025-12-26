import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, Sparkles } from 'lucide-react';
import Image from 'next/image';
import testimonialImg from '@/../public/testimonials-light.png';

const testimonials = [
    {
        quote: "Grâce à JC, j'ai réalisé mon rêve de jouer sur une scène avec mon copain en seulement 6 mois. La méthode Z2G a changé ma vie !",
        name: "Sophie L.",
        age: "28 ans",
        result: "De débutante à scène en 6 mois",
        initials: "SL",
        tag: "Inspirant"
    },
    {
        quote: "À 40 ans, je pensais que c'était trop tard. JC m'a prouvé le contraire. En 10 séances, je jouais déjà mes premiers morceaux !",
        name: "Thomas M.",
        age: "41 ans",
        result: "A surmonté ses doutes",
        initials: "TM",
        tag: "Détermination"
    }
];

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-12 md:py-24 bg-white relative overflow-hidden">
            {/* Soft decorative background element */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">

                    {/* Left Side: Visual & Header */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                                <Star className="w-3.5 h-3.5" />
                                100 % de réussite
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                                Ce que <span className="italic text-amber-600">disent</span> <br />
                                mes élèves
                            </h2>
                            <div className="w-24 h-1.5 bg-amber-600 rounded-full opacity-30" />
                            <p className="text-xl text-stone-600 font-light leading-relaxed max-w-md">
                                Découvrez les parcours inspirants de ceux qui ont osé débloquer leur potentiel musical.
                            </p>
                        </div>

                        {/* Large Stylized Image */}
                        <div className="relative group pt-4">
                            <div className="absolute -inset-4 bg-amber-100 rounded-[3rem] -z-10 group-hover:bg-amber-200 transition-colors duration-500" />
                            <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)]">
                                <Image
                                    src={testimonialImg}
                                    alt="Élève de trompette heureuse"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Testimonial Cards */}
                    <div className="flex flex-col gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,1)] transition-all duration-300 rounded-[2rem] group"
                            >
                                <CardContent className="p-10 relative">
                                    <Quote className="absolute top-8 right-8 w-12 h-12 text-amber-500/10 group-hover:text-amber-500/20 transition-colors" />

                                    <div className="flex items-center gap-2 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    <blockquote className="text-xl md:text-2xl text-stone-700 italic font-light leading-relaxed mb-8 relative z-10">
                                        &ldquo;{testimonial.quote}&rdquo;
                                    </blockquote>

                                    <div className="flex items-center gap-5 pt-8 border-t border-stone-100">
                                        <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                            {testimonial.initials}
                                        </div>
                                        <div>
                                            <p className="text-xl font-serif text-stone-900">{testimonial.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-stone-500 uppercase tracking-wider">{testimonial.age}</span>
                                                <span className="w-1 h-1 rounded-full bg-amber-500" />
                                                <span className="text-sm font-medium text-amber-700">{testimonial.result}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Subtle reassurance footer */}
                        <div className="text-center md:text-left pl-4">
                            <p className="text-stone-400 italic text-sm">
                                Votre réussite est ma seule priorité.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
