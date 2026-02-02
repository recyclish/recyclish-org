import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Mail, Loader2, ChevronDown, Check, Leaf } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";

const AGE_RANGES = [
  "Under 18",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
  "Other",
];

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [sex, setSex] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSuccessMessage(data.message);
        setErrorMessage("");
        // Reset form
        setEmail("");
        setZipCode("");
        setAge("");
        setGender("");
        setSex("");
        setAdditionalInfo("");
        setShowOptional(false);
      } else {
        setErrorMessage(data.message);
        setSuccessMessage("");
      }
    },
    onError: (error) => {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      setSuccessMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !zipCode) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    subscribeMutation.mutate({
      email,
      zipCode,
      age: age || undefined,
      gender: gender || undefined,
      sex: sex || undefined,
      additionalInfo: additionalInfo || undefined,
    });
  };

  return (
    <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-16">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <Leaf className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Stay Updated on Recycling
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed max-w-lg mx-auto">
              Get recycling center updates in your area, helpful tips, and information 
              to create a more sustainable world. Join our community of eco-conscious individuals.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {successMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-xl p-8 shadow-sm border border-border text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  You're Subscribed!
                </h3>
                <p className="text-muted-foreground font-body">
                  {successMessage}
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border"
              >
                {/* Required Fields */}
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-label">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="font-label">
                      Zip Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="zipCode"
                      type="text"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                {/* Optional Fields Collapsible */}
                <Collapsible open={showOptional} onOpenChange={setShowOptional}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-muted-foreground hover:text-foreground mb-4"
                    >
                      <span className="font-label text-sm">
                        Optional: Tell us more about yourself
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${showOptional ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="font-label text-sm">
                          Age Range
                        </Label>
                        <Select value={age} onValueChange={setAge}>
                          <SelectTrigger id="age">
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                          <SelectContent>
                            {AGE_RANGES.map((range) => (
                              <SelectItem key={range} value={range}>
                                {range}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="font-label text-sm">
                          Gender
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sex" className="font-label text-sm">
                          Sex
                        </Label>
                        <Select value={sex} onValueChange={setSex}>
                          <SelectTrigger id="sex">
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo" className="font-label text-sm">
                        Additional Information
                      </Label>
                      <Textarea
                        id="additionalInfo"
                        placeholder="Tell us anything else you'd like us to know (e.g., specific recycling interests, feedback, suggestions)..."
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        rows={3}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground">
                        {additionalInfo.length}/1000 characters
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Error Message */}
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm font-body mb-4"
                  >
                    {errorMessage}
                  </motion.p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-label"
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Subscribe to Newsletter
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4 font-body">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
