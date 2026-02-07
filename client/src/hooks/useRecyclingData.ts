import { useState, useEffect, useMemo, useCallback } from "react";
import type { RecyclingFacility } from "@/components/RecyclingCard";
import { getDataUrl } from "@/lib/dataVersion";

// Common material types extracted from Feedstock field
export const MATERIAL_TYPES = [
  { value: "electronics", label: "Electronics", keywords: ["electronics", "tvs", "computers", "cell phones", "appliances"] },
  { value: "batteries", label: "Batteries", keywords: ["batteries", "rechargeable", "lead-acid"] },
  { value: "plastic", label: "Plastic", keywords: ["plastic"] },
  { value: "glass", label: "Glass", keywords: ["glass"] },
  { value: "paper", label: "Paper", keywords: ["paper"] },
  { value: "cardboard", label: "Cardboard", keywords: ["cardboard"] },
  { value: "tires", label: "Tires", keywords: ["tires", "tire"] },
  { value: "textiles", label: "Textiles", keywords: ["textiles", "clothing", "fabric"] },
  { value: "wood", label: "Wood", keywords: ["wood"] },
  { value: "ink", label: "Ink & Toner", keywords: ["ink", "toner", "cartridges"] },
  { value: "cfls", label: "CFLs & Light Bulbs", keywords: ["cfls", "light bulbs", "fluorescent"] },
];

// Distance options in miles
export const DISTANCE_OPTIONS = [
  { value: "any", label: "Any Distance" },
  { value: "10", label: "Within 10 miles" },
  { value: "25", label: "Within 25 miles" },
  { value: "50", label: "Within 50 miles" },
  { value: "100", label: "Within 100 miles" },
];

// Drop-off acceptance options
export const DROPOFF_OPTIONS = [
  { value: "all", label: "All Facilities" },
  { value: "Yes", label: "Accepts Drop-offs" },
  { value: "By Appointment", label: "By Appointment Only" },
  { value: "No", label: "No Drop-offs" },
];

// Fee structure options
export const FEE_OPTIONS = [
  { value: "all", label: "Any Fee Structure" },
  { value: "Free", label: "Free" },
  { value: "Fee", label: "Has Fees" },
  { value: "Varies", label: "Fees Vary" },
  { value: "pays", label: "Pays for Materials" },
];

