import { useState, useEffect, useMemo } from "react";
import type { RecyclingFacility } from "@/components/RecyclingCard";

interface UseRecyclingDataReturn {
  facilities: RecyclingFacility[];
  filteredFacilities: RecyclingFacility[];
  states: string[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedState: string;
  setSelectedState: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  clearFilters: () => void;
}

export function useRecyclingData(): UseRecyclingDataReturn {
  const [facilities, setFacilities] = useState<RecyclingFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/data/master_recycling_directory.csv");
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

  const states = useMemo(() => {
    const uniqueStates = Array.from(new Set(facilities.map((f) => f.State).filter(Boolean)));
    return uniqueStates.sort();
  }, [facilities]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(facilities.map((f) => f.Category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesSearch =
        !searchTerm ||
        facility.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.Address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.State?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = selectedState === "all" || facility.State === selectedState;
      const matchesCategory = selectedCategory === "all" || facility.Category === selectedCategory;

      return matchesSearch && matchesState && matchesCategory;
    });
  }, [facilities, searchTerm, selectedState, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedState("all");
    setSelectedCategory("all");
  };

  return {
    facilities,
    filteredFacilities,
    states,
    categories,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedState,
    setSelectedState,
    selectedCategory,
    setSelectedCategory,
    clearFilters,
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
