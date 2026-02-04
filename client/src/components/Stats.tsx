import { motion } from "framer-motion";
import { DollarSign, ShieldCheck, RefreshCw, Smartphone } from "lucide-react";

export function Stats() {
  const valueProps = [
    {
      icon: DollarSign,
      title: "Free Drop-offs",
      description: "Find locations that accept materials at no cost",
    },
    {
      icon: ShieldCheck,
      title: "Verified Data",
      description: "EPA-sourced and community verified listings",
    },
    {
      icon: RefreshCw,
      title: "Updated Regularly",
      description: "Fresh information you can rely on",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Search and navigate on any device",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {valueProps.map((prop, index) => (
        <motion.div
          key={prop.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-card rounded-xl p-4 border border-border/50 text-center"
        >
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
            <prop.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="font-display text-lg font-bold text-foreground mb-1">
            {prop.title}
          </div>
          <div className="text-xs font-label text-muted-foreground leading-snug">
            {prop.description}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
