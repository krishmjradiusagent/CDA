import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ApprovalStatus,
  MoneyRow,
  FeeBadge,
} from "../components/finance";
import {
  ArrowLeft,
  Download,
  Send,
  Printer,
  RefreshCw,
  CheckCircle2,
  Clock,
  Mail,
  Copy,
  FileText,
  User,
  Users,
  Shield,
  Building2,
  ExternalLink,
} from "lucide-react";

export function FinalizedPDFPage() {
  const [docuSignModalOpen, setDocuSignModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex">
          {/* Sidebar placeholder */}
          <div className="w-[72px] bg-sidebar border-r flex-shrink-0" />

          {/* Main Content Area */}
          <div className="flex-1 max-w-[1248px]">
            {/* Page Header */}
            <div className="border-b bg-background px-8 py-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>Auditing Dashboard</span>
                <span>/</span>
                <span>Commission Breakdown</span>
                <span>/</span>
                <span className="text-foreground">Finalized</span>
              </div>

              <div className="flex items-start justify-between gap-6">
                <div>
                  <Link to="/auditor-verification">
                    <Button variant="ghost" size="sm" className="mb-3 -ml-2">
                      <ArrowLeft className="size-4 mr-2" />
                      Back to Auditor Verification
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-medium mb-1">Finalized Commission Breakdown</h1>
                  <p className="text-sm text-muted-foreground">
                    Commission breakdown is finalized and ready for PDF export or signature routing.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <ApprovalStatus status="finalized" />
                  <Button variant="outline" size="sm">
                    <Download className="size-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button size="sm" onClick={() => setDocuSignModalOpen(true)}>
                    <Send className="size-4 mr-2" />
                    Send via DocuSign
                  </Button>
                  <Link to="/">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Components
                    </Button>
                  </Link>
                  <Link to="/breakdown">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Commission Breakdown
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Success Summary Bar */}
            <div className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-900/50 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-green-600 dark:text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Commission breakdown finalized.
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                      PDF generated and ready for signature routing.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="size-4 mr-2" />
                    View PDF
                  </Button>
                  <Button size="sm" onClick={() => setDocuSignModalOpen(true)}>
                    <Send className="size-4 mr-2" />
                    Send via DocuSign
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-6 px-8 py-8">
              {/* Left Content */}
              <div className="flex-1 space-y-6">
                {/* PDF Preview Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">PDF Preview</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="size-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Printer className="size-4 mr-2" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="size-4 mr-2" />
                          Regenerate PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* PDF-like preview */}
                    <div className="border rounded-lg p-8 bg-white dark:bg-background space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold mb-1">
                          Commission Disbursement Authorization
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Final Commission Distribution
                        </p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Property Address</p>
                          <p className="font-medium">1284 Willow Creek Dr</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Client Name</p>
                          <p className="font-medium">Michael Loft</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Gross Commission</p>
                          <p className="font-medium">$25,000.00</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Agent Net Total</p>
                          <p className="font-medium">$18,650.00</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Company Dollar</p>
                          <p className="font-medium">$4,100.00</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Finalized By</p>
                          <p className="font-medium">Jessica (Auditor)</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="text-center text-xs text-muted-foreground">
                        <p>Finalized: Today, 1:22 PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Numbers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Final Numbers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <MoneyRow label="Gross Commission" value={25000} variant="positive" />
                    <MoneyRow
                      label="Pre-Split Deductions"
                      value={-750}
                      variant="deduction"
                      badges={[{ label: "Pre-Split", variant: "pre-split" }]}
                    />
                    <Separator className="my-2" />
                    <MoneyRow label="Split Basis" value={24250} variant="neutral" />
                    <MoneyRow
                      label="Agent Net Total"
                      value={18650}
                      variant="positive"
                      description="Total to all agents after deductions"
                    />
                    <MoneyRow
                      label="Team Portion"
                      value={4850}
                      variant="neutral"
                      description="20% team split"
                    />
                    <MoneyRow
                      label="Radius Fee"
                      value={750}
                      variant="deduction"
                      badges={[{ label: "Auditor Entry", variant: "post-split" }]}
                    />
                    <Separator className="my-2" />
                    <MoneyRow
                      label="Company Dollar"
                      value={4100}
                      variant="positive"
                      description="Final company revenue"
                    />
                  </CardContent>
                </Card>

                {/* Signer Routing */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Signer Routing</CardTitle>
                      <Button variant="outline" size="sm">
                        Edit Recipients
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Agent */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Ila Corcoran</p>
                          <p className="text-xs text-muted-foreground">Agent</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Pending signature</span>
                      </div>
                    </div>

                    {/* Team Lead */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Rod Watson</p>
                          <p className="text-xs text-muted-foreground">Team Lead</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Pending signature</span>
                      </div>
                    </div>

                    {/* Auditor */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Shield className="size-5 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Jessica</p>
                          <p className="text-xs text-muted-foreground">Auditor</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Completed
                        </span>
                      </div>
                    </div>

                    {/* Managing Broker */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Megan Foster</p>
                          <p className="text-xs text-muted-foreground">Managing Broker</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Pending signature</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      Auditor notified when envelope sent. Auditor, team lead, agent notified after managing broker signs.
                    </div>

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => setDocuSignModalOpen(true)}
                    >
                      <Send className="size-4 mr-2" />
                      Send Envelope
                    </Button>
                  </CardContent>
                </Card>

                {/* Final Approval Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Final Approval Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Agent entry complete", completed: true },
                        { label: "Team Lead review complete", completed: true },
                        { label: "Agent confirmation complete", completed: true },
                        { label: "Auditor verification complete", completed: true },
                        { label: "Commission breakdown PDF generated", completed: true },
                        { label: "DocuSign pending", completed: false },
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex items-center justify-center size-6 rounded-full bg-muted mt-0.5">
                            {step.completed ? (
                              <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                            ) : (
                              <Clock className="size-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                step.completed
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Trail */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Audit Trail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {[
                        { time: "Today, 9:15 AM", event: "Commission breakdown created by Ila Corcoran" },
                        { time: "Today, 10:22 AM", event: "TL reviewed by Rod Watson" },
                        { time: "Today, 11:05 AM", event: "Agent confirmed by Ila Corcoran" },
                        { time: "Today, 1:10 PM", event: "Auditor entered Radius fee ($750)" },
                        { time: "Today, 1:22 PM", event: "Commission breakdown for 1284 Willow Creek Dr finalized" },
                        { time: "Today, 1:22 PM", event: "PDF generated successfully" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[110px]">
                            {item.time}
                          </div>
                          <div className="text-sm">{item.event}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sticky Final Status Panel */}
              <div className="w-[350px] flex-shrink-0">
                <div className="sticky top-6 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Final Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <ApprovalStatus status="finalized" />
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">PDF</span>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                            <span className="text-sm font-medium">Generated</span>
                          </div>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">DocuSign</span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-4 text-amber-500" />
                            <span className="text-sm font-medium">Not sent</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">Company Dollar</span>
                          <span className="text-sm font-semibold tabular-nums">$4,100.00</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">Radius Fee</span>
                          <span className="text-sm font-semibold tabular-nums">$750.00</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">Finalized By</span>
                          <span className="text-sm font-medium">Jessica</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">Finalized Time</span>
                          <span className="text-sm font-medium">Today, 1:22 PM</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Button className="w-full" size="sm">
                          <Download className="size-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          size="sm"
                          onClick={() => setDocuSignModalOpen(true)}
                        >
                          <Send className="size-4 mr-2" />
                          Send via DocuSign
                        </Button>
                        <Button className="w-full" variant="outline" size="sm">
                          <Copy className="size-4 mr-2" />
                          Copy Breakdown Link
                        </Button>
                        <Button className="w-full" variant="outline" size="sm" disabled>
                          Reopen Breakdown
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DocuSign Confirmation Modal */}
      <Dialog open={docuSignModalOpen} onOpenChange={setDocuSignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send commission breakdown for signature?</DialogTitle>
            <DialogDescription>
              Envelope send notifies auditor. After managing broker signs, auditor, team lead, agent get notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <User className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Ila Corcoran</p>
                <p className="text-xs text-muted-foreground">Agent - Signer</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Users className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Rod Watson</p>
                <p className="text-xs text-muted-foreground">Team Lead - Signer</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Building2 className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Megan Foster</p>
                <p className="text-xs text-muted-foreground">Managing Broker - Signer</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mail className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Jessica</p>
                <p className="text-xs text-muted-foreground">Auditor - Notification only</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDocuSignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDocuSignModalOpen(false)}>
              <Send className="size-4 mr-2" />
              Send via DocuSign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
