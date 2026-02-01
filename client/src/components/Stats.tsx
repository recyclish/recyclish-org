import { motion } from "framer-motion";
import { Building2, MapPin, Layers, Recycle } from "lucide-react";

interface StatsProps {
  totalFacilities: number;
  totalStates: number;
  totalCategories: number;
}

export function Stats({ totalFacilities, totalStates, totalCategories }: StatsProps) {
  const stats = [
    {
      icon: Building2,
      value: totalFacilities.toLocaleString(),
      label: "Recycling Facilities",
    },
    {
      icon: MapPin,
      value: totalStates.toString(),
      label: "States Covered",
    },
    {
      icon: Layers,
      value: totalCategories.toString(),
      label: "Categories",
    },
    {
      icon: Recycle,
      value: "100%",
      label: "Free to Use",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-card rounded-xl p-4 border border-border/50 text-center"
        >
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
            <stat.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {stat.value}
          </div>
          <div className="text-sm font-label text-muted-foreground">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
