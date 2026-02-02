import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { trpc } from "@/lib/trpc";
import { MapPin, Navigation, Loader2, ChevronRight } from "lucide-react";
import { RecyclingFacility, generateFacilityId } from "./RecyclingCard";

interface NearbyFacilitiesProps {
  currentFacilityId: string;
  latitude: number;
  longitude: number;
  className?: string;
}

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
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface NearbyFacilityWithDistance extends RecyclingFacility {
  distance: number;
  id: string;
}

export function NearbyFacilities({ currentFacilityId, latitude, longitude, className }: NearbyFacilitiesProps) {
  const [nearbyFacilities, setNearbyFacilities] = useState<NearbyFacilityWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const RADIUS_MILES = 10;
  const MAX_RESULTS = 5;

  // Fetch review stats for nearby facilities
  const facilityIds = nearbyFacilities.map((f) => f.id);
  const { data: reviewStatsMap } = trpc.reviews.batchStats.useQuery(
    { facilityIds },
    { enabled: facilityIds.length > 0 }
  );

  useEffect(() => {
    const loadNearbyFacilities = async () => {
      if (!latitude || !longitude) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/data/master_recycling_directory.csv");
        const text = await response.text();
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

        const nearby: NearbyFacilityWithDistance[] = [];

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

            const lat = parseFloat(facilityData.Latitude);
            const lng = parseFloat(facilityData.Longitude);

            // Skip facilities without coordinates
            if (!lat || !lng) continue;

            const facilityObj: RecyclingFacility = {
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
              Latitude: lat,
              Longitude: lng,
              NAICS_Code: facilityData.NAICS_Code || "",
            };

            const id = generateFacilityId(facilityObj.Name, facilityObj.Address);

            // Skip the current facility
            if (id === currentFacilityId) continue;

            // Calculate distance
            const distance = calculateDistance(
              latitude,
              longitude,
              lat,
              lng
            );

            // Only include facilities within the radius
            if (distance <= RADIUS_MILES) {
              nearby.push({
                ...facilityObj,
                distance,
                id,
              });
            }
          }
        }

        // Sort by distance and take top results
        nearby.sort((a, b) => a.distance - b.distance);
        setNearbyFacilities(nearby.slice(0, MAX_RESULTS));
      } catch (error) {
        console.error("Error loading nearby facilities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNearbyFacilities();
  }, [latitude, longitude, currentFacilityId]);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Nearby Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latitude || !longitude) {
    return null;
  }

  if (nearbyFacilities.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Nearby Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No other recycling facilities found within {RADIUS_MILES} miles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className || "mt-4"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">
          Nearby Facilities
          <span className="text-sm font-normal text-muted-foreground ml-2">
            within {RADIUS_MILES} miles
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nearbyFacilities.map((facility) => {
          const stats = reviewStatsMap?.[facility.id];
          const categoryColor = categoryColors[facility.Category] || "bg-primary text-primary-foreground";

          return (
            <Link key={facility.id} href={`/facility/${facility.id}`}>
              <div className="group p-3 border rounded-lg hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {facility.Name}
                      </h4>
                      <Badge className={`${categoryColor} text-xs px-1.5 py-0`}>
                        {facility.Category.replace("Recycling Facilities", "").replace("Recyclers", "").replace("(MRFs)", "").trim() || facility.Category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{facility.Address}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Navigation className="h-3 w-3" />
                        <span>{facility.distance.toFixed(1)} mi</span>
                      </div>
                      
                      {stats && stats.count > 0 && (
                        <div className="flex items-center gap-1">
                          <StarRating rating={stats.average} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            ({stats.count})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
