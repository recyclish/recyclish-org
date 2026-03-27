import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Shelter } from "@/components/ShelterCard";

export const PAGE_SIZE = 25;

export const SPECIES_OPTIONS = [
  { value: "Electronics", label: "Electronics" },
  { value: "Plastic", label: "Plastic" },
  { value: "Metal", label: "Metal" },
  { value: "Glass", label: "Glass" },
  { value: "Paper", label: "Paper" },
  { value: "Batteries", label: "Batteries" },
  { value: "Hazardous Waste", label: "Hazardous Waste" },
  { value: "Composting", label: "Composting / Organics" },
];

export const SHELTER_TYPES = [
  { value: "Drop-off Center", label: "Drop-off Center" },
  { value: "Curbside Pickup", label: "Curbside Pickup" },
  { value: "Retail Take-Back", label: "Retail Take-Back" },
  { value: "Hazardous Waste", label: "Hazardous Waste" },
  { value: "E-Waste", label: "E-Waste" },
  { value: "Composting", label: "Composting" },
  { value: "Scrap Metal", label: "Scrap Metal" },
  { value: "Transfer Station", label: "Transfer Station" },
  { value: "Material Recovery Facility", label: "Material Recovery Facility" },
  { value: "Municipal Recycling", label: "Municipal Recycling" },
];

export function useShelterData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [isNoKill, setIsNoKill] = useState<boolean | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(25);
  const [page, setPage] = useState(0);

  // Reset to page 0 whenever filters change
  const resetPage = () => setPage(0);

  const { data: shelters, isLoading, error } = trpc.directory.search.useQuery(
    {
      search: searchTerm || undefined,
      state: selectedState || undefined,
      species: selectedSpecies.length > 0 ? selectedSpecies : undefined,
      type: selectedType || undefined,
      noKill: isNoKill,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      radius: (userLocation || /^\d{5}$/.test(searchTerm)) ? radius : undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    },
    {
      placeholderData: (previousData: any) => previousData,
    }
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedState("");
    setSelectedSpecies([]);
    setIsNoKill(undefined);
    setSelectedType(undefined);
    setRadius(25);
    setPage(0);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedState) count++;
    if (selectedSpecies.length > 0) count++;
    if (isNoKill !== undefined) count++;
    if (selectedType) count++;
    if (userLocation) count++;
    return count;
  }, [searchTerm, selectedState, selectedSpecies, isNoKill, selectedType, userLocation]);

  const hasNextPage = (shelters?.length ?? 0) === PAGE_SIZE;
  const hasPrevPage = page > 0;

  return {
    shelters: (shelters || []) as unknown as Shelter[],
    isLoading,
    error,
    searchTerm,
    setSearchTerm: (v: string) => { setSearchTerm(v); resetPage(); },
    selectedState,
    setSelectedState: (v: string) => { setSelectedState(v); resetPage(); },
    selectedSpecies,
    setSelectedSpecies: (v: string[]) => { setSelectedSpecies(v); resetPage(); },
    isNoKill,
    setIsNoKill: (v: boolean | undefined) => { setIsNoKill(v); resetPage(); },
    selectedType,
    setSelectedType: (v: string | undefined) => { setSelectedType(v); resetPage(); },
    userLocation,
    setUserLocation,
    radius,
    setRadius: (v: number) => { setRadius(v); resetPage(); },
    clearFilters,
    activeFilterCount,
    // Pagination
    page,
    setPage,
    hasNextPage,
    hasPrevPage,
    pageSize: PAGE_SIZE,
  };
}