// Household recyclable materials - common items consumers want to drop off
const HOUSEHOLD_MATERIALS = [
  "paper", "cardboard", "plastic", "glass", "aluminum", "steel", "cans",
  "newspaper", "magazines", "mixed paper", "bottles", "containers"
];

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UseRecyclingDataReturn {
  facilities: RecyclingFacility[];
  filteredFacilities: RecyclingFacility[];
  states: string[];
  categories: string[];
  materialTypes: typeof MATERIAL_TYPES;
  dropoffOptions: typeof DROPOFF_OPTIONS;
  feeOptions: typeof FEE_OPTIONS;
  isLoading: boolean;
  error: string | null;
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
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  locationDisplayName: string;
  setLocationDisplayName: (name: string) => void;
  isLocating: boolean;
  locationError: string | null;
  requestLocation: () => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Valid US states and territories
const US_STATES: Record<string, string> = {
  // Full names
  'Alabama': 'Alabama',
  'Alaska': 'Alaska',
  'Arizona': 'Arizona',
  'Arkansas': 'Arkansas',
  'California': 'California',
  'Colorado': 'Colorado',
  'Connecticut': 'Connecticut',
  'Delaware': 'Delaware',
  'Florida': 'Florida',
  'Georgia': 'Georgia',
  'Hawaii': 'Hawaii',
  'Idaho': 'Idaho',
  'Illinois': 'Illinois',
  'Indiana': 'Indiana',
  'Iowa': 'Iowa',
  'Kansas': 'Kansas',
  'Kentucky': 'Kentucky',
  'Louisiana': 'Louisiana',
  'Maine': 'Maine',
  'Maryland': 'Maryland',
  'Massachusetts': 'Massachusetts',
  'Michigan': 'Michigan',
  'Minnesota': 'Minnesota',
  'Mississippi': 'Mississippi',
  'Missouri': 'Missouri',
  'Montana': 'Montana',
  'Nebraska': 'Nebraska',
  'Nevada': 'Nevada',
  'New Hampshire': 'New Hampshire',
  'New Jersey': 'New Jersey',
  'New Mexico': 'New Mexico',
  'New York': 'New York',
  'North Carolina': 'North Carolina',
  'North Dakota': 'North Dakota',
  'Ohio': 'Ohio',
  'Oklahoma': 'Oklahoma',
  'Oregon': 'Oregon',
  'Pennsylvania': 'Pennsylvania',
  'Rhode Island': 'Rhode Island',
  'South Carolina': 'South Carolina',
  'South Dakota': 'South Dakota',
  'Tennessee': 'Tennessee',
  'Texas': 'Texas',
  'Utah': 'Utah',
  'Vermont': 'Vermont',
  'Virginia': 'Virginia',
  'Washington': 'Washington',
  'West Virginia': 'West Virginia',
  'Wisconsin': 'Wisconsin',
  'Wyoming': 'Wyoming',
  'District of Columbia': 'District of Columbia',
  'Puerto Rico': 'Puerto Rico',
  'Guam': 'Guam',
  'U.S. Virgin Islands': 'U.S. Virgin Islands',
  // Abbreviations
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia',
  'PR': 'Puerto Rico',
  'GU': 'Guam',
  'VI': 'U.S. Virgin Islands',
};

// Normalize state value to full state name
function normalizeState(state: string): string {
  if (!state) return '';
  const trimmed = state.trim();
  return US_STATES[trimmed] || '';
}

// Check if facility accepts household recyclables
function acceptsHouseholdRecyclables(facility: RecyclingFacility): boolean {
  const feedstockLower = (facility.Feedstock || "").toLowerCase();
  const categoryLower = (facility.Category || "").toLowerCase();
  
  // Municipal recycling centers typically accept household items
  if (categoryLower.includes("municipal")) {
    return true;
  }
  
  // Check if feedstock mentions common household materials
  const matchCount = HOUSEHOLD_MATERIALS.filter(
    material => feedstockLower.includes(material)
  ).length;
  
  // If it accepts 3+ household materials, consider it a household drop-off
  return matchCount >= 3;
}

// Priority ranking for default sort order (lower = higher priority)
// Prioritizes consumer-friendly drop-off locations, pushes commercial/electronics to bottom
function getFacilityPriority(facility: RecyclingFacility): number {
  const categoryLower = (facility.Category || "").toLowerCase();
  const nameLower = (facility.Name || "").toLowerCase();
  const feedstockLower = (facility.Feedstock || "").toLowerCase();
  const dropoff = facility.Accepts_Dropoff || "";
  const fee = facility.Fee_Structure || "";
  
  // Tier 1: Free municipal/household drop-off sites (most consumer-friendly)
  if ((categoryLower.includes("municipal") || acceptsHouseholdRecyclables(facility)) &&
      dropoff === "Yes" && fee === "Free") {
    return 1;
  }
  
  // Tier 2: Free drop-off sites (any type)
  if (dropoff === "Yes" && fee === "Free") {
    return 2;
  }
  
  // Tier 3: Sharps/needles disposal (important for health/safety)
  if (categoryLower.includes("sharps") || feedstockLower.includes("sharps") ||
      feedstockLower.includes("needle") || nameLower.includes("sharps")) {
    return 3;
  }
  
  // Tier 4: Retail take-back programs (convenient for consumers)
  if (categoryLower.includes("retail") || categoryLower.includes("take-back") ||
      nameLower.includes("best buy") || nameLower.includes("staples") ||
      nameLower.includes("home depot") || nameLower.includes("goodwill") ||
      nameLower.includes("salvation army")) {
    return 4;
  }
  
  // Tier 5: Other drop-off accepting facilities
  if (dropoff === "Yes") {
    return 5;
  }
  
  // Tier 6: General recycling facilities
  if (!categoryLower.includes("commercial") && !categoryLower.includes("secondary") &&
      !categoryLower.includes("electronics")) {
    return 6;
  }
  
  // Tier 7: Electronics recyclers (pushed lower)
  if (categoryLower.includes("electronics")) {
    return 7;
  }
  
  // Tier 8: Commercial/secondary recyclers (pushed to bottom)
  return 8;
}

export function useRecyclingData(): UseRecyclingDataReturn {
  const [facilities, setFacilities] = useState<RecyclingFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("any");
  const [selectedDropoff, setSelectedDropoff] = useState("all");
  const [selectedFee, setSelectedFee] = useState("all");
  const [householdDropoff, setHouseholdDropoff] = useState(false);
  const [sharpsFilter, setSharpsFilter] = useState(false);
  const [retailTakeBack, setRetailTakeBack] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationDisplayName, setLocationDisplayName] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(getDataUrl());
        if (!response.ok) {
          throw new Error("Failed to load recycling data");
        }
        const text = await response.text();
        const parsed = parseCSV(text);
        setFacilities(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationDisplayName("Your Location");
        setIsLocating(false);
        // Auto-set distance when location is obtained
        if (selectedDistance === "any") {
          setSelectedDistance("25");
        }
      },
      (error) => {
        let message = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        setLocationError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [selectedDistance]);

  const states = useMemo(() => {
    // Normalize and filter to only valid US states
    const normalizedStates = facilities
      .map((f) => normalizeState(f.State))
      .filter(Boolean);
    const uniqueStates = Array.from(new Set(normalizedStates));
    return uniqueStates.sort();
  }, [facilities]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(facilities.map((f) => f.Category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    return facilities
      .map((facility) => {
        // Calculate distance if user location is available
        let distance: number | undefined;
        if (userLocation && facility.Latitude && facility.Longitude) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            facility.Latitude,
            facility.Longitude
          );
        }
        return { ...facility, distance };
      })
      .filter((facility) => {
        // Search term filter
        const matchesSearch =
          !searchTerm ||
          facility.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.Address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.State?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.Feedstock?.toLowerCase().includes(searchTerm.toLowerCase());

        // State filter (normalize facility state for comparison)
        const normalizedFacilityState = normalizeState(facility.State);
        const matchesState = selectedState === "all" || normalizedFacilityState === selectedState;

        // Category filter
        const matchesCategory = selectedCategory === "all" || facility.Category === selectedCategory;

        // Material type filter
        let matchesMaterial = selectedMaterial === "all";
        if (!matchesMaterial) {
          const materialType = MATERIAL_TYPES.find(m => m.value === selectedMaterial);
          if (materialType) {
            const feedstockLower = (facility.Feedstock || "").toLowerCase();
            const categoryLower = (facility.Category || "").toLowerCase();
            matchesMaterial = materialType.keywords.some(
              keyword => feedstockLower.includes(keyword) || categoryLower.includes(keyword)
            );
          }
        }

        // Distance filter
        let matchesDistance = selectedDistance === "any";
        if (!matchesDistance && userLocation) {
          // When user has selected a location and distance filter is active
          if (facility.distance !== undefined) {
            const maxDistance = parseInt(selectedDistance, 10);
            matchesDistance = facility.distance <= maxDistance;
          } else {
            // Exclude facilities without coordinates when distance filtering is active
            matchesDistance = false;
          }
        } else if (!matchesDistance && !userLocation) {
          // If no user location set, include all (distance filter not applicable)
          matchesDistance = true;
        }

        // Drop-off filter
        let matchesDropoff = selectedDropoff === "all";
        if (!matchesDropoff) {
          matchesDropoff = facility.Accepts_Dropoff === selectedDropoff;
        }

        // Fee filter
        let matchesFee = selectedFee === "all";
        if (!matchesFee) {
          if (selectedFee === "pays") {
            matchesFee = facility.Offers_Payment === "Yes";
          } else {
            matchesFee = facility.Fee_Structure === selectedFee;
          }
        }

        // Household drop-off filter
        let matchesHousehold = !householdDropoff;
        if (householdDropoff) {
          matchesHousehold = acceptsHouseholdRecyclables(facility) && 
            (facility.Accepts_Dropoff === "Yes" || facility.Accepts_Dropoff === "By Appointment");
        }

        // Sharps/Needles filter
        let matchesSharps = !sharpsFilter;
        if (sharpsFilter) {
          const feedstockLower = (facility.Feedstock || "").toLowerCase();
          const categoryLower = (facility.Category || "").toLowerCase();
          const nameLower = (facility.Name || "").toLowerCase();
          matchesSharps = feedstockLower.includes("sharps") || 
            feedstockLower.includes("needle") || 
            feedstockLower.includes("syringe") ||
            categoryLower.includes("sharps") ||
            categoryLower.includes("needle") ||
            nameLower.includes("sharps") ||
            nameLower.includes("needle");
        }

        // Retail Take-Back filter
        let matchesRetail = !retailTakeBack;
        if (retailTakeBack) {
          const nameLower = (facility.Name || "").toLowerCase();
          const categoryLower = (facility.Category || "").toLowerCase();
          const typeLower = (facility.Facility_Type || "").toLowerCase();
          matchesRetail = nameLower.includes("best buy") ||
            nameLower.includes("staples") ||
            nameLower.includes("home depot") ||
            nameLower.includes("lowe") ||
            nameLower.includes("walmart") ||
            nameLower.includes("target") ||
            nameLower.includes("batteries plus") ||
            nameLower.includes("office depot") ||
            nameLower.includes("goodwill") ||
            nameLower.includes("salvation army") ||
            categoryLower.includes("retail") ||
            categoryLower.includes("take-back") ||
            categoryLower.includes("takeback") ||
            typeLower.includes("retail") ||
            typeLower.includes("take-back") ||
            typeLower.includes("store");
        }

        return matchesSearch && matchesState && matchesCategory && matchesMaterial && 
               matchesDistance && matchesDropoff && matchesFee && matchesHousehold && matchesSharps && matchesRetail;
      })
      .sort((a, b) => {
        // When distance is available, use distance as primary sort
        // with priority as secondary sort for facilities at similar distances
        if (a.distance !== undefined && b.distance !== undefined) {
          const distDiff = a.distance - b.distance;
          // If distances are meaningfully different (>0.5 miles apart), sort by distance
          if (Math.abs(distDiff) > 0.5) {
            return distDiff;
          }
          // For facilities at similar distances, use priority as tiebreaker
          const priorityA = getFacilityPriority(a);
          const priorityB = getFacilityPriority(b);
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          return distDiff;
        }
        
        // When no distance sorting available, always apply priority sorting
        // This ensures consumer-friendly facilities appear first by default
        const priorityA = getFacilityPriority(a);
        const priorityB = getFacilityPriority(b);
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Final tiebreaker: alphabetical by name
        return (a.Name || "").localeCompare(b.Name || "");
      });
  }, [facilities, searchTerm, selectedState, selectedCategory, selectedMaterial, 
      selectedDistance, selectedDropoff, selectedFee, householdDropoff, sharpsFilter, retailTakeBack, userLocation]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedState !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedMaterial !== "all") count++;
    if (selectedDistance !== "any") count++;
    if (selectedDropoff !== "all") count++;
    if (selectedFee !== "all") count++;
    if (householdDropoff) count++;
    if (sharpsFilter) count++;
    if (retailTakeBack) count++;
    if (userLocation) count++;
    return count;
  }, [searchTerm, selectedState, selectedCategory, selectedMaterial, 
      selectedDistance, selectedDropoff, selectedFee, householdDropoff, sharpsFilter, retailTakeBack, userLocation]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedState("all");
    setSelectedCategory("all");
    setSelectedMaterial("all");
    setSelectedDistance("any");
    setSelectedDropoff("all");
    setSelectedFee("all");
    setHouseholdDropoff(false);
    setSharpsFilter(false);
    setRetailTakeBack(false);
    setUserLocation(null);
    setLocationDisplayName("");
  };

  return {
    facilities,
    filteredFacilities,
    states,
    categories,
    materialTypes: MATERIAL_TYPES,
    dropoffOptions: DROPOFF_OPTIONS,
    feeOptions: FEE_OPTIONS,
    isLoading,
    error,
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
    userLocation,
    setUserLocation,
    locationDisplayName,
    setLocationDisplayName,
    isLocating,
    locationError,
    requestLocation,
    clearFilters,
    activeFilterCount,
  };
}

function parseCSV(text: string): RecyclingFacility[] {
  const lines = text.split("\n");
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1).filter(line => line.trim()).map((line) => {
    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });
    return {
      Name: obj.Name || "",
      Address: obj.Address || "",
      State: obj.State || "",
      County: obj.County || "",
      Phone: obj.Phone || "",
      Email: obj.Email || "",
      Website: obj.Website || "",
      Category: obj.Category || "",
      Facility_Type: obj.Facility_Type || "",
      Feedstock: obj.Feedstock || "",
      Latitude: parseFloat(obj.Latitude) || 0,
      Longitude: parseFloat(obj.Longitude) || 0,
      NAICS_Code: obj.NAICS_Code || "",
      Hours: obj.Hours || "",
      Accepts_Dropoff: obj.Accepts_Dropoff || "",
      Fee_Structure: obj.Fee_Structure || "",
      Fee_Details: obj.Fee_Details || "",
      Offers_Payment: obj.Offers_Payment || "",
      Payment_Details: obj.Payment_Details || "",
    } as RecyclingFacility;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
