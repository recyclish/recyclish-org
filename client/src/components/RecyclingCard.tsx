import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Globe, ExternalLink, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShareButton } from "./ShareButton";
import { ReportIssueButton } from "./ReportIssueButton";

export interface RecyclingFacility {
  Name: string;
  Address: string;
  State: string;
  County: string;
  Phone: string;
  Email: string;
  Website: string;
  Category: string;
  Facility_Type: string;
  Feedstock: string;
  Latitude: number;
  Longitude: number;
  NAICS_Code: string;
  distance?: number; // Distance from user in miles (calculated)
}

interface RecyclingCardProps {
  facility: RecyclingFacility;
  index: number;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
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

// Generate a unique facility ID from name and address
export function generateFacilityId(name: string, address: string): string {
  const str = `${name}-${address}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export function RecyclingCard({ facility, index, isFavorite = false, onFavoriteChange }: RecyclingCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const categoryColor = categoryColors[facility.Category] || "bg-primary text-primary-foreground";
  const facilityId = generateFacilityId(facility.Name, facility.Address);
  
  const addFavorite = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success("Added to favorites");
      utils.favorites.ids.invalidate();
      onFavoriteChange?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to favorites");
    },
  });

  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
      utils.favorites.ids.invalidate();
      onFavoriteChange?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from favorites");
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }

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
  
  const formatCategory = (cat: string) => {
    return cat
      .replace("Recycling ", "Recycling ")
      .replace("Secondary ", "Secondary ")
      .replace("Recyclers", "Recycling")
      .replace("(MRFs)", "")
      .trim();
  };

  const openMaps = () => {
    const query = encodeURIComponent(facility.Address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const isLoading = addFavorite.isPending || removeFavorite.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border/50 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-display leading-tight line-clamp-2 flex-1">
              {facility.Name}
            </CardTitle>
            <div className="flex items-center gap-0.5 shrink-0 -mt-1 -mr-2">
              <ReportIssueButton
                facilityId={facilityId}
                facilityName={facility.Name}
                facilityAddress={facility.Address}
              />
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
                disabled={isLoading}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
          <Badge className={`${categoryColor} w-fit text-xs font-label`}>
            {formatCategory(facility.Category)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <span className="line-clamp-2">{facility.Address}</span>
          </div>
          
          {facility.Phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              <a 
                href={`tel:${facility.Phone}`} 
                className="hover:text-primary transition-colors"
              >
                {facility.Phone}
              </a>
            </div>
          )}
          
          {facility.Email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              <a 
                href={`mailto:${facility.Email}`}
                className="hover:text-primary transition-colors truncate"
              >
                {facility.Email}
              </a>
            </div>
          )}
          
          {facility.Website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 shrink-0 text-accent" />
              <a 
                href={facility.Website.startsWith('http') ? facility.Website : `https://${facility.Website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors truncate flex items-center gap-1"
              >
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          
          {facility.distance !== undefined && (
            <div className="flex items-center gap-1 text-sm text-primary font-medium">
              <MapPin className="h-3 w-3" />
              {facility.distance < 1 
                ? "Less than 1 mile away" 
                : `${facility.distance.toFixed(1)} miles away`}
            </div>
          )}
          
          {facility.Feedstock && (
            <div className="pt-2 border-t border-border/50">
              <span className="text-xs font-label text-muted-foreground">
                Accepts: <span className="text-foreground">{facility.Feedstock}</span>
              </span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 font-label"
            onClick={openMaps}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
