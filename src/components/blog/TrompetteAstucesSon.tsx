'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image';
import dynamic from 'next/dynamic';

const AccessoiresTrompette = dynamic(() => import('./AccessoireRecommandes'), {
    loading: () => <div className="animate-pulse p-4">Loading accessories...</div>,
    ssr: false
});

const RelatedArticles = dynamic(() => import('./RelatedArticles'), {
    loading: () => <div className="animate-pulse p-4">Loading related articles...</div>,
    ssr: false
});

export default function TrompetteAstucesSon() {
    return (
        <article className="container max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Header Section */}
            <header className="text-center space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
                    3 Astuces pour améliorer immédiatement votre son à la trompette
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Découvrez comment obtenir un son clair et détendu grâce à des techniques simples et efficaces.
                </p>
            </header>

            {/* Introductory Content */}
            <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 space-y-6">
                <p>
                    Bonjour à vous c'est Jean-Christophe, j'espère que vous allez bien ! Aujourd'hui, je vais vous donner trois astuces pour améliorer immédiatement votre son à la trompette. Ces astuces, on va les mettre en pratique avec un exercice très simple.
                </p>
                <p>
                    L'idée générale que vous devez retenir de cet article, c'est qu'on a tendance, à la trompette, à jouer de manière crispée. C'est ce qui va faire qu'on va avoir un mauvais son. Donc pour contrecarrer ce problème, ce que l'on va rechercher, c'est un maximum de détente. Et les trois astuces que je vais vous présenter dans cette vidéo vont vous permettre et bien d'aller rechercher cette détente.
                </p>
            </div>

            {/* Apprentissage de l'exercice */}
            <section className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <h2 className="text-2xl font-semibold text-primary mb-4">L'exercice de base : les 5 premières notes</h2>
                <p className="text-gray-700 dark:text-gray-300">
                    Avant de vous présenter les trois astuces, il faut déjà qu'on apprenne à faire l'exercice en question. Donc c'est vraiment très simple, on joue sur 5 notes, les cinq premières notes en général qu'on apprend à la trompette : do, ré, mi, fa, sol. On va monter et descendre ses notes, donc faire do, ré, mi, fa, sol, fa, mi, ré, do. On va le faire une fois lentement et deux fois plus rapidement.
                </p>
                <p className="mt-4 font-bold text-gray-800 dark:text-gray-200">
                    Ceux qui sont déjà inscrits au kit de démarrage de la trompette connaissent certainement déjà cet exercice. Pour les autres, je vous invite vivement à vous inscrire !
                </p>
            </section>

            {/* Astuce 1 */}
            <section className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-primary">Astuce n°1 : La Respiration Ventrale</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        C'est un fondamental qu'il est très important d'acquérir. On a beau le savoir en théorie, le problème c'est qu'on a une vie, on a du stress qui s'emmagasine tous les jours... C'est pour ça qu'il faut que vous réappreniez à respirer au quotidien avec des exercices de respiration.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-4">
                        <span className="font-bold">Consignes :</span> Détendez vos épaules, votre gorge et la mâchoire. Soufflez en partant du ventre. Inspirez en gonflant le ventre. Tout le reste doit rester détendu.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-4">
                        <span className="font-bold">Exercice :</span> Utilisez un métronome à 60. Soufflez pendant 4 temps, inspirez pendant 4 temps, et faites ça en boucle.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-4">
                        <span className="font-bold">Astuce :</span> Si vous avez du mal à ressentir votre ventre, allongez-vous au sol et posez une pile de livres sur votre ventre.
                    </p>
                </div>
                <Image
                    src="/blog/TrompetteAstucesSon (3).webp"
                    alt="Illustration de la respiration ventrale"
                    width={1500}
                    height={1500}
                    className="rounded-lg shadow-lg"
                    priority
                />
            </section>

            {/* Astuce 2 */}
            <section className="grid md:grid-cols-2 gap-8 items-center">
                <Image
                    src="/blog/TrompetteAstucesSon (4).webp"
                    alt="Jouer dans une tessiture confortable"
                    width={1500}
                    height={1500}
                    className="rounded-lg shadow-lg"
                    priority
                />
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-primary">Astuce n°2 : Jouer dans une Tessiture Confortable</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        L'exercice que nous avons vu est dans une tessiture qui convient normalement à tout le monde. Lorsque vous débutez, je vous invite surtout à ne pas chercher à aller trop vite dans l'aigu. Ça prendra plusieurs mois, voire plusieurs années, c'est normal.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-4">
                        Ce qui est génial avec la trompette, c'est que déjà dans la tessiture médium grave, ça sonne super bien et on peut déjà faire plein de choses.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-4">
                        Quand vous sentez que votre son perd en qualité, faites une pause, et reprenez des exercices dans une tessiture où vous êtes confortable.
                    </p>
                </div>
            </section>

            {/* Astuce 3 */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="method">
                    <AccordionTrigger className="text-xl font-semibold text-primary">Astuce n°3 : Prendre le Temps de Respirer</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-gray-800 dark:text-gray-200">
                            <p>Lorsque vous sentez que vous avez un bug, lorsque vous enchaînez un exercice, prenez le temps de respirer avant de rejouer.</p>
                            <p className="mt-3">
                                Par exemple, si vous travaillez l'exercice de base dans différentes tonalités et que vous butez sur une, plutôt que de foncer tête baissée, respirez un bon coup et refaites le passage tranquillement.
                            </p>
                            <p className="mt-3 font-bold">Exemple :</p>
                            <p>
                                Imaginons que vous faites une erreur en jouant l'exercice en si bémol. Au lieu de répéter l'erreur en boucle, arrêtez-vous, respirez, identifiez le problème (ex : mi bécar au lieu de mi bémol), et reprenez lentement pour corriger.
                            </p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Call to Action */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-primary mb-4">Prêt à commencer ?</h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                    Votre premier cours d&apos;essai est gratuit. Aucun engagement, juste la musique.
                </p>
                <a
                    href="/#booking"
                    className="inline-block bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
                >
                    Réserver mon cours gratuit
                </a>
            </div>

            <div className="mt-12 space-y-8">
                <RelatedArticles />
                <AccessoiresTrompette />
            </div>
        </article>
    );
}