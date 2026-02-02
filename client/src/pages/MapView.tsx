import { useState, useRef, useCallback, useMemo } from "react";
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
} from "lucide-react";
import { useRecyclingData } from "@/hooks/useRecyclingData";
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
    clearFilters,
  } = useRecyclingData();

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<RecyclingFacility | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter facilities with valid coordinates
  const facilitiesWithCoords = useMemo(() => {
    return filteredFacilities.filter(
      (f) => f.Latitude && f.Longitude && f.Latitude !== 0 && f.Longitude !== 0
    );
  }, [filteredFacilities]);

  // Calculate center based on filtered facilities
  const mapCenter = useMemo(() => {
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
  }, [facilitiesWithCoords]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];
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
    },
    [facilitiesWithCoords, createMarkers]
  );

  // Update markers when filtered facilities change
  const updateMarkers = useCallback(() => {
    if (mapRef.current && mapReady) {
      createMarkers(mapRef.current, facilitiesWithCoords);
    }
  }, [mapReady, facilitiesWithCoords, createMarkers]);

  // Effect to update markers when filters change
  useMemo(() => {
    if (mapReady) {
      updateMarkers();
    }
  }, [mapReady, updateMarkers]);

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
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="font-label"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(selectedState !== "all" || selectedCategory !== "all" || searchTerm) && (
                    <Badge variant="secondary" className="ml-2">
                      Active
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

            {/* Collapsible Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
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
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {formatCategory(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={clearFilters} className="font-label">
                    Clear Filters
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
              initialZoom={4}
              onMapReady={handleMapReady}
            />
          )}

          {/* Selected Facility Panel */}
          {selectedFacility && (
            <div className="absolute top-4 right-4 w-80 max-w-[calc(100%-2rem)] z-10">
              <Card className="shadow-xl border-border bg-card">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
