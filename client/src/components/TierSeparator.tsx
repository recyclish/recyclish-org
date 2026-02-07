import { Home, DollarSign, Syringe, ShoppingBag, Building2, Warehouse, Cpu, Factory } from "lucide-react";

interface TierInfo {
  tier: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const TIER_CONFIG: Record<number, TierInfo> = {
  1: {
    tier: 1,
    label: "Free Municipal & Household Drop-off",
    description: "Free drop-off sites run by local government — accepts common household recyclables",
    icon: <Home className="h-4 w-4" />,
    colorClass: "text-green-700",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
  },
  2: {
    tier: 2,
    label: "Free Drop-off Sites",
    description: "Additional free drop-off locations for recyclable materials",
    icon: <DollarSign className="h-4 w-4" />,
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
  },
  3: {
    tier: 3,
    label: "Sharps & Needles Disposal",
    description: "Safe disposal locations for needles, syringes, and other sharps",
    icon: <Syringe className="h-4 w-4" />,
    colorClass: "text-red-700",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
  },
  4: {
    tier: 4,
    label: "Retail Take-Back Programs",
    description: "Stores and retailers that accept recyclable items — convenient drop-off while you shop",
    icon: <ShoppingBag className="h-4 w-4" />,
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  5: {
    tier: 5,
    label: "Other Drop-off Facilities",
    description: "Additional facilities accepting drop-off recyclables (fees may apply)",
    icon: <Building2 className="h-4 w-4" />,
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
  },
  6: {
    tier: 6,
    label: "Municipal & Household Facilities",
    description: "Government-run recycling facilities (fees may apply)",
    icon: <Home className="h-4 w-4" />,
    colorClass: "text-teal-700",
    bgClass: "bg-teal-50",
    borderClass: "border-teal-200",
  },
  7: {
    tier: 7,
    label: "General Recycling Facilities",
    description: "Recycling centers and material recovery facilities",
    icon: <Warehouse className="h-4 w-4" />,
    colorClass: "text-slate-700",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-200",
  },
  8: {
    tier: 8,
    label: "Electronics Recyclers",
    description: "Specialized facilities for e-waste, computers, TVs, and electronic equipment",
    icon: <Cpu className="h-4 w-4" />,
    colorClass: "text-violet-700",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-200",
  },
  9: {
    tier: 9,
    label: "Commercial & Industrial Recyclers",
    description: "Facilities primarily serving businesses and industrial operations",
    icon: <Factory className="h-4 w-4" />,
    colorClass: "text-gray-600",
    bgClass: "bg-gray-50",
    borderClass: "border-gray-200",
  },
};

interface TierSeparatorProps {
  tier: number;
  count: number;
}

export function TierSeparator({ tier, count }: TierSeparatorProps) {
  const config = TIER_CONFIG[tier];
  if (!config) return null;

  return (
    <div className="col-span-full" role="separator" aria-label={config.label}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bgClass} ${config.borderClass}`}>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${config.bgClass} ${config.colorClass} border ${config.borderClass}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-display text-sm font-semibold ${config.colorClass}`}>
              {config.label}
            </h3>
            <span className={`text-xs font-label px-2 py-0.5 rounded-full ${config.bgClass} ${config.colorClass} border ${config.borderClass}`}>
              {count} {count === 1 ? "facility" : "facilities"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-1">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export { TIER_CONFIG };
export type { TierInfo };
