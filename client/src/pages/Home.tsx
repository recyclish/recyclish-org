import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Stats } from "@/components/Stats";

import { NewsletterSignup } from "@/components/NewsletterSignup";
import { HeroSearch } from "@/components/HeroSearch";
import { useRecyclingData } from "@/hooks/useRecyclingData";
import { MapPin, PawPrint } from "lucide-react";
import { motion } from "framer-motion";


export default function Home() {
  const {
    categories,
    states,
    facilities,
  } = useRecyclingData();

  return (
    <>
      <Helmet>
        <title>Find Animal Rescues & Shelters Near You | National Directory</title>
        <meta
          name="description"
          content="Search 8,500+ animal rescues and shelters across all 50 US states. Find dogs, cats, rabbits, and other pets waiting for their forever homes."
        />
        <meta
          name="keywords"
          content="animal shelters near me, dog rescue directory, cat shelters, pet adoption, rescue groups, local animal control"
        />
        <link rel="canonical" href="https://recyclish.pet/" />

        {/* Open Graph */}
        <meta property="og:title" content="Find Animal Rescues & Shelters Near You | National Directory" />
        <meta property="og:description" content="Search 8,500+ animal rescues and shelters across all 50 US states. Find your perfect companion." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://recyclish.pet/" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Animal Rescues & Shelters Near You | National Directory" />
        <meta name="twitter:description" content="Search 8,500+ animal rescues and shelters across all 50 US states." />
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

          <div className="container relative py-12 md:py-16">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left Column - Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-label mb-4">
                  <PawPrint className="h-4 w-4" />
                  <span>National Shelter Directory</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
                  Find Your Local{" "}
                  <span className="text-primary">Animal Rescue</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed mb-4">
                  Search our comprehensive directory of over 8,500 rescues and shelters across
                  all 50 states. Help us turn knowledge into action by finding your local shelter and giving an animal a second chance.
                </p>

                <div className="flex items-center gap-4 text-sm font-label text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>50 States</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center gap-1">
                    <span>8,500+ Locations</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center gap-1">
                    <span>Direct Impact</span>
                  </div>
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

              {/* Right Column - Desktop Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:flex lg:flex-col lg:items-center lg:justify-start"
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
                    className="w-72 h-auto drop-shadow-xl"
                  />
                </a>
              </motion.div>
            </div>

            {/* Hero Search - Full Width Below */}
            <HeroSearch
              states={states}
              totalFacilities={facilities.length}
            />
          </div>
        </section>

        {/* Value Propositions Section */}
        <section className="container relative z-10 py-6">
          <Stats />
        </section>

        {/* Newsletter Signup Section */}
        <NewsletterSignup />

        <Footer />
      </div>
    </>
  );
}
