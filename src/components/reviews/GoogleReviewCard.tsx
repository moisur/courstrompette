import React from 'react';
import { Star } from 'lucide-react'; // Removed Quote icon
import Image from 'next/image';

interface Review {
  author: string;
  rating: number; // Rating out of 5
  text: string;
  date: string; // e.g., "2 weeks ago" or "March 2024"
  avatarUrl?: string; // Optional avatar image URL
}

interface GoogleReviewCardProps {
  review: Review;
}

const GoogleReviewCard: React.FC<GoogleReviewCardProps> = ({ review }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
        />
      );
    }
    return stars;
  };

  // Google-like styling
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm"> {/* Simpler border, bg, shadow */}
      <div className="flex items-center mb-2">
        {/* Avatar or Initial */}
        {review.avatarUrl ? (
          <Image
            src={review.avatarUrl}
            alt={review.author}
            width={40}
            height={40}
            className="rounded-full mr-3" // Standard size
          />
        ) : (
          // Google's typical blue background for initials
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-white font-medium text-base flex-shrink-0">
            {review.author.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Author Info */}
        <div className="flex-grow">
          <p className="font-medium text-sm text-gray-900">{review.author}</p> {/* Google uses slightly smaller, medium weight */}
          <div className="flex items-center mt-0.5"> {/* Reduced margin */}
            {/* Stars */}
            <div className="flex mr-2">{renderStars()}</div>
            {/* Date */}
            <span className="text-xs text-gray-500">{review.date}</span>
          </div>
        </div>
      </div>
      {/* Review Text */}
      {review.text && (
        // Standard Google review text styling
        <p className="text-sm text-gray-700 leading-relaxed mt-2">
          {review.text}
        </p>
      )}
    </div>
  );
};

export default GoogleReviewCard;
