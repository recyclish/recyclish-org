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

    if (stateParam) setSelectedState(stateParam);
    if (searchParam) setSearchTerm(searchParam);
    if (latParam && lngParam) {
      setUserLocation({ lat: parseFloat(latParam), lng: parseFloat(lngParam) });
    }
    if (distanceParam) setRadius(parseInt(distanceParam));
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Browse Animal Rescues & Shelters | National Directory</title>
        <meta
          name="description"
          content="Search and browse 8,500+ animal rescues across all 50 US states. Find your new best friend."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-topo-pattern font-body">
        <Header />

        {/* Page Header */}
        <section className="bg-gradient-to-b from-primary/5 to-transparent py-8 border-b border-border/50">
          <div className="container">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Rescue Directory
            </h1>
            <p className="text-muted-foreground">
              Helping you find your local animal rescue and making an impact together.
            </p>
          </div>
        </section>

        {/* Search & Results Section */}
        <section className="container py-8 flex-1">
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

          <div className="flex items-center justify-between mb-6 mt-8">
            <div className="text-sm text-muted-foreground font-medium">
              Showing <strong>{shelters.length.toLocaleString()}</strong> results
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full transition-colors">
                Clear all filters ({activeFilterCount})
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Finding shelters...</span>
            </div>
          ) : dataError ? (
            <div className="text-center py-20">
              <p className="text-destructive font-body">Failed to load directory data.</p>
            </div>
          ) : shelters.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No rescues found</h3>
              <p className="text-muted-foreground mb-4">
                Try expanding your search radius or clearing filters.
              </p>
              <Button onClick={clearFilters} variant="outline" className="rounded-full">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div id="shelter-results" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
              {shelters.map((shelter, idx) => (
                <ShelterCard
                  key={shelter.id}
                  shelter={shelter}
                  index={idx % ITEMS_PER_PAGE}
                />
              ))}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </>
  );
}
