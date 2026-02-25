import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Heart, Shield, Globe, Mail, ArrowRight, Search, Info, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroSearch } from '@/components/HeroSearch';

const UnderConstruction = () => {
    return (
        <div className="min-h-screen bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta overflow-x-hidden">
            {/* Recyclish Brand Bar */}
            <div className="bg-ocean py-2 px-10 text-center">
                <p className="text-cream/60 text-[10px] font-label uppercase tracking-[0.4em] font-bold">
                    An Official Recyclish Community Project
                </p>
            </div>

            {/* Navigation / Header */}
            <header className="py-8 px-10 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="bg-terracotta p-2.5 rounded-xl shadow-lg shadow-terracotta/20">
                        <Recycle className="w-7 h-7 text-cream" />
                    </div>
                    <div>
                        <span className="font-display text-2xl font-bold text-ocean block leading-none">Animal Shelter Directory</span>
                        <span className="text-[10px] font-label uppercase tracking-[0.2em] text-terracotta font-black mt-1 block">A RECYCLISH INITIATIVE</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-ocean/5 px-4 py-2 rounded-full border border-ocean/10">
                        <span className="flex h-2 w-2 rounded-full bg-terracotta animate-pulse" />
                        <span className="text-ocean font-label text-xs uppercase tracking-widest font-bold pt-0.5">Development in Progress</span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative pt-6 pb-20 px-6 overflow-hidden">
                {/* Topographic Background Pattern */}
                <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
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
                                The ultimate platform for discovering <span className="font-bold text-ocean border-b-2 border-terracotta/20">8,500+ Verified Shelters & Rescues</span> is coming soon.
                            </p>
                        </div>

                        {/* Functional Search Bar */}
                        <div className="pt-2 max-w-xl group">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-ocean/10 rounded-lg">
                                    <Search className="w-3.5 h-3.5 text-ocean" />
                                </div>
                                <p className="text-xs font-label text-ocean/50 uppercase tracking-widest font-bold">
                                    Search Engine Sneak Peek
                                </p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] border-2 border-ocean/10 shadow-2xl shadow-ocean/5 transition-all group-hover:border-terracotta/20 group-hover:shadow-terracotta/5">
                                <form
                                    className="flex flex-col sm:flex-row gap-2 p-1"
                                    onSubmit={(e: any) => {
                                        e.preventDefault();
                                        const val = e.target.search.value;
                                        window.location.href = `/directory?q=${encodeURIComponent(val)}`;
                                    }}
                                >
                                    <div className="flex-grow flex items-center px-6 gap-3 bg-cream/70 rounded-[1.5rem] border border-ocean/5">
                                        <Search className="w-5 h-5 text-ocean/30" />
                                        <Input
                                            name="search"
                                            placeholder="Find a shelter or rescue near you..."
                                            className="bg-transparent border-none text-ocean placeholder:text-ocean/20 h-14 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-lg italic shadow-none"
                                        />
                                    </div>
                                    <Button type="submit" className="bg-ocean hover:bg-ocean-light text-cream h-14 px-10 font-bold rounded-[1.5rem] transition-all flex items-center gap-2">
                                        Launching Soon
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                            <p className="mt-6 text-[11px] text-ocean/40 font-medium italic">
                                * Our high-performance search engine will feature intelligent filters for pet types, rescue size, and verification status.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 pt-4">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-terracotta/10 flex items-center justify-center group-hover:bg-terracotta/20 transition-colors">
                                    <Mail className="w-6 h-6 text-terracotta" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ocean leading-tight">Get Notified</p>
                                    <p className="text-[10px] text-ocean/40 font-label uppercase tracking-widest font-black mt-0.5">JOIN THE LOCAL LIST</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center group-hover:bg-ocean/20 transition-colors">
                                    <Info className="w-6 h-6 text-ocean" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ocean leading-tight">Recyclish Mission</p>
                                    <p className="text-[10px] text-ocean/40 font-label uppercase tracking-widest font-black mt-0.5">TURNING KNOWLEDGE INTO ACTION</p>
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

                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-36 -right-24 bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl shadow-ocean/20 border border-ocean/10 z-40 flex items-center gap-4 min-w-[220px]"
                            >
                                <div className="p-3 bg-ocean rounded-full group animate-bounce">
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

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-8 border-t border-white/10">
                            {[
                                { icon: Globe, title: "Universal Sync", desc: "Recyclish standards applied to local 501(c)(3) rescues." },
                                { icon: Heart, title: "Rescue First", desc: "Direct priority for no-kill sanctuaries and small rescues." },
                                { icon: Shield, title: "Mobi Verified", desc: "Only licensed and animal-welfare compliant centers." },
                                { icon: Search, title: "Smart Search", desc: "Advanced location-based discovery engine." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="p-4 bg-white/5 rounded-2xl h-fit border border-white/10 group-hover:bg-terracotta/20 group-hover:border-terracotta/50 transition-all">
                                        <item.icon className="w-7 h-7 text-terracotta" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl mb-1">{item.title}</h3>
                                        <p className="text-cream/40 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-white/5 border border-white/10 rounded-[5rem] p-16 backdrop-blur-md overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-terracotta/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="text-center space-y-6 relative z-10">
                                <div className="text-[10rem] md:text-[14rem] font-display font-bold text-terracotta leading-none tracking-tighter drop-shadow-2xl">
                                    8.5k
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

            {/* Footer */}
            <footer className="py-20 px-6 bg-cream-dark border-t border-ocean/5">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3 transition-all cursor-pointer group">
                            <Recycle className="w-8 h-8 text-terracotta group-hover:rotate-180 transition-transform duration-700" />
                            <span className="font-display font-bold text-2xl text-ocean pt-1 tracking-tight">Recyclish Community</span>
                        </div>
                        <p className="text-ocean/40 text-[10px] font-label uppercase tracking-[0.2em] text-center max-w-lg leading-loose font-bold">
                            CONNECTING PEOPLE TO THE CAUSES THEY CARE ABOUT. <br />
                            &copy; 2026 ANIMAL SHELTER DIRECTORY. A RECYCLISH INITIATIVE.
                        </p>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-label uppercase tracking-[0.2em] text-ocean/50 font-bold">
                        <a href="#" className="hover:text-terracotta transition-colors">PRIVACY POLICY</a>
                        <a href="#" className="hover:text-terracotta transition-colors">TERMS OF SERVICE</a>
                        <a href="https://recyclish.com" target="_blank" className="hover:text-terracotta transition-colors border-b border-terracotta/20 pb-0.5">BACK TO RECYCLISH.COM</a>
                        <a href="#" className="hover:text-terracotta transition-colors">SUPPORT</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
};

export default UnderConstruction;
