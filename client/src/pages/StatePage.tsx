import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShelterCard } from "@/components/ShelterCard";
import { generateFacilityId } from "@/components/RecyclingCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, MapPin, ChevronRight, Building2, Recycle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useShelterData } from "@/hooks/useShelterData";
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

  // Set initial state from slug
  useEffect(() => {
    if (stateInfo && selectedState !== stateInfo.name) {
      setSelectedState(stateInfo.name);
    }
  }, [stateInfo, setSelectedState, selectedState]);

  const { data: favoriteIds, refetch: refetchFavorites } = trpc.favorites.ids.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const displayedShelters = shelters.slice(0, displayCount);
  const hasMore = displayCount < shelters.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedSpecies, isNoKill]);

  if (!stateInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-cream font-body">
        <Header />
        <main className="flex-1 container py-32 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-ocean/5 text-ocean/20 mb-8">
            <MapPin className="h-12 w-12" />
          </div>
          <h1 className="font-display text-5xl font-bold text-ocean mb-6">Region Unmapped.</h1>
          <p className="text-ocean/40 font-medium text-xl mb-12 max-w-lg mx-auto leading-relaxed">
            We couldn't synchronize data for this specific state. It may be outside our current verification zone.
          </p>
          <Link href="/states">
            <Button className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-10 h-16 font-bold text-lg shadow-xl shadow-ocean/20">
              View All States
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Animal Rescues in ${stateInfo.name}`,
    "description": `Find verified animal rescues and drop-off locations in ${stateInfo.name}.`,
    "numberOfItems": shelters.length,
    "itemListElement": displayedShelters.slice(0, 10).map((shelter, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": shelter.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": shelter.addressLine1,
          "addressRegion": stateInfo.abbreviation,
          "addressCountry": "US"
        }
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Rescues in {stateInfo.name} | Animal Rescue Directory</title>
        <meta
          name="description"
          content={`Explore verified animal rescues in ${stateInfo.name}. Find shelters, no-kill sanctuaries, and welfare organizations near you.`}
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
        <Header />

        {/* Hero Section - Ocean Palette */}
        <section className="bg-ocean text-cream py-16 md:py-24 px-6 relative overflow-hidden">
          {/* Brand Watermark */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden lg:block">
            <span className="text-[15vw] font-display font-black leading-none tracking-tighter uppercase italic">{stateInfo.abbreviation}</span>
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/states">
                <Button variant="ghost" className="mb-8 -ml-4 text-cream/40 hover:text-cream hover:bg-white/5 font-label uppercase tracking-widest text-[10px] font-black">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Atlas
                </Button>
              </Link>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-terracotta shadow-xl shadow-terracotta/20">
                  <MapPin className="h-8 w-8 text-cream" />
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                  Rescues in <br />
                  <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-8">{stateInfo.name}</span>
                </h1>
              </div>

              <p className="text-xl text-cream/60 font-medium leading-relaxed max-w-3xl mb-12">
                We have logged verified animal welfare organizations across {stateInfo.name}.
                Each facility listed meets our high-fidelity standards for active licensing and humane care.
              </p>

              <div className="flex flex-wrap gap-12">
                <div className="space-y-1">
                  <p className="text-3xl font-display font-bold text-cream">{shelters.length}</p>
                  <p className="text-[10px] font-label uppercase tracking-widest text-terracotta font-black">Logged Rescues</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & Results Section */}
        <section className="relative py-20 px-6 overflow-hidden">
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

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
                <span className="text-ocean/30 font-label uppercase tracking-widest text-xs font-black">
                  Synchronizing with Atlas...
                </span>
              </div>
            ) : dataError ? (
              <div className="text-center py-32">
                <p className="text-terracotta font-bold text-xl">{dataError.message || "Error loading data"}</p>
              </div>
            ) : shelters.length === 0 ? (
              <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-ocean/5 mt-12">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-ocean/5 text-ocean/10 mb-8">
                  <MapPin className="h-12 w-12" />
                </div>
                <h3 className="font-display text-4xl font-bold text-ocean mb-4">No Rescues Found</h3>
                <p className="text-ocean/40 font-medium text-lg mb-10 max-w-sm mx-auto">
                  Try adjusting your filters or expanding your search parameters.
                </p>
                <Button
                  variant="ghost"
                  className="text-terracotta hover:text-terracotta-dark font-label uppercase tracking-widest text-[10px] font-black"
                  onClick={clearFilters}
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
                  {displayedShelters.map((shelter, index) => (
                    <motion.div
                      key={`${shelter.name}-${shelter.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                    >
                      <ShelterCard
                        shelter={shelter}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-20">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={loadMore}
                      className="h-16 px-12 rounded-2xl border-ocean/10 text-ocean hover:bg-ocean hover:text-cream transition-all font-bold text-lg"
                    >
                      <ChevronDown className="h-5 w-5 mr-3" />
                      Load More ({shelters.length - displayCount} remain)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* SEO Narrative */}
        <section className="py-24 px-6 bg-cream border-t border-ocean/5">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ocean mb-12">
                About the {stateInfo.name} <span className="text-terracotta italic">Rescue Network.</span>
              </h2>
              <div className="prose prose-ocean max-w-none text-ocean/50 font-medium text-lg leading-relaxed space-y-8">
                <p>
                  Animal welfare in {stateInfo.name} is supported by a diverse network of {shelters.length} verified organizations. From specialized breed rescues to large municipal shelters, each facility plays a critical role in the community ecosystem.
                </p>
                <p>
                  Our directory provides direct access to these resources, ensuring that potential adopters, volunteers, and donors can connect with transparency. Every listing in {stateInfo.name} is synchronized periodically via Mobi to guarantee the highest data fidelity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
