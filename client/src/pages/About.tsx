import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Recycle,
  Database,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  PawPrint
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Mobi Verified",
      description: "Every rescue in our directory is manually verified for active licensing and humane standards.",
    },
    {
      icon: Users,
      title: "Rescue-First",
      description: "Direct priority for no-kill sanctuaries and small, localized 501(c)(3) organizations.",
    },
    {
      icon: Target,
      title: "Data Excellence",
      description: "We synchronize thousands of rescue databases to provide the most accurate census of US animal welfare.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
      <Header />

      {/* Hero Section - Ocean Palette */}
      <section className="relative overflow-hidden bg-ocean text-cream py-24 md:py-32 px-6">
        <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none overflow-hidden">
          <span className="text-[30vw] font-display font-black leading-none tracking-tighter uppercase italic whitespace-nowrap -ml-20 -mt-20">Community</span>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="font-display text-5xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
              A New Era for <br />
              <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-[12px]">Animal Welfare.</span>
            </h1>
            <p className="text-xl md:text-3xl text-cream/70 font-medium leading-relaxed max-w-2xl">
              The Animal Rescue Directory is a Recyclish initiative dedicated to mapping every shelter, rescue, and sanctuary across the United States.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

        <div className="container relative z-10">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-1 bg-terracotta rounded-full" />
                <span className="text-[10px] font-label uppercase tracking-[0.4em] font-black text-ocean/40">Our Mission</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ocean mb-8 leading-tight">
                Visibility for those who <br />provide sanctuary.
              </h2>
              <p className="text-xl text-ocean/60 font-medium leading-relaxed mb-8">
                For too long, small rescues and independent sanctuaries have operated in the shadows of generic search engines. We believe that every organization dedicated to saving lives deserves a premium digital presence and a place in the National Atlas.
              </p>
              <p className="text-xl text-ocean/60 font-medium leading-relaxed mb-10">
                Powered by the Recyclish data engine, we provide users with a verified, high-fidelity directory that connects potential adopters and donors with the causes that matter most.
              </p>
              <Link href="/directory">
                <Button className="bg-ocean hover:bg-ocean-light text-cream rounded-[1.5rem] px-10 h-16 font-bold text-lg shadow-xl shadow-ocean/20">
                  Explore the Atlas
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative p-12"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-ocean/5 rounded-full blur-3xl" />

              <div className="relative z-10 aspect-square max-w-md mx-auto bg-white/40 backdrop-blur-xl rounded-[4rem] border border-ocean/5 shadow-2xl flex flex-col items-center justify-center p-12 text-center overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-terracotta" />
                <PawPrint className="w-24 h-24 text-terracotta mb-8 group-hover:scale-110 transition-transform duration-1000" />
                <h3 className="font-display text-3xl font-bold text-ocean mb-2">Recyclish</h3>
                <p className="text-sm font-label uppercase tracking-widest text-ocean/30 font-bold">Community Projects</p>
                <p className="mt-8 text-ocean/50 font-medium">Turning knowledge into action for the animal welfare community.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values/Features Section */}
      <section className="bg-ocean py-24 px-6">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10 hover:bg-white/10 transition-colors group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-terracotta/20 text-terracotta mb-8 group-hover:scale-110 transition-transform">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-cream mb-4">
                  {item.title}
                </h3>
                <p className="text-cream/40 font-medium leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Census Section */}
      <section className="py-24 px-6 bg-cream border-t border-ocean/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ocean mb-12">
              The National Census of <span className="text-terracotta italic underline decoration-terracotta/20 underline-offset-8">Animal Welfare</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {[
                { val: "8,500+", label: "Logged Rescues" },
                { val: "50", label: "States Covered" },
                { val: "24/7", label: "Data Sync" },
                { val: "100%", label: "Mobi Verified" }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-4xl font-display font-bold text-ocean">{stat.val}</p>
                  <p className="text-[10px] font-label uppercase tracking-widest text-terracotta font-black">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xl text-ocean/50 font-medium leading-relaxed mb-12">
              Our directory utilizes a proprietary synchronization engine that tracks changes in facility hours, contact information, and licensing status across a massive network of public and private sources.
            </p>
            <Link href="/submit-rescue">
              <Button variant="ghost" className="text-ocean/40 hover:text-terracotta font-label uppercase tracking-widest text-xs font-black h-14 px-8 border border-ocean/5 rounded-2xl">
                Is your rescue missing? Submit here
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
