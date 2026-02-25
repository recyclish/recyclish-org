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
      className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border-2 border-ocean/10 shadow-2xl shadow-ocean/5 p-8"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-terracotta/10 rounded-xl">
            <Filter className="h-5 w-5 text-terracotta" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ocean">Search Filters</h2>
          {activeFilterCount > 0 && (
            <div className="ml-4 px-3 py-1 bg-ocean text-cream text-[10px] font-label uppercase tracking-widest font-black rounded-full">
              {activeFilterCount} Active
            </div>
          )}
        </div>
      </div>

      {/* Primary Search Row - Location + Distance */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            Find Near
          </label>
          <div className="bg-cream/50 rounded-2xl border border-ocean/5 focus-within:border-terracotta/30 transition-all">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              currentLocation={userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : null}
              isLocating={false}
              onUseMyLocation={() => { }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            Search Radius
          </label>
          <Select
            value={radius.toString()}
            onValueChange={(v) => setRadius(parseInt(v))}
            disabled={!userLocation && !(/^\d{5}$/.test(searchTerm))}
          >
            <SelectTrigger className="h-12 rounded-2xl bg-cream/50 border-ocean/5 font-medium text-ocean">
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-ocean/10 bg-white/95 backdrop-blur-md">
              <SelectItem value="10" className="rounded-lg">10 miles</SelectItem>
              <SelectItem value="25" className="rounded-lg">25 miles</SelectItem>
              <SelectItem value="50" className="rounded-lg">50 miles</SelectItem>
              <SelectItem value="100" className="rounded-lg">100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            Keywords
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean/20 group-focus-within:text-terracotta transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rescue name or city..."
              className="w-full h-12 pl-11 pr-4 bg-cream/50 border border-ocean/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-terracotta/10 focus:border-terracotta/30 transition-all font-body text-ocean"
            />
          </div>
        </div>
      </div>

      {/* Species & Features */}
      <div className="mt-10 pt-10 border-t border-ocean/5">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black mb-4 block">
              Animals Served
            </label>
            <div className="flex flex-wrap gap-3">
              {SPECIES_OPTIONS.map((species) => (
                <button
                  key={species.value}
                  onClick={() => toggleSpecies(species.value)}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-label text-[10px] uppercase tracking-[0.2em] font-black transition-all border flex items-center gap-2",
                    selectedSpecies.includes(species.value)
                      ? "bg-terracotta border-terracotta text-cream shadow-lg shadow-terracotta/20"
                      : "bg-cream/50 border-ocean/10 text-ocean/60 hover:border-terracotta/30 hover:text-terracotta"
                  )}
                >
                  <PawPrint className="h-3 w-3" />
                  {species.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black mb-4 block">
              Facility Attributes
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsNoKill(isNoKill === true ? undefined : true)}
                className={cn(
                  "px-5 py-2.5 rounded-full font-label text-[10px] uppercase tracking-[0.2em] font-black transition-all border flex items-center gap-2",
                  isNoKill === true
                    ? "bg-ocean border-ocean text-cream shadow-lg shadow-ocean/20"
                    : "bg-cream/50 border-ocean/10 text-ocean/60 hover:border-ocean/30 hover:text-ocean"
                )}
              >
                <Heart className="h-3 w-3" />
                No-Kill Only
              </button>
              <button
                className="px-5 py-2.5 rounded-full font-label text-[10px] uppercase tracking-[0.2em] font-black transition-all border border-ocean/10 bg-cream/50 text-ocean/60 hover:border-ocean/30 hover:text-ocean flex items-center gap-2"
              >
                <ShieldCheck className="h-3 w-3" />
                Verified Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Button and Results Summary */}
      <div className="mt-10 pt-10 border-t border-ocean/5 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-ocean/60">
            Atlas currently tracking <span className="font-black text-ocean">{totalResults.toLocaleString()}</span> rescues
          </p>
          {userLocation && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-terracotta/10 rounded-full">
              <MapPin className="h-3 w-3 text-terracotta" />
              <span className="text-[10px] font-label uppercase tracking-widest font-black text-terracotta">Sorted by Proximity</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-ocean/40 hover:text-terracotta font-label text-[10px] uppercase tracking-widest font-black h-12 px-6"
            >
              <X className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          )}
          <Button
            className="bg-ocean hover:bg-ocean-light text-cream font-bold h-12 px-10 rounded-2xl shadow-xl shadow-ocean/20 transition-all font-body"
            onClick={() => {
              const resultsEl = document.getElementById('shelter-results');
              if (resultsEl) {
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            Apply & View Atlas
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
