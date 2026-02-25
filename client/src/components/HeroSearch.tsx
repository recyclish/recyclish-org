import { Button } from "@/components/ui/button";
import { Home, ArrowRight, Loader2, PawPrint, Heart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";

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

type FilterKey = "dogs" | "cats" | "nokill";

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
    } else if (inputValue.trim()) {
      // Fallback to keyword search if no location selected
      params.set("q", inputValue.trim());
    }

    const species: string[] = [];
    if (selectedFilters.has("dogs")) species.push("dog");
    if (selectedFilters.has("cats")) species.push("cat");

    if (species.length > 0) {
      params.set("species", species.join(","));
    }

    if (selectedFilters.has("nokill")) {
      params.set("noKill", "true");
    }

    setLocation(`/directory?${params.toString()}`);
  };

  // Check if current input is a valid ZIP code
  const showZipSearchButton = isZipCode(inputValue) && !selectedLocation;

  return (
    <div className="w-full group">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-ocean/10 rounded-lg">
          <Search className="w-3.5 h-3.5 text-ocean" />
        </div>
        <p className="text-xs font-label text-ocean/50 uppercase tracking-widest font-bold">
          Search Directory
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] border-2 border-ocean/10 shadow-2xl shadow-ocean/5 transition-all group-hover:border-terracotta/20 group-hover:shadow-terracotta/5">
        <div className="flex flex-col lg:flex-row gap-2 p-1">
          {/* Location Input Wrapper */}
          <div className="flex-grow flex items-center px-6 gap-3 bg-cream/70 rounded-[1.5rem] border border-ocean/5 relative">
            <Search className="w-5 h-5 text-ocean/30" />
            <div className="flex-grow">
              {selectedLocation ? (
                <div className="flex items-center gap-2 h-14">
                  <span className="text-lg text-ocean font-bold italic truncate">
                    {selectedLocation.name}
                  </span>
                  <button
                    onClick={handleClearLocation}
                    className="p-1 hover:bg-terracotta/10 rounded-full text-terracotta"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => inputValue && !isZipCode(inputValue) && setShowDropdown(true)}
                    placeholder="Find a shelter or rescue near you..."
                    className="bg-transparent border-none text-ocean placeholder:text-ocean/20 h-14 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-lg italic shadow-none"
                  />
                  {(isSearching || isGeocodingZip) && (
                    <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-terracotta" />
                  )}
                </div>
              )}
            </div>

            {/* Predictions dropdown */}
            {showDropdown && predictions.length > 0 && !selectedLocation && (
              <div
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-ocean/10 rounded-2xl shadow-2xl max-h-60 overflow-auto overflow-x-hidden p-2"
              >
                {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    className="w-full px-4 py-3 text-left hover:bg-cream transition-colors flex items-center gap-3 rounded-xl"
                    onClick={() => handleSelectPrediction(prediction)}
                  >
                    <MapPin className="h-4 w-4 text-terracotta flex-shrink-0" />
                    <div>
                      <div className="font-bold text-ocean text-sm">
                        {prediction.main_text}
                      </div>
                      <div className="text-[10px] text-ocean/40 font-label uppercase tracking-widest font-bold">
                        {prediction.secondary_text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="bg-ocean hover:bg-ocean-light text-cream h-14 px-10 font-bold rounded-[1.5rem] transition-all flex items-center gap-2"
            onClick={handleSearch}
          >
            Find Rescues
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="mt-8 flex flex-wrap gap-3">
        {[
          { key: "dogs", label: "Dogs", icon: PawPrint },
          { key: "cats", label: "Cats", icon: Heart },
          { key: "nokill", label: "No-Kill Only", icon: ShieldCheck },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => toggleFilter(filter.key as any)}
            className={cn(
              "px-5 py-2.5 rounded-full font-label text-[10px] uppercase tracking-[0.2em] font-black transition-all border flex items-center gap-2",
              selectedFilters.has(filter.key as any)
                ? "bg-terracotta border-terracotta text-cream shadow-lg shadow-terracotta/20"
                : "bg-white/50 border-ocean/10 text-ocean/60 hover:border-terracotta/30 hover:text-terracotta"
            )}
          >
            {filter.icon && <filter.icon className="h-3 w-3" />}
            {filter.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-ocean/40 font-medium italic">
        * Our high-performance search engine features intelligent filters for pet types, rescue size, and verification status.
        <Link href="/directory" className="text-terracotta hover:underline ml-1">Browse all shelters</Link>
      </p>
    </div>
  );
}
