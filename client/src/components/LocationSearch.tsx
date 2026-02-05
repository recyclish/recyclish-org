import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, X, Navigation, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

interface LocationSearchProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    displayName: string;
  }) => void;
  currentLocation: { latitude: number; longitude: number } | null;
  isLocating: boolean;
  onUseMyLocation: () => void;
  className?: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

// Load Google Maps script if not already loaded
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
    // Check if already loaded
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

export function LocationSearch({
  onLocationSelect,
  currentLocation,
  isLocating,
  onUseMyLocation,
  className,
}: LocationSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps services
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

  // Fetch place predictions using Google Places Autocomplete Service
  const fetchPredictions = useCallback(async (query: string) => {
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

  // Geocode a place to get coordinates
  const geocodePlace = useCallback(
    async (placeId: string, description: string) => {
      if (!geocoderRef.current) return;

      try {
        geocoderRef.current.geocode({ placeId }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const location = results[0].geometry.location;
            onLocationSelect({
              latitude: location.lat(),
              longitude: location.lng(),
              displayName: description,
            });
            setSelectedLocationName(description);
            setInputValue("");
            setPredictions([]);
            setShowDropdown(false);
          }
        });
      } catch (error) {
        console.error("Error geocoding place:", error);
      }
    },
    [onLocationSelect]
  );

  // Debounced input handler
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowDropdown(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(value);
    }, 300);
  };

  // Handle prediction selection
  const handleSelectPrediction = (prediction: PlacePrediction) => {
    geocodePlace(prediction.place_id, prediction.description);
  };

  // Clear location
  const handleClearLocation = () => {
    setSelectedLocationName(null);
    setInputValue("");
    setPredictions([]);
    onLocationSelect({
      latitude: 0,
      longitude: 0,
      displayName: "",
    });
  };

  // Handle click outside to close dropdown
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

  // Update display when using browser location
  useEffect(() => {
    if (currentLocation && !selectedLocationName) {
      setSelectedLocationName("Your Location");
    }
  }, [currentLocation, selectedLocationName]);

  return (
    <div className={cn("relative", className)}>
      <label className="text-sm font-label text-muted-foreground mb-1.5 block">
        Enter your city or ZIP code
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          {selectedLocationName ? (
            <div className="flex items-center gap-2 h-10 px-3 bg-green-50 border border-green-200 rounded-md">
              <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium truncate">
                {selectedLocationName}
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
                onFocus={() => inputValue && setShowDropdown(true)}
                placeholder="e.g., Austin, TX or 78701"
                className="pl-9 font-body"
                disabled={!mapsReady}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </>
          )}

          {/* Predictions dropdown */}
          {showDropdown && predictions.length > 0 && !selectedLocationName && (
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
        </div>

        {/* Use My Location button */}
        {!selectedLocationName && (
          <Button
            variant="outline"
            size="icon"
            onClick={onUseMyLocation}
            disabled={isLocating}
            className="flex-shrink-0"
            title="Use my current location"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
