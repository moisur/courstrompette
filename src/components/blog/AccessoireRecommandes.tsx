import React from 'react';
import { AmazonWidget } from './AmazonWidget';

const AccessoiresTrompette = () => {
  const accessoires = [
    {
      id: "embouchure",
      title: "Embouchure de trompette 1 1/2 C",
      description:
        "Une embouchure polyvalente, idéale pour les débutants et les joueurs intermédiaires.",
      imageUrl:
        "https://m.media-amazon.com/images/I/61zOmTG92EL._AC_SY879_.jpg?height=200&width=200",
      price: "75.00€",
      affiliateLink: "https://amzn.to/3TGm4kR",
    },
    {
      title: "Huile pour Pistons La Tromba",
      description:
        "L'huile La Tromba pour pistons des instruments cuivres. (Pistons acier fin ou monel).",
      imageUrl:
        "https://m.media-amazon.com/images/I/81GSVBcEjuL._AC_SX425_.jpg?height=200&width=200",
      price: "17.82€",
      affiliateLink: "https://amzn.to/4eaaM0H",
    },
    {
      title: "La Tromba - Graisse pour liège et coulisse - 15g",
      description: "Graisse unique et stable pour les instruments de musique.",
      imageUrl:
        "https://m.media-amazon.com/images/I/7194DSxPXrL._AC_SX425_.jpg?height=200&width=200",
      price: "9.90€",
      affiliateLink: "https://amzn.to/3ZyLXXy",
    },
    {
      title: "Pied de trompette Noir",
      description:
        "Support trompette, avec lequel votre instrument peut être placé n'importe où en douceur et facilement.",
      imageUrl:
        "https://m.media-amazon.com/images/I/61kfnneKqWL._AC_SX425_.jpg?height=200&width=200",
      price: "19,90€",
      affiliateLink: "https://amzn.to/4gwZc15",
    },
    {
      title: "Sourdine de Tompette",
      description:
        "Il est compatible avec presque tous les types de trompette.",
      imageUrl:
        "https://m.media-amazon.com/images/I/41cCVPK6bRS._AC_SX425_.jpg?height=200&width=200",
      price: "11,99€",
      affiliateLink: "https://amzn.to/3Xtya1K",
    },
    {
      title: "Protec ML102 Liberty Sourdine",
      description:
        "Protec ML102 Liberty Sourdine en aluminium pour trompette Wah Wah.",
      imageUrl:
        "https://m.media-amazon.com/images/I/81yaPDx2wEL._AC_SX425_.jpg?height=200&width=200",
      price: "53,91€",
      affiliateLink: "https://amzn.to/3BfJc3l",
    },
    {
      title: "Cahier de Musique",
      description:
        "2 Portées - Partition pour Dictée, Étude, Solfège, Composition Musicale et Chant",
      imageUrl:
        "https://m.media-amazon.com/images/I/51VWRB2w14L._SY466_.jpg?height=200&width=200",
      price: "4,95€",
      affiliateLink: "https://amzn.to/3TDHNtG",
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mt-8 mb-4">Accessoires recommandés :</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {accessoires.map((accessoire, index) => (
          <div id={accessoire.id} key={index}>
            <AmazonWidget {...accessoire} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessoiresTrompette;
