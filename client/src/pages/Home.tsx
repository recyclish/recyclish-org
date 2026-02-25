import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  Globe,
  Heart,
  Shield,
  PawPrint,
  Loader2,
  MapPin,
  Recycle
} from 'lucide-react';
import { HeroSearch } from "@/components/HeroSearch";

export default function Home() {
  const { data: stats, isLoading } = trpc.directory.stats.useQuery();

  return (
    <>
      <Helmet>
        <title>Animal Shelter Directory | Finding Rescues & Homes</title>
        <meta
          name="description"
          content="Search 8,500+ animal rescues and shelters across all 50 US states. Find dogs, cats, and pets waiting for their forever homes."
        />
      </Helmet>

      <div className="min-h-screen bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta overflow-x-hidden">
        <Header />

        {/* Hero Section */}
        <main className="relative pt-6 pb-20 px-6 overflow-hidden">
          {/* Topographic Background Pattern */}
          <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

          <div className="container relative z-10 grid lg:grid-cols-2 gap-16 items-center py-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-display text-ocean font-bold leading-[1.05] text-balance">
                  Finding <span className="text-terracotta italic">Rescues</span> & Homes.
                </h1>
                <p className="text-xl md:text-2xl text-ocean/80 leading-relaxed max-w-xl font-medium">
                  The ultimate platform for discovering <span className="font-bold text-ocean border-b-2 border-terracotta/20">8,500+ Verified Shelters & Rescues</span> is now live.
                </p>
              </div>

              {/* Functional Search Bar */}
              <div className="pt-2 max-w-2xl">
                {isLoading ? (
                  <div className="flex justify-start items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                  </div>
                ) : (
                  <HeroSearch
                    states={stats?.byState.map(s => s.state) || []}
                    totalFacilities={stats?.total || 0}
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-8 pt-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-terracotta/10 flex items-center justify-center group-hover:bg-terracotta/20 transition-colors">
                    <MapPin className="w-6 h-6 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ocean leading-tight">50 States</p>
                    <p className="text-xs text-ocean/40 font-label uppercase tracking-widest font-bold">Comprehensive coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center group-hover:bg-ocean/20 transition-colors">
                    <PawPrint className="w-6 h-6 text-ocean" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ocean leading-tight">Shared Mission</p>
                    <p className="text-xs text-ocean/40 font-label uppercase tracking-widest font-bold">Knowledge into Action</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              {/* Mobi Mascot Integration */}
              <div className="relative z-20 aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 to-ocean/10 blur-[120px] opacity-20 rounded-full animate-pulse" />
                <img
                  src="/images/mobi-mascot.png"
                  alt="Mobi - The Recyclish Mascot"
                  className="relative z-30 w-full h-full object-contain -rotate-3 hover:rotate-0 transition-transform duration-700 pointer-events-none drop-shadow-sm"
                />

                {/* Floating Recyclish Brand Badge */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-36 -right-24 bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl shadow-ocean/20 border border-ocean/10 z-40 flex items-center gap-4 min-w-[220px]"
                >
                  <div className="p-3 bg-ocean rounded-full group">
                    <Recycle className="w-6 h-6 text-cream group-hover:rotate-180 transition-transform duration-1000" />
                  </div>
                  <div>
                    <div className="text-[10px] font-label text-ocean/40 uppercase tracking-widest font-black">Meet Mobi:</div>
                    <div className="text-sm font-bold text-ocean italic">"Saving lives, one pawsitive step at a time!"</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Mission Section */}
        <section className="bg-ocean text-cream py-32 px-6 relative overflow-hidden">
          {/* Brand Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
            <span className="text-[25vw] font-display font-black leading-none tracking-tighter">MOBI</span>
          </div>

          <div className="container grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-7xl md:text-9xl font-display font-bold leading-[0.9] tracking-tight">
                  Empowering <br />
                  <span className="text-terracotta italic">Rescues</span> <br />
                  Everywhere
                </h2>
                <p className="text-xl md:text-2xl text-cream/70 leading-relaxed max-w-xl font-medium">
                  We're bringing the Recyclish standard of data excellence to the animal welfare world.
                  Our platform synchronizes thousands of local **Private Rescues** and **City Shelters**.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 pt-12 border-t border-white/10">
                {[
                  { icon: Globe, title: "Universal Sync", desc: "Recyclish standards applied to local 501(c)(3) rescues." },
                  { icon: Heart, title: "Rescue First", desc: "Direct priority for no-kill sanctuaries and small rescues." },
                  { icon: Shield, title: "Mobi Verified", desc: "Only licensed and animal-welfare compliant centers." },
                  { icon: Search, title: "Smart Search", desc: "Advanced location-based discovery engine." }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-4 group">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 group-hover:bg-terracotta/20 group-hover:border-terracotta/50 transition-all">
                      <item.icon className="w-6 h-6 text-terracotta" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-cream/40 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/5 border border-white/10 rounded-[5rem] p-12 md:p-20 backdrop-blur-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-terracotta/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="text-center space-y-4 relative z-10 transition-transform duration-700 group-hover:scale-105">
                  <div className="text-[10rem] md:text-[14rem] font-display font-bold text-terracotta leading-none tracking-tighter drop-shadow-2xl">
                    {stats?.total ? `${(stats.total / 1000).toFixed(1)}k` : '8.5k'}
                  </div>
                  <div className="space-y-4">
                    <div className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight">Locations Synced</div>
                    <div className="flex justify-center gap-3 items-center">
                      <span className="h-1 w-6 bg-terracotta/50 rounded-full" />
                      <p className="text-terracotta font-label uppercase tracking-[0.4em] text-xs font-black">
                        Shelters & Rescues
                      </p>
                      <span className="h-1 w-6 bg-terracotta/50 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
