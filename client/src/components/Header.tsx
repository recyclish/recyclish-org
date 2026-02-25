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
    { href: "/directory", label: "Directory" },
    { href: "/map", label: "Map" },
    { href: "/submit", label: "Submit" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
  ];

  const isAdmin = user?.role === "admin";

  return (
    <div className="w-full">
      {/* Recyclish Brand Bar */}
      <div className="bg-ocean py-2 px-6 text-center">
        <p className="text-cream/60 text-[10px] font-label uppercase tracking-[0.4em] font-bold">
          An Official Recyclish Community Project
        </p>
      </div>

      <header className="py-4 lg:py-8 px-6 bg-cream border-b border-ocean/5 relative z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-terracotta p-2.5 rounded-xl shadow-lg shadow-terracotta/20">
                <Recycle className="w-6 h-6 text-cream" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-ocean block leading-none">
                  Animal Shelter Directory
                </span>
                <span className="text-[10px] font-label uppercase tracking-[0.2em] text-terracotta font-black mt-1">
                  A RECYCLISH INITIATIVE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 bg-ocean/5 px-4 py-2 rounded-full border border-ocean/10">
                <span className="flex h-2 w-2 rounded-full bg-terracotta animate-pulse" />
                <span className="text-ocean font-label text-[10px] uppercase tracking-widest font-bold pt-0.5">Development in Progress</span>
              </div>

              <div className="h-4 w-[1px] bg-ocean/10" />

              <div className="flex items-center gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`font-label text-xs uppercase tracking-widest font-bold hover:bg-terracotta/10 hover:text-terracotta transition-all ${location === link.href ? "text-terracotta" : "text-ocean/60"
                        }`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>

              {isAuthenticated && (
                <Link href="/favorites">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`font-label text-xs uppercase tracking-widest font-bold hover:bg-terracotta/10 hover:text-terracotta transition-all ${location === "/favorites" ? "text-terracotta" : "text-ocean/60"
                      }`}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Saved
                  </Button>
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-label text-xs uppercase tracking-widest font-bold text-terracotta hover:bg-terracotta/10"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-ocean"
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
              className="md:hidden absolute top-full left-0 w-full bg-cream border-b border-ocean/10 shadow-2xl"
            >
              <nav className="container py-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-label text-xs uppercase tracking-widest font-bold text-ocean/60"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link href="/favorites">
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-label text-xs uppercase tracking-widest font-bold text-ocean/60"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Saved Rescues
                    </Button>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-label text-xs uppercase tracking-widest font-bold text-terracotta"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
