import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Recycle, Menu, X, Shield, Heart } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navLinks = [
    { href: "/", label: "Directory" },
    { href: "/map", label: "Map" },
    { href: "/submit", label: "Submit" },
    { href: "/about", label: "About" },
  ];

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Recycle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-semibold leading-tight">
                National Recycling
              </span>
              <span className="text-xs font-label text-muted-foreground -mt-0.5">
                Directory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="font-label"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/favorites">
                <Button
                  variant={location === "/favorites" ? "secondary" : "ghost"}
                  size="sm"
                  className="font-label"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Favorites
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant={location === "/admin" ? "secondary" : "ghost"}
                  size="sm"
                  className="font-label text-primary"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </Link>
            )}
            <div className="ml-2 pl-2 border-l border-border">
              <a
                href="https://recyclish.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" size="sm" className="font-label">
                  Recyclish LLC
                </Button>
              </a>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-card"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start font-label"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              {isAuthenticated && (
                <Link href="/favorites">
                  <Button
                    variant={location === "/favorites" ? "secondary" : "ghost"}
                    className="w-full justify-start font-label"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant={location === "/admin" ? "secondary" : "ghost"}
                    className="w-full justify-start font-label text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <a
                href="https://recyclish.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2"
              >
                <Button variant="default" className="w-full font-label">
                  Recyclish LLC
                </Button>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
