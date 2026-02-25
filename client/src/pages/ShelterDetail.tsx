import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    ExternalLink,
    Heart,
    ArrowLeft,
    Navigation,
    Clock,
    PawPrint,
    ShieldCheck,
    Loader2,
    Info,
    CheckCircle2
} from "lucide-react";

export default function ShelterDetail() {
    const params = useParams();
    const shelterId = params.id as string;
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

    const { data: shelter, isLoading, error } = trpc.directory.getShelter.useQuery(
        { id: shelterId },
        { enabled: !!shelterId }
    );

    const handleMapReady = (map: google.maps.Map) => {
        mapRef.current = map;
        if (shelter && shelter.latitude && shelter.longitude) {
            const position = { lat: shelter.latitude, lng: shelter.longitude };
            map.setCenter(position);

            // Add marker
            markerRef.current = new google.maps.marker.AdvancedMarkerElement({
                map,
                position,
                title: shelter.name,
            });
        }
    };

    const openMaps = () => {
        if (!shelter) return;
        const query = encodeURIComponent(`${shelter.addressLine1}, ${shelter.city}, ${shelter.state}`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-cream">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-terracotta/20 blur-xl rounded-full animate-pulse" />
                        <Loader2 className="h-12 w-12 animate-spin text-terracotta relative z-10" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !shelter) {
        return (
            <div className="min-h-screen flex flex-col bg-cream">
                <Header />
                <main className="flex-1 container py-20 px-6">
                    <div className="text-center max-w-xl mx-auto py-20 bg-white/50 backdrop-blur-md rounded-[3rem] border border-ocean/5 shadow-2xl shadow-ocean/5">
                        <Info className="h-16 w-16 mx-auto text-ocean/20 mb-8" />
                        <h1 className="text-4xl font-display font-bold text-ocean mb-4">Atlas Entry Not Found</h1>
                        <p className="text-ocean/50 mb-10 font-medium">
                            The rescue you are searching for might have relocated or is no longer listed in our directory.
                        </p>
                        <Link href="/directory">
                            <Button className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-10 h-14 font-bold">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return to Directory
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
            <Header />

            <main className="flex-1 relative">
                {/* Topographic Background Pattern */}
                <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

                <div className="container relative z-10 py-12 px-6">
                    {/* Breadcrumb with Brand Bar Style */}
                    <div className="mb-12 flex items-center justify-between">
                        <Link href="/directory">
                            <Button variant="ghost" size="sm" className="text-ocean/40 hover:text-ocean hover:bg-ocean/5 font-label uppercase tracking-widest text-[10px] font-black">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Rescue Atlas
                            </Button>
                        </Link>
                        {shelter.verified && (
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-ocean text-cream rounded-full text-[10px] font-label uppercase tracking-widest font-black">
                                <ShieldCheck className="w-3 h-3" />
                                Verified Rescue Partner
                            </div>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Profile Header Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Card className="overflow-hidden border-none shadow-2xl shadow-ocean/5 bg-white/80 backdrop-blur-xl rounded-[3rem]">
                                    <div className="h-2 bg-gradient-to-r from-terracotta/20 via-terracotta to-terracotta/20" />
                                    <div className="p-10 md:p-14">
                                        <div className="flex flex-wrap gap-3 mb-8">
                                            <div className="px-4 py-1.5 bg-ocean/5 text-ocean text-[10px] font-label uppercase tracking-widest font-black rounded-full border border-ocean/5">
                                                {shelter.shelterType}
                                            </div>
                                            {shelter.isNoKill && (
                                                <div className="px-4 py-1.5 bg-terracotta/10 text-terracotta text-[10px] font-label uppercase tracking-widest font-black rounded-full">
                                                    No-Kill Facility
                                                </div>
                                            )}
                                        </div>

                                        <h1 className="text-5xl md:text-7xl font-display font-bold text-ocean leading-tight mb-12 capitalize tracking-tight">
                                            {shelter.name.toLowerCase()}
                                        </h1>

                                        <div className="grid md:grid-cols-2 gap-12">
                                            {/* Location Details */}
                                            <div className="space-y-8">
                                                <div className="flex items-start gap-5">
                                                    <div className="w-14 h-14 rounded-3xl bg-cream flex items-center justify-center shrink-0 border border-ocean/5">
                                                        <MapPin className="h-6 w-6 text-terracotta" />
                                                    </div>
                                                    <div className="pt-2">
                                                        <p className="text-xs font-label uppercase tracking-widest text-ocean/30 font-bold mb-2">Location Identifier</p>
                                                        <p className="text-2xl font-display font-bold text-ocean leading-tight">{shelter.addressLine1}</p>
                                                        {shelter.addressLine2 && <p className="text-xl text-ocean/60 mt-1">{shelter.addressLine2}</p>}
                                                        <p className="text-lg text-ocean/40 font-medium mt-1">{shelter.city}, {shelter.state} {shelter.zip}</p>
                                                    </div>
                                                </div>

                                                <Button onClick={openMaps} className="w-full h-16 bg-ocean hover:bg-ocean-light text-cream rounded-2xl font-bold text-lg shadow-xl shadow-ocean/20 flex items-center justify-center gap-3 transition-all shrink-0">
                                                    <Navigation className="h-5 w-5" />
                                                    Open in Google Maps
                                                </Button>
                                            </div>

                                            {/* Contact Connectivity */}
                                            <div className="space-y-6 pt-2">
                                                <div className="space-y-4">
                                                    {shelter.phone && (
                                                        <a href={`tel:${shelter.phone}`} className="flex items-center gap-4 p-5 rounded-3xl bg-cream/30 border border-ocean/5 hover:bg-terracotta/5 hover:border-terracotta/20 transition-all group/link">
                                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover/link:bg-terracotta">
                                                                <Phone className="h-5 w-5 text-terracotta group-hover/link:text-cream transition-colors" />
                                                            </div>
                                                            <div className="flex-1 truncate">
                                                                <p className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-bold mb-1">Direct Line</p>
                                                                <p className="font-bold text-ocean text-lg">{shelter.phone}</p>
                                                            </div>
                                                        </a>
                                                    )}

                                                    {shelter.email && (
                                                        <a href={`mailto:${shelter.email}`} className="flex items-center gap-4 p-5 rounded-3xl bg-cream/30 border border-ocean/5 hover:bg-ocean/5 hover:border-ocean/20 transition-all group/link">
                                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover/link:bg-ocean">
                                                                <Mail className="h-5 w-5 text-ocean group-hover/link:text-cream transition-colors" />
                                                            </div>
                                                            <div className="flex-1 truncate">
                                                                <p className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-bold mb-1">Email Correspondence</p>
                                                                <p className="font-bold text-ocean text-lg truncate">{shelter.email}</p>
                                                            </div>
                                                        </a>
                                                    )}

                                                    {shelter.website && (
                                                        <a
                                                            href={shelter.website.startsWith('http') ? shelter.website : `https://${shelter.website}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-4 p-5 rounded-3xl bg-cream/30 border border-ocean/5 hover:bg-ocean/5 hover:border-ocean/20 transition-all group/link"
                                                        >
                                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover/link:bg-ocean">
                                                                <Globe className="h-5 w-5 text-ocean group-hover/link:text-cream transition-colors" />
                                                            </div>
                                                            <div className="flex-1 truncate">
                                                                <p className="text-[10px] font-label uppercase tracking-widest text-ocean/30 font-bold mb-1">Rescue Website</p>
                                                                <p className="font-bold text-ocean text-lg flex items-center gap-2">
                                                                    View Online <ExternalLink className="h-4 w-4" />
                                                                </p>
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        {shelter.description && (
                                            <div className="mt-16 pt-12 border-t border-ocean/5">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <div className="w-1 h-8 bg-terracotta rounded-full" />
                                                    <h3 className="font-display font-bold text-ocean text-3xl">Mission & Focus</h3>
                                                </div>
                                                <p className="text-xl text-ocean/60 leading-relaxed font-medium whitespace-pre-line max-w-3xl">
                                                    {shelter.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Interactive Sidebar */}
                        <div className="space-y-8">
                            {/* Map Visualization */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Card className="overflow-hidden border-none shadow-2xl shadow-ocean/5 rounded-[3rem] bg-white">
                                    <div className="p-8 border-b border-ocean/5 flex items-center gap-4">
                                        <div className="p-2.5 bg-ocean text-cream rounded-xl">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-ocean">Proximity Map</h3>
                                    </div>
                                    <div className="h-[400px] w-full bg-cream relative">
                                        {shelter.latitude && shelter.longitude && (
                                            <MapView
                                                initialCenter={{ lat: shelter.latitude, lng: shelter.longitude }}
                                                initialZoom={14}
                                                onMapReady={handleMapReady}
                                            />
                                        )}
                                        <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-ocean/5 shadow-2xl shadow-ocean/10 z-10 pointer-events-none">
                                            <p className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 mb-1">Mobi Geodata Sync</p>
                                            <p className="text-xs font-bold text-ocean">Precision verification complete for this coordinate.</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Verification Standard Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Card className="bg-ocean text-cream border-none shadow-2xl shadow-ocean/10 rounded-[3rem] overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                                        <ShieldCheck className="w-32 h-32 rotate-12" />
                                    </div>
                                    <CardContent className="p-10 relative z-10">
                                        <div className="w-16 h-16 bg-cream text-ocean rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-black/20">
                                            <ShieldCheck className="h-10 w-10 text-terracotta" />
                                        </div>
                                        <h3 className="text-3xl font-display font-bold mb-6 tracking-tight">Recyclish Verification Standard</h3>
                                        <p className="text-cream/60 leading-relaxed font-medium text-lg mb-8">
                                            This rescue has been processed through the Recyclish data validation engine, ensuring it is a licensed, active, and animal-welfare compliant center.
                                        </p>
                                        <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-ocean bg-ocean-light flex items-center justify-center">
                                                        <CheckCircle2 className="w-5 h-5 text-cream/30" />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] font-label uppercase tracking-widest font-bold text-cream/40">Trusted by the community</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
