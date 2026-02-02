import { Recycle, Heart } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[oklch(0.35_0.08_250)] text-white mt-auto">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-white/10">
                <Recycle className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-semibold leading-tight">
                  National Recycling
                </span>
                <span className="text-xs font-label text-white/70 -mt-0.5">
                  Directory
                </span>
              </div>
            </div>
            <p className="text-sm text-white/80 font-body leading-relaxed">
              A comprehensive directory of recycling facilities across the United States, 
              helping communities find responsible ways to recycle electronics, plastics, 
              glass, paper, and more.
            </p>
          </div>
          
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 font-body">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Search Directory
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                  About This Project
                </Link>
              </li>
              <li>
                <a 
                  href="https://recyclish.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Recyclish LLC
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Data Sources</h3>
            <p className="text-sm text-white/80 font-body leading-relaxed mb-3">
              This directory uses data from the U.S. Environmental Protection Agency (EPA) 
              Recycling Infrastructure dataset, which includes information on over 1,750 
              recycling facilities nationwide.
            </p>
            <p className="text-xs text-white/60 font-label">
              Last updated: 2025
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white/70 font-body flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-[oklch(0.72_0.12_45)]" /> by
            </p>
            <a 
              href="https://recyclish.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/TzwKbZtYhBOMfoAs.png" 
                alt="Recyclish - Turning Knowledge into Action" 
                className="h-10 w-auto brightness-0 invert"
              />
            </a>
          </div>
          <p className="text-xs text-white/50 font-label">
            © {new Date().getFullYear()} National Recycling Directory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
