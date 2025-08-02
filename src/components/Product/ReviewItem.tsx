import React from 'react';
import { Star, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    created_at: string;
    user_email: string;
    is_verified: boolean;
  };
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Format the date to show "il y a X jours/mois/années"
  const formattedDate = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: fr
  });

  // Anonymize email if needed
  const displayName = review.user_email.includes('@')
    ? review.user_email.split('@')[0].substring(0, 3) + '***'
    : review.user_email;

  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="flex">{renderStars(review.rating)}</div>
          {review.is_verified && (
            <div className="flex items-center text-green-600 text-xs font-medium">
              <Check className="w-3 h-3 mr-1" />
              Achat vérifié
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>

      <div className="mb-1">
        <span className="font-medium text-gray-900">{displayName}</span>
      </div>

      {review.title && (
        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-gray-600 text-sm">{review.comment}</p>
      )}
    </div>
  );
};

export default ReviewItem;