import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Shelter } from "@/components/ShelterCard";

export const SPECIES_OPTIONS = [
    { value: "dogs", label: "Dogs" },
    { value: "cats", label: "Cats" },
    { value: "rabbits", label: "Rabbits" },
    { value: "birds", label: "Birds" },
    { value: "small_animals", label: "Small Animals" },
];

export const SHELTER_TYPES = [
    { value: "shelter", label: "Public Shelter" },
    { value: "rescue", label: "Private Rescue" },
    { value: "sanctuary", label: "Sanctuary" },
];

export function useShelterData() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
    const [isNoKill, setIsNoKill] = useState<boolean | undefined>(undefined);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState<number>(25);

    const { data: shelters, isLoading, error } = trpc.directory.search.useQuery({
        search: searchTerm || undefined,
        state: selectedState || undefined,
        species: selectedSpecies.length > 0 ? selectedSpecies : undefined,
        noKill: isNoKill,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        radius: (userLocation || /^\d{5}$/.test(searchTerm)) ? radius : undefined,
        limit: 100,
    }, {
        placeholderData: (previousData: any) => previousData,
    });

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedState("");
        setSelectedSpecies([]);
        setIsNoKill(undefined);
        setRadius(25);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (selectedState) count++;
        if (selectedSpecies.length > 0) count++;
        if (isNoKill !== undefined) count++;
        if (userLocation) count++;
        return count;
    }, [searchTerm, selectedState, selectedSpecies, isNoKill, userLocation]);

    return {
        shelters: (shelters || []) as unknown as Shelter[],
        isLoading,
        error,
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
        clearFilters,
        activeFilterCount,
    };
}
