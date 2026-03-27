import { useMemo } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Recycling Centers by State",
    "description": "Find verified recycling centers, drop-off locations, and take-back programs across all 50 US states.",
    "numberOfItems": STATES.length,
    "itemListElement": sortedStates.map((state, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "WebPage",
        "name": `Recycling Centers in ${state.name}`,
        "url": `https://recyclish.info/state/${state.slug}`
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Recycling Centers by State | National Directory of Recycling</title>
        <meta
          name="description"
          content="Browse recycling centers, drop-off locations, and take-back programs by state. Find verified recycling facilities in all 50 US states on Recyclish."
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
        <Header />

        {/* Hero Section */}
        <section className="bg-ocean text-cream py-20 md:py-32 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden lg:block">
            <span className="text-[25vw] font-display font-black leading-none tracking-tighter uppercase italic whitespace-nowrap">The Atlas</span>
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-1 bg-terracotta rounded-full" />
                <span className="text-[10px] font-label uppercase tracking-[0.4em] font-black text-cream/40">National Census</span>
              </div>
              <h1 className="font-display text-5xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
                Recycling Centers <br />
                <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-[12px]">by State.</span>
              </h1>
              <p className="text-xl md:text-2xl text-cream/70 font-medium leading-relaxed max-w-2xl">
                Our verified directory spans all 50 states, covering thousands of recycling facilities in the most comprehensive census ever built.
              </p>
            </motion.div>
          </div>
        </section>

        {/* States Grid */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

          <div className="container relative z-10">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-[2rem] bg-ocean/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedStates.map((state, index) => {
                  const count = stateCounts[state.slug] || 0;
                  return (
                    <motion.div
                      key={state.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index * 0.02, 0.5) }}
                    >
                      <Link href={`/state/${state.slug}`}>
                        <div className="group p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-ocean/5 hover:bg-white hover:border-terracotta/20 hover:shadow-2xl hover:shadow-ocean/5 transition-all cursor-pointer relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                            <MapPin className="w-12 h-12 text-ocean" />
                          </div>

                          <div className="relative z-10">
                            <span className="text-[10px] font-label uppercase tracking-widest text-terracotta font-black mb-2 block">{state.abbreviation}</span>
                            <h2 className="font-display text-2xl font-bold text-ocean mb-4 group-hover:text-terracotta transition-colors">
                              {state.name}
                            </h2>
                            <div className="flex items-center gap-2 text-ocean/40 font-bold text-[10px] font-label uppercase tracking-widest">
                              <Building2 className="h-3 w-3" />
                              <span>{count} Recycling {count === 1 ? "Facility" : "Facilities"}</span>
                            </div>
                          </div>

                          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                            <ChevronRight className="w-6 h-6 text-terracotta" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-24 px-6 bg-ocean text-cream overflow-hidden">
          <div className="container relative">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-terracotta/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-10 leading-tight">
                Building the <span className="text-terracotta italic">National Census</span> <br />of US Recycling.
              </h2>
              <div className="grid md:grid-cols-2 gap-12 text-cream/60 font-medium text-lg leading-relaxed">
                <p>
                  The National Directory of Recycling is more than just a list of addresses. It is a living, synchronized database that tracks recycling infrastructure in every corner of America — from small community drop-off centers in rural Alaska to large-scale materials recovery facilities in New York City.
                </p>
                <p>
                  By organizing facilities by state and city, we help local communities find the recycling options closest to them. Mobi, our synchronization engine, ensures that every facility listed is verified, active, and meeting the Recyclish standard of community excellence.
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
