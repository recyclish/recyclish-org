import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecyclingCard, RecyclingFacility } from "@/components/RecyclingCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, Heart, MapPin, Search } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Favorites() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const { data: favorites, isLoading, refetch } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Convert favorites to RecyclingFacility format
  const facilitiesFromFavorites: RecyclingFacility[] = (favorites || []).map(fav => ({
    Name: fav.facilityName,
    Address: fav.facilityAddress,
    State: "",
    County: "",
    Phone: fav.facilityPhone || "",
    Email: "",
    Website: fav.facilityWebsite || "",
    Category: fav.facilityCategory || "",
    Facility_Type: "",
    Feedstock: fav.facilityFeedstock || "",
    Latitude: fav.facilityLatitude ? parseFloat(fav.facilityLatitude) : 0,
    Longitude: fav.facilityLongitude ? parseFloat(fav.facilityLongitude) : 0,
    NAICS_Code: "",
  }));

  // Get favorite IDs for the cards
  const { data: favoriteIds } = trpc.favorites.ids.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const favoriteIdSet = new Set(favoriteIds || []);

  // Generate facility ID (same function as in RecyclingCard)
  const generateFacilityId = (name: string, address: string): string => {
    const str = `${name}-${address}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />
        <main className="flex-1 container py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">
              Your Favorites
            </h1>
            <p className="text-muted-foreground mb-8">
              Log in to save your favorite recycling centers for quick access.
            </p>
            <Button asChild size="lg" className="font-label">
              <a href={getLoginUrl()}>Log In to Continue</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">
              Your Favorites
            </h1>
          </div>
          <p className="text-muted-foreground">
            Quick access to your saved recycling centers
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground font-body">Loading favorites...</span>
          </div>
        ) : facilitiesFromFavorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-md mx-auto">
              Start exploring the directory and click the heart icon on any facility to save it here for quick access.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="font-label">
                <Link href="/">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Directory
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-label">
                <Link href="/map">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Map
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {facilitiesFromFavorites.length} saved {facilitiesFromFavorites.length === 1 ? 'facility' : 'facilities'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {facilitiesFromFavorites.map((facility, index) => (
                <RecyclingCard
                  key={generateFacilityId(facility.Name, facility.Address)}
                  facility={facility}
                  index={index}
                  isFavorite={favoriteIdSet.has(generateFacilityId(facility.Name, facility.Address))}
                  onFavoriteChange={() => refetch()}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
