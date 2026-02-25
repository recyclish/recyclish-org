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
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50 bg-card group overflow-hidden">
                <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <Link href={`/shelter/${shelter.id}`}>
                            <CardTitle className="text-xl font-display leading-tight line-clamp-2 flex-1 hover:text-primary transition-colors cursor-pointer capitalize">
                                {shelter.name.toLowerCase()}
                            </CardTitle>
                        </Link>
                        {shelter.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            <PawPrint className="h-3 w-3 mr-1" />
                            {shelter.shelterType}
                        </Badge>
                        {shelter.isNoKill && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                No-Kill
                            </Badge>
                        )}
                        {shelter.speciesServed?.map(species => (
                            <Badge key={species} variant="secondary" className="text-[10px] uppercase tracking-wider">
                                {species}
                            </Badge>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                            <div className="flex-1">
                                <span className="line-clamp-1">{shelter.addressLine1}</span>
                                <span className="block text-xs">{shelter.city}, {shelter.state} {shelter.zip}</span>
                                {shelter.distance !== undefined && (
                                    <span className="block text-sm text-primary font-bold mt-1">
                                        {shelter.distance.toFixed(1)} miles away
                                    </span>
                                )}
                            </div>
                        </div>

                        {shelter.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <a href={`tel:${shelter.phone}`} className="hover:text-primary transition-colors">
                                    {shelter.phone}
                                </a>
                            </div>
                        )}

                        {shelter.website && (
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <a
                                    href={shelter.website.startsWith('http') ? shelter.website : `https://${shelter.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors truncate flex items-center gap-1"
                                >
                                    Visit Website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-full border-primary/20 hover:bg-primary/5"
                            onClick={getDirections}
                        >
                            <Navigation className="h-4 w-4 mr-2" />
                            Directions
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="flex-1 rounded-full shadow-lg shadow-primary/20"
                        >
                            Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
