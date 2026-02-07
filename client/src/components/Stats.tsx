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
    <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-2 text-center">
      {valueProps.map((prop, index) => (
        <>
          {index > 0 && (
            <div className="hidden sm:block w-px h-8 bg-border/60 self-center" />
          )}
          <div
            key={prop.title}
            className="flex items-center gap-2 py-1"
          >
            <prop.icon className="h-4 w-4 text-primary shrink-0" />
            <div className="text-left">
              <span className="text-sm font-semibold text-foreground">{prop.title}</span>
              <span className="text-xs text-muted-foreground ml-1.5 hidden sm:inline">— {prop.description}</span>
              <p className="text-xs text-muted-foreground leading-tight sm:hidden">{prop.description}</p>
            </div>
          </div>
        </>
      ))}
    </div>
  );
}
