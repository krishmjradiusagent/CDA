import { useState } from "react";
import { Link } from "react-router";
import {
  MoneyRow,
  ApprovalStatus,
  CDASectionHeader,
  FinanceSideSummary,
  CDAActionBar,
  FinanceInput,
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
  MoreHorizontal,
  Flag,
  Lock,
  Calculator,
  Download,
  Send,
} from "lucide-react";
import { cn } from "../components/ui/utils";

export function AuditorVerification() {
  const [radiusFee, setRadiusFee] = useState("750");
  const [verified, setVerified] = useState(false);
  const [auditorNotes, setAuditorNotes] = useState("");

  const teamPortionBeforeFee = 4850;
  const companyDollar = teamPortionBeforeFee - parseFloat(radiusFee || "0");

  const agentBreakdowns = [
    {
      name: "Ila Corcoran",
      initials: "IC",
      split: 60,
      plan: "80/20 Standard",
      grossAfterSplit: 14550,
      teamPortion: 2910,
      postSplitDeductions: 425,
      netCommission: 11215,
      status: "confirmed",
    },
    {
      name: "Michael Tran",
      initials: "MT",
      split: 40,
      plan: "80/20 Standard",
      grossAfterSplit: 9700,
      teamPortion: 1940,
      postSplitDeductions: 325,
      netCommission: 7435,
      status: "confirmed",
    },
  ];

  const changeLog = [
    { time: "Today, 10:42 AM", event: "Agent submitted CDA details" },
    { time: "Today, 11:35 AM", event: "TL updated commission plan" },
    { time: "Today, 12:18 PM", event: "Agent confirmed net commission" },
    { time: "Today, 2:05 PM", event: "Auditor opened verification" },
    { time: "Pending", event: "Radius fee pending" },
  ];

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
            <span className="text-xs text-muted-foreground">Auditing Dashboard</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">CDA Verification</span>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link to="/breakdown">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to Auditing Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold mb-1">Auditor Verification</h1>
                <p className="text-sm text-muted-foreground">
                  Verify Radius fee, company dollar, and final CDA before PDF generation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-2 pr-2 border-r">
                <Link to="/">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Components
                  </Button>
                </Link>
                <Link to="/breakdown">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Breakdown
                  </Button>
                </Link>
                <Link to="/team-lead-review">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    TL Review
                  </Button>
                </Link>
                <Link to="/finalized-pdf">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Finalized PDF
                  </Button>
                </Link>
              </div>
              <ApprovalStatus status="auditor-review" />
              <Button variant="outline" size="sm">
                Save Verification
              </Button>
              {verified ? (
                <Link to="/finalized-pdf">
                  <Button size="sm">
                    Finalize CDA
                  </Button>
                </Link>
              ) : (
                <Button size="sm" disabled>
                  Finalize CDA
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Verification Alert Bar */}
      <div className="border-b bg-amber-50/50 dark:bg-amber-950/20">
        <div className="max-w-[1320px] mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Final verification required
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Team Lead and Agent have confirmed. Enter Radius fee and verify company dollar before generating the CDA PDF.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="size-4 mr-2" />
                View Approvals
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="size-4 mr-2" />
                View Change Log
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
                <DollarSign className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Purchase Price</p>
                  <p className="text-sm font-medium">$1,000,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Closing Date</p>
                  <p className="text-sm font-medium">Jun 18, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Team</p>
                  <p className="text-sm font-medium">Keystone Team</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Side</p>
                <p className="text-sm font-medium">Buyer</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Commission</p>
                <p className="text-sm font-medium">2.5% / $25,000</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Team Lead</p>
                <p className="text-sm font-medium">Rod Watson</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Agent Confirmed</p>
                <p className="text-sm font-medium">Today, 12:18 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-[70%_30%] gap-6">
          {/* Left Content */}
          <div className="space-y-6">
            {/* A. Approval Summary */}
            <section>
              <CDASectionHeader title="Approval Summary" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[
                      { label: "Agent Entry", status: "complete", time: "10:42 AM", icon: CheckCircle2 },
                      { label: "Team Lead Review", status: "complete", time: "11:35 AM", icon: CheckCircle2 },
                      { label: "Agent Confirmation", status: "complete", time: "12:18 PM", icon: UserCheck },
                      { label: "Auditor Verification", status: "current", time: "In progress", icon: Clock },
                      { label: "Final CDA PDF", status: "pending", time: "Pending", icon: FileText },
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
                          <p className="text-xs text-muted-foreground">{step.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* B. Final Commission Summary */}
            <section>
              <CDASectionHeader title="Final Commission Summary" />
              <Card>
                <CardContent className="pt-6 space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="size-3 text-muted-foreground" />
                    <MoneyRow label="Purchase Price" value={1000000} variant="neutral" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-3 text-muted-foreground" />
                    <MoneyRow label="Gross Commission Income" value={25000} variant="positive" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-3 text-muted-foreground" />
                    <MoneyRow label="Pre-split Deductions" value={-750} variant="deduction" />
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2">
                    <Lock className="size-3 text-muted-foreground" />
                    <MoneyRow label="Split Basis" value={24250} variant="positive" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-3 text-muted-foreground" />
                    <MoneyRow label="Agent Net Total" value={18650} variant="positive" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-3 text-muted-foreground" />
                    <MoneyRow label="Team Portion Before Radius Fee" value={4850} variant="neutral" />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* C. Agent Breakdown Review */}
            <section>
              <CDASectionHeader title="Agent Breakdown Review" />
              <div className="space-y-3">
                {agentBreakdowns.map((agent, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                            {agent.initials}
                          </div>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {agent.split}% split · {agent.plan}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-green-600" />
                          <span className="text-xs text-muted-foreground">
                            {agent.status === "finalized" ? "Finalized" : "Confirmed by TL and Agent / Pending Auditor"}
                          </span>
                          <Button variant="ghost" size="sm" className="h-7">
                            <Flag className="size-3 mr-1" />
                            Flag
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Gross After Split</p>
                          <p className="font-medium">${agent.grossAfterSplit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Team Portion</p>
                          <p className="font-medium">${agent.teamPortion.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Deductions</p>
                          <p className="font-medium">${agent.postSplitDeductions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Net Commission</p>
                          <p className="font-semibold text-green-700 dark:text-green-400">
                            ${agent.netCommission.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* D. Radius Fee Input Section */}
            <section>
              <CDASectionHeader
                title="Radius Fee Input"
                status={
                  verified ? (
                    <CheckCircle2 className="size-4 text-green-600" />
                  ) : (
                    <AlertCircle className="size-4 text-amber-600" />
                  )
                }
              />
              <Card className={cn(
                "border-2",
                verified ? "border-green-200 dark:border-green-800" : "border-amber-200 dark:border-amber-800"
              )}>
                <CardContent className="pt-6 space-y-4">
                  <MoneyRow
                    label="Team Portion Before Radius Fee"
                    value={teamPortionBeforeFee}
                    variant="neutral"
                  />
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Radius Fee Amount</label>
                      <span className="text-xs text-muted-foreground">Manual entry required</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FinanceInput
                        variant="currency"
                        value={radiusFee}
                        onChange={(e) => setRadiusFee(e.target.value)}
                        placeholder="750.00"
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Calculator className="size-4 mr-2" />
                        Recalculate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Radius fee is entered manually until automatic calculation is available.
                    </p>
                  </div>
                  <Separator />
                  <div className={cn(
                    "p-4 rounded-lg",
                    verified ? "bg-green-50 dark:bg-green-950/20" : "bg-slate-50 dark:bg-slate-900/20"
                  )}>
                    <MoneyRow
                      label="Company Dollar"
                      value={companyDollar}
                      variant={verified ? "positive" : "neutral"}
                      description="Team portion minus Radius fee"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* E. Company Dollar Verification */}
            <section>
              <CDASectionHeader title="Company Dollar Verification" />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <MoneyRow label="Team Portion" value={teamPortionBeforeFee} variant="neutral" />
                    <MoneyRow label="Radius Fee" value={-parseFloat(radiusFee || "0")} variant="deduction" />
                    <Separator className="my-2" />
                    <MoneyRow label="Company Dollar" value={companyDollar} variant="positive" />
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                      <Lock className="size-3" />
                      Cap contribution calculated in background (not shown on CDA)
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="verify-company-dollar"
                      checked={verified}
                      onCheckedChange={(checked) => setVerified(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="verify-company-dollar"
                        className="text-sm font-medium cursor-pointer"
                      >
                        I verified company dollar and Radius fee
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Confirm all calculations are correct before generating the CDA PDF.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* F. PDF Generation Preview */}
            <section>
              <CDASectionHeader title="PDF Generation" />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">CDA PDF</p>
                          <p className="text-xs text-muted-foreground">
                            {verified ? "Ready to generate" : "Not generated"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled={!verified}>
                        <Download className="size-4 mr-2" />
                        Generate CDA PDF
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Send className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">DocuSign Envelope</p>
                          <p className="text-xs text-muted-foreground">
                            {verified ? "Ready to send" : "Pending"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled={!verified}>
                        <Send className="size-4 mr-2" />
                        Send via DocuSign
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    PDF generation is available after final auditor verification.
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* G. Audit Notes */}
            <section>
              <CDASectionHeader title="Audit Notes" />
              <Card>
                <CardContent className="pt-6">
                  <Textarea
                    placeholder="Add internal notes for finance or compliance..."
                    value={auditorNotes}
                    onChange={(e) => setAuditorNotes(e.target.value)}
                    className="min-h-[100px] text-sm"
                  />
                  <div className="flex justify-end mt-3">
                    <Button variant="outline" size="sm">
                      Save Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* H. Change Log */}
            <section>
              <CDASectionHeader title="Change Log" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {changeLog.map((entry, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="text-xs text-muted-foreground whitespace-nowrap w-28">
                          {entry.time}
                        </div>
                        <div className="flex-1 text-sm">{entry.event}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Sticky Verification Panel */}
          <div className="sticky top-24 h-fit space-y-4">
            <FinanceSideSummary
              data={{
                grossCommission: 25000,
                totalDeductions: 750,
                companyDollar: companyDollar,
                netCommission: 18650,
                status: "auditor-review",
              }}
              sticky={false}
              onExport={() => console.log("Generate PDF")}
              onRequestApproval={() => console.log("Finalize CDA")}
            />

            {/* Validation Block */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium mb-3">Verification Status</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="size-3 text-green-600" />
                    <span className="text-muted-foreground">Agent confirmed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="size-3 text-green-600" />
                    <span className="text-muted-foreground">Team Lead confirmed</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {radiusFee && parseFloat(radiusFee) > 0 ? (
                      <CheckCircle2 className="size-3 text-green-600" />
                    ) : (
                      <AlertCircle className="size-3 text-amber-600" />
                    )}
                    <span className="text-muted-foreground">Radius fee required</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {verified ? (
                      <CheckCircle2 className="size-3 text-green-600" />
                    ) : (
                      <Clock className="size-3 text-slate-400" />
                    )}
                    <span className="text-muted-foreground">
                      Company dollar {verified ? "verified" : "not verified"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Helper Text */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="space-y-2 text-xs text-blue-900 dark:text-blue-100">
                <p>• Company dollar = team portion minus Radius fee</p>
                <p>• Cap contribution is calculated in background</p>
                <p>• CDA PDF can be generated after final verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <CDAActionBar
        status="auditor-review"
        isDirty={!verified}
        onSaveDraft={() => console.log("Save verification")}
        onRequestApproval={() => console.log("Finalize CDA")}
        onFinalize={() => console.log("Finalize")}
        onExportPDF={() => console.log("Generate PDF")}
      />
    </div>
  );
}
