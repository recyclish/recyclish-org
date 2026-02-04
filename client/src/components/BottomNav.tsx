import { Home, Map, Search, Heart, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Directory", href: "/directory" },
  { icon: Map, label: "Map", href: "/map" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
];

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Browse Directory", href: "/directory" },
  { label: "Map View", href: "/map" },
  { label: "Submit Facility", href: "/submit" },
  { label: "Browse by State", href: "/states" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Favorites", href: "/favorites" },
  { label: "Admin", href: "/admin" },
];

export function BottomNav() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);



  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = 
            item.href === "/" 
              ? location === "/" 
              : item.href === "/#search"
                ? location === "/"
                : location.startsWith(item.href);
          
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("text-xs font-label", isActive && "text-primary font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* More Menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs font-label">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="font-display text-lg">Menu</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 pb-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors font-body",
                    location === item.href || (item.href !== "/" && location.startsWith(item.href))
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
