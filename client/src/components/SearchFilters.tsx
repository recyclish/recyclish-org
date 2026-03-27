import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter, MapPin, ShieldCheck, Search, Recycle } from "lucide-react";
import { motion } from "framer-motion";
import { LocationSearch } from "./LocationSearch";
import { cn } from "@/lib/utils";
import { SPECIES_OPTIONS, SHELTER_TYPES } from "@/hooks/useShelterData";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedState: string;
  setSelectedState: (value: string) => void;
  selectedSpecies: string[];
  setSelectedSpecies: (value: string[]) => void;
  isNoKill: boolean | undefined;
  setIsNoKill: (value: boolean | undefined) => void;
  selectedType: string | undefined;
  setSelectedType: (value: string | undefined) => void;
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
  selectedType,
  setSelectedType,
  userLocation,
  setUserLocation,
  radius,
  setRadius,
  onClear,
  totalResults,
  activeFilterCount,
}: SearchFiltersProps) {
  const hasFilters = activeFilterCount > 0;

  const toggleMaterial = (value: string) => {
    if (selectedSpecies.includes(value)) {
      setSelectedSpecies(selectedSpecies.filter((s) => s !== value));
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
      {/* Header */}
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

      {/* Row 1: Location + Radius + State */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Location search */}
        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            Find Near
          </label>
          <div className="bg-cream/50 rounded-2xl border border-ocean/5 focus-within:border-terracotta/30 transition-all">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              currentLocation={
                userLocation
                  ? { latitude: userLocation.lat, longitude: userLocation.lng }
                  : null
              }
              isLocating={false}
              onUseMyLocation={() => {}}
            />
          </div>
        </div>

        {/* Radius */}
        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            Search Radius
          </label>
          <Select
            value={String(radius)}
            onValueChange={(v) => setRadius(Number(v))}
            disabled={!userLocation && !/^\d{5}$/.test(searchTerm)}
          >
            <SelectTrigger className="h-12 bg-cream/50 border-ocean/5 rounded-2xl font-body">
              <SelectValue placeholder="Select radius" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50, 100, 250].map((mi) => (
                <SelectItem key={mi} value={String(mi)}>
                  Within {mi} miles
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State */}
        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            State
          </label>
          <Select
            value={selectedState || "all"}
            onValueChange={(v) => setSelectedState(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-12 bg-cream/50 border-ocean/5 rounded-2xl font-body">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Keyword search + Facility type */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Keyword search */}
        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            Keyword Search
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean/20 group-focus-within:text-terracotta transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Facility name or city..."
              className="w-full h-12 pl-11 pr-4 bg-cream/50 border border-ocean/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-terracotta/10 focus:border-terracotta/30 transition-all font-body text-ocean"
            />
          </div>
        </div>

        {/* Facility type */}
        <div className="space-y-2">
          <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black ml-1">
            Facility Type
          </label>
          <Select
            value={selectedType || "all"}
            onValueChange={(v) => setSelectedType(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="h-12 bg-cream/50 border-ocean/5 rounded-2xl font-body">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {SHELTER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Materials accepted + Facility attributes */}
      <div className="mt-10 pt-10 border-t border-ocean/5">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Materials accepted */}
          <div>
            <label className="text-[10px] font-label text-ocean/40 uppercase tracking-[0.2em] font-black mb-4 block">
              Materials Accepted
            </label>
            <div className="flex flex-wrap gap-3">
              {SPECIES_OPTIONS.map((material) => (
                <button
                  key={material.value}
                  onClick={() => toggleMaterial(material.value)}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-label text-[10px] uppercase tracking-[0.2em] font-black transition-all border flex items-center gap-2",
                    selectedSpecies.includes(material.value)
                      ? "bg-terracotta border-terracotta text-cream shadow-lg shadow-terracotta/20"
                      : "bg-cream/50 border-ocean/10 text-ocean/60 hover:border-terracotta/30 hover:text-terracotta"
                  )}
                >
                  <Recycle className="h-3 w-3" />
                  {material.label}
                </button>
              ))}
            </div>
          </div>

          {/* Facility attributes */}
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
                <ShieldCheck className="h-3 w-3" />
                Verified Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: results count + actions */}
      <div className="mt-10 pt-10 border-t border-ocean/5 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-ocean/60">
            Showing{" "}
            <span className="font-black text-ocean">{totalResults.toLocaleString()}</span>{" "}
            recycling {totalResults === 1 ? "facility" : "facilities"}
          </p>
          {userLocation && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-terracotta/10 rounded-full">
              <MapPin className="h-3 w-3 text-terracotta" />
              <span className="text-[10px] font-label uppercase tracking-widest font-black text-terracotta">
                Sorted by Proximity
              </span>
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
              const resultsEl = document.getElementById("shelter-results");
              if (resultsEl) {
                resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
