import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building2,
  Loader2,
  ArrowLeft,
  Trash2,
  Eye
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type SubmissionStatus = "pending" | "approved" | "rejected";

interface Submission {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: string;
  materialsAccepted: string | null;
  additionalNotes: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  status: SubmissionStatus;
  reviewNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SubmissionStatus | "all">("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  // Fetch submissions based on active tab
  const { data: submissions, isLoading: submissionsLoading } = trpc.facility.list.useQuery(
    activeTab === "all" ? undefined : { status: activeTab as SubmissionStatus }
  );

  // Fetch stats
  const { data: stats } = trpc.facility.stats.useQuery();

  // Update status mutation
  const updateStatusMutation = trpc.facility.updateStatus.useMutation({
    onSuccess: () => {
      utils.facility.list.invalidate();
      utils.facility.stats.invalidate();
      setActionDialogOpen(false);
      setSelectedSubmission(null);
      setReviewNotes("");
      toast.success(pendingAction === "approve" ? "Facility approved!" : "Facility rejected");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete mutation
  const deleteMutation = trpc.facility.delete.useMutation({
    onSuccess: () => {
      utils.facility.list.invalidate();
      utils.facility.stats.invalidate();
      toast.success("Submission deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Export approved facilities
  const { data: exportData, refetch: refetchExport } = trpc.facility.exportApproved.useQuery(undefined, {
    enabled: false
  });

  const handleExport = async () => {
    const result = await refetchExport();
    if (result.data && result.data.length > 0) {
      const headers = Object.keys(result.data[0]);
      const csvContent = [
        headers.join(","),
        ...result.data.map(row => 
          headers.map(h => `"${(row as Record<string, string>)[h] || ''}"`).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `approved_facilities_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.data.length} approved facilities`);
    } else {
      toast.info("No approved facilities to export");
    }
  };

  const openActionDialog = (submission: Submission, action: "approve" | "reject") => {
    setSelectedSubmission(submission);
    setPendingAction(action);
    setReviewNotes("");
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedSubmission || !pendingAction) return;
    updateStatusMutation.mutate({
      id: selectedSubmission.id,
      status: pendingAction === "approve" ? "approved" : "rejected",
      reviewNotes: reviewNotes || undefined
    });
  };

  const getStatCount = (status: SubmissionStatus) => {
    const stat = stats?.find(s => s.status === status);
    return stat?.count ?? 0;
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Please sign in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not admin
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Directory
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage facility submissions</p>
              </div>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Approved
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600">{getStatCount("pending")}</p>
                </div>
                <Clock className="h-10 w-10 text-amber-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{getStatCount("approved")}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{getStatCount("rejected")}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {getStatCount("pending") > 0 && (
                <Badge variant="secondary" className="ml-1">{getStatCount("pending")}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !submissions || submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No submissions found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Main Info */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold">{submission.name}</h3>
                                <StatusBadge status={submission.status} />
                              </div>
                              <p className="text-sm text-muted-foreground">{submission.category}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <span>{submission.address}, {submission.city}, {submission.state} {submission.zipCode}</span>
                            </div>
                            {submission.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{submission.phone}</span>
                              </div>
                            )}
                            {submission.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{submission.email}</span>
                              </div>
                            )}
                            {submission.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                  {submission.website}
                                </a>
                              </div>
                            )}
                          </div>

                          {submission.materialsAccepted && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Materials Accepted</p>
                              <p className="text-sm">{submission.materialsAccepted}</p>
                            </div>
                          )}

                          {submission.reviewNotes && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-xs font-medium text-amber-800 mb-1">Review Notes</p>
                              <p className="text-sm text-amber-900">{submission.reviewNotes}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 p-4 md:p-6 bg-muted/30 md:border-l justify-end md:justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {submission.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openActionDialog(submission, "approve")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openActionDialog(submission, "reject")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this submission?")) {
                                deleteMutation.mutate({ id: submission.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "approve" ? "Approve Facility" : "Reject Facility"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "approve" 
                ? "This facility will be marked as approved and can be exported to the main directory."
                : "This facility will be marked as rejected and will not appear in the directory."
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{selectedSubmission.name}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Review Notes (optional)</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add any notes about this decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={updateStatusMutation.isPending}
              className={pendingAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={pendingAction === "reject" ? "destructive" : "default"}
            >
              {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {pendingAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{selectedSubmission.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedSubmission.category}</Badge>
                  <StatusBadge status={selectedSubmission.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Address</p>
                  <p>{selectedSubmission.address}</p>
                  <p>{selectedSubmission.city}, {selectedSubmission.state} {selectedSubmission.zipCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Contact</p>
                  {selectedSubmission.phone && <p>{selectedSubmission.phone}</p>}
                  {selectedSubmission.email && <p>{selectedSubmission.email}</p>}
                  {selectedSubmission.website && (
                    <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {selectedSubmission.website}
                    </a>
                  )}
                </div>
              </div>

              {selectedSubmission.materialsAccepted && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Materials Accepted</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedSubmission.materialsAccepted}</p>
                </div>
              )}

              {selectedSubmission.additionalNotes && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Additional Notes</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedSubmission.additionalNotes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-muted-foreground mb-2 text-sm">Submitter Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p>{selectedSubmission.submitterName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{selectedSubmission.submitterEmail || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Submitted: {new Date(selectedSubmission.createdAt).toLocaleString()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
  }
}
