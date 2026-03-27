import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters } from "@/components/SearchFilters";
import { ShelterCard } from "@/components/ShelterCard";
import { useShelterData } from "@/hooks/useShelterData";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

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
    page,
    setPage,
    hasNextPage,
    hasPrevPage,
    pageSize,
  } = useShelterData();

  // Handle URL parameters for filters
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const stateParam = params.get('state');
    const searchParam = params.get('q');
    const latParam = params.get('lat');
    const lngParam = params.get('lng');
    const distanceParam = params.get('distance');
    const materialsParam = params.get('materials');

    if (stateParam) setSelectedState(stateParam);
    if (searchParam) setSearchTerm(searchParam);
    if (latParam && lngParam) {
      setUserLocation({ lat: parseFloat(latParam), lng: parseFloat(lngParam) });
    }
    if (distanceParam) setRadius(parseInt(distanceParam));
    if (materialsParam) setSelectedSpecies(materialsParam.split(','));
  }, [searchParams]);

  const startItem = page * pageSize + 1;
  const endItem = page * pageSize + (shelters?.length ?? 0);

  return (
    <>
      <Helmet>
        <title>Recycling Center Directory | National Directory of Recycling | Recyclish</title>
        <meta
          name="description"
          content="Search and browse thousands of recycling centers, drop-off locations, and take-back programs across all 50 US states. Find recycling near you."
        />
        <link rel="canonical" href="https://recyclish.info/directory" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
        <Header />

        {/* Page Header */}
        <section className="bg-ocean text-cream py-16 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden lg:block">
            <span className="text-[15vw] font-display font-black leading-none tracking-tighter uppercase italic">Directory</span>
          </div>

          <div className="container relative z-10">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-cream/60 hover:text-cream hover:bg-white/10 font-label uppercase tracking-widest text-[10px] font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight">
              Recycling <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-8">Directory</span>
            </h1>
            <p className="text-xl md:text-2xl text-cream/70 max-w-2xl font-medium leading-relaxed">
              Find verified recycling centers, drop-off locations, and take-back programs across all 50 states.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="relative flex-1 py-12 px-6">
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
                  {shelters.length > 0
                    ? <>Showing <span className="text-terracotta">{startItem}–{endItem}</span> recycling locations</>
                    : <>No results found</>
                  }
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
                <span className="mt-6 text-ocean/50 font-label uppercase tracking-widest text-xs font-bold">Loading Recycling Centers...</span>
              </div>
            ) : dataError ? (
              <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[3rem] border border-ocean/5">
                <p className="text-destructive font-bold text-xl">Connectivity Issue Detected</p>
                <p className="text-ocean/40 mt-2 font-medium">Please refresh the page to try again.</p>
              </div>
            ) : shelters.length === 0 ? (
              <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[3rem] border border-ocean/5">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-ocean/5 mb-6">
                  <MapPin className="h-10 w-10 text-ocean/20" />
                </div>
                <h3 className="font-display text-3xl font-bold text-ocean mb-4">No recycling centers found in this area</h3>
                <p className="text-ocean/40 mb-8 max-w-md mx-auto font-medium">
                  Try expanding your search radius or clearing material filters to see more results.
                </p>
                <Button onClick={clearFilters} className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-10 h-14 font-bold shadow-xl shadow-ocean/20">
                  Reset Search
                </Button>
              </div>
            ) : (
              <>
                <div id="directory-results" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {shelters.map((shelter, idx) => (
                    <ShelterCard
                      key={shelter.id}
                      shelter={shelter}
                      index={idx}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {(hasPrevPage || hasNextPage) && (
                  <div className="mt-16 flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={!hasPrevPage}
                      className="font-label uppercase tracking-widest text-[10px] font-bold border-ocean/20 text-ocean hover:bg-ocean hover:text-cream disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <span className="text-ocean/40 font-label text-xs uppercase tracking-widest font-bold">
                      Page {page + 1}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={!hasNextPage}
                      className="font-label uppercase tracking-widest text-[10px] font-bold border-ocean/20 text-ocean hover:bg-ocean hover:text-cream disabled:opacity-30"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Bottom Brand Bar */}
            {!isLoading && shelters.length > 0 && !hasNextPage && (
              <div className="mt-24 pt-12 border-t border-ocean/5 flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-[2px] bg-terracotta/20 rounded-full" />
                  <div className="text-[10px] font-label text-ocean/30 uppercase tracking-[0.4em] font-black">End of Results</div>
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
