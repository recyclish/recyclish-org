import { useState } from "react";
import { MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating, RatingBreakdown } from "@/components/StarRating";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReviewButtonProps {
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
}

export function ReviewButton({
  facilityId,
  facilityName,
  facilityAddress,
}: ReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serviceRating, setServiceRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [convenienceRating, setConvenienceRating] = useState(0);

  // Fetch reviews and stats
  const { data: reviews, refetch: refetchReviews } = trpc.reviews.list.useQuery(
    { facilityId },
    { enabled: isOpen }
  );
  const { data: stats, refetch: refetchStats } = trpc.reviews.stats.useQuery(
    { facilityId },
    { enabled: isOpen }
  );
  const { data: hasReviewedData } = trpc.reviews.hasReviewed.useQuery(
    { facilityId },
    { enabled: isOpen && isAuthenticated }
  );
  const { data: helpfulVotes } = trpc.reviews.helpfulVotes.useQuery(
    undefined,
    { enabled: isOpen && isAuthenticated }
  );

  // Mutations
  const submitReview = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      resetForm();
      refetchReviews();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const markHelpful = trpc.reviews.markHelpful.useMutation({
    onSuccess: () => {
      refetchReviews();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark as helpful");
    },
  });

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setServiceRating(0);
    setCleanlinessRating(0);
    setConvenienceRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    submitReview.mutate({
      facilityId,
      facilityName,
      facilityAddress,
      rating,
      title: title || undefined,
      content: content || undefined,
      serviceRating: serviceRating || undefined,
      cleanlinessRating: cleanlinessRating || undefined,
      convenienceRating: convenienceRating || undefined,
    });
  };

  const handleMarkHelpful = (reviewId: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to mark reviews as helpful");
      return;
    }
    markHelpful.mutate({ reviewId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          title="Reviews"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">Reviews</DialogTitle>
          <DialogDescription className="text-sm">
            {facilityName}
          </DialogDescription>
        </DialogHeader>

        {/* Rating Summary */}
        <div className="border-b pb-4">
          <RatingBreakdown
            avgRating={stats?.avgRating ?? null}
            totalReviews={stats?.totalReviews ?? 0}
            avgService={stats?.avgService}
            avgCleanliness={stats?.avgCleanliness}
            avgConvenience={stats?.avgConvenience}
          />
        </div>

        {/* Write Review Button or Form */}
        {!showReviewForm ? (
          <div className="py-2">
            {!isAuthenticated ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Log in to write a review
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Log In
                </Button>
              </div>
            ) : hasReviewedData?.hasReviewed ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                You have already reviewed this facility
              </p>
            ) : (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="w-full"
              >
                Write a Review
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Overall Rating *</Label>
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-title">Title (optional)</Label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-content">Your Review (optional)</Label>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with this facility..."
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="space-y-3 pt-2 border-t">
              <Label className="text-sm text-muted-foreground">
                Detailed Ratings (optional)
              </Label>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Service</span>
                  <StarRating
                    rating={serviceRating}
                    size="sm"
                    interactive
                    onChange={setServiceRating}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Cleanliness</span>
                  <StarRating
                    rating={cleanlinessRating}
                    size="sm"
                    interactive
                    onChange={setCleanlinessRating}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Convenience</span>
                  <StarRating
                    rating={convenienceRating}
                    size="sm"
                    interactive
                    onChange={setConvenienceRating}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitReview.isPending || rating === 0}
                className="flex-1"
              >
                {submitReview.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {!showReviewForm && reviews && reviews.length > 0 && (
          <div className="space-y-4 pt-2">
            <h4 className="font-semibold text-sm">All Reviews</h4>
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      {review.title && (
                        <span className="font-medium text-sm">{review.title}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.userName || "Anonymous"} •{" "}
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {review.content && (
                  <p className="text-sm text-foreground/90">{review.content}</p>
                )}

                {(review.serviceRating || review.cleanlinessRating || review.convenienceRating) && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {review.serviceRating && (
                      <span>Service: {review.serviceRating}/5</span>
                    )}
                    {review.cleanlinessRating && (
                      <span>Cleanliness: {review.cleanlinessRating}/5</span>
                    )}
                    {review.convenienceRating && (
                      <span>Convenience: {review.convenienceRating}/5</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleMarkHelpful(review.id)}
                    disabled={helpfulVotes?.includes(review.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Helpful ({review.helpfulCount})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showReviewForm && reviews && reviews.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reviews yet. Be the first to share your experience!
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
