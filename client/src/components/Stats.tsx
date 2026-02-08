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
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 sm:gap-y-2 text-center">
      {valueProps.map((prop, index) => (
        <Fragment key={prop.title}>
          {index > 0 && (
            <div className="hidden sm:block w-px h-8 bg-border/60 self-center" />
          )}
          <div className="flex items-center gap-2.5 py-1">
            <prop.icon className="h-5 w-5 sm:h-4 sm:w-4 text-primary shrink-0" />
            <div className="text-left">
              <span className="text-sm font-semibold text-foreground">{prop.title}</span>
              <span className="text-xs text-muted-foreground ml-1.5 hidden sm:inline">— {prop.description}</span>
              <p className="text-xs text-muted-foreground leading-tight sm:hidden">{prop.description}</p>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
