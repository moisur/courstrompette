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
        "@type": "Organization",
        "name": "Cours De Trompette Paris",
        "url": "https://courstrompetteparis.lecoledes1.com",
        "logo": "https://courstrompetteparis.lecoledes1.com/icon.png",
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
        "name": "Cours De Trompette Paris",
        "url": "https://courstrompetteparis.lecoledes1.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://courstrompetteparis.lecoledes1.com/blog?search={search_term_string}",
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