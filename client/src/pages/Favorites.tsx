import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShelterCard, Shelter } from "@/components/ShelterCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, Heart, MapPin, Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";

export default function Favorites() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: favorites, isLoading, refetch } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Convert favorites to Shelter format
  const sheltersFromFavorites: Shelter[] = (favorites || []).map(fav => ({
    id: fav.facilityId,
    name: fav.facilityName,
    addressLine1: fav.facilityAddress.split(',')[0] || fav.facilityAddress,
    city: fav.facilityAddress.split(',')[1]?.trim() || "",
    state: "",
    zip: "",
    phone: fav.facilityPhone || "",
    email: "",
    website: fav.facilityWebsite || "",
    shelterType: fav.facilityCategory || "Rescue",
    speciesServed: fav.facilityFeedstock ? fav.facilityFeedstock.split(',') : ["All Species"],
    isNoKill: true,
    verified: true,
    latitude: fav.facilityLatitude ? parseFloat(fav.facilityLatitude) : 0,
    longitude: fav.facilityLongitude ? parseFloat(fav.facilityLongitude) : 0,
  }));

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream font-body">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-cream font-body">
        <Header />
        <main className="flex-1 container py-32">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-ocean/5 text-ocean/20 mb-8">
              <Heart className="h-12 w-12" />
            </div>
            <h1 className="font-display text-5xl font-bold text-ocean mb-6">
              Your Sanctuary.
            </h1>
            <p className="text-ocean/40 font-medium text-xl mb-12 leading-relaxed">
              Log in to synchronize your saved rescues across the Mobi network and keep your community atlas up to date.
            </p>
            <Button asChild className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-12 h-16 font-bold text-lg shadow-xl shadow-ocean/20 transition-all">
              <a href={getLoginUrl()}>Log In to Synchronize</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
      <Header />

      {/* Hero Section - Ocean Palette */}
      <section className="bg-ocean text-cream py-16 px-6 relative overflow-hidden">
        {/* Brand Watermark */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden lg:block">
          <span className="text-[15vw] font-display font-black leading-none tracking-tighter uppercase italic">Sanctuary</span>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <Button variant="ghost" className="mb-8 -ml-4 text-cream/40 hover:text-cream hover:bg-white/5 font-label uppercase tracking-widest text-[10px] font-black">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Atlas
              </Button>
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-terracotta shadow-xl shadow-terracotta/20">
                <Heart className="h-8 w-8 text-cream fill-current" />
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                Your <br />
                <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-8">Saved Rescues</span>
              </h1>
            </div>

            <p className="text-xl text-cream/60 font-medium leading-relaxed max-w-2xl">
              A personalized atlas of the rescues and shelters you've bookmarked for your community mission.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
            <span className="text-ocean/30 font-label uppercase tracking-widest text-xs font-black">
              Retrieving Saved Nodes...
            </span>
          </div>
        ) : sheltersFromFavorites.length === 0 ? (
          <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[4rem] border border-ocean/5 max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-ocean/5 text-ocean/10 mb-8">
              <Heart className="h-12 w-12" />
            </div>
            <h3 className="font-display text-4xl font-bold text-ocean mb-4">The Sanctuary is Empty.</h3>
            <p className="text-ocean/40 font-medium text-lg mb-12 max-w-sm mx-auto">
              You haven't bookmarked any rescues yet. Explore the atlas to build your personal network.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/directory">
                <Button className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-10 h-16 font-bold text-lg shadow-xl shadow-ocean/20 transition-all">
                  <Search className="h-4 w-4 mr-3" />
                  Explore Atlas
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-ocean/10 text-ocean hover:bg-ocean/5 transition-all font-bold text-lg">
                  <MapPin className="h-4 w-4 mr-3" />
                  View Global Map
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <p className="text-4xl font-display font-bold text-ocean">{sheltersFromFavorites.length}</p>
                <p className="text-[10px] font-label uppercase tracking-widest text-terracotta font-black">Bookmarked Nodes</p>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sheltersFromFavorites.map((shelter, index) => (
                <ShelterCard
                  key={shelter.id}
                  shelter={shelter}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
