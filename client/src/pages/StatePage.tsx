import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecyclingCard } from "@/components/RecyclingCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, MapPin, ChevronRight, Building2, Recycle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRecyclingData } from "@/hooks/useRecyclingData";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Helmet } from "react-helmet-async";

// State data with slugs and full names
const STATE_DATA: Record<string, { name: string; abbreviation: string }> = {
  "alabama": { name: "Alabama", abbreviation: "AL" },
  "alaska": { name: "Alaska", abbreviation: "AK" },
  "arizona": { name: "Arizona", abbreviation: "AZ" },
  "arkansas": { name: "Arkansas", abbreviation: "AR" },
  "california": { name: "California", abbreviation: "CA" },
  "colorado": { name: "Colorado", abbreviation: "CO" },
  "connecticut": { name: "Connecticut", abbreviation: "CT" },
  "delaware": { name: "Delaware", abbreviation: "DE" },
  "florida": { name: "Florida", abbreviation: "FL" },
  "georgia": { name: "Georgia", abbreviation: "GA" },
  "hawaii": { name: "Hawaii", abbreviation: "HI" },
  "idaho": { name: "Idaho", abbreviation: "ID" },
  "illinois": { name: "Illinois", abbreviation: "IL" },
  "indiana": { name: "Indiana", abbreviation: "IN" },
  "iowa": { name: "Iowa", abbreviation: "IA" },
  "kansas": { name: "Kansas", abbreviation: "KS" },
  "kentucky": { name: "Kentucky", abbreviation: "KY" },
  "louisiana": { name: "Louisiana", abbreviation: "LA" },
  "maine": { name: "Maine", abbreviation: "ME" },
  "maryland": { name: "Maryland", abbreviation: "MD" },
  "massachusetts": { name: "Massachusetts", abbreviation: "MA" },
  "michigan": { name: "Michigan", abbreviation: "MI" },
  "minnesota": { name: "Minnesota", abbreviation: "MN" },
  "mississippi": { name: "Mississippi", abbreviation: "MS" },
  "missouri": { name: "Missouri", abbreviation: "MO" },
  "montana": { name: "Montana", abbreviation: "MT" },
  "nebraska": { name: "Nebraska", abbreviation: "NE" },
  "nevada": { name: "Nevada", abbreviation: "NV" },
  "new-hampshire": { name: "New Hampshire", abbreviation: "NH" },
  "new-jersey": { name: "New Jersey", abbreviation: "NJ" },
  "new-mexico": { name: "New Mexico", abbreviation: "NM" },
  "new-york": { name: "New York", abbreviation: "NY" },
  "north-carolina": { name: "North Carolina", abbreviation: "NC" },
  "north-dakota": { name: "North Dakota", abbreviation: "ND" },
  "ohio": { name: "Ohio", abbreviation: "OH" },
  "oklahoma": { name: "Oklahoma", abbreviation: "OK" },
  "oregon": { name: "Oregon", abbreviation: "OR" },
  "pennsylvania": { name: "Pennsylvania", abbreviation: "PA" },
  "rhode-island": { name: "Rhode Island", abbreviation: "RI" },
  "south-carolina": { name: "South Carolina", abbreviation: "SC" },
  "south-dakota": { name: "South Dakota", abbreviation: "SD" },
  "tennessee": { name: "Tennessee", abbreviation: "TN" },
  "texas": { name: "Texas", abbreviation: "TX" },
  "utah": { name: "Utah", abbreviation: "UT" },
  "vermont": { name: "Vermont", abbreviation: "VT" },
  "virginia": { name: "Virginia", abbreviation: "VA" },
  "washington": { name: "Washington", abbreviation: "WA" },
  "west-virginia": { name: "West Virginia", abbreviation: "WV" },
  "wisconsin": { name: "Wisconsin", abbreviation: "WI" },
  "wyoming": { name: "Wyoming", abbreviation: "WY" },
  "district-of-columbia": { name: "District of Columbia", abbreviation: "DC" },
  "puerto-rico": { name: "Puerto Rico", abbreviation: "PR" },
};

const ITEMS_PER_PAGE = 12;

