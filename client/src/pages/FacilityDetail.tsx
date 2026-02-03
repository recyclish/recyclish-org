import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating, RatingBreakdown } from "@/components/StarRating";
import { ShareButton } from "@/components/ShareButton";
import { ReportIssueButton } from "@/components/ReportIssueButton";
import { PrintButton } from "@/components/PrintButton";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Heart,
  ArrowLeft,
  Navigation,
  Clock,
  Recycle,
  ThumbsUp,
  Loader2,
  Building2,
} from "lucide-react";
import { RecyclingFacility, generateFacilityId } from "@/components/RecyclingCard";
import { NearbyFacilities } from "@/components/NearbyFacilities";
import { SEOHead, generateFacilitySEO } from "@/components/SEOHead";

const categoryColors: Record<string, string> = {
  "Electronics Recyclers": "bg-[oklch(0.35_0.08_250)] text-white",
  "Material Recovery Facilities (MRFs)": "bg-[oklch(0.62_0.14_45)] text-white",
  "PlasticRecycling Facilities": "bg-[oklch(0.55_0.15_180)] text-white",
  "GlassRecycling Facilities": "bg-[oklch(0.50_0.12_200)] text-white",
  "GlassSecondary Processors": "bg-[oklch(0.45_0.10_200)] text-white",
  "PaperRecycling Facilities": "bg-[oklch(0.55_0.10_80)] text-white",
  "TextilesRecycling Facilities": "bg-[oklch(0.50_0.15_320)] text-white",
  "WoodRecycling Facilities": "bg-[oklch(0.45_0.12_60)] text-white",
  "WoodSecondary Processors": "bg-[oklch(0.40_0.10_60)] text-white",
  "Retail Take-Back Program": "bg-[oklch(0.55_0.20_25)] text-white",
  "Sharps Disposal": "bg-[oklch(0.45_0.15_0)] text-white",
  "Cardboard Recycling": "bg-[oklch(0.50_0.12_70)] text-white",
  "Metals Recycling": "bg-[oklch(0.45_0.08_240)] text-white",
  "Clothing Recycling": "bg-[oklch(0.55_0.18_340)] text-white",
};

