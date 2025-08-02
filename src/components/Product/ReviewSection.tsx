import React, { useState } from 'react';
import ReviewSummary from './ReviewSummary';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  user_email: string;
  is_verified: boolean;
}

interface ReviewSectionProps {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  avgRating,
  reviewCount,
  productId
}) => {
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [refreshReviews, setRefreshReviews] = useState<boolean>(false);
  
  const handleReviewSubmitted = () => {
    setRefreshReviews(!refreshReviews);
  };

  // Calculate rating distribution
  const ratingDistribution = reviews.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as { [key: number]: number }
  );

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <ReviewSummary
        avgRating={avgRating}
        reviewCount={reviewCount}
        ratingDistribution={ratingDistribution}
      />

      {/* Reviews List */}
      {/* Review Form */}
      <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
      
      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {reviewCount} {reviewCount > 1 ? 'avis clients' : 'avis client'}
            </h3>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="recent">Plus récents</option>
                <option value="highest">Meilleures notes</option>
                <option value="lowest">Notes les plus basses</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-gray-200">
            {sortedReviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun avis pour le moment
          </h3>
          <p className="text-gray-500">
            Soyez le premier à donner votre avis sur ce produit !
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;