import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, MapPin, Home, Syringe, Store } from "lucide-react";
import { motion } from "framer-motion";
import { MATERIAL_TYPES, DISTANCE_OPTIONS, DROPOFF_OPTIONS, FEE_OPTIONS } from "@/hooks/useRecyclingData";
import { LocationSearch } from "./LocationSearch";
import { cn } from "@/lib/utils";

interface Facility {
  Name: string;
  Address: string;
  Category: string;
  State: string;
}

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedState: string;
  setSelectedState: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (value: string) => void;
  selectedDistance: string;
  setSelectedDistance: (value: string) => void;
  selectedDropoff: string;
  setSelectedDropoff: (value: string) => void;
  selectedFee: string;
  setSelectedFee: (value: string) => void;
  householdDropoff: boolean;
  setHouseholdDropoff: (value: boolean) => void;
  sharpsFilter: boolean;
  setSharpsFilter: (value: boolean) => void;
  retailTakeBack: boolean;
  setRetailTakeBack: (value: boolean) => void;
  states: string[];
  categories: string[];
  onClear: () => void;
  totalResults: number;
  activeFilterCount: number;
  userLocation: { latitude: number; longitude: number } | null;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  locationDisplayName: string;
  setLocationDisplayName: (name: string) => void;
  isLocating: boolean;
  locationError: string | null;
  requestLocation: () => void;
  facilities?: Facility[];
}

