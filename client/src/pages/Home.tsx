import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Stats } from "@/components/Stats";
import { HighestRated } from "@/components/HighestRated";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useRecyclingData } from "@/hooks/useRecyclingData";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Recycle, Map, Navigation, ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";


export default function Home() {
  const [, setLocation] = useLocation();
  
  const {
    categories,
    isLocating,
    requestLocation,
    facilities,
  } = useRecyclingData();

  const handleNearMe = () => {
    requestLocation();
    // Navigate to directory with nearme parameter
    setTimeout(() => {
      setLocation('/directory?nearme=true');
    }, 300);
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
        <meta property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/MHnZhwLgCpRxIMdo.png" />
        <meta property="og:image:width" content="1456" />
        <meta property="og:image:height" content="816" />
        <meta property="og:image:alt" content="National Recycling Directory - Find 2,000+ Recycling Centers Near You" />
        <meta property="og:site_name" content="National Recycling Directory" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Recycling Centers Near You | National Directory" />
        <meta name="twitter:description" content="Search 2,000+ recycling centers across all 50 US states." />
        <meta name="twitter:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/MHnZhwLgCpRxIMdo.png" />
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
                  Search our comprehensive directory of over {facilities.length.toLocaleString()} recycling facilities across 
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
                    <span>{categories.length} Categories</span>
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
                    onClick={handleNearMe}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    {isLocating ? 'Finding Location...' : 'Near Me'}
                  </Button>
                  <Link href="/directory">
                    <Button variant="outline" className="font-label">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Directory
                    </Button>
                  </Link>
                  <Link href="/map">
                    <Button variant="outline" className="font-label">
                      <Map className="h-4 w-4 mr-2" />
                      View Map
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

        {/* Value Propositions Section */}
        <section className="container -mt-8 relative z-10 mb-8">
          <Stats />
        </section>

        {/* Highest Rated Section */}
        <HighestRated />

        {/* Browse Directory CTA Section */}
        <section className="container py-12">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 md:p-12 border border-primary/20">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Ready to Find Your Recycling Center?
              </h2>
              <p className="text-muted-foreground font-body mb-6">
                Browse our complete directory of {facilities.length.toLocaleString()} recycling facilities. 
                Filter by state, category, material type, and more to find exactly what you need.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/directory">
                  <Button size="lg" className="font-label bg-primary hover:bg-primary/90">
                    Browse All Facilities
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/states">
                  <Button size="lg" variant="outline" className="font-label">
                    Browse by State
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup Section */}
        <NewsletterSignup />

        <Footer />
      </div>
    </>
  );
}
