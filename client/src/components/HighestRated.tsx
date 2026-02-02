import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ChevronRight, Award, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface TopRatedFacility {
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  avgRating: number;
  totalReviews: number;
}

export function HighestRated() {
  const { data: topRated, isLoading } = trpc.reviews.topRated.useQuery({ limit: 6 });

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!topRated || topRated.length === 0) {
    return null; // Don't show section if no reviews yet
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-label mb-3">
              <Award className="h-4 w-4" />
              <span>Community Favorites</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Highest Rated Recycling Centers
            </h2>
            <p className="text-muted-foreground font-body mt-2">
              Top-rated facilities based on user reviews and ratings
            </p>
          </div>
          <Link href="/map">
            <Button variant="outline" className="font-label gap-2">
              View All on Map
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Top Rated Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topRated.map((facility, index) => (
            <motion.div
              key={facility.facilityId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow border-border/50 overflow-hidden group">
                <CardContent className="p-0">
                  {/* Rank Badge */}
                  <div className="relative">
                    <div className={`
                      absolute top-3 left-3 z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                      ${index === 0 ? 'bg-amber-400 text-amber-900' : 
                        index === 1 ? 'bg-gray-300 text-gray-700' : 
                        index === 2 ? 'bg-amber-600 text-amber-100' : 
                        'bg-muted text-muted-foreground'}
                    `}>
                      #{index + 1}
                    </div>
                    
                    {/* Rating Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-4 pt-6">
                      <div className="flex items-center gap-2 ml-8">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(facility.avgRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-muted text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-foreground">{facility.avgRating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({facility.totalReviews} {facility.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Facility Info */}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {facility.facilityName}
                    </h3>
                    <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{facility.facilityAddress}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground font-body mb-4">
            Have you visited a recycling center? Share your experience to help others!
          </p>
          <Link href="/">
            <Button className="font-label gap-2">
              <Star className="h-4 w-4" />
              Browse & Review Facilities
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
