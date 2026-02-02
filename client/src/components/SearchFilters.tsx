import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, MapPin, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MATERIAL_TYPES, DISTANCE_OPTIONS } from "@/hooks/useRecyclingData";

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
  states: string[];
  categories: string[];
  onClear: () => void;
  totalResults: number;
  activeFilterCount: number;
  userLocation: { latitude: number; longitude: number } | null;
  isLocating: boolean;
  locationError: string | null;
  requestLocation: () => void;
}

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
  states,
  categories,
  onClear,
  totalResults,
  activeFilterCount,
  userLocation,
  isLocating,
  locationError,
  requestLocation,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasFilters = activeFilterCount > 0;

  const formatCategory = (cat: string) => {
    return cat
      .replace("Recycling ", "Recycling ")
      .replace("Secondary ", "Secondary ")
      .replace("Recyclers", "Recycling")
      .replace("(MRFs)", "")
      .trim();
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-muted-foreground hover:text-foreground font-label"
        >
          {showAdvanced ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Less Filters
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              More Filters
            </>
          )}
        </Button>
      </div>
      
      {/* Primary Search Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Search by name, address, or material
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g., Green Earth Recycling, Los Angeles, or batteries"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-body"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            State
          </label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 md:grid-cols-3 mt-4 pt-4 border-t border-border/50">
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
                  Distance
                </label>
                <Select 
                  value={selectedDistance} 
                  onValueChange={setSelectedDistance}
                  disabled={!userLocation && selectedDistance === "any"}
                >
                  <SelectTrigger className="font-body">
                    <SelectValue placeholder="Any Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTANCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-label text-muted-foreground mb-1.5 block">
                  Your Location
                </label>
                {userLocation ? (
                  <div className="flex items-center gap-2 h-10 px-3 bg-green-50 border border-green-200 rounded-md">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Location enabled</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full font-label"
                    onClick={requestLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Use My Location
                      </>
                    )}
                  </Button>
                )}
                {locationError && (
                  <p className="text-xs text-destructive mt-1">{locationError}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Results and Clear */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <p className="text-sm font-body text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> recycling facilities
          </p>
          {userLocation && selectedDistance !== "any" && (
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
