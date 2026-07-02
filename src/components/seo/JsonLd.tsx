import React from 'react';

// 1. Définition du type pour les props
interface JsonLdProps {
    data?: Record<string, any>; // Accepte un objet JSON générique ou undefined
}

// 2. On récupère la prop 'data' ici
const JsonLd = ({ data }: JsonLdProps) => {
    // Vos données globales statiques (Organization, Website...)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Cours de trompette à Paris (+150 élèves transformés) !",
        "url": "https://courstrompette.fr",
        "logo": "https://courstrompette.fr/icon.png",
        "description": "Cours de trompette à Paris, à domicile ou en ligne. Méthode unique JC — débutants, amateurs et pros. 1er cours offert.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Paris",
            "postalCode": "75011",
            "addressCountry": "FR"
        },
        "sameAs": [],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+33-6-63-73-89-02",
            "contactType": "customer service",
            "areaServed": "FR",
            "availableLanguage": "French"
        }
    };

    const webSiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Cours de trompette à Paris (+150 élèves transformés) !",
        "url": "https://courstrompette.fr",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://courstrompette.fr/blog?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }

    return (
        <>
            {/* Scripts statiques existants */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
            />

            {/* 3. Nouveau script dynamique qui s'affiche si 'data' est fourni dans le layout */}
            {data && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
                />
            )}
        </>
    );
};

export default JsonLd;