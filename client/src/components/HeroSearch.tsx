import { Button } from "@/components/ui/button";
import { Home, ArrowRight, Loader2, Syringe, Store, Cpu, Battery, CircleDot, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

// Load Google Maps script
let mapsScriptLoaded = false;
let mapsScriptPromise: Promise<void> | null = null;

function loadMapsScript(): Promise<void> {
  if (mapsScriptLoaded && window.google?.maps) {
    return Promise.resolve();
  }
  
  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }
  
  mapsScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      mapsScriptLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=places,geocoding`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      mapsScriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      mapsScriptPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });
  
  return mapsScriptPromise;
}

// Check if input is a valid US ZIP code (5 digits)
function isZipCode(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}

const MAX_FILTERS = 2;

type FilterKey = "household" | "free" | "sharps" | "retail" | "electronics" | "batteries" | "tires" | "cardboard";

interface HeroSearchProps {
  states: string[];
  totalFacilities: number;
}

export function HeroSearch({ states, totalFacilities }: HeroSearchProps) {
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Set<FilterKey>>(new Set());
  const [isGeocodingZip, setIsGeocodingZip] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    loadMapsScript()
      .then(() => {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
        setMapsReady(true);
      })
      .catch((error) => {
        console.error("Failed to load Google Maps:", error);
      });
  }, []);

  // Toggle a filter (up to MAX_FILTERS)
  const toggleFilter = (filter: FilterKey) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else if (next.size < MAX_FILTERS) {
        next.add(filter);
      } else {
        // Already at max, do nothing (or optionally replace oldest)
        return prev;
      }
      return next;
    });
  };

  // Geocode ZIP code
  const geocodeZipCode = useCallback((zipCode: string) => {
    if (!geocoderRef.current) return;

    setIsGeocodingZip(true);
    geocoderRef.current.geocode(
      { address: zipCode, componentRestrictions: { country: "us" } },
      (results, status) => {
        setIsGeocodingZip(false);
        if (status === "OK" && results?.[0]) {
          const location = results[0].geometry.location;
          let cityName = zipCode;
          const addressComponents = results[0].address_components;
          const locality = addressComponents?.find(c => c.types.includes("locality"));
          const adminArea = addressComponents?.find(c => c.types.includes("administrative_area_level_1"));
          if (locality && adminArea) {
            cityName = `${locality.short_name}, ${adminArea.short_name} ${zipCode}`;
          } else if (adminArea) {
            cityName = `${adminArea.short_name} ${zipCode}`;
          }
          
          setSelectedLocation({
            lat: location.lat(),
            lng: location.lng(),
            name: cityName,
          });
          setInputValue("");
          setPredictions([]);
          setShowDropdown(false);
        } else {
          console.error("ZIP code geocoding failed:", status);
        }
      }
    );
  }, []);

  // Fetch predictions (for city/state search)
  const fetchPredictions = useCallback(async (query: string) => {
    if (isZipCode(query)) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }
    
    if (query.length < 2 || !autocompleteServiceRef.current) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    try {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query,
          types: ["(cities)"],
          componentRestrictions: { country: "us" },
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(
              results.map((r) => ({
                place_id: r.place_id,
                description: r.description,
                main_text: r.structured_formatting?.main_text || r.description,
                secondary_text: r.structured_formatting?.secondary_text || "",
              }))
            );
          } else {
            setPredictions([]);
          }
          setIsSearching(false);
        }
      );
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
      setIsSearching(false);
    }
  }, []);

  // Geocode place (for city selection)
  const geocodePlace = useCallback((placeId: string, description: string) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ placeId }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const location = results[0].geometry.location;
        setSelectedLocation({
          lat: location.lat(),
          lng: location.lng(),
          name: description,
        });
        setInputValue("");
        setPredictions([]);
        setShowDropdown(false);
      }
    });
  }, []);

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (!isZipCode(value)) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setPredictions([]);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(value);
    }, 300);
  };

  // Handle Enter key press for ZIP code search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isZipCode(inputValue)) {
        geocodeZipCode(inputValue.trim());
      } else if (predictions.length > 0) {
        handleSelectPrediction(predictions[0]);
      }
    }
  };

  // Handle prediction selection
  const handleSelectPrediction = (prediction: PlacePrediction) => {
    geocodePlace(prediction.place_id, prediction.description);
  };

  // Clear location
  const handleClearLocation = () => {
    setSelectedLocation(null);
    setInputValue("");
    setPredictions([]);
  };

  // Handle ZIP code search button click
  const handleZipSearch = () => {
    if (isZipCode(inputValue)) {
      geocodeZipCode(inputValue.trim());
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = () => {
    // If user has typed a ZIP code but hasn't geocoded it yet, do that first
    if (isZipCode(inputValue) && !selectedLocation) {
      geocodeZipCode(inputValue.trim());
      return;
    }
    
    const params = new URLSearchParams();
    
    if (selectedLocation) {
      params.set("lat", selectedLocation.lat.toString());
      params.set("lng", selectedLocation.lng.toString());
      params.set("locationName", selectedLocation.name);
      params.set("distance", "25");
    }
    
    if (selectedFilters.has("household")) {
      params.set("household", "true");
    }
    if (selectedFilters.has("free")) {
      params.set("fee", "Free");
    }
    if (selectedFilters.has("sharps")) {
      params.set("sharps", "true");
    }
    if (selectedFilters.has("retail")) {
      params.set("retail", "true");
    }
    // Material shortcut tags
    const materialShortcuts: FilterKey[] = ["electronics", "batteries", "tires", "cardboard"];
    const activeMaterial = materialShortcuts.find(m => selectedFilters.has(m));
    if (activeMaterial) {
      params.set("material", activeMaterial);
    }
    
    setLocation(`/directory?${params.toString()}`);
  };

  // Check if current input is a valid ZIP code
  const showZipSearchButton = isZipCode(inputValue) && !selectedLocation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-6 md:p-8 mt-8"
    >
      <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-2">
        Search {totalFacilities.toLocaleString()} Recycling Centers
      </h2>
      <p className="text-muted-foreground font-body text-sm mb-6">
        Enter your city, state or ZIP code to find drop-off locations for household recyclables, electronics, hazardous waste, and more.
      </p>

      {/* Search Row */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Location Input */}
        <div className="md:col-span-8 relative">
          <label className="text-sm font-label text-muted-foreground mb-1.5 block">
            Your Location
          </label>
          <div className="relative">
            {selectedLocation ? (
              <div className="flex items-center gap-2 h-10 px-3 bg-green-50 border border-green-200 rounded-md">
                <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700 font-medium truncate">
                  {selectedLocation.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto hover:bg-green-100"
                  onClick={handleClearLocation}
                >
                  <X className="h-4 w-4 text-green-600" />
                </Button>
              </div>
            ) : (
              <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => inputValue && !isZipCode(inputValue) && setShowDropdown(true)}
                  placeholder="Enter city, state or ZIP"
                  className="pl-9 pr-10 font-body"
                  disabled={!mapsReady}
                />
                {(isSearching || isGeocodingZip) && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </>
            )}

            {/* Predictions dropdown */}
            {showDropdown && predictions.length > 0 && !selectedLocation && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto"
              >
                {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3 border-b border-border/50 last:border-0"
                    onClick={() => handleSelectPrediction(prediction)}
                  >
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">
                        {prediction.main_text}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {prediction.secondary_text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* ZIP code hint */}
            {showZipSearchButton && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">Search ZIP code <strong>{inputValue}</strong></span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleZipSearch}
                    disabled={isGeocodingZip}
                    className="font-label"
                  >
                    {isGeocodingZip ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Press Enter or click Search</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="md:col-span-4 flex items-end">
          <Button 
            size="lg" 
            className="w-full font-label bg-primary hover:bg-primary/90"
            onClick={handleSearch}
          >
            Find Recycling Centers
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Quick Filter Chips - up to 2 selectable */}
      <div className="mt-5 pt-5 border-t border-border/50">
        <label className="text-sm font-label text-muted-foreground mb-3 block">
          I'm looking for...
          <span className="ml-2 text-xs opacity-70">(select up to 2)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFilters.has("household") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("household")}
            className={cn(
              "font-label",
              selectedFilters.has("household") && "bg-primary text-primary-foreground"
            )}
          >
            <Home className="h-4 w-4 mr-1.5" />
            Household Drop-off
            <span className="ml-1.5 text-xs opacity-70">(Paper, Plastic, Glass)</span>
          </Button>
          <Button
            variant={selectedFilters.has("free") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("free")}
            className={cn(
              "font-label",
              selectedFilters.has("free") && "bg-primary text-primary-foreground"
            )}
          >
            <span className="mr-1.5">$0</span>
            Free Drop-off Only
          </Button>
          <Button
            variant={selectedFilters.has("sharps") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("sharps")}
            className={cn(
              "font-label",
              selectedFilters.has("sharps") && "bg-primary text-primary-foreground"
            )}
          >
            <Syringe className="h-4 w-4 mr-1.5" />
            Needles / Sharps
          </Button>
          <Button
            variant={selectedFilters.has("retail") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("retail")}
            className={cn(
              "font-label",
              selectedFilters.has("retail") && "bg-primary text-primary-foreground"
            )}
          >
            <Store className="h-4 w-4 mr-1.5" />
            Retail Take-Back
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-muted-foreground self-center mr-1">By material:</span>
          <Button
            variant={selectedFilters.has("electronics") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("electronics")}
            className={cn(
              "font-label text-xs h-7 px-2.5",
              selectedFilters.has("electronics") && "bg-blue-600 text-white hover:bg-blue-700",
              !selectedFilters.has("electronics") && "border-blue-200 text-blue-700 hover:bg-blue-50"
            )}
          >
            <Cpu className="h-3.5 w-3.5 mr-1" />
            Electronics
          </Button>
          <Button
            variant={selectedFilters.has("batteries") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("batteries")}
            className={cn(
              "font-label text-xs h-7 px-2.5",
              selectedFilters.has("batteries") && "bg-amber-600 text-white hover:bg-amber-700",
              !selectedFilters.has("batteries") && "border-amber-200 text-amber-700 hover:bg-amber-50"
            )}
          >
            <Battery className="h-3.5 w-3.5 mr-1" />
            Batteries
          </Button>
          <Button
            variant={selectedFilters.has("tires") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("tires")}
            className={cn(
              "font-label text-xs h-7 px-2.5",
              selectedFilters.has("tires") && "bg-gray-700 text-white hover:bg-gray-800",
              !selectedFilters.has("tires") && "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <CircleDot className="h-3.5 w-3.5 mr-1" />
            Tires
          </Button>
          <Button
            variant={selectedFilters.has("cardboard") ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("cardboard")}
            className={cn(
              "font-label text-xs h-7 px-2.5",
              selectedFilters.has("cardboard") && "bg-yellow-700 text-white hover:bg-yellow-800",
              !selectedFilters.has("cardboard") && "border-yellow-300 text-yellow-800 hover:bg-yellow-50"
            )}
          >
            <Package className="h-3.5 w-3.5 mr-1" />
            Cardboard
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground mt-4">
        Not sure what you can recycle? <a href="/blog/what-can-cannot-be-recycled" className="text-primary hover:underline">Read our recycling guide</a> or <a href="/directory" className="text-primary hover:underline">browse all facilities</a>.
      </p>
    </motion.div>
  );
}
