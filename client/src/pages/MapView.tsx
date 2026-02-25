import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapView } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  List,
  X,
  Loader2,
  Filter,
  Navigation,
  ArrowLeft,
  Heart,
  ShieldCheck,
  Compass
} from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import { useShelterData } from "@/hooks/useShelterData";
import type { Shelter } from "@/components/ShelterCard";
import { motion, AnimatePresence } from "framer-motion";

const shelterTypeColors: Record<string, string> = {
  "Public Shelter": "#1e4a7a",
  "Private Rescue": "#c4652a",
  "Sanctuary": "#2a8a8a",
  "Humane Society": "#3a7a9a",
  "Rescue": "#c4652a",
};

export default function MapViewPage() {
  const {
    shelters,
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
  } = useShelterData();

  const isMobile = useIsMobile();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter shelters with valid coordinates
  const sheltersWithCoords = useMemo(() => {
    return shelters.filter(
      (s) => s.latitude && s.longitude && s.latitude !== 0 && s.longitude !== 0
    );
  }, [shelters]);

  // Calculate center based on user location or filtered shelters
  const mapCenter = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    if (sheltersWithCoords.length === 0) {
      return { lat: 39.8283, lng: -98.5795 }; // Center of US
    }
    // Optimization: if many shelters, just center on the first few or a known good center
    return { lat: sheltersWithCoords[0].latitude, lng: sheltersWithCoords[0].longitude };
  }, [sheltersWithCoords, userLocation]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];
  }, []);

  // Create user location marker
  const createUserMarker = useCallback((map: google.maps.Map, location: { lat: number; lng: number }) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
    }

    const markerContent = document.createElement("div");
    markerContent.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #c4652a;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(196, 101, 42, 0.4);
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
      position: location,
      title: "Your Sanctuary",
      content: markerContent,
    });
  }, []);

  // Create markers for shelters
  const createMarkers = useCallback(
    (map: google.maps.Map, shelters: Shelter[]) => {
      clearMarkers();

      shelters.forEach((shelter) => {
        if (!shelter.latitude || !shelter.longitude) return;

        const color = shelterTypeColors[shelter.shelterType] || "#1e4a7a";

        const markerContent = document.createElement("div");
        markerContent.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: rotate(45deg);
          ">
            <div style="transform: rotate(-45deg)">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
               </svg>
            </div>
          </div>
        `;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: shelter.latitude, lng: shelter.longitude },
          title: shelter.name,
          content: markerContent,
        });

        marker.addListener("click", () => {
          setSelectedShelter(shelter);
          map.panTo({ lat: shelter.latitude, lng: shelter.longitude });
          const currentZoom = map.getZoom();
          if (currentZoom !== undefined && currentZoom < 12) {
            map.setZoom(12);
          }
        });

        markersRef.current.push(marker);
      });
    },
    [clearMarkers]
  );

  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      setMapReady(true);

      if (sheltersWithCoords.length > 0) {
        createMarkers(map, sheltersWithCoords);
      }

      if (userLocation) {
        createUserMarker(map, userLocation);
        map.setCenter(userLocation);
        map.setZoom(10);
      }
    },
    [sheltersWithCoords, createMarkers, userLocation, createUserMarker]
  );

  useEffect(() => {
    if (mapReady && mapRef.current) {
      createMarkers(mapRef.current, sheltersWithCoords);
    }
  }, [mapReady, sheltersWithCoords, createMarkers]);

  useEffect(() => {
    if (mapRef.current && mapReady && userLocation) {
      createUserMarker(mapRef.current, userLocation);
      mapRef.current.setCenter(userLocation);
      mapRef.current.setZoom(10);
    }
  }, [mapReady, userLocation, createUserMarker]);

  const openMaps = (shelter: Shelter) => {
    const address = `${shelter.addressLine1}, ${shelter.city}, ${shelter.state}`;
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
      <Header />

      <main className="flex-1 flex flex-col relative">
        {/* Map Interface Overlay - Header */}
        <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none">
          <div className="container px-0 flex flex-col gap-4">
            <div className={`flex items-start justify-between pointer-events-auto ${isMobile ? 'gap-2' : ''}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-ocean text-cream rounded-[1.5rem] lg:rounded-[2rem] ${isMobile ? 'p-3' : 'p-6'} shadow-2xl flex items-center gap-3 lg:gap-6 border border-white/10`}
              >
                <div className={`${isMobile ? 'p-2' : 'p-3'} bg-terracotta rounded-xl shadow-lg`}>
                  <Compass className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'}`} />
                </div>
                <div>
                  <h1 className={`${isMobile ? 'text-sm' : 'text-2xl'} font-display font-bold leading-none mb-1`}>Rescue Atlas</h1>
                  <p className="text-[8px] lg:text-[10px] font-label uppercase tracking-widest text-cream/40 font-black">
                    {sheltersWithCoords.length} Node{isMobile ? '' : 's Synced'}
                  </p>
                </div>
              </motion.div>

              <div className={`flex ${isMobile ? 'flex-col' : 'gap-3'} gap-2`}>
                <Link href="/directory">
                  <Button className={`bg-white/80 backdrop-blur-xl text-ocean hover:bg-white rounded-xl lg:rounded-2xl ${isMobile ? 'h-10 px-3 text-xs' : 'h-14 px-6 font-bold'} shadow-xl border border-ocean/5 transition-all`}>
                    <List className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} lg:mr-2`} />
                    <span className={isMobile ? 'sr-only lg:not-sr-only' : ''}>List</span>
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${showFilters ? 'bg-terracotta text-cream' : 'bg-white/80 backdrop-blur-xl text-ocean'} rounded-xl lg:rounded-2xl ${isMobile ? 'h-10 px-3 text-xs' : 'h-14 px-6 font-bold'} shadow-xl border border-ocean/5 transition-all`}
                >
                  <Filter className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} lg:mr-2`} />
                  <span className={isMobile ? 'sr-only lg:not-sr-only' : ''}>Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 lg:ml-2 bg-ocean text-cream border-none h-4 w-4 lg:h-5 lg:w-5 p-0 flex items-center justify-center rounded-full text-[8px] lg:text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white/90 backdrop-blur-2xl ${isMobile ? 'p-4 rounded-[1.5rem]' : 'p-8 rounded-[2.5rem]'} shadow-2xl border border-ocean/5 pointer-events-auto max-h-[60vh] overflow-y-auto`}
                >
                  <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-black ml-1">Search Keywords</label>
                      <div className="relative">
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search by name..."
                          className="w-full bg-cream/50 border-none rounded-2xl px-5 h-12 text-ocean placeholder:text-ocean/20 focus:ring-2 focus:ring-terracotta/20 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-black ml-1">Universal Search Radius</label>
                      <Select value={radius.toString()} onValueChange={(v) => setRadius(parseInt(v))}>
                        <SelectTrigger className="bg-cream/50 border-none rounded-2xl h-12 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-ocean/5 shadow-2xl">
                          <SelectItem value="10">Within 10 miles</SelectItem>
                          <SelectItem value="25">Within 25 miles</SelectItem>
                          <SelectItem value="50">Within 50 miles</SelectItem>
                          <SelectItem value="100">Within 100 miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-black ml-1">Sanctuary Type</label>
                      <Select value={isNoKill === undefined ? "all" : isNoKill.toString()} onValueChange={(v) => setIsNoKill(v === "all" ? undefined : v === "true")}>
                        <SelectTrigger className="bg-cream/50 border-none rounded-2xl h-12 font-medium">
                          <SelectValue placeholder="All Ethics" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-ocean/5 shadow-2xl">
                          <SelectItem value="all">All Ethics</SelectItem>
                          <SelectItem value="true">No-Kill Only</SelectItem>
                          <SelectItem value="false">Standard Shelters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="w-full h-12 text-ocean/40 hover:text-terracotta font-label uppercase tracking-widest text-[10px] font-black"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reset Atlas
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 min-h-[600px] h-[calc(100vh-80px)]">
          {isLoading && !mapReady ? (
            <div className="absolute inset-0 flex items-center justify-center bg-cream z-30">
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
                <span className="text-ocean/30 font-label uppercase tracking-widest text-xs font-black">
                  Synchronizing Mobi Geodata...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center z-30">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-terracotta/20 text-center max-w-sm">
                <p className="text-terracotta font-bold text-lg mb-4">{error?.message || "An unexpected error occurred"}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Retry Connection</Button>
              </div>
            </div>
          ) : null}

          <MapView
            className="w-full h-full"
            initialCenter={mapCenter}
            initialZoom={userLocation ? 10 : 4}
            onMapReady={handleMapReady}
          />

          {/* Legend Overlay - Hide on Mobile */}
          {!isMobile && (
            <div className="absolute bottom-10 left-10 z-20">
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-ocean/5 w-64">
                <h4 className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/30 mb-4">Atlas Legend</h4>
                <div className="space-y-3">
                  {Object.entries(shelterTypeColors).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                      <span className="text-xs font-bold text-ocean/60">{type}</span>
                    </div>
                  ))}
                  {userLocation && (
                    <div className="flex items-center gap-3 pt-2 border-t border-ocean/5">
                      <div className="w-3 h-3 rounded-full bg-terracotta border-2 border-white shadow-sm" />
                      <span className="text-xs font-bold text-ocean/60">Your Sanctuary</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detail Side Panel */}
          <AnimatePresence>
            {selectedShelter && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
                className={`absolute ${isMobile ? 'bottom-20 left-4 right-4 h-[45vh]' : 'top-6 bottom-6 right-6 w-96'} z-30 pointer-events-none`}
              >
                <Card className={`h-full bg-white/95 backdrop-blur-2xl shadow-2xl border-none ${isMobile ? 'rounded-t-[2.5rem] rounded-b-none' : 'rounded-[3.5rem]'} overflow-hidden pointer-events-auto flex flex-col`}>
                  <div className="h-2 bg-terracotta" />

                  <div className={`${isMobile ? 'p-6' : 'p-10'} flex-1 overflow-y-auto custom-scrollbar`}>
                    <div className={`flex justify-between items-start ${isMobile ? 'mb-4' : 'mb-8'}`}>
                      <Badge className="bg-ocean/5 text-ocean/40 border-none px-4 py-1.5 rounded-full text-[9px] font-label font-black uppercase tracking-widest">
                        {selectedShelter.shelterType}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedShelter(null)}
                        className="rounded-full hover:bg-ocean/5 text-ocean/20 hover:text-ocean"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <h2 className="font-display text-4xl font-bold text-ocean mb-8 leading-tight">
                      {selectedShelter.name}
                    </h2>

                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-cream/50 border border-ocean/5">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-terracotta" />
                          </div>
                          <div>
                            <p className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-black mb-1">Mapping Node</p>
                            <p className="text-sm font-bold text-ocean leading-relaxed">{selectedShelter.addressLine1}</p>
                            <p className="text-xs text-ocean/40 font-medium">{selectedShelter.city}, {selectedShelter.state}</p>
                          </div>
                        </div>

                        {selectedShelter.phone && (
                          <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-white border border-ocean/5 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-ocean/5 flex items-center justify-center shrink-0">
                              <Phone className="h-4 w-4 text-ocean" />
                            </div>
                            <div>
                              <p className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-black mb-0.5">Primary Line</p>
                              <p className="text-sm font-bold text-ocean">{selectedShelter.phone}</p>
                            </div>
                          </div>
                        )}

                        {selectedShelter.website && (
                          <a
                            href={selectedShelter.website.startsWith('http') ? selectedShelter.website : `https://${selectedShelter.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-5 rounded-[2rem] bg-white border border-ocean/5 shadow-sm hover:border-terracotta/20 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-ocean/5 flex items-center justify-center shrink-0 group-hover:bg-terracotta group-hover:text-cream transition-all">
                              <Globe className="h-4 w-4" />
                            </div>
                            <div className="flex-1 truncate">
                              <p className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-black mb-0.5">Registry Link</p>
                              <p className="text-sm font-bold text-ocean flex items-center gap-2">
                                Open Website <ExternalLink className="h-3 w-3" />
                              </p>
                            </div>
                          </a>
                        )}
                      </div>

                      <div className="pt-8 border-t border-ocean/5">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-1 h-5 bg-terracotta rounded-full" />
                          <h4 className="text-[10px] font-label uppercase tracking-widest text-ocean/40 font-black font-bold">Verification Standard</h4>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-ocean text-cream rounded-2xl shadow-xl shadow-ocean/20">
                          <ShieldCheck className="h-5 w-5 text-terracotta" />
                          <span className="text-[10px] font-label uppercase tracking-widest font-black">Mobi Certified Sync</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-cream/30 border-t border-ocean/5">
                    <div className="flex gap-4">
                      <Button
                        onClick={() => openMaps(selectedShelter)}
                        className="flex-1 h-14 bg-ocean hover:bg-ocean-light text-cream rounded-2xl font-bold transition-all shadow-lg"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                      <Link href={`/shelter/${selectedShelter.id}`} className="flex-1">
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-ocean/10 text-ocean hover:bg-white font-bold transition-all">
                          Full Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
