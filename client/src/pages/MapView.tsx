import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapView } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  List,
  X,
  Search,
  Loader2,
  Filter,
  Navigation,
} from "lucide-react";
import { useRecyclingData, MATERIAL_TYPES, DISTANCE_OPTIONS } from "@/hooks/useRecyclingData";
import type { RecyclingFacility } from "@/components/RecyclingCard";

const categoryColors: Record<string, string> = {
  "Electronics Recyclers": "#1e4a7a",
  "Material Recovery Facilities (MRFs)": "#c4652a",
  "PlasticRecycling Facilities": "#2a8a8a",
  "GlassRecycling Facilities": "#3a7a9a",
  "GlassSecondary Processors": "#2a6a8a",
  "PaperRecycling Facilities": "#8a7a2a",
  "TextilesRecycling Facilities": "#7a2a7a",
  "WoodRecycling Facilities": "#6a5a2a",
  "WoodSecondary Processors": "#5a4a2a",
  "Retail Take-Back Program": "#e63946",
};

export default function MapViewPage() {
  const {
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
    selectedMaterial,
    setSelectedMaterial,
    selectedDistance,
    setSelectedDistance,
    userLocation,
    isLocating,
    locationError,
    requestLocation,
    clearFilters,
    activeFilterCount,
  } = useRecyclingData();

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<RecyclingFacility | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter facilities with valid coordinates
  const facilitiesWithCoords = useMemo(() => {
    return filteredFacilities.filter(
      (f) => f.Latitude && f.Longitude && f.Latitude !== 0 && f.Longitude !== 0
    );
  }, [filteredFacilities]);

  // Calculate center based on user location or filtered facilities
  const mapCenter = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    if (facilitiesWithCoords.length === 0) {
      return { lat: 39.8283, lng: -98.5795 }; // Center of US
    }
    const avgLat =
      facilitiesWithCoords.reduce((sum, f) => sum + f.Latitude, 0) /
      facilitiesWithCoords.length;
    const avgLng =
      facilitiesWithCoords.reduce((sum, f) => sum + f.Longitude, 0) /
      facilitiesWithCoords.length;
    return { lat: avgLat, lng: avgLng };
  }, [facilitiesWithCoords, userLocation]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];
  }, []);

  // Create user location marker
  const createUserMarker = useCallback((map: google.maps.Map, location: { latitude: number; longitude: number }) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
    }

    const markerContent = document.createElement("div");
    markerContent.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #4285f4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `;

    userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: location.latitude, lng: location.longitude },
      title: "Your Location",
      content: markerContent,
    });
  }, []);

  // Create markers for facilities
  const createMarkers = useCallback(
    (map: google.maps.Map, facilities: RecyclingFacility[]) => {
      clearMarkers();

      facilities.forEach((facility) => {
        if (!facility.Latitude || !facility.Longitude) return;

        const color = categoryColors[facility.Category] || "#c4652a";

        // Create custom marker element
        const markerContent = document.createElement("div");
        markerContent.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transition: transform 0.2s;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: facility.Latitude, lng: facility.Longitude },
          title: facility.Name,
          content: markerContent,
        });

        marker.addListener("click", () => {
          setSelectedFacility(facility);
          map.panTo({ lat: facility.Latitude, lng: facility.Longitude });
        });

        markersRef.current.push(marker);
      });
    },
    [clearMarkers]
  );

  // Handle map ready
  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      setMapReady(true);

      // Set initial zoom for US view
      map.setZoom(4);

      // Create markers
      if (facilitiesWithCoords.length > 0) {
        createMarkers(map, facilitiesWithCoords);
      }

      // Create user location marker if available
      if (userLocation) {
        createUserMarker(map, userLocation);
        map.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
        map.setZoom(10);
      }
    },
    [facilitiesWithCoords, createMarkers, userLocation, createUserMarker]
  );

  // Update markers when filtered facilities change
  const updateMarkers = useCallback(() => {
    if (mapRef.current && mapReady) {
      createMarkers(mapRef.current, facilitiesWithCoords);
    }
  }, [mapReady, facilitiesWithCoords, createMarkers]);

  // Effect to update markers when filters change
  useEffect(() => {
    if (mapReady) {
      updateMarkers();
    }
  }, [mapReady, updateMarkers]);

  // Effect to update user location marker when location changes
  useEffect(() => {
    if (mapRef.current && mapReady && userLocation) {
      createUserMarker(mapRef.current, userLocation);
      mapRef.current.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
      mapRef.current.setZoom(10);
    }
  }, [mapReady, userLocation, createUserMarker]);

  const formatCategory = (cat: string) => {
    return cat
      .replace("Recycling ", "Recycling ")
      .replace("Secondary ", "Secondary ")
      .replace("Recyclers", "Recycling")
      .replace("(MRFs)", "")
      .trim();
  };

  const openMaps = (facility: RecyclingFacility) => {
    const query = encodeURIComponent(facility.Address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Map Header */}
        <div className="bg-card border-b border-border/50 py-4">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Interactive Map
                </h1>
                <p className="text-sm text-muted-foreground">
                  {facilitiesWithCoords.length} facilities with location data
                  {userLocation && selectedDistance !== "any" && " • Sorted by distance"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={userLocation ? "default" : "outline"}
                  size="sm"
                  onClick={requestLocation}
                  disabled={isLocating}
                  className="font-label"
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  {userLocation ? "Located" : "Find Me"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="font-label"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                <Link href="/">
                  <Button variant="outline" size="sm" className="font-label">
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </Button>
                </Link>
              </div>
            </div>

            {locationError && (
              <p className="text-xs text-destructive mt-2">{locationError}</p>
            )}

            {/* Collapsible Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search facilities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
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

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Facility Types" />
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

                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                    <SelectTrigger>
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

                  <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                    <SelectTrigger>
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

                <div className="flex justify-end mt-3">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="font-label">
                    <X className="h-4 w-4 mr-1" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading facilities...</span>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <MapView
              className="w-full h-[calc(100vh-200px)] min-h-[500px]"
              initialCenter={mapCenter}
              initialZoom={userLocation ? 10 : 4}
              onMapReady={handleMapReady}
            />
          )}

          {/* Selected Facility Panel */}
          {selectedFacility && (
            <div className="absolute top-4 right-4 w-80 max-w-[calc(100%-2rem)] z-10">
              <Card className="shadow-lg border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-display leading-tight line-clamp-2">
                      {selectedFacility.Name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 -mt-1 -mr-2"
                      onClick={() => setSelectedFacility(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge
                    className="w-fit text-xs font-label"
                    style={{
                      backgroundColor: categoryColors[selectedFacility.Category] || "#c4652a",
                      color: "white",
                    }}
                  >
                    {formatCategory(selectedFacility.Category)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <span className="line-clamp-2">{selectedFacility.Address}</span>
                  </div>

                  {selectedFacility.distance !== undefined && (
                    <div className="flex items-center gap-1 text-primary font-medium">
                      <Navigation className="h-3 w-3" />
                      {selectedFacility.distance < 1
                        ? "Less than 1 mile away"
                        : `${selectedFacility.distance.toFixed(1)} miles away`}
                    </div>
                  )}

                  {selectedFacility.Phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-accent" />
                      <a
                        href={`tel:${selectedFacility.Phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {selectedFacility.Phone}
                      </a>
                    </div>
                  )}

                  {selectedFacility.Email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-accent" />
                      <a
                        href={`mailto:${selectedFacility.Email}`}
                        className="hover:text-primary transition-colors truncate"
                      >
                        {selectedFacility.Email}
                      </a>
                    </div>
                  )}

                  {selectedFacility.Website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-accent" />
                      <a
                        href={
                          selectedFacility.Website.startsWith("http")
                            ? selectedFacility.Website
                            : `https://${selectedFacility.Website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors truncate flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {selectedFacility.Feedstock && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs font-label text-muted-foreground">
                        Accepts: <span className="text-foreground">{selectedFacility.Feedstock}</span>
                      </span>
                    </div>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    className="w-full mt-2 font-label"
                    onClick={() => openMaps(selectedFacility)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50 max-w-xs">
            <h4 className="font-label text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {Object.entries(categoryColors).slice(0, 6).map(([category, color]) => (
                <div key={category} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-muted-foreground">
                    {formatCategory(category).substring(0, 15)}
                  </span>
                </div>
              ))}
            </div>
            {userLocation && (
              <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full bg-[#4285f4] border-2 border-white shrink-0" />
                <span className="text-muted-foreground">Your Location</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
