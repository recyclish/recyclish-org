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
import { Loader2, CheckCircle, MapPin, Building2, Phone, Mail, Globe, FileText, User } from "lucide-react";
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
  { value: "Electronics Recyclers", label: "Electronics Recycling" },
  { value: "Material Recovery Facilities (MRFs)", label: "Material Recovery Facility (MRF)" },
  { value: "PlasticRecycling Facilities", label: "Plastic Recycling" },
  { value: "GlassRecycling Facilities", label: "Glass Recycling" },
  { value: "PaperRecycling Facilities", label: "Paper Recycling" },
  { value: "TextilesRecycling Facilities", label: "Textile Recycling" },
  { value: "WoodRecycling Facilities", label: "Wood Recycling" },
  { value: "Other", label: "Other" },
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
      toast.success("Facility submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit facility. Please try again.");
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
      <div className="min-h-screen flex flex-col bg-topo-pattern">
        <Header />
        <main className="flex-1 container py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-muted-foreground font-body text-lg mb-8">
              Your facility submission has been received. Our team will review it and add it to the 
              directory if it meets our criteria. This typically takes 1-3 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button className="font-label">
                  Back to Directory
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="font-label"
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
                Submit Another
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-topo-pattern">
      <Header />
      
      <main className="flex-1 container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Submit a Recycling Facility
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Know a recycling center that's not in our directory? Help us expand our database 
              by submitting its information below.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Facility Information
              </CardTitle>
              <CardDescription className="font-body">
                Please provide as much information as possible. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="font-label">
                      Facility Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g., Green Earth Recycling Center"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="font-label">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                      required
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-label text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="font-label">
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="123 Main Street"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="font-label">
                        City *
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Los Angeles"
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="font-label">
                        State *
                      </Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => handleChange("state", value)}
                        required
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="w-1/2">
                    <Label htmlFor="zipCode" className="font-label">
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      placeholder="90001"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-label text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="font-label">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="(555) 123-4567"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-label">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="info@example.com"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website" className="font-label flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-label text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Additional Details
                  </div>

                  <div>
                    <Label htmlFor="materialsAccepted" className="font-label">
                      Materials Accepted
                    </Label>
                    <Textarea
                      id="materialsAccepted"
                      value={formData.materialsAccepted}
                      onChange={(e) => handleChange("materialsAccepted", e.target.value)}
                      placeholder="e.g., Computers, TVs, cell phones, batteries, etc."
                      className="mt-1.5"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes" className="font-label">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={(e) => handleChange("additionalNotes", e.target.value)}
                      placeholder="Any other relevant information (hours, fees, special instructions, etc.)"
                      className="mt-1.5"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submitter Info */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm font-label text-muted-foreground">
                    <User className="h-4 w-4" />
                    Your Information (Optional)
                  </div>
                  <p className="text-sm text-muted-foreground font-body">
                    Provide your contact info if you'd like us to follow up with any questions.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="submitterName" className="font-label">
                        Your Name
                      </Label>
                      <Input
                        id="submitterName"
                        value={formData.submitterName}
                        onChange={(e) => handleChange("submitterName", e.target.value)}
                        placeholder="John Doe"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="submitterEmail" className="font-label">
                        Your Email
                      </Label>
                      <Input
                        id="submitterEmail"
                        type="email"
                        value={formData.submitterEmail}
                        onChange={(e) => handleChange("submitterEmail", e.target.value)}
                        placeholder="john@example.com"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-label"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Facility"
                    )}
                  </Button>
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
