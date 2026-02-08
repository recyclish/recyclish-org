import { Fragment } from "react";
import { ShieldCheck, RefreshCw, Smartphone } from "lucide-react";

export function Stats() {
  const valueProps = [
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
    <>
      {/* Desktop: horizontal row with dividers */}
      <div className="hidden sm:flex items-center justify-center gap-x-6 text-center">
        {valueProps.map((prop, index) => (
          <Fragment key={prop.title}>
            {index > 0 && (
              <div className="w-px h-8 bg-border/60 self-center" />
            )}
            <div className="flex items-center gap-2.5 py-1">
              <prop.icon className="h-4 w-4 text-primary shrink-0" />
              <div className="text-left">
                <span className="text-sm font-semibold text-foreground">{prop.title}</span>
                <span className="text-xs text-muted-foreground ml-1.5">— {prop.description}</span>
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      {/* Mobile: vertical stack, all items left-aligned identically */}
      <div className="flex sm:hidden flex-col items-center gap-3">
        {valueProps.map((prop) => (
          <div key={prop.title} className="flex items-start gap-3 w-64">
            <div className="w-5 shrink-0 flex justify-center pt-0.5">
              <prop.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{prop.title}</p>
              <p className="text-xs text-muted-foreground leading-tight">{prop.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
