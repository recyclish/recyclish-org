import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, MapPin, Building2, Phone, Mail, Globe, FileText, User, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "District of Columbia", "Puerto Rico"
];

const CATEGORIES = [
  { value: "shelter", label: "Animal Shelter" },
  { value: "rescue", label: "Rescue Organization" },
  { value: "sanctuary", label: "Animal Sanctuary" },
  { value: "foster_network", label: "Foster Network" },
  { value: "community_resource", label: "Community Resource" },
  { value: "other", label: "Other" },
];

const CORRECTION_TYPES = [
  { value: "new_shelter", label: "New Shelter/Rescue Add" },
  { value: "info_update", label: "Update Existing Listing" },
  { value: "closure_report", label: "Report Permanent Closure" },
  { value: "general", label: "General Feedback" },
];

export default function SubmitFacility() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    category: "",
    materialsAccepted: "",
    additionalNotes: "",
    submitterName: "",
    submitterEmail: "",
  });

  const submitMutation = trpc.facility.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Rescue submission received!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-cream font-body">
        <Header />
        <main className="flex-1 container py-32 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center bg-white/50 backdrop-blur-xl p-16 rounded-[4rem] border border-ocean/5 shadow-2xl"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-terracotta/10 mb-10">
              <CheckCircle className="h-12 w-12 text-terracotta" />
            </div>
            <h1 className="font-display text-5xl font-bold text-ocean mb-6">Census Updated.</h1>
            <p className="text-ocean/50 font-medium text-xl mb-12 leading-relaxed">
              Your submission has been logged in our verification queue.
              Mobi will synchronize your data with the National Atlas within 24-48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-ocean hover:bg-ocean-light text-cream rounded-2xl px-10 h-16 font-bold text-lg shadow-xl shadow-ocean/20">
                  Return to Discovery
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-ocean/40 hover:text-ocean font-label uppercase tracking-widest text-[10px] font-black h-16 px-10"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    address: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    phone: "",
                    email: "",
                    website: "",
                    category: "",
                    materialsAccepted: "",
                    additionalNotes: "",
                    submitterName: "",
                    submitterEmail: "",
                  });
                }}
              >
                Submit Another Rescue
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body selection:bg-terracotta/20 selection:text-terracotta">
      <Header />

      {/* Page Header */}
      <section className="bg-ocean text-cream py-16 md:py-24 px-6 relative overflow-hidden">
        {/* Brand Watermark */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden lg:block">
          <span className="text-[15vw] font-display font-black leading-none tracking-tighter uppercase italic">Submit</span>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Expand the <br />
              <span className="text-terracotta italic underline decoration-terracotta/30 underline-offset-8">National Atlas.</span>
            </h1>
            <p className="text-xl text-cream/60 font-medium leading-relaxed">
              Help us maintain the most accurate directory of animal rescues in the United States.
              Whether it's a new 501(c)(3) or an update to an existing shelter, every entry matters.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container py-20 px-6 relative">
        {/* Topographic Background Pattern */}
        <div className="absolute inset-0 bg-topo-pattern opacity-[0.04] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <Card className="border-none bg-white/80 backdrop-blur-2xl shadow-2xl shadow-ocean/5 rounded-[3.5rem] overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-terracotta/20 via-terracotta to-terracotta/20" />

            <CardHeader className="p-12 pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-ocean text-cream rounded-2xl shadow-lg shadow-ocean/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="font-display text-3xl font-bold text-ocean">Submission Intake</CardTitle>
              </div>
              <CardDescription className="text-ocean/40 font-medium text-lg leading-relaxed">
                Please provide high-fidelity information to ensure a fast verification process.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-12 pt-6">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Submission Type */}
                <div className="space-y-4">
                  <Label htmlFor="correctionType" className="text-[10px] font-label uppercase tracking-[0.3em] font-black text-ocean/30">
                    Submission Intent
                  </Label>
                  <Select
                    value={formData.additionalNotes.includes('[UPDATE LISTING]') ? 'info_update' : 'new_shelter'}
                    onValueChange={(value) => handleChange("category", value === 'info_update' ? formData.category : 'shelter')}
                    required
                  >
                    <SelectTrigger className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold focus:ring-terracotta/20 focus:border-terracotta transition-all">
                      <SelectValue placeholder="What are you submitting today?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-ocean/5">
                      {CORRECTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="focus:bg-ocean focus:text-cream rounded-xl">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Basic Info */}
                <div className="space-y-8 pt-6 border-t border-ocean/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-terracotta rounded-full" />
                    <span className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/30">Rescue Profile</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        Organization Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g., North Shore Animal League"
                        required
                        className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        Facility Classification *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleChange("category", value)}
                        required
                      >
                        <SelectTrigger className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold transition-all focus:ring-terracotta/20 focus:border-terracotta">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-ocean/5">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="focus:bg-ocean focus:text-cream rounded-xl">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-8 pt-6 border-t border-ocean/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-terracotta rounded-full" />
                    <span className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/30">Geographic Data</span>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="123 Rescue Way"
                      required
                      className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-3">
                      <Label htmlFor="city" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        City *
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="New York"
                        required
                        className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="state" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        State *
                      </Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => handleChange("state", value)}
                        required
                      >
                        <SelectTrigger className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold transition-all focus:ring-terracotta/20 focus:border-terracotta">
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-ocean/5">
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state} className="focus:bg-ocean focus:text-cream rounded-xl">
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="zipCode" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        ZIP Code
                      </Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleChange("zipCode", e.target.value)}
                        placeholder="10001"
                        className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Connectivity */}
                <div className="space-y-8 pt-6 border-t border-ocean/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-terracotta rounded-full" />
                    <span className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/30">Connectivity</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        Direct Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="(555) 000-0000"
                        className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        Official Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="contact@rescue.org"
                        className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="website" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                      Web Domain / Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="https://www.rescue.org"
                      className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="space-y-8 pt-6 border-t border-ocean/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-terracotta rounded-full" />
                    <span className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/30">Detailed Metadata</span>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="materialsAccepted" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                      Species Rescued / Animals Served
                    </Label>
                    <Textarea
                      id="materialsAccepted"
                      value={formData.materialsAccepted}
                      onChange={(e) => handleChange("materialsAccepted", e.target.value)}
                      placeholder="e.g., Dogs, Cats, Small Animals, Livestock, etc."
                      className="min-h-[120px] border-ocean/5 bg-cream/30 rounded-[2rem] text-ocean font-bold placeholder:text-ocean/20 p-8 focus:ring-terracotta/20 focus:border-terracotta transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="additionalNotes" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                      Organization Mission / Notes
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={(e) => handleChange("additionalNotes", e.target.value)}
                      placeholder="Any additional context regarding intake hours, fees, or specific facility features."
                      className="min-h-[120px] border-ocean/5 bg-cream/30 rounded-[2rem] text-ocean font-bold placeholder:text-ocean/20 p-8 focus:ring-terracotta/20 focus:border-terracotta transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submitter Info */}
                <div className="space-y-8 pt-8 border-t border-ocean/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-ocean rounded-full" />
                    <span className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/30">Submitter Credentials (Optional)</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="submitterName" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        Full Name
                      </Label>
                      <Input
                        id="submitterName"
                        value={formData.submitterName}
                        onChange={(e) => handleChange("submitterName", e.target.value)}
                        placeholder="Jane Doe"
                        className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="submitterEmail" className="text-[10px] font-label uppercase tracking-widest font-black text-ocean/40 pl-1">
                        Email for Verification Follow-up
                      </Label>
                      <Input
                        id="submitterEmail"
                        type="email"
                        value={formData.submitterEmail}
                        onChange={(e) => handleChange("submitterEmail", e.target.value)}
                        placeholder="jane@example.com"
                        className="h-14 border-ocean/5 bg-cream/30 rounded-2xl text-ocean font-bold placeholder:text-ocean/20 px-6 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-10">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-20 bg-ocean hover:bg-ocean-light text-cream rounded-[2rem] font-bold text-xl shadow-2xl shadow-ocean/20 flex items-center justify-center gap-4 transition-all"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Processing Intake...
                      </>
                    ) : (
                      <>
                        Synchronize with Atlas
                        <ArrowRight className="h-6 w-6" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[10px] font-label uppercase tracking-widest text-ocean/30 font-black mt-6">
                    Mobi Automated Verification Engine Active
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
