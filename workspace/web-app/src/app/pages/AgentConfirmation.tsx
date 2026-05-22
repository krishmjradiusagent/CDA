import { useState } from "react";
import { Link } from "react-router";
import {
  MoneyRow,
  ApprovalStatus,
  CDASectionHeader,
  FinanceSideSummary,
  CDAActionBar,
  FeeBadge,
} from "../components/finance";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft,
  ChevronRight,
  Building2,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Library,
  Eye,
  EyeOff,
  Lock,
  ExternalLink,
  Settings,
} from "lucide-react";
import { cn } from "../components/ui/utils";

export function AgentConfirmation() {
  const [showCorrectionRequest, setShowCorrectionRequest] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const [checklist, setChecklist] = useState({
    reviewedSplit: false,
    reviewedDeductions: false,
    understandsAuditor: false,
    readyForAudit: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const myCommission = {
    split: 60,
    splitBasis: 14550,
    plan: "80/20 Standard",
    teamSplit: 2910,
    grossAfterTeamSplit: 11640,
    deductions: [
      { id: "d1", label: "RM Fee", amount: 300, timing: "Post-split", appliesTo: "Agent" },
      { id: "d2", label: "E&O Fee", amount: 125, timing: "Post-split", appliesTo: "Agent" },
    ],
    totalDeductions: 425,
    netCommission: 11215,
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background border-b px-8 py-4">
        <div className="max-w-[1320px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link to="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Library className="size-3.5" />
              Components
            </Link>
            <ChevronRight className="size-3" />
            <Link to="/breakdown" className="hover:text-foreground transition-colors">
              CDA
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Agent Confirmation</span>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link to="/breakdown">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to CDA Breakdown
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold mb-1">Confirm CDA</h1>
                <p className="text-sm text-muted-foreground">
                  Review your commission, deductions, and estimated payout.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-2 pr-2 border-r">
                <Link to="/breakdown">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <ExternalLink className="size-3 mr-1.5" />
                    Breakdown
                  </Button>
                </Link>
                <Link to="/team-lead-review">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <ExternalLink className="size-3 mr-1.5" />
                    TL Review
                  </Button>
                </Link>
                <Link to="/auditor-verification">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <ExternalLink className="size-3 mr-1.5" />
                    Auditor
                  </Button>
                </Link>
                <Link to="/cda-settings">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Settings className="size-3 mr-1.5" />
                    Settings
                  </Button>
                </Link>
              </div>
              <ApprovalStatus status="awaiting-agent" />
              <Button variant="outline" size="sm" onClick={() => setShowCorrectionRequest(true)}>
                Request Correction
              </Button>
              <Button size="sm" disabled={!allChecked}>
                Confirm CDA
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Agent Notice Bar */}
      <div className="border-b bg-blue-50/50 dark:bg-blue-950/20">
        <div className="max-w-[1320px] mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Team Lead has reviewed this CDA
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Confirm your payout or request correction before auditor verification.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="size-4 mr-2" />
                View TL Note
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCorrectionRequest(true)}>
                Request Correction
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-8 py-6">
        {/* Transaction Context Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Property</p>
                  <p className="text-sm font-medium">1284 Willow Creek Dr</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Client</p>
                  <p className="text-sm font-medium">Michael Loft</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Side</p>
                <p className="text-sm font-medium">Buyer</p>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Purchase Price</p>
                  <p className="text-sm font-medium">$1,000,000</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Gross Commission</p>
                <p className="text-sm font-medium">$25,000</p>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Closing Date</p>
                  <p className="text-sm font-medium">Jun 18, 2026</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Team</p>
                <p className="text-sm font-medium">Keystone Team</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Agent</p>
                <p className="text-sm font-medium">Ila Corcoran</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-[68%_32%] gap-6">
          {/* Left Content */}
          <div className="space-y-6">
            {/* A. My Commission Summary */}
            <section>
              <CDASectionHeader
                title="My Commission Summary"
                status={
                  <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                    Read-only
                  </span>
                }
              />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {/* Row 1: My Split */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">My Split</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Primary agent allocation
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">60%</span>
                      <FeeBadge label="Confirmed" variant="post-split" />
                    </div>
                  </div>

                  {/* Row 2: Split Basis */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Split Basis</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        After pre-split deductions
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      ${myCommission.splitBasis.toLocaleString()}
                    </span>
                  </div>

                  {/* Row 3: Commission Plan */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commission Plan</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {myCommission.plan}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        Agent 80% / Team 20%
                      </span>
                      <FeeBadge label="Standard" variant="flat" />
                    </div>
                  </div>

                  <Separator />

                  {/* Row 4: Team Split */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Team Split</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Team portion from selected plan
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-destructive tabular-nums">
                      -${myCommission.teamSplit.toLocaleString()}
                    </span>
                  </div>

                  {/* Row 5: Gross After Team Split */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Gross After Team Split</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Before post-split deductions
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      ${myCommission.grossAfterTeamSplit.toLocaleString()}
                    </span>
                  </div>

                  {/* Row 6: Post-split Deductions */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Post-split Deductions</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        RM Fee + E&O Fee
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-destructive tabular-nums">
                      -${myCommission.totalDeductions}
                    </span>
                  </div>

                  <Separator />

                  {/* Final Row: My Net Commission */}
                  <div className="flex items-start justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">My Net Commission</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estimated payout before final audit
                      </p>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">
                      ${myCommission.netCommission.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* B. Deductions Breakdown */}
            <section>
              <CDASectionHeader title="Deductions Breakdown" />
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="space-y-1">
                    {myCommission.deductions.map((deduction) => (
                      <div key={deduction.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Lock className="size-3 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{deduction.label}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <FeeBadge
                                label={deduction.timing}
                                variant={deduction.timing === "Pre-split" ? "pre-split" : "post-split"}
                              />
                              <FeeBadge label={deduction.appliesTo} variant="agent" />
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">${deduction.amount}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      These deductions were applied by your team settings and Team Lead review.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* C. What I Cannot See */}
            <section>
              <CDASectionHeader title="Privacy & Limitations" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <EyeOff className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Other Agent Payout</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Co-agent commission details are not visible to you
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Lock className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Radius Fee</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Handled by auditor during final verification
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Lock className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Company Dollar</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Calculated by auditor after Radius fee entry
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* D. Confirmation Checklist */}
            <section>
              <CDASectionHeader title="Confirmation Checklist" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="check-split"
                        checked={checklist.reviewedSplit}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, reviewedSplit: checked as boolean })
                        }
                      />
                      <label htmlFor="check-split" className="text-sm cursor-pointer flex-1">
                        I reviewed my commission split
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="check-deductions"
                        checked={checklist.reviewedDeductions}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, reviewedDeductions: checked as boolean })
                        }
                      />
                      <label htmlFor="check-deductions" className="text-sm cursor-pointer flex-1">
                        I reviewed post-split deductions
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="check-auditor"
                        checked={checklist.understandsAuditor}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, understandsAuditor: checked as boolean })
                        }
                      />
                      <label htmlFor="check-auditor" className="text-sm cursor-pointer flex-1">
                        I understand final CDA requires auditor verification
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="check-ready"
                        checked={checklist.readyForAudit}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, readyForAudit: checked as boolean })
                        }
                      />
                      <label htmlFor="check-ready" className="text-sm cursor-pointer flex-1">
                        I confirm this payout is ready for audit
                      </label>
                    </div>
                  </div>
                  {!allChecked && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                            Complete all checklist items
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                            You must confirm all items before proceeding to auditor verification
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* E. Correction Request */}
            {showCorrectionRequest && (
              <section>
                <CDASectionHeader title="Request Correction" />
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Correction Details</Label>
                      <Textarea
                        placeholder="Explain what needs to be corrected..."
                        value={correctionText}
                        onChange={(e) => setCorrectionText(e.target.value)}
                        className="mt-2 min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Your request will be sent back to the Team Lead for review.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCorrectionRequest(false);
                          setCorrectionText("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" disabled={!correctionText.trim()}>
                        Send Correction Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* F. Approval Progress */}
            <section>
              <CDASectionHeader title="Approval Progress" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[
                      { label: "Agent Entry", status: "complete", icon: CheckCircle2 },
                      { label: "Team Lead Review", status: "complete", icon: CheckCircle2 },
                      { label: "Agent Confirmation", status: "current", icon: Clock },
                      { label: "Auditor Verification", status: "pending", icon: AlertCircle },
                      { label: "Final CDA PDF", status: "pending", icon: FileText },
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "size-8 rounded-full flex items-center justify-center",
                            step.status === "complete" &&
                              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            step.status === "current" &&
                              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                            step.status === "pending" &&
                              "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          )}
                        >
                          <step.icon className="size-4" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              step.status === "pending" && "text-muted-foreground"
                            )}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step.status === "complete" && "Completed"}
                            {step.status === "current" && "In Progress"}
                            {step.status === "pending" && "Pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Sticky Summary Panel */}
          <div className="sticky top-24 h-fit space-y-4">
            <FinanceSideSummary
              data={{
                grossCommission: myCommission.netCommission,
                totalDeductions: myCommission.totalDeductions,
                companyDollar: 0,
                netCommission: myCommission.netCommission,
                status: "awaiting-agent",
              }}
              sticky={false}
              onExport={() => console.log("Export PDF")}
              onRequestApproval={() => console.log("Confirm CDA")}
            />

            {/* Summary Details */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium mb-3">Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">My Net Commission</span>
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      ${myCommission.netCommission.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">My Split</span>
                    <span>{myCommission.split}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Deductions</span>
                    <span>${myCommission.totalDeductions}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <span>Awaiting Agent</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Auditor Verification</span>
                    <span className="text-muted-foreground">Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button className="w-full" size="sm" disabled={!allChecked}>
                <CheckCircle2 className="size-4 mr-2" />
                Confirm CDA
              </Button>
              <Button variant="outline" className="w-full" size="sm" onClick={() => setShowCorrectionRequest(true)}>
                Request Correction
              </Button>
            </div>

            {/* Helper Text */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                After confirmation, the CDA moves to auditor for final verification and PDF generation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <CDAActionBar
        status="awaiting-agent"
        isDirty={!allChecked}
        onSaveDraft={() => console.log("Request correction")}
        onRequestApproval={() => console.log("Confirm CDA")}
        onFinalize={() => console.log("Finalize")}
        onExportPDF={() => console.log("Export PDF")}
      />
    </div>
  );
}

function Label({ className, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}
