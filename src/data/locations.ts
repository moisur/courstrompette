export interface LocationData {
    slug: string;
    aliases?: string[];
    name: string;
    zipCode?: string;
    type: 'arrondissement' | 'neighborhood';
    neighborhoods?: string[];
    monument?: string;
    vibe: string;
    description: string;
}

export const locations: LocationData[] = [
    // Arrondissements
    {
        slug: 'paris-1er',
        aliases: ['75001', '1er'],
        name: 'Paris 1er',
        zipCode: '75001',
        type: 'arrondissement',
        neighborhoods: ['Louvre', 'Châtelet', 'Les Halles'],
        monument: 'le Louvre',
        vibe: 'prestigieuse et historique',
        description: "Apprenez la trompette au cœur de Paris, entre le Louvre et les Tuileries. Un cadre inspirant pour maîtriser votre instrument."
    },
    {
        slug: 'paris-2e',
        aliases: ['75002', '2e'],
        name: 'Paris 2e',
        zipCode: '75002',
        type: 'arrondissement',
        neighborhoods: ['Bourse', 'Sentier', 'Montorgueil'],
        monument: 'le Palais Brongniart',
        vibe: 'dynamique et centrale',
        description: "Des cours de trompette flexibles dans le quartier du Sentier, parfaits pour les actifs et les passionnés du centre de Paris."
    },
    {
        slug: 'paris-3e',
        aliases: ['75003', '3e'],
        name: 'Paris 3e',
        zipCode: '75003',
        type: 'arrondissement',
        neighborhoods: ['Le Marais', 'Temple', 'Arts et Métiers'],
        monument: 'le Musée de l\'Histoire de France',
        vibe: 'artistique et bohème',
        description: "Plongez dans l'atmosphère créative du Marais pour vos leçons de trompette. Un quartier où l'art et la musique se rencontrent."
    },
    {
        slug: 'paris-4e',
        aliases: ['75004', '4e'],
        name: 'Paris 4e',
        zipCode: '75004',
        type: 'arrondissement',
        neighborhoods: ['Île de la Cité', 'Hôtel de Ville', 'Saint-Paul'],
        monument: 'Notre-Dame',
        vibe: 'historique et vivante',
        description: "Pratiquez la trompette à deux pas de Notre-Dame. Un lieu chargé d'histoire pour faire progresser votre sonorité."
    },
    {
        slug: 'paris-5e',
        aliases: ['75005', '5e'],
        name: 'Paris 5e',
        zipCode: '75005',
        type: 'arrondissement',
        neighborhoods: ['Quartier Latin', 'Panthéon', 'Saint-Michel'],
        monument: 'le Panthéon',
        vibe: 'intellectuelle et jazz',
        description: "Le berceau du jazz parisien ! Apprenez la trompette dans le Quartier Latin, là où les caves de jazz ont fait l'histoire."
    },
    {
        slug: 'paris-6e',
        aliases: ['75006', '6e'],
        name: 'Paris 6e',
        zipCode: '75006',
        type: 'arrondissement',
        neighborhoods: ['Saint-Germain-des-Prés', 'Odéon', 'Luxembourg'],
        monument: 'le Jardin du Luxembourg',
        vibe: 'élégante et littéraire',
        description: "L'élégance de Saint-Germain-des-Prés au service de votre apprentissage de la trompette. Des cours d'exception dans un cadre mythique."
    },
    {
        slug: 'paris-7e',
        aliases: ['75007', '7e'],
        name: 'Paris 7e',
        zipCode: '75007',
        type: 'arrondissement',
        neighborhoods: ['Gros-Caillou', 'Invalides', 'École Militaire'],
        monument: 'la Tour Eiffel',
        vibe: 'prestigieuse et calme',
        description: "Faites résonner votre trompette à l'ombre de la Tour Eiffel. Des cours personnalisés dans le quartier le plus emblématique de Paris."
    },
    {
        slug: 'paris-8e',
        aliases: ['75008', '8e'],
        name: 'Paris 8e',
        zipCode: '75008',
        type: 'arrondissement',
        neighborhoods: ['Champs-Élysées', 'Madeleine', 'Monceau'],
        monument: 'l\'Arc de Triomphe',
        vibe: 'chic et majestueuse',
        description: "L'excellence musicale dans le 8ème arrondissement. Des cours de trompette de haut niveau près du Parc Monceau."
    },
    {
        slug: 'paris-9e',
        aliases: ['75009', '9e'],
        name: 'Paris 9e',
        zipCode: '75009',
        type: 'arrondissement',
        neighborhoods: ['Grands Boulevards', 'Pigalle', 'Opéra'],
        monument: 'l\'Opéra Garnier',
        vibe: 'musicale et vibrante',
        description: "Le quartier des musiciens ! Proche de l'Opéra et des magasins d'instruments, c'est l'endroit idéal pour vos cours de trompette."
    },
    {
        slug: 'paris-10e',
        aliases: ['75010', '10e'],
        name: 'Paris 10e',
        zipCode: '75010',
        type: 'arrondissement',
        neighborhoods: ['Canal Saint-Martin', 'Goncourt', 'République'],
        monument: 'le Canal Saint-Martin',
        vibe: 'branchée et cosmopolite',
        description: "Une approche moderne de la trompette le long du Canal Saint-Martin. Un quartier dynamique pour une progression rythmée."
    },
    {
        slug: 'paris-11e',
        aliases: ['75011', '11e'],
        name: 'Paris 11e',
        zipCode: '75011',
        type: 'arrondissement',
        neighborhoods: ['Bastille', 'Oberkampf', 'Nation'],
        monument: 'la Place de la Bastille',
        vibe: 'festive et culturelle',
        description: "Apprenez la trompette dans le quartier le plus animé de Paris. Entre Bastille et Nation, trouvez votre propre style musical."
    },
    {
        slug: 'paris-12e',
        aliases: ['75012', '12e'],
        name: 'Paris 12e',
        zipCode: '75012',
        type: 'arrondissement',
        neighborhoods: ['Reuilly', 'Bercy', 'Picpus'],
        monument: 'le Palais Omnisports de Bercy',
        vibe: 'résidentielle et verdoyante',
        description: "Le calme du 12ème pour une concentration maximale. Des cours de trompette adaptés à votre rythme près de Bercy."
    },
    {
        slug: 'paris-13e',
        aliases: ['75013', '13e'],
        name: 'Paris 13e',
        zipCode: '75013',
        type: 'arrondissement',
        neighborhoods: ['Italie', 'Bibliothèque François Mitterrand', 'Butte-aux-Cailles'],
        monument: 'la Bibliothèque Nationale',
        vibe: 'moderne et diversifiée',
        description: "De la Butte-aux-Cailles à la BNF, découvrez des cours de trompette accessibles à tous dans le 13ème arrondissement."
    },
    {
        slug: 'paris-14e',
        aliases: ['75014', '14e'],
        name: 'Paris 14e',
        zipCode: '75014',
        type: 'arrondissement',
        neighborhoods: ['Montparnasse', 'Alésia', 'Denfert-Rochereau'],
        monument: 'la Tour Montparnasse',
        vibe: 'artistique et conviviale',
        description: "L'héritage artistique de Montparnasse inspire vos leçons de trompette. Un quartier chaleureux pour s'épanouir musicalement."
    },
    {
        slug: 'paris-15e',
        aliases: ['75015', '15e'],
        name: 'Paris 15e',
        zipCode: '75015',
        type: 'arrondissement',
        neighborhoods: ['Vaugirard', 'Grenelle', 'Convention'],
        monument: 'le Parc André Citroën',
        vibe: 'familiale et dynamique',
        description: "Le plus grand arrondissement de Paris vous accueille pour vos cours de trompette. Méthode efficace et résultats garantis."
    },
    {
        slug: 'paris-16e',
        aliases: ['75016', '16e', 'paris-16'],
        name: 'Paris 16e',
        zipCode: '75016',
        type: 'arrondissement',
        neighborhoods: ['Passy', 'Auteuil', 'Trocadéro'],
        monument: 'le Trocadéro',
        vibe: 'calme et prestigieuse',
        description: "Un cadre serein dans le 16ème pour maîtriser la trompette. Des cours particuliers de qualité près du Trocadéro."
    },
    {
        slug: 'paris-17e',
        aliases: ['75017', '17e'],
        name: 'Paris 17e',
        zipCode: '75017',
        type: 'arrondissement',
        neighborhoods: ['Batignolles', 'Ternes', 'Monceau'],
        monument: 'le Parc des Batignolles',
        vibe: 'conviviale et diversifiée',
        description: "L'esprit village des Batignolles pour apprendre la trompette en toute simplicité. Une pédagogie adaptée à chaque élève."
    },
    {
        slug: 'paris-18e',
        aliases: ['75018', '18e'],
        name: 'Paris 18e',
        zipCode: '75018',
        type: 'arrondissement',
        neighborhoods: ['Montmartre', 'Abbesses', 'Lamarck'],
        monument: 'le Sacré-Cœur',
        vibe: 'bohème et inspirante',
        description: "Faites chanter votre trompette sur la butte Montmartre. Un quartier mythique pour une inspiration musicale sans limites."
    },
    {
        slug: 'paris-19e',
        aliases: ['75019', '19e'],
        name: 'Paris 19e',
        zipCode: '75019',
        type: 'arrondissement',
        neighborhoods: ['La Villette', 'Buttes-Chaumont', 'Belleville'],
        monument: 'la Philharmonie de Paris',
        vibe: 'culturelle et populaire',
        description: "À deux pas de la Cité de la Musique, profitez d'un environnement exceptionnel pour vos cours de trompette dans le 19ème."
    },
    {
        slug: 'paris-20e',
        aliases: ['75020', '20e'],
        name: 'Paris 20e',
        zipCode: '75020',
        type: 'arrondissement',
        neighborhoods: ['Ménilmontant', 'Gambetta', 'Père Lachaise'],
        monument: 'le Père Lachaise',
        vibe: 'authentique et musicale',
        description: "L'énergie de Belleville et Ménilmontant pour booster votre apprentissage de la trompette. Des cours vivants et passionnés."
    },

    // Popular Neighborhoods (Hyper-local)
    {
        slug: 'montmartre',
        name: 'Montmartre',
        type: 'neighborhood',
        monument: 'le Sacré-Cœur',
        vibe: 'artistique mythique',
        description: "Prendre des cours de trompette à Montmartre, c'est s'inscrire dans une longue tradition artistique. Progrès rapides sur la Butte."
    },
    {
        slug: 'le-marais',
        name: 'Le Marais',
        type: 'neighborhood',
        monument: 'la Place des Vosges',
        vibe: 'historique et tendance',
        description: "Le Marais offre un cadre unique pour vos leçons de trompette. Entre galeries d'art et histoire, développez votre musicalité."
    },
    {
        slug: 'saint-germain-des-pres',
        name: 'Saint-Germain-des-Prés',
        type: 'neighborhood',
        monument: 'l\'Église Saint-Germain',
        vibe: 'jazz légendaire',
        description: "Le quartier historique du jazz ! Apprenez la trompette là où les plus grands ont joué. Une immersion musicale totale."
    },
    {
        slug: 'bastille',
        name: 'Bastille',
        type: 'neighborhood',
        monument: 'l\'Opéra Bastille',
        vibe: 'vivante et culturelle',
        description: "À quelques pas de l'Opéra, profitez de cours de trompette dynamiques au cœur de l'action parisienne."
    },
    {
        slug: 'quartier-latin',
        name: 'Quartier Latin',
        type: 'neighborhood',
        monument: 'la Sorbonne',
        vibe: 'étudiante et animée',
        description: "Des cours de trompette au cœur du savoir et de la culture. Une ambiance stimulante pour tous les niveaux."
    },
    {
        slug: 'batignolles',
        name: 'Batignolles',
        type: 'neighborhood',
        monument: 'le square des Batignolles',
        vibe: 'village et chaleureuse',
        description: "L'esprit village au service de votre musique. Des cours de trompette conviviaux et efficaces dans le 17ème."
    },
    {
        slug: 'canal-saint-martin',
        name: 'Canal Saint-Martin',
        type: 'neighborhood',
        monument: 'le pont tournant',
        vibe: 'créative et moderne',
        description: "Progressez à la trompette au bord de l'eau. Le Canal Saint-Martin est le lieu idéal pour une pratique musicale inspirée."
    }
];

export const getNearLocations = (currentSlug: string, limit = 4) => {
    return locations
        .filter(loc => loc.slug !== currentSlug)
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
};
