import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, MapPin, Heart, ShieldCheck, Search, PawPrint, Dog, Cat } from "lucide-react";
import { motion } from "framer-motion";
import { LocationSearch } from "./LocationSearch";
import { cn } from "@/lib/utils";
import { SPECIES_OPTIONS, SHELTER_TYPES } from "@/hooks/useShelterData";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedState: string;
  setSelectedState: (value: string) => void;
  selectedSpecies: string[];
  setSelectedSpecies: (value: string[]) => void;
  isNoKill: boolean | undefined;
  setIsNoKill: (value: boolean | undefined) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  radius: number;
  setRadius: (value: number) => void;
  onClear: () => void;
  totalResults: number;
  activeFilterCount: number;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedState,
  setSelectedState,
  selectedSpecies,
  setSelectedSpecies,
  isNoKill,
  setIsNoKill,
  userLocation,
  setUserLocation,
  radius,
  setRadius,
  onClear,
  totalResults,
  activeFilterCount,
}: SearchFiltersProps) {
  const hasFilters = activeFilterCount > 0;

  const toggleSpecies = (value: string) => {
    if (selectedSpecies.includes(value)) {
      setSelectedSpecies(selectedSpecies.filter(s => s !== value));
    } else {
      setSelectedSpecies([...selectedSpecies, value]);
    }
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    displayName: string;
  }) => {
    if (location.latitude && location.longitude) {
      // If coordinates are the placeholder ones (Google Maps down)
      if (Math.abs(location.latitude) < 0.001) {
        setSearchTerm(location.displayName);
        setUserLocation(null);
      } else {
        setUserLocation({ lat: location.latitude, lng: location.longitude });
      }
    } else {
      setUserLocation(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl shadow-xl border border-border/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Search Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 rounded-full px-3">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
      </div>

      {/* Primary Search Row - Location + Distance */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-label text-muted-foreground ml-1">
            Find Near
          </label>
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            currentLocation={userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : null}
            isLocating={false}
            onUseMyLocation={() => { }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-label text-muted-foreground ml-1">
            Search Radius
          </label>
          <Select
            value={radius.toString()}
            onValueChange={(v) => setRadius(parseInt(v))}
            disabled={!userLocation && !(/^\d{5}$/.test(searchTerm))}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 miles</SelectItem>
              <SelectItem value="25">25 miles</SelectItem>
              <SelectItem value="50">50 miles</SelectItem>
              <SelectItem value="100">100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-label text-muted-foreground ml-1">
            Keywords
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rescue name or city..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body text-sm"
            />
          </div>
        </div>
      </div>

      {/* Species & Features */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="text-sm font-label text-muted-foreground mb-3 block">
              Animals Served
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map((species) => (
                <Button
                  key={species.value}
                  variant={selectedSpecies.includes(species.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSpecies(species.value)}
                  className={cn(
                    "rounded-full font-label transition-all",
                    selectedSpecies.includes(species.value) && "shadow-lg shadow-primary/20"
                  )}
                >
                  <PawPrint className="h-3.5 w-3.5 mr-1.5" />
                  {species.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-label text-muted-foreground mb-3 block">
              Facility Options
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isNoKill === true ? "default" : "outline"}
                size="sm"
                onClick={() => setIsNoKill(isNoKill === true ? undefined : true)}
                className={cn(
                  "rounded-full font-label transition-all",
                  isNoKill === true && "shadow-lg shadow-primary/20"
                )}
              >
                <Heart className="h-3.5 w-3.5 mr-1.5" />
                No-Kill Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-label"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Verified Only
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Button and Results Summary */}
      <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm font-body text-muted-foreground">
            Found <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> local rescues
          </p>
          {userLocation && (
            <Badge variant="outline" className="text-primary border-primary/30 rounded-full bg-primary/5 px-3">
              <MapPin className="h-3 w-3 mr-1" />
              Sorted by nearest
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground font-label h-10 px-4"
            >
              <X className="h-4 w-4 mr-1.5" />
              Reset All
            </Button>
          )}
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-label h-10 px-8 rounded-xl shadow-lg shadow-primary/20"
            onClick={() => {
              const resultsEl = document.getElementById('shelter-results');
              if (resultsEl) {
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            Show Results
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
