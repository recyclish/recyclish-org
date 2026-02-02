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
  Eye,
  Flag,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type SubmissionStatus = "pending" | "approved" | "rejected";
type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";
type AdminView = "submissions" | "reports";

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

interface Report {
  id: number;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  issueType: string;
  description: string | null;
  reporterName: string | null;
  reporterEmail: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [adminView, setAdminView] = useState<AdminView>("submissions");
  const [activeTab, setActiveTab] = useState<SubmissionStatus | "all">("pending");
  const [reportTab, setReportTab] = useState<ReportStatus | "all">("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [reportActionDialogOpen, setReportActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
  const [pendingReportAction, setPendingReportAction] = useState<ReportStatus | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reportDetailDialogOpen, setReportDetailDialogOpen] = useState(false);

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

  // Export approved facilities
  const { refetch: refetchExport } = trpc.facility.exportApproved.useQuery(undefined, {
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

  const openReportActionDialog = (report: Report, action: ReportStatus) => {
    setSelectedReport(report);
    setPendingReportAction(action);
    setAdminNotes("");
    setReportActionDialogOpen(true);
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

  const getStatCount = (status: SubmissionStatus) => {
    const stat = stats?.find(s => s.status === status);
    return stat?.count ?? 0;
  };

  const getReportStatCount = (status: ReportStatus) => {
    const stat = reportStats?.find(s => s.status === status);
    return stat?.count ?? 0;
  };

  const getTotalPendingReports = () => getReportStatCount("pending");

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
                <p className="text-sm text-muted-foreground">Manage facility submissions and reports</p>
              </div>
            </div>
            {adminView === "submissions" && (
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Approved
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
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
        ) : (
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
                              {report.status === "reviewed" && (
                                <>
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
        )}
      </main>

      {/* Submission Action Confirmation Dialog */}
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

      {/* Report Action Confirmation Dialog */}
      <Dialog open={reportActionDialogOpen} onOpenChange={setReportActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingReportAction === "reviewed" && "Mark as Reviewed"}
              {pendingReportAction === "resolved" && "Resolve Report"}
              {pendingReportAction === "dismissed" && "Dismiss Report"}
            </DialogTitle>
            <DialogDescription>
              {pendingReportAction === "reviewed" && "This report will be marked as reviewed for further action."}
              {pendingReportAction === "resolved" && "This report will be marked as resolved. The issue has been addressed."}
              {pendingReportAction === "dismissed" && "This report will be dismissed. No action will be taken."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{selectedReport.facilityName}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Issue: {issueTypeLabels[selectedReport.issueType] || selectedReport.issueType}
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes about this action..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReportAction}
              disabled={updateReportStatusMutation.isPending}
              className={pendingReportAction === "resolved" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={pendingReportAction === "dismissed" ? "outline" : "default"}
            >
              {updateReportStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Detail View Dialog */}
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

      {/* Report Detail View Dialog */}
      <Dialog open={reportDetailDialogOpen} onOpenChange={setReportDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{selectedReport.facilityName}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {issueTypeLabels[selectedReport.issueType] || selectedReport.issueType}
                  </Badge>
                  <ReportStatusBadge status={selectedReport.status} />
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm">Facility Address</p>
                <p className="text-sm">{selectedReport.facilityAddress}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Issue Description</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.adminNotes && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Admin Notes</p>
                  <p className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-lg">{selectedReport.adminNotes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-muted-foreground mb-2 text-sm">Reporter Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p>{selectedReport.reporterName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{selectedReport.reporterEmail || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Reported: {new Date(selectedReport.createdAt).toLocaleString()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDetailDialogOpen(false)}>
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

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    case "reviewed":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reviewed</Badge>;
    case "resolved":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
    case "dismissed":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Dismissed</Badge>;
  }
}
