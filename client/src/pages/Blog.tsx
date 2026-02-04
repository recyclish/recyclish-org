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
  Recycle,
  Cpu,
  Syringe,
  HelpCircle,
  MapPin
} from "lucide-react";

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
    slug: "how-to-recycle-electronics-safely",
    title: "How to Recycle Electronics Safely: A Complete Guide",
    excerpt: "Learn the proper way to dispose of old computers, phones, TVs, and other electronic devices. Find out what happens to e-waste and why proper recycling matters.",
    category: "Electronics",
    readTime: "8 min read",
    publishDate: "2024-02-01",
    icon: Cpu,
    featured: true,
  },
  {
    slug: "sharps-disposal-guide-glp1-medications",
    title: "Sharps Disposal Guide for Ozempic, Wegovy & GLP-1 Medications",
    excerpt: "Essential guide for safely disposing of needles and syringes from injectable medications. Find FDA-approved disposal methods and local drop-off locations.",
    category: "Medical Waste",
    readTime: "6 min read",
    publishDate: "2024-01-28",
    icon: Syringe,
    featured: true,
  },
  {
    slug: "what-can-and-cannot-be-recycled",
    title: "What Can and Cannot Be Recycled: The Ultimate Checklist",
    excerpt: "Stop guessing! This comprehensive guide covers what belongs in your recycling bin and what doesn't. Avoid contamination and recycle right.",
    category: "Basics",
    readTime: "10 min read",
    publishDate: "2024-01-25",
    icon: HelpCircle,
  },
  {
    slug: "find-free-recycling-near-you",
    title: "How to Find Free Recycling Centers Near You",
    excerpt: "Discover free recycling options in your area for electronics, batteries, plastics, and more. Tips for finding facilities that won't charge you a dime.",
    category: "Tips",
    readTime: "5 min read",
    publishDate: "2024-01-20",
    icon: MapPin,
  },
];

export default function Blog() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <Helmet>
        <title>Recycling Guides & Tips | National Recycling Directory Blog</title>
        <meta 
          name="description" 
          content="Expert recycling guides, tips, and how-to articles. Learn about electronics recycling, sharps disposal, what can be recycled, and find free recycling near you." 
        />
        <meta 
          name="keywords" 
          content="recycling guide, how to recycle, electronics recycling, sharps disposal, e-waste, recycling tips, what can be recycled, free recycling" 
        />
        <meta property="og:title" content="Recycling Guides & Tips | National Recycling Directory Blog" />
        <meta property="og:description" content="Expert recycling guides, tips, and how-to articles to help you recycle right." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://recycling.recyclish.com/blog" />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[oklch(0.35_0.08_250)]">
        <div className="container relative py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-white"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-label mb-4">
              <Recycle className="h-4 w-4" />
              <span>Recycling Guides</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Learn How to Recycle Right
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-body leading-relaxed">
              Expert guides, tips, and resources to help you recycle responsibly 
              and make a positive impact on the environment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="container py-12">
          <h2 className="font-display text-2xl font-bold mb-6">Featured Guides</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group border-2 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <post.icon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                              Featured
                            </Badge>
                          </div>
                          <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground font-body text-sm mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground font-label">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(post.publishDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
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
        </section>
      )}

      {/* All Posts */}
      <section className="container pb-16">
        <h2 className="font-display text-2xl font-bold mb-6">All Guides</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <post.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {post.category}
                    </Badge>
                    <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-label">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                      <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                        Read More
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/30 py-12">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold mb-3">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground font-body mb-6 max-w-xl mx-auto">
            Search our directory of over 2,000 recycling facilities to find the right 
            place to recycle your materials.
          </p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-label hover:bg-primary/90 transition-colors">
              Search the Directory
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
