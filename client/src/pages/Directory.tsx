import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters } from "@/components/SearchFilters";
import { RecyclingCard, generateFacilityId } from "@/components/RecyclingCard";
import { useRecyclingData } from "@/hooks/useRecyclingData";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, MapPin, ArrowLeft } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const ITEMS_PER_PAGE = 12;

export default function Directory() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearch();
  
  const {
    filteredFacilities,
    states,
    categories,
    isLoading,
    error: dataError,
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
    facilities,
  } = useRecyclingData();

  // Handle URL parameters for filters
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const stateParam = params.get('state');
    const categoryParam = params.get('category');
    const nearMe = params.get('nearme');
    const household = params.get('household');
    const feeParam = params.get('fee');
    const latParam = params.get('lat');
    const lngParam = params.get('lng');
    const locationNameParam = params.get('locationName');
    const distanceParam = params.get('distance');
    
    if (stateParam) {
      setSelectedState(stateParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (nearMe === 'true') {
      requestLocation();
    }
    if (household === 'true') {
      setHouseholdDropoff(true);
    }
    if (feeParam) {
      setSelectedFee(feeParam);
    }
    const sharpsParam = params.get('sharps');
    if (sharpsParam === 'true') {
      setSharpsFilter(true);
    }
    const retailParam = params.get('retail');
    if (retailParam === 'true') {
      setRetailTakeBack(true);
    }
    const materialParam = params.get('material');
    if (materialParam) {
      setSelectedMaterial(materialParam);
    }
    // Handle location from HeroSearch
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setUserLocation({ latitude: lat, longitude: lng });
        setLocationDisplayName(locationNameParam || 'Selected Location');
        if (distanceParam) {
          setSelectedDistance(distanceParam);
        }
      }
    }
  }, []);

  // Fetch user's favorite IDs
  const { data: favoriteIds, refetch: refetchFavorites } = trpc.favorites.ids.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const favoriteIdSet = new Set(favoriteIds || []);

  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const displayedFacilities = filteredFacilities.slice(0, displayCount);
  const hasMore = displayCount < filteredFacilities.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedState, selectedCategory, selectedMaterial, selectedDistance, selectedDropoff, selectedFee, householdDropoff, userLocation]);

  return (
    <>
      <Helmet>
        <title>Browse All Recycling Centers | National Directory</title>
        <meta 
          name="description" 
          content="Search and browse 2,600+ recycling centers across all 50 US states. Filter by location, material type, and more. Free directory for electronics, plastics, hazardous waste, and sharps disposal." 
        />
        <meta 
          name="keywords" 
          content="recycling centers directory, recycling locations, find recycling near me, electronics recycling, hazardous waste disposal, sharps disposal, e-waste recycling, plastic recycling, recycling search" 
        />
        <link rel="canonical" href="https://recycling.recyclish.com/directory" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Browse All Recycling Centers | National Directory" />
        <meta property="og:description" content="Search and browse 2,600+ recycling centers across all 50 US states." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://recycling.recyclish.com/directory" />
        <meta property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/MHnZhwLgCpRxIMdo.png" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-topo-pattern">
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
              Browse Recycling Centers
            </h1>
            <p className="text-muted-foreground font-body">
              Search and filter through {facilities.length.toLocaleString()} recycling facilities across all 50 states
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
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            selectedDistance={selectedDistance}
            setSelectedDistance={setSelectedDistance}
            selectedDropoff={selectedDropoff}
            setSelectedDropoff={setSelectedDropoff}
            selectedFee={selectedFee}
            setSelectedFee={setSelectedFee}
            householdDropoff={householdDropoff}
            setHouseholdDropoff={setHouseholdDropoff}
            sharpsFilter={sharpsFilter}
            setSharpsFilter={setSharpsFilter}
            retailTakeBack={retailTakeBack}
            setRetailTakeBack={setRetailTakeBack}
            states={states}
            categories={categories}
            onClear={clearFilters}
            totalResults={filteredFacilities.length}
            activeFilterCount={activeFilterCount}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            locationDisplayName={locationDisplayName}
            setLocationDisplayName={setLocationDisplayName}
            isLocating={isLocating}
            locationError={locationError}
            requestLocation={requestLocation}
            facilities={facilities}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground font-body">Loading recycling facilities...</span>
            </div>
          ) : dataError ? (
            <div className="text-center py-20">
              <p className="text-destructive font-body">{dataError}</p>
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No facilities found</h3>
              <p className="text-muted-foreground font-body mb-4">
                Try adjusting your search criteria or clearing filters.
              </p>
              <Button onClick={clearFilters} variant="outline" className="font-label">
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div id="facility-results" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
                {displayedFacilities.map((facility, index) => {
                  const facilityId = generateFacilityId(facility.Name, facility.Address);
                  return (
                    <RecyclingCard
                      key={`${facility.Name}-${facility.Address}-${index}`}
                      facility={facility}
                      index={index % ITEMS_PER_PAGE}
                      isFavorite={favoriteIdSet.has(facilityId)}
                      onFavoriteChange={() => refetchFavorites()}
                    />
                  );
                })}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    size="lg"
                    className="font-label"
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More ({filteredFacilities.length - displayCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        <Footer />
      </div>
    </>
  );
}
