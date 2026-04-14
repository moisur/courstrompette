
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Politique de Confidentialité - Dreamy',
    description: "Politique de confidentialité pour l'application mobile Dreamy.",
    robots: {
        index: false,
        follow: true,
    },
};

const ConfidentialiteDreamyPage = () => {
    return (
        <main className="bg-white text-gray-800 font-sans leading-relaxed max-w-4xl mx-auto p-6 sm:p-10">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900">Politique de Confidentialité pour l&apos;application Dreamy</h1>
                <p className="text-md text-gray-600 mt-2">Dernière mise à jour : 13 octobre 2025</p>
            </header>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">1. Introduction</h2>
                <p>
                    Cette politique de confidentialité régit votre utilisation de l&apos;application software <strong>Dreamy</strong> (&quot;l&apos;Application&quot;) pour les appareils mobiles, qui a été créée par <strong>Jean Christophe YERVANT</strong>.
                </p>
                <p className="mt-2">
                    Cette politique a pour but de vous informer sur les données que nous pouvons collecter, comment nous les utilisons et les choix que vous avez concernant ces données.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">2. Collecte et Utilisation des Données</h2>
                <p>
                    L&apos;Application <strong>ne collecte, ne transmet et ne stocke aucune information personnelle identifiable</strong> vous concernant (telle que votre nom, adresse, numéro de téléphone ou adresse e-mail).
                </p>
                <p className="mt-2">
                    L&apos;Application peut collecter des données d&apos;utilisation anonymes et non personnelles à des fins d&apos;analyse et d&apos;amélioration de l&apos;expérience utilisateur. Cela peut inclure :
                </p>
                <ul className="list-disc list-inside mt-2 pl-4">
                    <li>Le type d&apos;appareil mobile que vous utilisez.</li>
                    <li>L&apos;identifiant unique de votre appareil mobile (le cas échéant).</li>
                    <li>Des informations sur la manière dont vous utilisez l&apos;Application.</li>
                </ul>
                <p className="mt-2">
                    Ces données sont utilisées exclusivement pour améliorer la fonctionnalité et la performance de l&apos;Application.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">3. Partage des Données</h2>
                <p>
                    Étant donné que nous ne collectons pas d&apos;informations personnelles identifiables, nous ne partageons, ne vendons, ni ne louons de telles informations à des tiers.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">4. Sécurité</h2>
                <p>
                    Nous prenons des mesures raisonnables pour protéger les informations anonymes collectées contre l&apos;accès, l&apos;utilisation ou la divulgation non autorisés.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">5. Modifications de cette Politique de Confidentialité</h2>
                <p>
                    Cette politique de confidentialité peut être mise à jour de temps à autre. Nous vous notifierons de tout changement en publiant la nouvelle politique de confidentialité ici. Il vous est conseillé de consulter cette politique de confidentialité périodiquement pour tout changement.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">6. Contact</h2>
                <p>
                    Si vous avez des questions concernant la confidentialité lors de l&apos;utilisation de l&apos;Application, ou sur nos pratiques, veuillez nous contacter par e-mail à l&apos;adresse suivante :
                    <a href="mailto:yervantj@gmail.com" className="text-blue-600 hover:underline ml-1">yervantj@gmail.com</a>.
                </p>
            </section>

            <footer className="text-center mt-12 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                    <Link href="/" className="text-blue-600 hover:underline">Retour à l&apos;accueil</Link>
                </p>
            </footer>
        </main>
    );
};

export default ConfidentialiteDreamyPage;