const MAX_QUICK_FILTERS = 2;

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedState,
  setSelectedState,
  selectedCategory,
  setSelectedCategory,
  selectedMaterial,
  setSelectedMaterial,
  selectedDistance,
  setSelectedDistance,
  selectedDropoff,
  setSelectedDropoff,
  selectedFee,
  setSelectedFee,
  householdDropoff,
  setHouseholdDropoff,
  sharpsFilter,
  setSharpsFilter,
  retailTakeBack,
  setRetailTakeBack,
  states,
  categories,
  onClear,
  totalResults,
  activeFilterCount,
  userLocation,
  setUserLocation,
  locationDisplayName,
  setLocationDisplayName,
  isLocating,
  locationError,
  requestLocation,
  facilities = [],
}: SearchFiltersProps) {
  const hasFilters = activeFilterCount > 0;

  const formatCategory = (cat: string) => {
    return cat
      .replace("Recycling ", "Recycling ")
      .replace("Secondary ", "Secondary ")
      .replace("Recyclers", "Recycling")
      .replace("(MRFs)", "")
      .trim();
  };

  // Count currently active quick filters
  const activeQuickFilterCount = [
    householdDropoff,
    selectedFee === "Free",
    sharpsFilter,
    retailTakeBack,
  ].filter(Boolean).length;

  // Toggle a quick filter, respecting the max of 2
  const toggleQuickFilter = (
    currentValue: boolean,
    setter: (value: boolean) => void
  ) => {
    if (currentValue) {
      setter(false);
    } else if (activeQuickFilterCount < MAX_QUICK_FILTERS) {
      setter(true);
    }
  };

  const toggleFeeFilter = () => {
    const isActive = selectedFee === "Free";
    if (isActive) {
      setSelectedFee("all");
    } else if (activeQuickFilterCount < MAX_QUICK_FILTERS) {
      setSelectedFee("Free");
    }
  };

  // Handle location selection from LocationSearch
  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    displayName: string;
  }) => {
    if (location.latitude && location.longitude) {
      setUserLocation({ latitude: location.latitude, longitude: location.longitude });
      setLocationDisplayName(location.displayName);
      if (selectedDistance === "any") {
        setSelectedDistance("25");
      }
    } else {
      setUserLocation(null);
      setLocationDisplayName("");
      setSelectedDistance("any");
    }
  };

  // Handle browser geolocation
  const handleUseMyLocation = () => {
    requestLocation();
    setLocationDisplayName("Your Location");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl shadow-lg border border-border/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Find Recycling Centers</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </div>
      </div>
      
      {/* Primary Search Row - Location + Distance */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            currentLocation={userLocation}
            isLocating={isLocating}
            onUseMyLocation={handleUseMyLocation}
          />
          {locationError && (
            <p className="text-xs text-destructive mt-1">{locationError}</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Distance
          </label>
          <Select 
            value={selectedDistance} 
            onValueChange={setSelectedDistance}
            disabled={!userLocation}
          >
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              {DISTANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!userLocation && (
            <p className="text-xs text-muted-foreground mt-1">Enter location to filter by distance</p>
          )}
        </div>
      </div>

      {/* Quick Filter Buttons - up to 2 selectable */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <label className="text-sm font-label text-muted-foreground mb-2 block">
          Quick Filters
          <span className="ml-2 text-xs opacity-70">(select up to 2)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={householdDropoff ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter(householdDropoff, setHouseholdDropoff)}
            className={cn(
              "font-label",
              householdDropoff && "bg-primary text-primary-foreground",
              !householdDropoff && activeQuickFilterCount >= MAX_QUICK_FILTERS && "opacity-50 cursor-not-allowed"
            )}
          >
            <Home className="h-4 w-4 mr-1.5" />
            Household Drop-off
          </Button>
          <Button
            variant={selectedFee === "Free" ? "default" : "outline"}
            size="sm"
            onClick={toggleFeeFilter}
            className={cn(
              "font-label",
              selectedFee === "Free" && "bg-primary text-primary-foreground",
              selectedFee !== "Free" && activeQuickFilterCount >= MAX_QUICK_FILTERS && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="mr-1.5">$0</span>
            Free Only
          </Button>
          <Button
            variant={sharpsFilter ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter(sharpsFilter, setSharpsFilter)}
            className={cn(
              "font-label",
              sharpsFilter && "bg-primary text-primary-foreground",
              !sharpsFilter && activeQuickFilterCount >= MAX_QUICK_FILTERS && "opacity-50 cursor-not-allowed"
            )}
          >
            <Syringe className="h-4 w-4 mr-1.5" />
            Needles / Sharps
          </Button>
          <Button
            variant={retailTakeBack ? "default" : "outline"}
            size="sm"
            onClick={() => toggleQuickFilter(retailTakeBack, setRetailTakeBack)}
            className={cn(
              "font-label",
              retailTakeBack && "bg-primary text-primary-foreground",
              !retailTakeBack && activeQuickFilterCount >= MAX_QUICK_FILTERS && "opacity-50 cursor-not-allowed"
            )}
          >
            <Store className="h-4 w-4 mr-1.5" />
            Retail Take-Back
          </Button>
        </div>
      </div>

      {/* All Dropdown Filters - Always visible */}
      <div className="grid gap-4 md:grid-cols-3 mt-4 pt-4 border-t border-border/50">
        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Facility Type
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facility Types</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {formatCategory(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Material Type
          </label>
          <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All Materials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {MATERIAL_TYPES.map((material) => (
                <SelectItem key={material.value} value={material.value}>
                  {material.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Drop-off Availability
          </label>
          <Select value={selectedDropoff} onValueChange={setSelectedDropoff}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All Facilities" />
            </SelectTrigger>
            <SelectContent>
              {DROPOFF_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Fee Structure
          </label>
          <Select value={selectedFee} onValueChange={setSelectedFee}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Any Fee Structure" />
            </SelectTrigger>
            <SelectContent>
              {FEE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Results and Clear */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <p className="text-sm font-body text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> recycling facilities
          </p>
          {userLocation && (
            <Badge variant="outline" className="text-primary border-primary/30">
              <MapPin className="h-3 w-3 mr-1" />
              Sorted by distance
            </Badge>
          )}
        </div>
        
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground font-label"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all filters
          </Button>
        )}
      </div>
    </motion.div>
  );
}
