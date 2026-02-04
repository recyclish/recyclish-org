import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters } from "@/components/SearchFilters";
import { RecyclingCard, generateFacilityId } from "@/components/RecyclingCard";
import { Stats } from "@/components/Stats";
import { HighestRated } from "@/components/HighestRated";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useRecyclingData } from "@/hooks/useRecyclingData";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, MapPin, Recycle, Map, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const { isAuthenticated } = useAuth();
  
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
    userLocation,
    isLocating,
    locationError,
    requestLocation,
    clearFilters,
    activeFilterCount,
    facilities,
  } = useRecyclingData();

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

  return (
    <>
      <Helmet>
        <title>Find Recycling Centers Near You | National Directory</title>
        <meta 
          name="description" 
          content="Search 2,000+ recycling centers across all 50 US states. Free directory for electronics, plastics, glass, paper, hazardous waste, sharps disposal, and more." 
        />
        <meta 
          name="keywords" 
          content="recycling centers, recycling near me, electronics recycling, hazardous waste disposal, sharps disposal, e-waste recycling, plastic recycling, glass recycling, paper recycling, recycling directory, recycling locations, where to recycle, free recycling" 
        />
        <link rel="canonical" href="https://recycling.recyclish.com/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Find Recycling Centers Near You | National Directory" />
        <meta property="og:description" content="Search 2,000+ recycling centers across all 50 US states. Free directory for electronics, hazardous waste, sharps disposal, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://recycling.recyclish.com/" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Recycling Centers Near You | National Directory" />
        <meta name="twitter:description" content="Search 2,000+ recycling centers across all 50 US states." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-label mb-4">
                <Recycle className="h-4 w-4" />
                <span>Free National Directory</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
                Find Recycling Centers{" "}
                <span className="text-primary">Near You</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed mb-6">
                Search our comprehensive directory of over 2,000 recycling facilities across 
                all 50 states. Find the right place to recycle electronics, plastics, glass, 
                paper, textiles, cardboard, metals, clothing, sharps, and more.
              </p>
              
              <div className="flex items-center gap-4 text-sm font-label text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>50 States</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <div className="flex items-center gap-1">
                  <span>14 Categories</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <div className="flex items-center gap-1">
                  <span>EPA Data</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  variant="default" 
                  className="font-label bg-primary hover:bg-primary/90"
                  onClick={() => {
                    requestLocation();
                    // Scroll to search section after requesting location
                    setTimeout(() => {
                      document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  {isLocating ? 'Finding Location...' : 'Near Me'}
                </Button>
                <Link href="/map">
                  <Button variant="outline" className="font-label">
                    <Map className="h-4 w-4 mr-2" />
                    View Map
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button variant="outline" className="font-label">
                    <Recycle className="h-4 w-4 mr-2" />
                    Submit a Facility
                  </Button>
                </Link>
              </div>
              
              {/* Mobile Hero Logo */}
              <div className="lg:hidden mt-8 flex flex-col items-center">
                <span className="text-xs font-label text-muted-foreground tracking-wider uppercase">Powered By</span>
                <a 
                  href="https://recyclish.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:opacity-90 transition-opacity"
                >
                  <img
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/RhcQwfEviabRvpfW.png"
                    alt="Recyclish - Turning Knowledge into Action"
                    className="w-48 sm:w-56 h-auto drop-shadow-lg"
                  />
                </a>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex lg:flex-col lg:items-center absolute right-8 top-4"
          >
            <span className="text-xs font-label text-muted-foreground tracking-wider uppercase">Powered By</span>
            <a 
              href="https://recyclish.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
            >
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/RhcQwfEviabRvpfW.png"
                alt="Recyclish - Turning Knowledge into Action"
                className="w-86 h-auto drop-shadow-xl" style={{ width: '345px' }}
              />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container -mt-8 relative z-10 mb-8">
        <Stats
          totalFacilities={facilities.length}
          totalStates={states.length}
          totalCategories={categories.length}
        />
      </section>

      {/* Highest Rated Section */}
      <HighestRated />

      {/* Search & Results Section */}
      <section id="search-section" className="container pb-16">
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
          states={states}
          categories={categories}
          onClear={clearFilters}
          totalResults={filteredFacilities.length}
          activeFilterCount={activeFilterCount}
          userLocation={userLocation}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
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

      {/* Newsletter Signup Section */}
      <NewsletterSignup />

      <Footer />
      </div>
    </>
  );
}
