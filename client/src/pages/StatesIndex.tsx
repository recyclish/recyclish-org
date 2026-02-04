import { useMemo } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRecyclingData } from "@/hooks/useRecyclingData";
import { Helmet } from "react-helmet-async";

// State data with slugs and full names
const STATES = [
  { slug: "alabama", name: "Alabama", abbreviation: "AL" },
  { slug: "alaska", name: "Alaska", abbreviation: "AK" },
  { slug: "arizona", name: "Arizona", abbreviation: "AZ" },
  { slug: "arkansas", name: "Arkansas", abbreviation: "AR" },
  { slug: "california", name: "California", abbreviation: "CA" },
  { slug: "colorado", name: "Colorado", abbreviation: "CO" },
  { slug: "connecticut", name: "Connecticut", abbreviation: "CT" },
  { slug: "delaware", name: "Delaware", abbreviation: "DE" },
  { slug: "florida", name: "Florida", abbreviation: "FL" },
  { slug: "georgia", name: "Georgia", abbreviation: "GA" },
  { slug: "hawaii", name: "Hawaii", abbreviation: "HI" },
  { slug: "idaho", name: "Idaho", abbreviation: "ID" },
  { slug: "illinois", name: "Illinois", abbreviation: "IL" },
  { slug: "indiana", name: "Indiana", abbreviation: "IN" },
  { slug: "iowa", name: "Iowa", abbreviation: "IA" },
  { slug: "kansas", name: "Kansas", abbreviation: "KS" },
  { slug: "kentucky", name: "Kentucky", abbreviation: "KY" },
  { slug: "louisiana", name: "Louisiana", abbreviation: "LA" },
  { slug: "maine", name: "Maine", abbreviation: "ME" },
  { slug: "maryland", name: "Maryland", abbreviation: "MD" },
  { slug: "massachusetts", name: "Massachusetts", abbreviation: "MA" },
  { slug: "michigan", name: "Michigan", abbreviation: "MI" },
  { slug: "minnesota", name: "Minnesota", abbreviation: "MN" },
  { slug: "mississippi", name: "Mississippi", abbreviation: "MS" },
  { slug: "missouri", name: "Missouri", abbreviation: "MO" },
  { slug: "montana", name: "Montana", abbreviation: "MT" },
  { slug: "nebraska", name: "Nebraska", abbreviation: "NE" },
  { slug: "nevada", name: "Nevada", abbreviation: "NV" },
  { slug: "new-hampshire", name: "New Hampshire", abbreviation: "NH" },
  { slug: "new-jersey", name: "New Jersey", abbreviation: "NJ" },
  { slug: "new-mexico", name: "New Mexico", abbreviation: "NM" },
  { slug: "new-york", name: "New York", abbreviation: "NY" },
  { slug: "north-carolina", name: "North Carolina", abbreviation: "NC" },
  { slug: "north-dakota", name: "North Dakota", abbreviation: "ND" },
  { slug: "ohio", name: "Ohio", abbreviation: "OH" },
  { slug: "oklahoma", name: "Oklahoma", abbreviation: "OK" },
  { slug: "oregon", name: "Oregon", abbreviation: "OR" },
  { slug: "pennsylvania", name: "Pennsylvania", abbreviation: "PA" },
  { slug: "rhode-island", name: "Rhode Island", abbreviation: "RI" },
  { slug: "south-carolina", name: "South Carolina", abbreviation: "SC" },
  { slug: "south-dakota", name: "South Dakota", abbreviation: "SD" },
  { slug: "tennessee", name: "Tennessee", abbreviation: "TN" },
  { slug: "texas", name: "Texas", abbreviation: "TX" },
  { slug: "utah", name: "Utah", abbreviation: "UT" },
  { slug: "vermont", name: "Vermont", abbreviation: "VT" },
  { slug: "virginia", name: "Virginia", abbreviation: "VA" },
  { slug: "washington", name: "Washington", abbreviation: "WA" },
  { slug: "west-virginia", name: "West Virginia", abbreviation: "WV" },
  { slug: "wisconsin", name: "Wisconsin", abbreviation: "WI" },
  { slug: "wyoming", name: "Wyoming", abbreviation: "WY" },
];

export default function StatesIndex() {
  const { facilities, isLoading } = useRecyclingData();

  // Count facilities per state
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    facilities.forEach((f) => {
      const state = f.State;
      // Try to match by name or abbreviation
      const stateInfo = STATES.find(
        (s) => s.name === state || s.abbreviation === state
      );
      if (stateInfo) {
        counts[stateInfo.slug] = (counts[stateInfo.slug] || 0) + 1;
      }
    });
    return counts;
  }, [facilities]);

  // Sort states by facility count (descending)
  const sortedStates = useMemo(() => {
    return [...STATES].sort((a, b) => {
      const countA = stateCounts[a.slug] || 0;
      const countB = stateCounts[b.slug] || 0;
      return countB - countA;
    });
  }, [stateCounts]);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Recycling Centers by State",
    "description": "Find recycling centers in all 50 US states. Free directory of electronics recyclers, hazardous waste facilities, and more.",
    "numberOfItems": STATES.length,
    "itemListElement": sortedStates.map((state, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "WebPage",
        "name": `Recycling Centers in ${state.name}`,
        "url": `https://recycling.recyclish.com/state/${state.slug}`
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Recycling Centers by State | National Recycling Directory</title>
        <meta 
          name="description" 
          content="Find recycling centers in all 50 US states. Free directory of over 2,000 electronics recyclers, hazardous waste facilities, sharps disposal, and more." 
        />
        <meta name="keywords" content="recycling centers by state, recycling directory, where to recycle, electronics recycling, hazardous waste disposal" />
        <link rel="canonical" href="https://recycling.recyclish.com/states" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Recycling Centers by State | National Recycling Directory" />
        <meta property="og:description" content="Find recycling centers in all 50 US states. Free directory of over 2,000 facilities." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://recycling.recyclish.com/states" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Recycling Centers by State" />
        <meta name="twitter:description" content="Find recycling centers in all 50 US states." />
        
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
            <li className="text-foreground font-medium">
              States
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="container py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  Recycling Centers by State
                </h1>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-3xl mb-8">
              Browse recycling facilities across all 50 US states. Find electronics recyclers, 
              hazardous waste drop-offs, sharps disposal, and more in your state.
            </p>
          </motion.div>
        </section>

        {/* States Grid */}
        <section className="container pb-16">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedStates.map((state, index) => {
                const count = stateCounts[state.slug] || 0;
                return (
                  <motion.div
                    key={state.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
                  >
                    <Link href={`/state/${state.slug}`}>
                      <div className="group p-5 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                              {state.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span className="text-sm">
                                {count} {count === 1 ? "facility" : "facilities"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {state.abbreviation}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* SEO Content */}
        <section className="container pb-16">
          <div className="bg-muted/30 rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-4">
              Find Recycling Centers Near You
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground">
                The National Recycling Directory provides free access to over 2,000 recycling 
                facilities across all 50 US states. Whether you need to recycle electronics, 
                dispose of hazardous waste, or find a sharps disposal location, our directory 
                helps you find the right facility.
              </p>
              <p className="text-muted-foreground mt-4">
                Each state page shows all available recycling centers with detailed information 
                including addresses, phone numbers, hours of operation, and accepted materials. 
                You can filter by category, fee structure, and whether the facility accepts 
                walk-in drop-offs.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
