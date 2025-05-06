import React from 'react';
import GoogleReviewCard from './GoogleReviewCard';

// Define the structure of a single review
interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
  avatarUrl?: string;
}

// Actual review data from Google
const sampleReviews: Review[] = [
  {
    author: "Jonas lavallée",
    rating: 5,
    text: "Super expérience avec Jean Christophe, ses cours m’ont été très bénéfique. N’ayant pas de prof autour de chez moi j’ai...", // Truncated as per Google UI
    date: "Il y a 1 heure",
  },
  {
    author: "Mathieu Gueros",
    rating: 5,
    text: "Jean Christophe est super ! J'ai hâte, chaque semaine, de le retrouver pour apprendre plein de nouvelle chose sur ce...", // Truncated as per Google UI
    date: "Il y a 8 semaines",
  },
  {
    author: "Benjamin MARTIN",
    rating: 5,
    text: "J’ai commencé les cours avec Jean-Christophe en Janvier cette année, sans aucune pratique avant. Et avec sa...", // Truncated as per Google UI
    date: "Il y a 21 semaines",
  },
  {
    author: "Leone Locatelli",
    rating: 5,
    text: "Excellent professeur!!",
    date: "Il y a 21 semaines",
  },
  {
    author: "Romain Pons",
    rating: 5,
    text: "", // No text provided in the screenshot for this review
    date: "Il y a 37 semaines",
  },
];

interface GoogleReviewsDisplayProps {
  reviews?: Review[]; // Allow passing reviews as props, otherwise use sample data
  maxReviews?: number; // Optional: Limit the number of reviews shown
}

const GoogleReviewsDisplay: React.FC<GoogleReviewsDisplayProps> = ({ reviews = sampleReviews, maxReviews }) => {
  const reviewsToShow = maxReviews ? reviews.slice(0, maxReviews) : reviews;

  return (
    // Removed max-w-2xl and mx-auto to allow the grid to potentially span wider if needed within its container
    <div className="w-full">
      {/* Removed the h2 title from here, as it's now handled in cours.tsx */}
      {reviewsToShow.length > 0 ? (
        // Apply grid layout here
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviewsToShow.map((review, index) => (
            <GoogleReviewCard key={index} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Aucun avis Google à afficher pour le moment.</p>
      )}
      {/* Link to Google Reviews page - kept centered */}
      <div className="text-center mt-8"> {/* Adjusted margin */}
        <a
          href="https://www.google.com/search?q=Cours+de+trompette+Paris&stick=H4sIAAAAAAAA_-NgU1I1qDAxTzUzS7EwSbNMtUxNNTe1MqgwskhMSTUyMk1MSTFPSUq1XMQq4ZxfWlSskJKqUFKUn1uQWlKSqhCQWJRZDADYwYvIRAAAAA&hl=fr&mat=CQux7haAiHgSElYBmzl_pf8vBHDYbMwqfaZw8hBbfy_FZeexyUj_-HkDNplEFK4rhobVnHJTp3y0ZnE3BBmEbjQmVXJqa-jOpsIagYZ_oRvcW43fTUgx2Y-KsX7ELk1bqQ&authuser=0#mpd=~1330963773609914635/customers/reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm" // Added button styling
        >
          Voir tous les avis sur Google
        </a>
      </div>
    </div>
  );
};

export default GoogleReviewsDisplay;
