import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Recycle, 
  Database, 
  Users, 
  Target, 
  ArrowRight,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Database,
      title: "EPA-Sourced Data",
      description: "Our directory is built on official data from the U.S. Environmental Protection Agency's Recycling Infrastructure dataset.",
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Designed to help individuals and businesses find responsible recycling options in their local communities.",
    },
    {
      icon: Target,
      title: "Comprehensive Coverage",
      description: "Covering all 50 states with over 1,900 facilities across 11 different recycling categories including sharps disposal.",
    },
  ];

  const categories = [
    "Electronics Recycling",
    "Material Recovery Facilities (MRFs)",
    "Plastic Recycling",
    "Glass Recycling",
    "Paper Recycling",
    "Textile Recycling",
    "Wood Recycling",
    "Glass Secondary Processing",
    "Wood Secondary Processing",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[oklch(0.35_0.08_250)]">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/99778916/VQWiUEBjKxxYaPFV.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container relative py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-white"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              About the National Recycling Directory
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-body leading-relaxed">
              A free resource helping Americans find recycling facilities in their communities, 
              powered by official EPA data and maintained by Recyclish LLC.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground font-body text-lg leading-relaxed mb-6">
              The National Recycling Directory was created to address a simple but important problem: 
              finding where to recycle specific materials shouldn't be difficult. Whether you're looking 
              to responsibly dispose of old electronics, recycle plastic containers, or find a facility 
              that accepts textiles, our directory makes it easy.
            </p>
            <p className="text-muted-foreground font-body text-lg leading-relaxed mb-6">
              This project is a service of <a href="https://recyclish.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Recyclish LLC</a>, a company dedicated to 
              promoting sustainable practices and making recycling accessible to everyone.
            </p>
            <a
              href="https://recyclish.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="font-label">
                Learn About Recyclish
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <a 
              href="https://recyclish.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
            >
              <img
                src="https://manus-storage-test.oss-cn-beijing.aliyuncs.com/user-file/e6d2f6a2-7e4c-4f7f-8a75-c4f8a0e8f7e3/fulllogo_transparent.png"
                alt="Recyclish - Turning Knowledge into Action"
                className="w-full max-w-md h-auto"
              />
            </a>
            <p className="text-sm text-muted-foreground mt-4 font-body">
              A service of <a href="https://recyclish.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Recyclish LLC</a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              Why Use Our Directory?
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              We've built this directory with reliability and ease of use in mind.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground font-body">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold mb-4">
            Recycling Categories
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Our directory covers a wide range of recycling facility types to help you 
            find the right place for your materials.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/50"
            >
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <span className="font-body">{category}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Data Source Section */}
      <section className="bg-[oklch(0.35_0.08_250)] text-white py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Recycle className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="font-display text-3xl font-bold mb-4">
              Data Source & Accuracy
            </h2>
            <p className="text-white/80 font-body text-lg leading-relaxed mb-6">
              The data in this directory comes from the U.S. Environmental Protection Agency's 
              Recycling Infrastructure dataset. This dataset was developed to support the 
              National Recycling Goal of increasing the U.S. recycling rate to 50% by 2030.
            </p>
            <p className="text-white/60 font-body text-sm">
              While we strive to keep information accurate, facility details may change. 
              We recommend calling ahead to confirm hours and accepted materials.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Find a Recycling Center?
          </h2>
          <p className="text-muted-foreground font-body text-lg mb-6 max-w-xl mx-auto">
            Search our directory to find recycling facilities near you.
          </p>
          <Link href="/">
            <Button size="lg" className="font-label">
              Search the Directory
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
