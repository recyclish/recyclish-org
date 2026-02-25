import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters } from "@/components/SearchFilters";
import { ShelterCard } from "@/components/ShelterCard";
import { useShelterData } from "@/hooks/useShelterData";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, MapPin, ArrowLeft } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const ITEMS_PER_PAGE = 24;

export default function Directory() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearch();

  const {
    shelters,
    isLoading,
    error: dataError,
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

  // Handle URL parameters for filters
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const stateParam = params.get('state');
    const searchParam = params.get('q');
    const latParam = params.get('lat');
    const lngParam = params.get('lng');
    const distanceParam = params.get('distance');
    const speciesParam = params.get('species');
    const noKillParam = params.get('noKill');

    if (stateParam) setSelectedState(stateParam);
    if (searchParam) setSearchTerm(searchParam);
    if (latParam && lngParam) {
      setUserLocation({ lat: parseFloat(latParam), lng: parseFloat(lngParam) });
    }
    if (distanceParam) setRadius(parseInt(distanceParam));
    if (speciesParam) setSelectedSpecies(speciesParam.split(','));
    if (noKillParam === 'true') setIsNoKill(true);
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Browse Animal Rescues & Shelters | Animal Rescue Directory</title>
        <meta
          name="description"
          content="Search and browse 8,500+ animal rescues across all 50 US states. Find your new best friend."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
        <Header />

        {/* Page Header - Ocean Style */}
        <section className="bg-ocean text-cream py-16 px-6 relative overflow-hidden">
          {/* Brand Watermark */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden lg:block">
            <span className="text-[15vw] font-display font-black leading-none tracking-tighter uppercase italic">Atlas</span>
          </div>

          <div className="container relative z-10">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-cream/60 hover:text-cream hover:bg-white/10 font-label uppercase tracking-widest text-[10px] font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Discovery
              </Button>
            </Link>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight">
              Rescue <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-8">Directory</span>
            </h1>
            <p className="text-xl md:text-2xl text-cream/70 max-w-2xl font-medium leading-relaxed">
              Discover verified organizations dedicated to animal welfare across all 50 states.
            </p>
          </div>
        </section>

        {/* Content Section with Topo Pattern */}
        <div className="relative flex-1 py-12 px-6">
          {/* Topographic Background Pattern */}
          <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

          <div className="container relative z-10">
            <SearchFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedSpecies={selectedSpecies}
              setSelectedSpecies={setSelectedSpecies}
              isNoKill={isNoKill}
              setIsNoKill={setIsNoKill}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              radius={radius}
              setRadius={setRadius}
              onClear={clearFilters}
              totalResults={shelters.length}
              activeFilterCount={activeFilterCount}
            />

            <div className="flex items-center justify-between mb-8 mt-12 border-b border-ocean/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-terracotta rounded-full" />
                <div className="text-ocean font-label text-xs uppercase tracking-widest font-bold">
                  Found <span className="text-terracotta">{shelters.length.toLocaleString()}</span> Local Rescues
                </div>
              </div>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-terracotta hover:text-terracotta/80 hover:bg-terracotta/5 font-label text-[10px] uppercase tracking-widest font-bold"
                >
                  Clear all filters ({activeFilterCount})
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="absolute inset-0 bg-terracotta/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="h-12 w-12 animate-spin text-terracotta relative z-10" />
                </div>
                <span className="mt-6 text-ocean/50 font-label uppercase tracking-widest text-xs font-bold">Synchronizing Database...</span>
              </div>
            ) : dataError ? (
              <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[3rem] border border-ocean/5">
                <p className="text-destructive font-bold text-xl">Connectivity Issue Detected</p>
                <p className="text-ocean/40 mt-2 font-medium">Please refresh the atlas to try again.</p>
              </div>
            ) : shelters.length === 0 ? (
              <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[3rem] border border-ocean/5">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-ocean/5 mb-6">
                  <MapPin className="h-10 w-10 text-ocean/20" />
                </div>
                <h3 className="font-display text-3xl font-bold text-ocean mb-4">No results found in this area</h3>
                <p className="text-ocean/40 mb-8 max-w-md mx-auto font-medium">
                  Try expanding your search radius or clearing specialized species filters to see more results.
                </p>
                <Button onClick={clearFilters} className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-10 h-14 font-bold shadow-xl shadow-ocean/20">
                  Reset Search Atlas
                </Button>
              </div>
            ) : (
              <div id="shelter-results" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shelters.map((shelter, idx) => (
                  <ShelterCard
                    key={shelter.id}
                    shelter={shelter}
                    index={idx % ITEMS_PER_PAGE}
                  />
                ))}
              </div>
            )}

            {/* Bottom Brand Bar */}
            {!isLoading && shelters.length > 0 && (
              <div className="mt-24 pt-12 border-t border-ocean/5 flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-[2px] bg-terracotta/20 rounded-full" />
                  <div className="text-[10px] font-label text-ocean/30 uppercase tracking-[0.4em] font-black">End of Search Results</div>
                  <div className="w-8 h-[2px] bg-terracotta/20 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
