import React from 'react';
import { Star } from 'lucide-react';

interface ReviewSummaryProps {
  avgRating: number;
  reviewCount: number;
  ratingDistribution?: {
    [key: number]: number;
  };
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  avgRating,
  reviewCount,
  ratingDistribution = {}
}) => {
  // Calculate rating distribution percentages
  const calculatePercentage = (count: number) => {
    if (reviewCount === 0) return 0;
    return Math.round((count / reviewCount) * 100);
  };

  // Generate default distribution if not provided
  const distribution: Record<number, number> = {
    5: ratingDistribution[5] || 0,
    4: ratingDistribution[4] || 0,
    3: ratingDistribution[3] || 0,
    2: ratingDistribution[2] || 0,
    1: ratingDistribution[1] || 0
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
        {/* Average rating display */}
        <div className="text-center mb-6 md:mb-0">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {avgRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">
            {reviewCount} {reviewCount > 1 ? 'avis' : 'avis'}
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="w-full max-w-md">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating] || 0;
            const percentage = calculatePercentage(count);

            return (
              <div key={rating} className="flex items-center mb-2 last:mb-0">
                <div className="flex items-center w-12">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 ml-1 text-gray-400" />
                </div>
                <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-sm text-gray-500">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;