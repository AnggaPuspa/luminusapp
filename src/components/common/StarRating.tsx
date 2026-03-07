import React from 'react';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    onRatingChange,
    size = 'md',
    readonly = false,
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (readonly || !onRatingChange) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRatingChange(index + 1);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxRating)].map((_, i) => {
                const filled = i < rating;

                return (
                    <span
                        key={i}
                        role={readonly ? "img" : "button"}
                        aria-label={`${i + 1} Star`}
                        tabIndex={readonly ? -1 : 0}
                        onClick={() => !readonly && onRatingChange && onRatingChange(i + 1)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        className={`
                            ${sizeClasses[size]} 
                            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
                            flex items-center justify-center
                        `}
                    >
                        {filled ? (
                            <i className="fa-solid fa-star text-yellow-400 text-lg"></i>
                        ) : (
                            <i className="fa-regular fa-star text-gray-300 hover:text-yellow-300 text-lg"></i>
                        )}
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;