export default function FacilityDetail() {
  const params = useParams();
  const facilityId = params.id as string;
  const [facility, setFacility] = useState<RecyclingFacility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Review form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serviceRating, setServiceRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [convenienceRating, setConvenienceRating] = useState(0);

  // Fetch facility data from CSV
  useEffect(() => {
    const loadFacility = async () => {
      try {
        const response = await fetch("/data/master_recycling_directory.csv");
        const text = await response.text();
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

        for (let i = 1; i < lines.length; i++) {
          const values: string[] = [];
          let current = "";
          let inQuotes = false;

          for (const char of lines[i]) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          if (values.length >= headers.length) {
            const facilityData: Record<string, string> = {};
            headers.forEach((header, index) => {
              facilityData[header] = values[index]?.replace(/"/g, "") || "";
            });

            const currentFacility: RecyclingFacility = {
              Name: facilityData.Name || "",
              Address: facilityData.Address || "",
              State: facilityData.State || "",
              County: facilityData.County || "",
              Phone: facilityData.Phone || "",
              Email: facilityData.Email || "",
              Website: facilityData.Website || "",
              Category: facilityData.Category || "",
              Facility_Type: facilityData.Facility_Type || "",
              Feedstock: facilityData.Feedstock || "",
              Latitude: parseFloat(facilityData.Latitude) || 0,
              Longitude: parseFloat(facilityData.Longitude) || 0,
              NAICS_Code: facilityData.NAICS_Code || "",
              Hours: facilityData.Hours || "",
            };

            const currentId = generateFacilityId(currentFacility.Name, currentFacility.Address);
            if (currentId === facilityId) {
              setFacility(currentFacility);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error loading facility:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacility();
  }, [facilityId]);

  // Fetch reviews and stats
  const { data: reviews, refetch: refetchReviews } = trpc.reviews.list.useQuery(
    { facilityId },
    { enabled: !!facilityId }
  );
  const { data: stats, refetch: refetchStats } = trpc.reviews.stats.useQuery(
    { facilityId },
    { enabled: !!facilityId }
  );
  const { data: hasReviewedData } = trpc.reviews.hasReviewed.useQuery(
    { facilityId },
    { enabled: !!facilityId && isAuthenticated }
  );
  const { data: helpfulVotes } = trpc.reviews.helpfulVotes.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: favoriteIds } = trpc.favorites.ids.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isFavorite = favoriteIds?.includes(facilityId) ?? false;

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

  const addFavorite = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success("Added to favorites");
      utils.favorites.ids.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to favorites");
    },
  });

  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
      utils.favorites.ids.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from favorites");
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!facility) return;

    submitReview.mutate({
      facilityId,
      facilityName: facility.Name,
      facilityAddress: facility.Address,
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

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }
    if (!facility) return;

    if (isFavorite) {
      removeFavorite.mutate({ facilityId });
    } else {
      addFavorite.mutate({
        facilityId,
        facilityName: facility.Name,
        facilityAddress: facility.Address,
        facilityCategory: facility.Category || undefined,
        facilityPhone: facility.Phone || undefined,
        facilityWebsite: facility.Website || undefined,
        facilityFeedstock: facility.Feedstock || undefined,
        facilityLatitude: facility.Latitude?.toString() || undefined,
        facilityLongitude: facility.Longitude?.toString() || undefined,
      });
    }
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    if (facility && facility.Latitude && facility.Longitude) {
      const position = { lat: facility.Latitude, lng: facility.Longitude };
      map.setCenter(position);
      
      // Add marker
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: facility.Name,
      });
    }
  };

  const openMaps = () => {
    if (!facility) return;
    const query = encodeURIComponent(facility.Address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const formatCategory = (cat: string) => {
    return cat
      .replace("Recycling ", "Recycling ")
      .replace("Secondary ", "Secondary ")
      .replace("Recyclers", "Recycling")
      .replace("(MRFs)", "")
      .trim();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Facility Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The recycling facility you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryColor = categoryColors[facility.Category] || "bg-primary text-primary-foreground";

  // Extract city from address (usually format: "123 Main St, City, State ZIP")
  const addressParts = facility.Address.split(",").map(p => p.trim());
  const city = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : "";
  
  // Generate SEO data
  const seoData = generateFacilitySEO({
    name: facility.Name,
    category: facility.Category,
    address: facility.Address,
    city: city,
    state: facility.State,
    phone: facility.Phone,
    website: facility.Website,
    latitude: facility.Latitude,
    longitude: facility.Longitude,
    materials: facility.Feedstock ? facility.Feedstock.split(",").map(m => m.trim()) : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        ogType="place"
        canonicalUrl={`https://recycling.recyclish.com/facility/${facilityId}`}
        businessName={seoData.businessName}
        category={seoData.category}
        phone={seoData.phone}
        website={seoData.website}
        coordinates={seoData.coordinates}
        address={{
          street: addressParts[0] || facility.Address,
          city: city,
          state: facility.State,
        }}
      />
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>

        <div className="container pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Facility Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Badge className={`${categoryColor} w-fit text-xs font-label`}>
                          {formatCategory(facility.Category)}
                        </Badge>
                        <CardTitle className="text-2xl md:text-3xl font-display">
                          {facility.Name}
                        </CardTitle>
                        {stats && stats.totalReviews > 0 && (
                          <div className="flex items-center gap-2">
                            <StarRating rating={stats.avgRating ?? 0} size="sm" />
                            <span className="text-sm text-muted-foreground">
                              {stats.avgRating?.toFixed(1)} ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <ReportIssueButton
                          facilityId={facilityId}
                          facilityName={facility.Name}
                          facilityAddress={facility.Address}
                        />
                        <PrintButton facility={facility} />
                        <ShareButton
                          facilityName={facility.Name}
                          facilityAddress={facility.Address}
                          facilityCategory={formatCategory(facility.Category)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
                          onClick={handleFavoriteClick}
                          disabled={addFavorite.isPending || removeFavorite.isPending}
                          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">{facility.Address}</p>
                        {facility.County && (
                          <p className="text-sm text-muted-foreground">{facility.County} County</p>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {facility.Phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 shrink-0 text-accent" />
                          <a
                            href={`tel:${facility.Phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {facility.Phone}
                          </a>
                        </div>
                      )}

                      {facility.Email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 shrink-0 text-accent" />
                          <a
                            href={`mailto:${facility.Email}`}
                            className="hover:text-primary transition-colors truncate"
                          >
                            {facility.Email}
                          </a>
                        </div>
                      )}

                      {facility.Website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 shrink-0 text-accent" />
                          <a
                            href={facility.Website.startsWith('http') ? facility.Website : `https://${facility.Website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Operating Hours */}
                    {facility.Hours && (
                      <div className="pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 mt-0.5 shrink-0 text-accent" />
                          <div>
                            <p className="font-medium mb-1">Operating Hours</p>
                            <p className="text-sm text-muted-foreground">{facility.Hours}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Materials Accepted */}
                    {facility.Feedstock && (
                      <div className="pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <Recycle className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                          <div>
                            <p className="font-medium mb-1">Materials Accepted</p>
                            <p className="text-sm text-muted-foreground">{facility.Feedstock}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Get Directions Button */}
                    <Button onClick={openMaps} className="w-full sm:w-auto mt-4">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Rating Summary */}
                    <RatingBreakdown
                      avgRating={stats?.avgRating ?? null}
                      totalReviews={stats?.totalReviews ?? 0}
                      avgService={stats?.avgService}
                      avgCleanliness={stats?.avgCleanliness}
                      avgConvenience={stats?.avgConvenience}
                    />

                    {/* Write Review Button or Form */}
                    {!showReviewForm ? (
                      <div className="pt-4 border-t">
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
                          <Button onClick={() => setShowReviewForm(true)} className="w-full">
                            Write a Review
                          </Button>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t">
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
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">All Reviews ({reviews.length})</h4>
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <StarRating rating={review.rating} size="sm" />
                                  {review.title && (
                                    <span className="font-medium">{review.title}</span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {review.userName || "Anonymous"} •{" "}
                                  {format(new Date(review.createdAt), "MMMM d, yyyy")}
                                </p>
                              </div>
                            </div>

                            {review.content && (
                              <p className="text-foreground/90">{review.content}</p>
                            )}

                            {(review.serviceRating || review.cleanlinessRating || review.convenienceRating) && (
                              <div className="flex gap-4 text-sm text-muted-foreground">
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
                                className="h-8 text-sm"
                                onClick={() => handleMarkHelpful(review.id)}
                                disabled={helpfulVotes?.includes(review.id)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Helpful ({review.helpfulCount})
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showReviewForm && reviews && reviews.length === 0 && (
                      <p className="text-muted-foreground text-center py-6 border-t">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - Mini Map */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="sticky top-4"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {facility.Latitude && facility.Longitude ? (
                      <MapView
                        className="h-[300px] rounded-b-lg"
                        initialCenter={{ lat: facility.Latitude, lng: facility.Longitude }}
                        initialZoom={15}
                        onMapReady={handleMapReady}
                      />
                    ) : (
                      <div className="h-[300px] bg-muted flex items-center justify-center rounded-b-lg">
                        <p className="text-muted-foreground text-sm">
                          Location coordinates not available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button onClick={openMaps} variant="outline" className="w-full justify-start">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    {facility.Phone && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.location.href = `tel:${facility.Phone}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    )}
                    {facility.Website && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(
                          facility.Website.startsWith('http') ? facility.Website : `https://${facility.Website}`,
                          '_blank'
                        )}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Nearby Facilities Section */}
          {facility.Latitude && facility.Longitude && (
            <NearbyFacilities
              currentFacilityId={facilityId}
              latitude={facility.Latitude}
              longitude={facility.Longitude}
              className="mt-8"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