export default function StatePage() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const { isAuthenticated } = useAuth();
  
  const stateInfo = stateSlug ? STATE_DATA[stateSlug.toLowerCase()] : null;
  
  const {
    facilities,
    filteredFacilities: allFilteredFacilities,
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
  } = useRecyclingData();

  // Filter facilities for this state
  const stateFacilities = useMemo(() => {
    if (!stateInfo) return [];
    return facilities.filter(f => 
      f.State === stateInfo.name || 
      f.State === stateInfo.abbreviation
    );
  }, [facilities, stateInfo]);

  // Apply additional filters to state facilities
  const filteredFacilities = useMemo(() => {
    let filtered = stateFacilities;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.Name.toLowerCase().includes(term) ||
        f.Address.toLowerCase().includes(term) ||
        f.Category?.toLowerCase().includes(term) ||
        f.Feedstock?.toLowerCase().includes(term)
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(f => f.Category === selectedCategory);
    }
    
    if (selectedDropoff !== "all") {
      filtered = filtered.filter(f => f.Accepts_Dropoff === selectedDropoff);
    }
    
    if (selectedFee !== "all") {
      if (selectedFee === "pays") {
        filtered = filtered.filter(f => f.Offers_Payment === "Yes");
      } else {
        filtered = filtered.filter(f => f.Fee_Structure === selectedFee);
      }
    }
    
    return filtered;
  }, [stateFacilities, searchTerm, selectedCategory, selectedDropoff, selectedFee]);

  // Get categories available in this state
  const stateCategories = useMemo(() => {
    const cats = new Set(stateFacilities.map(f => f.Category).filter(Boolean));
    return Array.from(cats).sort();
  }, [stateFacilities]);

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
  }, [searchTerm, selectedCategory, selectedDropoff, selectedFee]);

  // If state not found, show 404-like message
  if (!stateInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">State Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find recycling information for this state.
          </p>
          <Link href="/states">
            <Button>View All States</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // SEO structured data for local business listings
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Recycling Centers in ${stateInfo.name}`,
    "description": `Find ${stateFacilities.length} recycling centers and drop-off locations in ${stateInfo.name}. Free directory of electronics recyclers, hazardous waste facilities, and more.`,
    "numberOfItems": stateFacilities.length,
    "itemListElement": displayedFacilities.slice(0, 10).map((facility, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "RecyclingCenter",
        "name": facility.Name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": facility.Address,
          "addressRegion": stateInfo.abbreviation,
          "addressCountry": "US"
        },
        ...(facility.Phone && { "telephone": facility.Phone }),
        ...(facility.Website && { "url": facility.Website }),
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Recycling Centers in {stateInfo.name} | National Recycling Directory</title>
        <meta 
          name="description" 
          content={`Find ${stateFacilities.length} recycling centers in ${stateInfo.name}. Free directory of electronics recyclers, hazardous waste facilities, sharps disposal, and more. Search by city or material type.`} 
        />
        <meta name="keywords" content={`recycling ${stateInfo.name}, recycling centers ${stateInfo.abbreviation}, where to recycle ${stateInfo.name}, electronics recycling ${stateInfo.name}, hazardous waste ${stateInfo.name}`} />
        <link rel="canonical" href={`https://recycling.recyclish.com/state/${stateSlug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`Recycling Centers in ${stateInfo.name} | National Recycling Directory`} />
        <meta property="og:description" content={`Find ${stateFacilities.length} recycling centers in ${stateInfo.name}. Electronics, hazardous waste, sharps disposal, and more.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://recycling.recyclish.com/state/${stateSlug}`} />
        <meta property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/MHnZhwLgCpRxIMdo.png" />
        <meta property="og:image:width" content="1456" />
        <meta property="og:image:height" content="816" />
        <meta property="og:image:alt" content={`Recycling Centers in ${stateInfo.name} - National Recycling Directory`} />
        <meta property="og:site_name" content="National Recycling Directory" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Recycling Centers in ${stateInfo.name}`} />
        <meta name="twitter:description" content={`Find ${stateFacilities.length} recycling centers in ${stateInfo.name}.`} />
        <meta name="twitter:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/MHnZhwLgCpRxIMdo.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />

        {/* Breadcrumb */}
        <nav className="container py-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li>
              <Link href="/states" className="hover:text-primary transition-colors">
                States
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li className="text-foreground font-medium">
              {stateInfo.name}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/states">
                <Button variant="ghost" size="sm" className="mb-4 -ml-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All States
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                    Recycling Centers in {stateInfo.name}
                  </h1>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-3xl mb-6">
                Find {stateFacilities.length} recycling facilities across {stateInfo.name}. 
                Search for electronics recyclers, hazardous waste drop-offs, sharps disposal, 
                and more. All locations are free to use.
              </p>

              {/* State Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-display font-bold text-xl">{stateFacilities.length}</span>
                  <span className="text-muted-foreground">Facilities</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border">
                  <Recycle className="h-5 w-5 text-primary" />
                  <span className="font-display font-bold text-xl">{stateCategories.length}</span>
                  <span className="text-muted-foreground">Categories</span>
                </div>
              </div>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {stateCategories.slice(0, 8).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-sm">
                    {cat}
                  </Badge>
                ))}
                {stateCategories.length > 8 && (
                  <Badge variant="outline" className="text-sm">
                    +{stateCategories.length - 8} more
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & Results Section */}
        <section className="container pb-16">
          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedState="all"
            setSelectedState={() => {}}
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
            states={[]}
            categories={stateCategories}
            onClear={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedDropoff("all");
              setSelectedFee("all");
            }}
            totalResults={filteredFacilities.length}
            activeFilterCount={
              (searchTerm ? 1 : 0) +
              (selectedCategory !== "all" ? 1 : 0) +
              (selectedDropoff !== "all" ? 1 : 0) +
              (selectedFee !== "all" ? 1 : 0)
            }
            userLocation={userLocation}
            isLocating={isLocating}
            locationError={locationError}
            requestLocation={requestLocation}
            facilities={stateFacilities}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground font-body">
                Loading recycling facilities...
              </span>
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
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedDropoff("all");
                  setSelectedFee("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {displayedFacilities.map((facility, index) => (
                  <motion.div
                    key={`${facility.Name}-${facility.Address}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <RecyclingCard
                      facility={facility}
                      index={index}
                      isFavorite={favoriteIdSet.has(`${facility.Name}-${facility.Address}`)}
                      onFavoriteChange={() => refetchFavorites()}
                    />
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMore}
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

        {/* SEO Content Section */}
        <section className="container pb-16">
          <div className="bg-muted/30 rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-4">
              About Recycling in {stateInfo.name}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground">
                {stateInfo.name} offers {stateFacilities.length} recycling facilities to help 
                residents properly dispose of various materials. From electronics and batteries 
                to hazardous waste and sharps disposal, you can find the right recycling center 
                for your needs. Many facilities accept drop-offs for free, while some specialize 
                in specific materials like scrap metal or textiles.
              </p>
              <p className="text-muted-foreground mt-4">
                Use the search filters above to find recycling centers near you in {stateInfo.name}. 
                You can filter by material type, fee structure, and whether the facility accepts 
                walk-in drop-offs. Click on any facility card to view detailed information including 
                hours of operation, accepted materials, and contact information.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
