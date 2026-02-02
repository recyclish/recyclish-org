import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (interactive && onChange && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onChange(index + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const partial = index === Math.floor(rating) && rating % 1 > 0;
        const fillPercentage = partial ? (rating % 1) * 100 : filled ? 100 : 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={!interactive}
            className={cn(
              "relative focus:outline-none",
              interactive && "cursor-pointer hover:scale-110 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm",
              !interactive && "cursor-default"
            )}
            tabIndex={interactive ? 0 : -1}
            aria-label={interactive ? `Rate ${index + 1} out of ${maxRating}` : undefined}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                "text-muted-foreground/30"
              )}
            />
            {/* Foreground star (filled) - uses clip-path for partial fill */}
            <Star
              className={cn(
                sizeClasses[size],
                "absolute inset-0 text-amber-500 fill-amber-500"
              )}
              style={{
                clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
              }}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingBreakdownProps {
  avgRating: number | null;
  totalReviews: number;
  avgService?: number | null;
  avgCleanliness?: number | null;
  avgConvenience?: number | null;
}

export function RatingBreakdown({
  avgRating,
  totalReviews,
  avgService,
  avgCleanliness,
  avgConvenience,
}: RatingBreakdownProps) {
  if (totalReviews === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StarRating rating={avgRating || 0} size="md" />
        <span className="text-lg font-semibold">{avgRating?.toFixed(1) || "0.0"}</span>
        <span className="text-sm text-muted-foreground">
          ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
        </span>
      </div>

      {(avgService || avgCleanliness || avgConvenience) && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          {avgService && (
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">Service</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>{avgService.toFixed(1)}</span>
              </div>
            </div>
          )}
          {avgCleanliness && (
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">Cleanliness</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>{avgCleanliness.toFixed(1)}</span>
              </div>
            </div>
          )}
          {avgConvenience && (
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground">Convenience</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>{avgConvenience.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
