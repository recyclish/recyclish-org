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
import { StarRating } from "@/components/StarRating";
import { Input } from "@/components/ui/input";
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
  Eye,
  Flag,
  AlertTriangle,
  Star,
  MessageSquare,
  Users,
  Search,
  UserX,
  UserCheck
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type SubmissionStatus = "pending" | "approved" | "rejected";
type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";
type ReviewStatus = "pending" | "approved" | "rejected";
type AdminView = "submissions" | "reports" | "reviews" | "newsletter";

type Submission = any;
type Report = any;
type Review = any;

const issueTypeLabels: Record<string, string> = {
  permanently_closed: "Permanently Closed",
  temporarily_closed: "Temporarily Closed",
  wrong_address: "Wrong Address",
  wrong_phone: "Wrong Phone Number",
  wrong_hours: "Wrong Hours",
  wrong_materials: "Wrong Materials Accepted",
  duplicate_listing: "Duplicate Listing",
  other: "Other Issue",
};

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const variants: Record<SubmissionStatus, { className: string; label: string }> = {
    pending: { className: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
    approved: { className: "bg-green-100 text-green-800 border-green-200", label: "Approved" },
    rejected: { className: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
  };
  const { className, label } = variants[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const variants: Record<ReportStatus, { className: string; label: string }> = {
    pending: { className: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
    reviewed: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Reviewed" },
    resolved: { className: "bg-green-100 text-green-800 border-green-200", label: "Resolved" },
    dismissed: { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Dismissed" },
  };
  const { className, label } = variants[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const variants: Record<ReviewStatus, { className: string; label: string }> = {
    pending: { className: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
    approved: { className: "bg-green-100 text-green-800 border-green-200", label: "Approved" },
    rejected: { className: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
  };
  const { className, label } = variants[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [adminView, setAdminView] = useState<AdminView>("submissions");
  const [activeTab, setActiveTab] = useState<SubmissionStatus | "all">("pending");
  const [reportTab, setReportTab] = useState<ReportStatus | "all">("pending");
  const [reviewTab, setReviewTab] = useState<ReviewStatus | "all">("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewAdminNotes, setReviewAdminNotes] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [reportActionDialogOpen, setReportActionDialogOpen] = useState(false);
  const [reviewActionDialogOpen, setReviewActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
  const [pendingReportAction, setPendingReportAction] = useState<ReportStatus | null>(null);
  const [pendingReviewAction, setPendingReviewAction] = useState<"approve" | "reject" | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reportDetailDialogOpen, setReportDetailDialogOpen] = useState(false);
  const [reviewDetailDialogOpen, setReviewDetailDialogOpen] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const utils = trpc.useUtils();

  // Fetch submissions based on active tab
  const { data: submissions, isLoading: submissionsLoading } = trpc.facility.list.useQuery(
    activeTab === "all" ? undefined : { status: activeTab as SubmissionStatus }
  );

  // Fetch stats
  const { data: stats } = trpc.facility.stats.useQuery();

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = trpc.reports.list.useQuery(
    reportTab === "all" ? undefined : { status: reportTab as ReportStatus }
  );

  // Fetch report stats
  const { data: reportStats } = trpc.reports.stats.useQuery();

  // Fetch reviews
  const { data: reviews, isLoading: reviewsLoading } = trpc.reviews.adminList.useQuery(
    reviewTab === "all" ? undefined : { status: reviewTab as ReviewStatus }
  );

  // Fetch review stats
  const { data: reviewStats } = trpc.reviews.adminStats.useQuery();

  // Fetch newsletter subscribers
  const { data: subscribers, isLoading: subscribersLoading } = trpc.newsletter.list.useQuery(
    { activeOnly: showActiveOnly }
  );

  // Fetch newsletter stats
  const { data: newsletterStats } = trpc.newsletter.stats.useQuery();

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

  // Update report status mutation
  const updateReportStatusMutation = trpc.reports.updateStatus.useMutation({
    onSuccess: () => {
      utils.reports.list.invalidate();
      utils.reports.stats.invalidate();
      setReportActionDialogOpen(false);
      setSelectedReport(null);
      setAdminNotes("");
      toast.success("Report status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Update review status mutation
  const updateReviewStatusMutation = trpc.reviews.adminUpdateStatus.useMutation({
    onSuccess: () => {
      utils.reviews.adminList.invalidate();
      utils.reviews.adminStats.invalidate();
      setReviewActionDialogOpen(false);
      setSelectedReview(null);
      setReviewAdminNotes("");
      toast.success(pendingReviewAction === "approve" ? "Review approved!" : "Review rejected");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete submission mutation
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

  // Delete report mutation
  const deleteReportMutation = trpc.reports.delete.useMutation({
    onSuccess: () => {
      utils.reports.list.invalidate();
      utils.reports.stats.invalidate();
      toast.success("Report deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete review mutation
  const deleteReviewMutation = trpc.reviews.adminDelete.useMutation({
    onSuccess: () => {
      utils.reviews.adminList.invalidate();
      utils.reviews.adminStats.invalidate();
      toast.success("Review deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Export approved facilities
  const { refetch: refetchExport } = trpc.facility.exportApproved.useQuery(undefined, {
    enabled: false
  });

  // Export newsletter subscribers as CSV
  const handleExportSubscribers = () => {
    if (!filteredSubscribers || filteredSubscribers.length === 0) {
      toast.info("No subscribers to export");
      return;
    }
    const headers = ["Email", "Zip Code", "Age", "Gender", "Status", "Subscribed Date"];
    const csvContent = [
      headers.join(","),
      ...filteredSubscribers.map(sub => [
        `"${sub.email}"`,
        `"${sub.zipCode}"`,
        `"${sub.age || ''}"`,
        `"${sub.gender || ''}"`,
        sub.isActive ? "Active" : "Inactive",
        `"${new Date(sub.createdAt).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredSubscribers.length} subscribers`);
  };

  // Filter subscribers by search term
  const filteredSubscribers = (subscribers || []).filter(sub => {
    if (!subscriberSearch) return true;
    const search = subscriberSearch.toLowerCase();
    return (
      sub.email.toLowerCase().includes(search) ||
      sub.zipCode.toLowerCase().includes(search) ||
      (sub.age || "").toLowerCase().includes(search) ||
      (sub.gender || "").toLowerCase().includes(search)
    );
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

  const openReportActionDialog = (report: Report, action: ReportStatus) => {
    setSelectedReport(report);
    setPendingReportAction(action);
    setAdminNotes("");
    setReportActionDialogOpen(true);
  };

  const openReviewActionDialog = (review: Review, action: "approve" | "reject") => {
    setSelectedReview(review);
    setPendingReviewAction(action);
    setReviewAdminNotes("");
    setReviewActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedSubmission || !pendingAction) return;
    updateStatusMutation.mutate({
      id: selectedSubmission.id,
      status: pendingAction === "approve" ? "approved" : "rejected",
      reviewNotes: reviewNotes || undefined
    });
  };

  const handleConfirmReportAction = () => {
    if (!selectedReport || !pendingReportAction) return;
    updateReportStatusMutation.mutate({
      id: selectedReport.id,
      status: pendingReportAction,
      adminNotes: adminNotes || undefined
    });
  };

  const handleConfirmReviewAction = () => {
    if (!selectedReview || !pendingReviewAction) return;
    updateReviewStatusMutation.mutate({
      id: selectedReview.id,
      status: pendingReviewAction === "approve" ? "approved" : "rejected",
      adminNotes: reviewAdminNotes || undefined
    });
  };

  const getStatCount = (status: SubmissionStatus) => {
    const stat = stats?.find(s => s.status === status);
    return stat?.count ?? 0;
  };

  const getReportStatCount = (status: ReportStatus) => {
    const stat = reportStats?.find(s => s.status === status);
    return stat?.count ?? 0;
  };

  const getReviewStatCount = (status: ReviewStatus) => {
    const stat = reviewStats?.find(s => s.status === status);
    return stat?.count ?? 0;
  };

  const getTotalPendingReports = () => getReportStatCount("pending");
  const getTotalPendingReviews = () => getReviewStatCount("pending");

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
                <p className="text-sm text-muted-foreground">Manage submissions, reports, reviews, and subscribers</p>
              </div>
            </div>
            {adminView === "submissions" && (
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Approved
              </Button>
            )}
            {adminView === "newsletter" && (
              <Button onClick={handleExportSubscribers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Subscribers
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* View Toggle */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={adminView === "submissions" ? "default" : "outline"}
            onClick={() => setAdminView("submissions")}
            className="gap-2"
          >
            <Building2 className="h-4 w-4" />
            Submissions
            {getStatCount("pending") > 0 && (
              <Badge variant="secondary" className="ml-1">{getStatCount("pending")}</Badge>
            )}
          </Button>
          <Button
            variant={adminView === "reports" ? "default" : "outline"}
            onClick={() => setAdminView("reports")}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Issue Reports
            {getTotalPendingReports() > 0 && (
              <Badge variant="destructive" className="ml-1">{getTotalPendingReports()}</Badge>
            )}
          </Button>
          <Button
            variant={adminView === "reviews" ? "default" : "outline"}
            onClick={() => setAdminView("reviews")}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            Reviews
            {getTotalPendingReviews() > 0 && (
              <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">{getTotalPendingReviews()}</Badge>
            )}
          </Button>
          <Button
            variant={adminView === "newsletter" ? "default" : "outline"}
            onClick={() => setAdminView("newsletter")}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Newsletter
            {newsletterStats && (
              <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-800">{newsletterStats.active}</Badge>
            )}
          </Button>
        </div>

        {adminView === "submissions" ? (
          <>
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
          </>
        ) : adminView === "newsletter" ? (
          <>
            {/* Newsletter Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Subscribers</p>
                      <p className="text-3xl font-bold text-emerald-600">{newsletterStats?.active ?? 0}</p>
                    </div>
                    <UserCheck className="h-10 w-10 text-emerald-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Signups</p>
                      <p className="text-3xl font-bold text-blue-600">{newsletterStats?.total ?? 0}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unsubscribed</p>
                      <p className="text-3xl font-bold text-gray-500">{(newsletterStats?.total ?? 0) - (newsletterStats?.active ?? 0)}</p>
                    </div>
                    <UserX className="h-10 w-10 text-gray-500/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, zip code, age..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showActiveOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowActiveOnly(true)}
                >
                  Active Only
                </Button>
                <Button
                  variant={!showActiveOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowActiveOnly(false)}
                >
                  All Subscribers
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredSubscribers.length} of {subscribers?.length ?? 0} subscribers
            </p>

            {/* Subscriber List */}
            {subscribersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {subscriberSearch ? "No subscribers match your search" : "No subscribers yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Email</th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Zip Code</th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Age</th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Gender</th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                              <a href={`mailto:${sub.email}`} className="text-sm font-medium text-primary hover:underline truncate max-w-[250px]">
                                {sub.email}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{sub.zipCode}</td>
                          <td className="px-4 py-3 text-sm hidden md:table-cell text-muted-foreground">{sub.age || "—"}</td>
                          <td className="px-4 py-3 text-sm hidden md:table-cell text-muted-foreground">{sub.gender || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={sub.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
                              {sub.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : adminView === "reports" ? (
          <>
            {/* Report Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold text-amber-600">{getReportStatCount("pending")}</p>
                    </div>
                    <Clock className="h-10 w-10 text-amber-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Reviewed</p>
                      <p className="text-3xl font-bold text-blue-600">{getReportStatCount("reviewed")}</p>
                    </div>
                    <Eye className="h-10 w-10 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-green-600">{getReportStatCount("resolved")}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Dismissed</p>
                      <p className="text-3xl font-bold text-gray-600">{getReportStatCount("dismissed")}</p>
                    </div>
                    <XCircle className="h-10 w-10 text-gray-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Tabs */}
            <Tabs value={reportTab} onValueChange={(v) => setReportTab(v as typeof reportTab)}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                  {getReportStatCount("pending") > 0 && (
                    <Badge variant="secondary" className="ml-1">{getReportStatCount("pending")}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviewed" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Reviewed
                </TabsTrigger>
                <TabsTrigger value="resolved" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolved
                </TabsTrigger>
                <TabsTrigger value="dismissed" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Dismissed
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={reportTab} className="mt-0">
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No reports found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            {/* Main Info */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold">{report.facilityName}</h3>
                                    <ReportStatusBadge status={report.status} />
                                  </div>
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {issueTypeLabels[report.issueType] || report.issueType}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex items-start gap-2 text-sm mb-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>{report.facilityAddress}</span>
                              </div>

                              {report.description && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                                  <p className="text-sm">{report.description}</p>
                                </div>
                              )}

                              {report.adminNotes && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-xs font-medium text-blue-800 mb-1">Admin Notes</p>
                                  <p className="text-sm text-blue-900">{report.adminNotes}</p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col gap-2 p-4 md:p-6 bg-muted/30 md:border-l justify-end md:justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setReportDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {report.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                    onClick={() => openReportActionDialog(report, "reviewed")}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Mark Reviewed
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => openReportActionDialog(report, "resolved")}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Resolve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openReportActionDialog(report, "dismissed")}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Dismiss
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this report?")) {
                                    deleteReportMutation.mutate({ id: report.id });
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
          </>
        ) : (
          <>
            {/* Review Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Moderation</p>
                      <p className="text-3xl font-bold text-amber-600">{getReviewStatCount("pending")}</p>
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
                      <p className="text-3xl font-bold text-green-600">{getReviewStatCount("approved")}</p>
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
                      <p className="text-3xl font-bold text-red-600">{getReviewStatCount("rejected")}</p>
                    </div>
                    <XCircle className="h-10 w-10 text-red-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews Tabs */}
            <Tabs value={reviewTab} onValueChange={(v) => setReviewTab(v as typeof reviewTab)}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                  {getReviewStatCount("pending") > 0 && (
                    <Badge variant="secondary" className="ml-1">{getReviewStatCount("pending")}</Badge>
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

              <TabsContent value={reviewTab} className="mt-0">
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !reviews || reviews.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No reviews found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            {/* Main Info */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold">{review.facilityName}</h3>
                                    <ReviewStatusBadge status={review.status} />
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>by {review.userName || 'Anonymous'}</span>
                                    <span>•</span>
                                    <StarRating rating={review.rating} size="sm" />
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex items-start gap-2 text-sm mb-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>{review.facilityAddress}</span>
                              </div>

                              {review.title && (
                                <h4 className="font-medium mb-2">{review.title}</h4>
                              )}

                              {review.content && (
                                <div className="p-3 bg-muted/50 rounded-lg mb-3">
                                  <p className="text-sm">{review.content}</p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {review.serviceRating && (
                                  <span>Service: {review.serviceRating}/5</span>
                                )}
                                {review.cleanlinessRating && (
                                  <span>Cleanliness: {review.cleanlinessRating}/5</span>
                                )}
                                {review.convenienceRating && (
                                  <span>Convenience: {review.convenienceRating}/5</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {review.helpfulCount} helpful
                                </span>
                              </div>

                              {review.adminNotes && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-xs font-medium text-amber-800 mb-1">Admin Notes</p>
                                  <p className="text-sm text-amber-900">{review.adminNotes}</p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col gap-2 p-4 md:p-6 bg-muted/30 md:border-l justify-end md:justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setReviewDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {review.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => openReviewActionDialog(review, "approve")}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => openReviewActionDialog(review, "reject")}
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
                                  if (confirm("Are you sure you want to delete this review?")) {
                                    deleteReviewMutation.mutate({ id: review.id });
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
          </>
        )}
      </main>

      {/* Submission Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "approve" ? "Approve Facility" : "Reject Facility"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "approve"
                ? "This facility will be marked as approved and can be exported to the directory."
                : "This facility will be marked as rejected and will not appear in the directory."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewNotes">Review Notes (optional)</Label>
              <Textarea
                id="reviewNotes"
                placeholder="Add any notes about this decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={pendingAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={pendingAction === "reject" ? "destructive" : "default"}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {pendingAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Action Dialog */}
      <Dialog open={reportActionDialogOpen} onOpenChange={setReportActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Report Status
            </DialogTitle>
            <DialogDescription>
              Change the status of this issue report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add any notes about this action..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReportAction}
              disabled={updateReportStatusMutation.isPending}
            >
              {updateReportStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Action Dialog */}
      <Dialog open={reviewActionDialogOpen} onOpenChange={setReviewActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingReviewAction === "approve" ? "Approve Review" : "Reject Review"}
            </DialogTitle>
            <DialogDescription>
              {pendingReviewAction === "approve"
                ? "This review will be published and visible to all users."
                : "This review will be rejected and hidden from public view."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewAdminNotes">Admin Notes (optional)</Label>
              <Textarea
                id="reviewAdminNotes"
                placeholder="Add any notes about this decision..."
                value={reviewAdminNotes}
                onChange={(e) => setReviewAdminNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReviewAction}
              className={pendingReviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={pendingReviewAction === "reject" ? "destructive" : "default"}
              disabled={updateReviewStatusMutation.isPending}
            >
              {updateReviewStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {pendingReviewAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Facility Name</Label>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{selectedSubmission.category}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">
                    {selectedSubmission.address}, {selectedSubmission.city}, {selectedSubmission.state} {selectedSubmission.zipCode}
                  </p>
                </div>
                {selectedSubmission.phone && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedSubmission.phone}</p>
                  </div>
                )}
                {selectedSubmission.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedSubmission.email}</p>
                  </div>
                )}
                {selectedSubmission.website && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Website</Label>
                    <p className="font-medium">
                      <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedSubmission.website}
                      </a>
                    </p>
                  </div>
                )}
                {selectedSubmission.materialsAccepted && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Materials Accepted</Label>
                    <p className="font-medium">{selectedSubmission.materialsAccepted}</p>
                  </div>
                )}
                {selectedSubmission.additionalNotes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Additional Notes</Label>
                    <p className="font-medium">{selectedSubmission.additionalNotes}</p>
                  </div>
                )}
                {selectedSubmission.submitterName && (
                  <div>
                    <Label className="text-muted-foreground">Submitter Name</Label>
                    <p className="font-medium">{selectedSubmission.submitterName}</p>
                  </div>
                )}
                {selectedSubmission.submitterEmail && (
                  <div>
                    <Label className="text-muted-foreground">Submitter Email</Label>
                    <p className="font-medium">{selectedSubmission.submitterEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Detail Dialog */}
      <Dialog open={reportDetailDialogOpen} onOpenChange={setReportDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Facility</Label>
                  <p className="font-medium">{selectedReport.facilityName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.facilityAddress}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Issue Type</Label>
                  <p className="font-medium">{issueTypeLabels[selectedReport.issueType] || selectedReport.issueType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <ReportStatusBadge status={selectedReport.status} />
                </div>
                {selectedReport.description && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium">{selectedReport.description}</p>
                  </div>
                )}
                {selectedReport.reporterName && (
                  <div>
                    <Label className="text-muted-foreground">Reporter Name</Label>
                    <p className="font-medium">{selectedReport.reporterName}</p>
                  </div>
                )}
                {selectedReport.reporterEmail && (
                  <div>
                    <Label className="text-muted-foreground">Reporter Email</Label>
                    <p className="font-medium">{selectedReport.reporterEmail}</p>
                  </div>
                )}
                {selectedReport.adminNotes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Admin Notes</Label>
                    <p className="font-medium">{selectedReport.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Detail Dialog */}
      <Dialog open={reviewDetailDialogOpen} onOpenChange={setReviewDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Facility</Label>
                  <p className="font-medium">{selectedReview.facilityName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.facilityAddress}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reviewer</Label>
                  <p className="font-medium">{selectedReview.userName || 'Anonymous'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <ReviewStatusBadge status={selectedReview.status} />
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Overall Rating</Label>
                  <div className="flex items-center gap-2">
                    <StarRating rating={selectedReview.rating} />
                    <span className="font-medium">{selectedReview.rating}/5</span>
                  </div>
                </div>
                {selectedReview.title && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Title</Label>
                    <p className="font-medium">{selectedReview.title}</p>
                  </div>
                )}
                {selectedReview.content && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Review Content</Label>
                    <p className="font-medium">{selectedReview.content}</p>
                  </div>
                )}
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  {selectedReview.serviceRating && (
                    <div>
                      <Label className="text-muted-foreground">Service</Label>
                      <p className="font-medium">{selectedReview.serviceRating}/5</p>
                    </div>
                  )}
                  {selectedReview.cleanlinessRating && (
                    <div>
                      <Label className="text-muted-foreground">Cleanliness</Label>
                      <p className="font-medium">{selectedReview.cleanlinessRating}/5</p>
                    </div>
                  )}
                  {selectedReview.convenienceRating && (
                    <div>
                      <Label className="text-muted-foreground">Convenience</Label>
                      <p className="font-medium">{selectedReview.convenienceRating}/5</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Helpful Votes</Label>
                  <p className="font-medium">{selectedReview.helpfulCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
                {selectedReview.adminNotes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Admin Notes</Label>
                    <p className="font-medium">{selectedReview.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
