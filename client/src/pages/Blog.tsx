import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  Clock,
  ArrowRight,
  Heart,
  PawPrint,
  Home as HomeIcon,
  ShieldCheck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "preparing-for-your-first-adoption",
    title: "The Sanctuary Guide: Preparing for Your First Rescue Adoption",
    excerpt: "Everything you need to know before bringing a rescue pet home. From home-proofing to finding the right veterinarian in your community.",
    category: "Adoption",
    readTime: "8 min read",
    publishDate: "2024-02-01",
    icon: HomeIcon,
    featured: true,
  },
  {
    slug: "understanding-no-kill-sanctuaries",
    title: "Safe Haven: Understanding the Impact of No-Kill Sanctuaries",
    excerpt: "A deep dive into the philosophy and operations of no-kill rescue organizations and how they are transforming the animal welfare landscape.",
    category: "Insights",
    readTime: "6 min read",
    publishDate: "2024-01-28",
    icon: ShieldCheck,
    featured: true,
  },
  {
    slug: "volunteering-at-local-rescues",
    title: "Community Action: A Guide to Volunteering at Local Rescues",
    excerpt: "Discover the various ways you can contribute to animal welfare in your area, beyond just adoption. From fostering to administrative support.",
    category: "Volunteer",
    readTime: "10 min read",
    publishDate: "2024-01-25",
    icon: PawPrint,
  },
  {
    slug: "mobi-verification-and-data-fidelity",
    title: "High Fidelity: How Mobi Verification Ensures Rescue Safety",
    excerpt: "Learn about our proprietary verification system that keeps our community atlas accurate and ensures every listed organization meets humane standards.",
    category: "Mobi",
    readTime: "5 min read",
    publishDate: "2024-01-20",
    icon: Heart,
  },
];

export default function Blog() {
  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
      <Helmet>
        <title>Rescue Insights & Guides | Animal Rescue Directory</title>
        <meta
          name="description"
          content="Expert guides on animal adoption, rescue operations, and community welfare. Learn how to support your local sanctuary."
        />
      </Helmet>

      <Header />

      {/* Hero Section - Ocean Palette */}
      <section className="relative overflow-hidden bg-ocean text-cream py-24 md:py-32 px-6">
        <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none overflow-hidden">
          <span className="text-[30vw] font-display font-black leading-none tracking-tighter uppercase italic whitespace-nowrap -ml-20 -mt-20">Insights</span>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-1 bg-terracotta rounded-full" />
              <span className="text-[10px] font-label uppercase tracking-[0.4em] font-black text-cream/40">The Knowledge Atlas</span>
            </div>
            <h1 className="font-display text-5xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
              A Voice for <br />
              <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-[12px]">The Voiceless.</span>
            </h1>
            <p className="text-xl md:text-3xl text-cream/70 font-medium leading-relaxed max-w-2xl">
              Expert guides, community stories, and operational insights from the front lines of the National Animal Welfare mission.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

          <div className="container relative z-10">
            <h2 className="font-display text-4xl font-bold text-ocean mb-12">Featured Insights</h2>
            <div className="grid gap-12 md:grid-cols-2">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="h-full bg-white/40 backdrop-blur-xl hover:shadow-2xl transition-all cursor-pointer group border-ocean/5 rounded-[3rem] overflow-hidden">
                      <CardContent className="p-10">
                        <div className="flex flex-col sm:flex-row items-start gap-8">
                          <div className="shrink-0 w-20 h-20 rounded-[2rem] bg-ocean/5 flex items-center justify-center group-hover:bg-terracotta group-hover:text-cream transition-all duration-500">
                            <post.icon className="h-10 w-10" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-4">
                              <Badge className="bg-ocean/5 text-ocean/40 border-none px-4 py-1.5 rounded-full text-[10px] font-label font-black uppercase tracking-widest">
                                {post.category}
                              </Badge>
                              <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                              <span className="text-[10px] font-label font-black uppercase tracking-widest text-ocean/20">Featured</span>
                            </div>
                            <h3 className="font-display text-3xl font-bold text-ocean mb-4 group-hover:text-terracotta transition-colors leading-tight">
                              {post.title}
                            </h3>
                            <p className="text-ocean/50 font-medium text-lg mb-8 leading-relaxed">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-8 text-[10px] font-label font-black uppercase tracking-widest text-ocean/20">
                              <span className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.publishDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-2 text-terracotta">
                                <Clock className="h-3 w-3" />
                                {post.readTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="container py-24 px-6 border-t border-ocean/5">
        <h2 className="font-display text-4xl font-bold text-ocean mb-12">The Full Atlas</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="h-full bg-white/40 backdrop-blur-xl hover:shadow-xl transition-all cursor-pointer group border-ocean/5 rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-ocean/5 flex items-center justify-center mb-6 group-hover:bg-ocean group-hover:text-cream transition-all">
                      <post.icon className="h-7 w-7" />
                    </div>
                    <Badge className="bg-ocean/5 text-ocean/40 border-none px-3 py-1 rounded-full text-[9px] font-label font-black uppercase tracking-widest mb-4">
                      {post.category}
                    </Badge>
                    <h3 className="font-display text-2xl font-bold text-ocean mb-4 group-hover:text-terracotta transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-ocean/50 font-medium text-sm mb-8 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-[9px] font-label font-black uppercase tracking-widest text-ocean/20">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                      <span className="flex items-center gap-2 text-terracotta group-hover:gap-4 transition-all">
                        Open File
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section - Terracotta Accents */}
      <section className="bg-topo-pattern bg-repeat py-24 px-6 border-y border-ocean/5">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ocean mb-6">
              Missing a <span className="text-terracotta italic">Sanctuary?</span>
            </h2>
            <p className="text-ocean/40 font-medium text-xl mb-12 leading-relaxed">
              Our community atlas grows with every verified submission. Help us map the unmapped organizations in your region.
            </p>
            <Link href="/directory">
              <Button className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-12 h-16 font-bold text-lg shadow-xl shadow-ocean/20 transition-all">
                Search the Full Directory
                <ArrowRight className="h-5 w-5 ml-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
