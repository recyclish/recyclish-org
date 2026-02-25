import { Recycle } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="py-20 px-6 bg-cream-dark border-t border-ocean/5">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-3 transition-all cursor-pointer group">
            <Recycle className="w-8 h-8 text-terracotta group-hover:rotate-180 transition-transform duration-700" />
            <span className="font-display font-bold text-2xl text-ocean pt-1 tracking-tight">
              Recyclish Community
            </span>
          </Link>
          <p className="text-ocean/40 text-[10px] font-label uppercase tracking-[0.2em] text-center max-w-lg leading-loose font-bold">
            CONNECTING PEOPLE TO THE CAUSES THEY CARE ABOUT. <br />
            &copy; {new Date().getFullYear()} ANIMAL SHELTER DIRECTORY. A RECYCLISH INITIATIVE.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-label uppercase tracking-[0.2em] text-ocean/50 font-bold">
          <Link href="/privacy" className="hover:text-terracotta transition-colors">
            PRIVACY POLICY
          </Link>
          <Link href="/terms" className="hover:text-terracotta transition-colors">
            TERMS OF SERVICE
          </Link>
          <a
            href="https://recyclish.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-terracotta transition-colors border-b border-terracotta/20 pb-0.5"
          >
            BACK TO RECYCLISH.COM
          </a>
          <Link href="/contact" className="hover:text-terracotta transition-colors">
            SUPPORT
          </Link>
        </nav>
      </div>
    </footer>
  );
}
