import { useState, useRef } from "react";
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
  Clock,
  Recycle,
  ThumbsUp,
  Loader2,
  Building2,
  DoorOpen,
  DollarSign,
  Banknote,
  Info,
} from "lucide-react";
import { NearbyFacilities } from "@/components/NearbyFacilities";
import { SEOHead } from "@/components/SEOHead";
import { SocialShareButtons } from "@/components/SocialShareButtons";

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
  // Mapped from DB shelterType field
  "shelter": "bg-[oklch(0.45_0.12_200)] text-white",
  "rescue": "bg-[oklch(0.50_0.15_180)] text-white",
  "sanctuary": "bg-[oklch(0.55_0.10_80)] text-white",
  "foster_network": "bg-[oklch(0.50_0.12_70)] text-white",
  "community_resource": "bg-[oklch(0.55_0.20_25)] text-white",
};

export default function FacilityDetail() {
  const params = useParams();
  const facilityId = params.id as string;
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Review form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serviceRating, setServiceRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [convenienceRating, setConvenienceRating] = useState(0);

  // ─── Fetch facility from tRPC backend ───────────────────────────────────────
  const {
    data: facility,
    isLoading,
    error: facilityError,
  } = trpc.directory.getById.useQuery(
    { id: facilityId },
    { enabled: !!facilityId, retry: false }
  );

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
      facilityName: facility.name,
      facilityAddress: `${facility.addressLine1}, ${facility.city}, ${facility.state}`,
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

    const fullAddress = `${facility.addressLine1}, ${facility.city}, ${facility.state} ${facility.zip}`;

    if (isFavorite) {
      removeFavorite.mutate({ facilityId });
    } else {
      addFavorite.mutate({
        facilityId,
        facilityName: facility.name,
        facilityAddress: fullAddress,
        facilityCategory: facility.shelterType || undefined,
        facilityPhone: facility.phone || undefined,
        facilityWebsite: facility.website || undefined,
        facilityFeedstock: facility.speciesServed?.join(", ") || undefined,
        facilityLatitude: facility.latitude?.toString() || undefined,
        facilityLongitude: facility.longitude?.toString() || undefined,
      });
    }
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    if (facility && facility.latitude && facility.longitude) {
      const position = { lat: facility.latitude, lng: facility.longitude };
      map.setCenter(position);
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: facility.name,
      });
    }
  };

  const openMaps = () => {
    if (!facility) return;
    const query = encodeURIComponent(`${facility.addressLine1}, ${facility.city}, ${facility.state} ${facility.zip}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const formatCategory = (cat: string) => {
    return cat
      .replace("Recycling ", "Recycling ")
      .replace("Secondary ", "Secondary ")
      .replace("Recyclers", "Recycling")
      .replace("(MRFs)", "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  // ─── Loading state ───────────────────────────────────────────────────────────
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

  // ─── Not found state ─────────────────────────────────────────────────────────
  if (!facility || facilityError) {
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
            <Link href="/directory">
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

  // ─── Derived display values ──────────────────────────────────────────────────
  const fullAddress = `${facility.addressLine1}${facility.addressLine2 ? `, ${facility.addressLine2}` : ""}, ${facility.city}, ${facility.state} ${facility.zip}`;
  const displayCategory = facility.shelterType || "Recycling Facility";
  const categoryColor = categoryColors[displayCategory] || "bg-primary text-primary-foreground";

  const materials = facility.speciesServed && facility.speciesServed.length > 0
    ? facility.speciesServed
    : facility.services && facility.services.length > 0
    ? facility.services
    : [];

  const hoursDisplay = typeof facility.hoursOfOperation === "string"
    ? facility.hoursOfOperation
    : facility.hoursOfOperation
    ? JSON.stringify(facility.hoursOfOperation)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <SEOHead
        title={`${facility.name} | Recycling Center | ${facility.city}, ${facility.state}`}
        description={`Find recycling information for ${facility.name} in ${facility.city}, ${facility.state}. View hours, materials accepted, contact info, and directions.${
          materials.length > 0 ? ` Accepts: ${materials.slice(0, 3).join(", ")}${materials.length > 3 ? ", and more" : ""}.` : ""
        }`}
        ogType="place"
        canonicalUrl={`https://recyclish.info/facility/${facilityId}`}
        businessName={facility.name}
        category={displayCategory}
        phone={facility.phone || undefined}
        website={facility.website || undefined}
        coordinates={
          facility.latitude && facility.longitude
            ? { lat: facility.latitude, lng: facility.longitude }
            : undefined
        }
        address={{
          street: facility.addressLine1,
          city: facility.city,
          state: facility.state,
          zip: facility.zip || undefined,
          country: "US",
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "RecyclingCenter",
          name: facility.name,
          description: `Recycling facility in ${facility.city}, ${facility.state}. ${displayCategory}.`,
          url: `https://recyclish.info/facility/${facilityId}`,
          address: {
            "@type": "PostalAddress",
            streetAddress: facility.addressLine1,
            addressLocality: facility.city,
            addressRegion: facility.state,
            postalCode: facility.zip || "",
            addressCountry: "US",
          },
          ...(facility.phone && { telephone: facility.phone }),
          ...(facility.website && { sameAs: facility.website }),
          ...(facility.latitude && facility.longitude && {
            geo: {
              "@type": "GeoCoordinates",
              latitude: facility.latitude,
              longitude: facility.longitude,
            },
          }),
          ...(materials.length > 0 && {
            knowsAbout: materials,
          }),
          ...(stats && stats.totalReviews > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: stats.avgRating?.toFixed(1),
              reviewCount: stats.totalReviews,
              bestRating: "5",
              worstRating: "1",
            },
          }),
          ...(facility.verified && { isVerified: true }),
        }}
      />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <Link href="/directory">
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
                          {formatCategory(displayCategory)}
                        </Badge>
                        <CardTitle className="text-2xl md:text-3xl font-display">
                          {facility.name}
                        </CardTitle>
                        {stats && stats.totalReviews > 0 && (
                          <div className="flex items-center gap-2">
                            <StarRating rating={stats.avgRating ?? 0} size="sm" />
                            <span className="text-sm text-muted-foreground">
                              {stats.avgRating?.toFixed(1)} ({stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <ReportIssueButton
                          facilityId={facilityId}
                          facilityName={facility.name}
                          facilityAddress={fullAddress}
                        />
                        <PrintButton facility={{
                          Name: facility.name,
                          Address: fullAddress,
                          State: facility.state,
                          County: "",
                          Phone: facility.phone || "",
                          Email: facility.email || "",
                          Website: facility.website || "",
                          Category: displayCategory,
                          Facility_Type: "",
                          Feedstock: materials.join(", "),
                          Latitude: facility.latitude || 0,
                          Longitude: facility.longitude || 0,
                          NAICS_Code: "",
                          Hours: hoursDisplay || "",
                          Accepts_Dropoff: "",
                          Fee_Structure: "",
                          Fee_Details: "",
                          Offers_Payment: "",
                          Payment_Details: "",
                        }} />
                        <ShareButton
                          facilityName={facility.name}
                          facilityAddress={fullAddress}
                          facilityCategory={formatCategory(displayCategory)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                          onClick={handleFavoriteClick}
                          disabled={addFavorite.isPending || removeFavorite.isPending}
                          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">{fullAddress}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {facility.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 shrink-0 text-accent" />
                          <a href={`tel:${facility.phone}`} className="hover:text-primary transition-colors">
                            {facility.phone}
                          </a>
                        </div>
                      )}
                      {facility.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 shrink-0 text-accent" />
                          <a href={`mailto:${facility.email}`} className="hover:text-primary transition-colors truncate">
                            {facility.email}
                          </a>
                        </div>
                      )}
                      {facility.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 shrink-0 text-accent" />
                          <a
                            href={facility.website.startsWith("http") ? facility.website : `https://${facility.website}`}
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
                    {hoursDisplay && (
                      <div className="pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 mt-0.5 shrink-0 text-accent" />
                          <div>
                            <p className="font-medium mb-1">Operating Hours</p>
                            <p className="text-sm text-muted-foreground">{hoursDisplay}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Materials Accepted */}
                    {materials.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <Recycle className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                          <div>
                            <p className="font-medium mb-2">Materials Accepted</p>
                            <div className="flex flex-wrap gap-2">
                              {materials.map((material, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verified Badge */}
                    {facility.verified && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <Info className="h-5 w-5 shrink-0 text-green-600" />
                          <p className="text-sm font-medium text-green-700">
                            Mobi Verified — This facility has been reviewed and confirmed by the Recyclish team.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Get Directions */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={openMaps}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Get Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Map */}
              {facility.latitude && facility.longitude && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-0 overflow-hidden rounded-lg">
                      <div className="h-64">
                        <MapView
                          facilities={[{
                            Name: facility.name,
                            Address: fullAddress,
                            State: facility.state,
                            County: "",
                            Phone: facility.phone || "",
                            Email: facility.email || "",
                            Website: facility.website || "",
                            Category: displayCategory,
                            Facility_Type: "",
                            Feedstock: materials.join(", "),
                            Latitude: facility.latitude,
                            Longitude: facility.longitude,
                            NAICS_Code: "",
                            Hours: hoursDisplay || "",
                            Accepts_Dropoff: "",
                            Fee_Structure: "",
                            Fee_Details: "",
                            Offers_Payment: "",
                            Payment_Details: "",
                          }]}
                          center={{ lat: facility.latitude, lng: facility.longitude }}
                          zoom={15}
                          onMapReady={handleMapReady}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display">
                        Reviews {stats && stats.totalReviews > 0 && `(${stats.totalReviews})`}
                      </CardTitle>
                      {isAuthenticated && !hasReviewedData?.hasReviewed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReviewForm(!showReviewForm)}
                        >
                          {showReviewForm ? "Cancel" : "Write a Review"}
                        </Button>
                      )}
                      {!isAuthenticated && (
                        <a href={getLoginUrl()}>
                          <Button variant="outline" size="sm">
                            Log in to Review
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Rating Breakdown */}
                    {stats && stats.totalReviews > 0 && (
                      <RatingBreakdown stats={stats} />
                    )}

                    {/* Review Form */}
                    {showReviewForm && (
                      <form onSubmit={handleSubmitReview} className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Overall Rating *</Label>
                          <StarRating rating={rating} interactive onRatingChange={setRating} size="lg" />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Service</Label>
                            <StarRating rating={serviceRating} interactive onRatingChange={setServiceRating} size="sm" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Cleanliness</Label>
                            <StarRating rating={cleanlinessRating} interactive onRatingChange={setCleanlinessRating} size="sm" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Convenience</Label>
                            <StarRating rating={convenienceRating} interactive onRatingChange={setConvenienceRating} size="sm" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="review-title" className="text-sm font-medium mb-1 block">Title</Label>
                          <Input
                            id="review-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summary of your experience"
                          />
                        </div>
                        <div>
                          <Label htmlFor="review-content" className="text-sm font-medium mb-1 block">Review</Label>
                          <Textarea
                            id="review-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your experience at this facility..."
                            rows={4}
                          />
                        </div>
                        <Button type="submit" disabled={submitReview.isPending}>
                          {submitReview.isPending ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                          ) : "Submit Review"}
                        </Button>
                      </form>
                    )}

                    {/* Review List */}
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="p-4 border rounded-lg space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <StarRating rating={review.rating} size="sm" />
                                  {review.title && <span className="font-medium text-sm">{review.title}</span>}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {review.userName} · {format(new Date(review.createdAt), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            {review.content && (
                              <p className="text-sm text-muted-foreground">{review.content}</p>
                            )}
                            <button
                              onClick={() => handleMarkHelpful(review.id)}
                              className={`flex items-center gap-1.5 text-xs transition-colors ${
                                helpfulVotes?.includes(review.id)
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground hover:text-primary"
                              }`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Share */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-display">Share This Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <SocialShareButtons
                    url={`https://recyclish.info/facility/${facilityId}`}
                    title={`${facility.name} — Recycling Center`}
                    description={`Find recycling info for ${facility.name} in ${facility.city}, ${facility.state} on Recyclish.`}
                  />
                </CardContent>
              </Card>

              {/* Nearby Facilities */}
              {facility.latitude && facility.longitude && (
                <NearbyFacilities
                  currentFacilityId={facilityId}
                  latitude={facility.latitude}
                  longitude={facility.longitude}
                  state={facility.state}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
