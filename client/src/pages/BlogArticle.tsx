import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { 
  Calendar, 
  Clock, 
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Search
} from "lucide-react";
import { blogPosts } from "./Blog";
import { blogArticles } from "@/data/blogArticles";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  
  const post = blogPosts.find(p => p.slug === slug);
  const article = blogArticles[slug || ""];
  
  if (!post || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />
        <div className="container py-16 text-center flex-1">
          <h1 className="font-display text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentIndex = blogPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  const shareUrl = `https://recycling.recyclish.com/blog/${slug}`;
  const shareTitle = post.title;
  const shareDescription = post.excerpt;

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <Helmet>
        <title>{post.title} | National Recycling Directory</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={article.keywords.join(", ")} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="article:published_time" content={post.publishDate} />
        <meta property="article:section" content={post.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <link rel="canonical" href={shareUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.publishDate,
            "author": {
              "@type": "Organization",
              "name": "Recyclish LLC"
            },
            "publisher": {
              "@type": "Organization",
              "name": "National Recycling Directory",
              "logo": {
                "@type": "ImageObject",
                "url": "https://recycling.recyclish.com/logo.png"
              }
            }
          })}
        </script>
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border/50">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm font-label text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <section className="container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            {post.title}
          </h1>

          <p className="text-lg text-muted-foreground font-body mb-6">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-label mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>

          <div className="border-t border-border pt-4">
            <SocialShareButtons 
              url={shareUrl}
              title={shareTitle}
              description={shareDescription}
            />
          </div>
        </motion.div>
      </section>

      {/* Article Content */}
      <section className="container pb-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto prose prose-lg prose-slate dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </section>

      {/* CTA Section */}
      <section className="container pb-12">
        <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <Search className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">
              Find Recycling Centers Near You
            </h3>
            <p className="text-muted-foreground font-body mb-4">
              Search our directory of over 2,000 facilities across all 50 states.
            </p>
            <Link href="/">
              <Button>
                Search the Directory
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Related Articles */}
      {(prevPost || nextPost) && (
        <section className="bg-secondary/30 py-12">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">
              Continue Reading
            </h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
              {prevPost && (
                <Link href={`/blog/${prevPost.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-5">
                      <span className="text-xs text-muted-foreground font-label flex items-center gap-1 mb-2">
                        <ArrowLeft className="h-3 w-3" />
                        Previous Article
                      </span>
                      <h3 className="font-display font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {prevPost.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              )}
              {nextPost && (
                <Link href={`/blog/${nextPost.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-5">
                      <span className="text-xs text-muted-foreground font-label flex items-center gap-1 mb-2 justify-end">
                        Next Article
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      <h3 className="font-display font-semibold group-hover:text-primary transition-colors line-clamp-2 text-right">
                        {nextPost.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
