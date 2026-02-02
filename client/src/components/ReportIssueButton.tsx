import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReportIssueButtonProps {
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  className?: string;
}

const issueTypes = [
  { value: "permanently_closed", label: "Permanently Closed" },
  { value: "temporarily_closed", label: "Temporarily Closed" },
  { value: "wrong_address", label: "Wrong Address" },
  { value: "wrong_phone", label: "Wrong Phone Number" },
  { value: "wrong_hours", label: "Wrong Hours" },
  { value: "wrong_materials", label: "Wrong Materials Accepted" },
  { value: "duplicate_listing", label: "Duplicate Listing" },
  { value: "other", label: "Other Issue" },
] as const;

type IssueType = typeof issueTypes[number]["value"];

export function ReportIssueButton({
  facilityId,
  facilityName,
  facilityAddress,
  className,
}: ReportIssueButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  const submitReport = trpc.reports.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Report submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType) {
      toast.error("Please select an issue type");
      return;
    }

    submitReport.mutate({
      facilityId,
      facilityName,
      facilityAddress,
      issueType,
      description: description || undefined,
      reporterName: reporterName || undefined,
      reporterEmail: reporterEmail || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setIssueType("");
        setDescription("");
        setReporterName("");
        setReporterEmail("");
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 text-muted-foreground hover:text-orange-500 ${className || ''}`}
          title="Report an issue"
          onClick={(e) => e.stopPropagation()}
        >
          <Flag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl mb-2">Thank You!</DialogTitle>
            <DialogDescription className="text-base">
              Your report has been submitted. We will review it and update the listing if needed.
            </DialogDescription>
            <Button className="mt-6" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report an Issue</DialogTitle>
              <DialogDescription>
                Help us keep the directory accurate by reporting incorrect or outdated information.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Facility</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{facilityName}</p>
                  <p className="text-sm text-muted-foreground">{facilityAddress}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select value={issueType} onValueChange={(val) => setIssueType(val as IssueType)}>
                  <SelectTrigger id="issueType">
                    <SelectValue placeholder="Select the type of issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide any additional details about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporterName">Your Name (Optional)</Label>
                  <Input
                    id="reporterName"
                    placeholder="John Doe"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterEmail">Your Email (Optional)</Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitReport.isPending || !issueType}
                >
                  {submitReport.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
