import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Globe, ExternalLink, Heart, ChevronRight, Navigation, Clock, PawPrint, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface Shelter {
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    website: string;
    shelterType: string;
    speciesServed: string[];
    isNoKill: boolean;
    verified: boolean;
    latitude: number;
    longitude: number;
    distance?: number;
}

interface ShelterCardProps {
    shelter: Shelter;
    index: number;
    isFavorite?: boolean;
}

export function ShelterCard({ shelter, index, isFavorite = false }: ShelterCardProps) {
    const { isAuthenticated } = useAuth();

    const getDirections = () => {
        const destination = encodeURIComponent(`${shelter.addressLine1}, ${shelter.city}, ${shelter.state}`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
        >
            <Card className="h-full hover:shadow-2xl transition-all duration-500 border-ocean/5 bg-white/90 backdrop-blur-md group overflow-hidden rounded-[2rem]">
                <div className="h-1.5 bg-gradient-to-r from-terracotta/20 via-terracotta to-terracotta/20 group-hover:h-2 transition-all" />
                <CardHeader className="pb-4 pt-8 px-8">
                    <div className="flex items-start justify-between gap-4">
                        <Link href={`/shelter/${shelter.id}`}>
                            <CardTitle className="text-2xl font-display font-bold text-ocean leading-tight line-clamp-2 flex-1 hover:text-terracotta transition-colors cursor-pointer capitalize">
                                {shelter.name.toLowerCase()}
                            </CardTitle>
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {shelter.verified && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-ocean text-cream text-[9px] font-label uppercase tracking-widest font-black rounded-full">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                            </div>
                        )}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/10 text-terracotta text-[9px] font-label uppercase tracking-widest font-black rounded-full">
                            <PawPrint className="h-3 w-3" />
                            {shelter.shelterType}
                        </div>
                        {shelter.isNoKill && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-ocean/5 text-ocean/40 text-[9px] font-label uppercase tracking-widest font-black rounded-full border border-ocean/5">
                                No-Kill
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 px-8 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cream flex items-center justify-center shrink-0 border border-ocean/5">
                                <MapPin className="h-5 w-5 text-terracotta" />
                            </div>
                            <div className="flex-1 pt-1">
                                <span className="block text-ocean font-bold text-sm leading-tight">{shelter.addressLine1}</span>
                                <span className="block text-ocean/40 text-xs font-label uppercase tracking-widest font-bold mt-1">
                                    {shelter.city}, {shelter.state}
                                </span>
                                {shelter.distance !== undefined && (
                                    <div className="inline-block mt-2 px-2 py-0.5 bg-terracotta text-cream text-[10px] font-label uppercase tracking-widest font-black rounded-md shadow-lg shadow-terracotta/20">
                                        {shelter.distance.toFixed(1)} Miles
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {shelter.phone && (
                                <a href={`tel:${shelter.phone}`} className="flex items-center gap-2 p-3 rounded-2xl bg-cream/50 border border-ocean/5 hover:bg-terracotta/5 hover:border-terracotta/20 transition-all group/link">
                                    <Phone className="h-4 w-4 text-ocean/20 group-hover/link:text-terracotta transition-colors" />
                                    <span className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/60">Call</span>
                                </a>
                            )}
                            {shelter.website && (
                                <a
                                    href={shelter.website.startsWith('http') ? shelter.website : `https://${shelter.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-3 rounded-2xl bg-cream/50 border border-ocean/5 hover:bg-ocean/5 hover:border-ocean/20 transition-all group/link"
                                >
                                    <Globe className="h-4 w-4 text-ocean/20 group-hover/link:text-ocean transition-colors" />
                                    <span className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/60">Web</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl font-label text-[10px] uppercase tracking-widest font-black text-ocean/40 hover:text-terracotta hover:bg-terracotta/5 transition-all"
                            onClick={getDirections}
                        >
                            <Navigation className="h-4 w-4 mr-2" />
                            Map
                        </Button>
                        <Link href={`/shelter/${shelter.id}`} className="flex-1">
                            <Button
                                className="w-full h-12 rounded-2xl bg-ocean hover:bg-ocean-light text-cream font-bold shadow-xl shadow-ocean/20 transition-all flex items-center justify-center gap-2"
                            >
                                Details
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
