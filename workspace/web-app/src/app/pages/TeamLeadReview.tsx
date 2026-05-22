import { useState } from "react";
import { Link } from "react-router";
import {
  MoneyRow,
  SplitAllocationBar,
  ApprovalStatus,
  CDASectionHeader,
  FinanceSideSummary,
  CDAActionBar,
  FeeBadge,
  type AgentBreakdownData,
} from "../components/finance";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import {
  Plus,
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
  CheckCheck,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { cn } from "../components/ui/utils";

export function TeamLeadReview() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("1");
  const [applyToAllDeals, setApplyToAllDeals] = useState(false);
  const [tlNote, setTlNote] = useState("");

  // Sample data for Agent Breakdown
  const agentData: AgentBreakdownData[] = [
    {
      agentId: "1",
      agentName: "Ila Corcoran",
      agentInitials: "IC",
      splitPercentage: 60,
      grossAmount: 14550,
      deductions: [
        {
          id: "d1",
          label: "RM Fee",
          value: 300,
          badges: [{ label: "Post-Split", variant: "post-split" }],
          editable: true,
        },
        {
          id: "d2",
          label: "E&O Fee",
          value: 125,
          badges: [{ label: "Post-Split", variant: "post-split" }],
          editable: true,
        },
      ],
      netAmount: 11215,
      approvalStatus: "awaiting-tl",
    },
    {
      agentId: "2",
      agentName: "Michael Tran",
      agentInitials: "MT",
      splitPercentage: 40,
      grossAmount: 9700,
      deductions: [
        {
          id: "d3",
          label: "RM Fee",
          value: 200,
          badges: [{ label: "Post-Split", variant: "post-split" }],
          editable: true,
        },
      ],
      netAmount: 7435,
      approvalStatus: "awaiting-tl",
    },
  ];

  const selectedAgent = agentData.find((a) => a.agentId === selectedAgentId) || agentData[0];

  const reviewItems = [
    { label: "Commission plan selected", status: "complete" },
    { label: "Gross commission calculated", status: "complete" },
    { label: "Pre-split deductions reviewed", status: "needs-review" },
    { label: "Agent split reviewed", status: "complete" },
    { label: "Post-split deductions reviewed", status: "needs-review" },
    { label: "Company dollar pending auditor input", status: "pending" },
  ];

  const changeLog = [
    { time: "Today, 10:42 AM", event: "Ila submitted CDA details" },
    { time: "Today, 10:42 AM", event: "System applied 80/20 Standard plan" },
    { time: "Today, 10:42 AM", event: "System applied TC Fee and Compliance Review" },
    { time: "Today, 10:43 AM", event: "Split allocation updated to 60/40" },
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
            <Link to="/breakdown" className="hover:text-foreground transition-colors">
              CDA
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Team Lead Review</span>
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
                <h1 className="text-xl font-semibold mb-1">Team Lead Review</h1>
                <p className="text-sm text-muted-foreground">
                  Validate commission plan, splits, deductions, and payout before sending to the agent.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ApprovalStatus status="awaiting-tl" />
              <Button variant="outline" size="sm">
                Save Changes
              </Button>
              <Button size="sm">Send to Agent</Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Review Alert Bar */}
      <div className="border-b bg-blue-50/50 dark:bg-blue-950/20">
        <div className="max-w-[1320px] mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Review required
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Agent submitted CDA details. Confirm commission plan, deductions, and split before sending for agent confirmation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="size-4 mr-2" />
                View Change Log
              </Button>
              <Button variant="outline" size="sm">
                <CheckCheck className="size-4 mr-2" />
                Mark Reviewed
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
                <p className="text-xs text-muted-foreground mb-0.5">Submitted By</p>
                <p className="text-sm font-medium">Ila Corcoran</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
                <p className="text-sm font-medium">Today, 10:42 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-[70%_30%] gap-6">
          {/* Left Content */}
          <div className="space-y-6">
            {/* A. Review Checklist */}
            <section>
              <CDASectionHeader title="Review Checklist" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {reviewItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 py-2">
                        <div
                          className={cn(
                            "size-5 rounded-full flex items-center justify-center",
                            item.status === "complete" &&
                              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            item.status === "needs-review" &&
                              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            item.status === "pending" &&
                              "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          )}
                        >
                          {item.status === "complete" && <CheckCircle2 className="size-3" />}
                          {item.status === "needs-review" && <AlertCircle className="size-3" />}
                          {item.status === "pending" && <Clock className="size-3" />}
                        </div>
                        <p
                          className={cn(
                            "text-sm flex-1",
                            item.status === "pending" && "text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* B. Commission Plan Section */}
            <section>
              <CDASectionHeader title="Commission Plan" />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <MoneyRow label="Current Plan" value={0} variant="neutral" description="80/20 Standard" />
                    <MoneyRow label="Applies To" value={0} variant="neutral" description="Ila Corcoran" />
                    <MoneyRow label="Team Split" value={20} variant="neutral" description="20%" />
                    <MoneyRow label="Agent Split" value={80} variant="neutral" description="80%" />
                    <MoneyRow label="Cap Contribution" value={0} variant="neutral" description="Enabled" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Edit2 className="size-4 mr-2" />
                      Change Plan
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="apply-all"
                      checked={applyToAllDeals}
                      onCheckedChange={(checked) => setApplyToAllDeals(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="apply-all"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Apply plan changes to all under contract deals
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Apply this commission plan change to all current under contract deals for this agent.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* C. Gross Commission */}
            <section>
              <CDASectionHeader title="Gross Commission" />
              <Card>
                <CardContent className="pt-6 space-y-1">
                  <MoneyRow label="Purchase Price" value={1000000} variant="neutral" />
                  <MoneyRow
                    label="Commission Rate"
                    value={2.5}
                    variant="editable"
                    editable
                    onChange={(val) => console.log("Rate changed:", val)}
                  />
                  <Separator className="my-2" />
                  <MoneyRow
                    label="Gross Commission Income"
                    value={25000}
                    variant="positive"
                    description="Calculated from purchase price × commission rate"
                  />
                </CardContent>
              </Card>
            </section>

            {/* D. Pre-Split Deductions */}
            <section>
              <CDASectionHeader
                title="Pre-Split Deductions"
                action={
                  <Button variant="outline" size="sm">
                    <Plus className="size-4 mr-2" />
                    Add Pre-Split Deduction
                  </Button>
                }
              />
              <Card>
                <CardContent className="pt-6 space-y-1">
                  <div className="group relative">
                    <MoneyRow
                      label="TC Fee"
                      value={-500}
                      variant="deduction"
                      editable
                      badges={[
                        { label: "Flat", variant: "flat" },
                        { label: "Pre-Split", variant: "pre-split" },
                        { label: "Team", variant: "team" },
                      ]}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="size-4 text-destructive hover:text-destructive/80" />
                    </button>
                  </div>
                  <div className="group relative">
                    <MoneyRow
                      label="Compliance Review"
                      value={-250}
                      variant="deduction"
                      editable
                      badges={[
                        { label: "Flat", variant: "flat" },
                        { label: "Pre-Split", variant: "pre-split" },
                        { label: "Team", variant: "team" },
                      ]}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="size-4 text-destructive hover:text-destructive/80" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* E. Split Allocation */}
            <section>
              <CDASectionHeader
                title="Split Allocation"
                action={
                  <Button variant="outline" size="sm">
                    <Plus className="size-4 mr-2" />
                    Add Co-Agent
                  </Button>
                }
              />
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <MoneyRow
                      label="Split Basis (after pre-split deductions)"
                      value={24250}
                      variant="positive"
                    />
                  </div>
                  <SplitAllocationBar
                    allocations={[
                      { agentName: "Ila Corcoran", percentage: 60 },
                      { agentName: "Michael Tran", percentage: 40 },
                    ]}
                  />
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm group">
                      <span className="text-muted-foreground">Ila Corcoran</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">60%</span>
                        <span className="text-muted-foreground">$14,550</span>
                        <Edit2 className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm group">
                      <span className="text-muted-foreground">Michael Tran</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">40%</span>
                        <span className="text-muted-foreground">$9,700</span>
                        <Edit2 className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3 text-green-600" />
                    Agent allocation must total 100%.
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* F. Agent Breakdown */}
            <section>
              <CDASectionHeader title="Agent Breakdown" />
              <div className="grid grid-cols-[200px_1fr] gap-4">
                {/* Agent List */}
                <div className="space-y-2">
                  {agentData.map((agent) => (
                    <button
                      key={agent.agentId}
                      onClick={() => setSelectedAgentId(agent.agentId)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                        selectedAgentId === agent.agentId
                          ? "bg-accent border-border"
                          : "bg-background hover:bg-accent/50 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium">
                          {agent.agentInitials}
                        </div>
                        <p className="text-sm font-medium">{agent.agentName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{agent.splitPercentage}%</p>
                      <div className="mt-2">
                        <ApprovalStatus status="awaiting-tl" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Agent Detail */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                          {selectedAgent.agentInitials}
                        </div>
                        <div>
                          <p className="font-medium">{selectedAgent.agentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedAgent.splitPercentage}% split
                          </p>
                        </div>
                      </div>
                      <ApprovalStatus status="awaiting-tl" />
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <MoneyRow label="Split Basis" value={14550} variant="neutral" />
                      <MoneyRow
                        label="Commission Plan"
                        value={0}
                        variant="editable"
                        editable
                        description="80/20 Standard"
                      />
                      <MoneyRow label="Team Portion" value={-2910} variant="deduction" />
                      <MoneyRow
                        label="Agent Gross (after team split)"
                        value={11640}
                        variant="positive"
                      />
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Post-Split Deductions
                        </p>
                        <Button variant="ghost" size="sm" className="h-7">
                          <Plus className="size-3 mr-1" />
                          Add Deduction
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {selectedAgent.deductions.map((deduction) => (
                          <div key={deduction.id} className="group relative">
                            <MoneyRow
                              label={deduction.label}
                              value={-deduction.value}
                              variant="deduction"
                              editable={deduction.editable}
                              badges={deduction.badges}
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="size-4 text-destructive hover:text-destructive/80" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-2">
                        Internal TL Note
                      </label>
                      <Textarea
                        placeholder="Add internal notes for this agent..."
                        value={tlNote}
                        onChange={(e) => setTlNote(e.target.value)}
                        className="min-h-[80px] text-sm"
                      />
                    </div>

                    <Separator />

                    <MoneyRow
                      label="Net Commission"
                      value={selectedAgent.netAmount}
                      variant="positive"
                    />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* G. Company Dollar */}
            <section>
              <CDASectionHeader title="Company Dollar" />
              <Card>
                <CardContent className="pt-6 space-y-1">
                  <MoneyRow label="Team Portion" value={2910} variant="neutral" />
                  <MoneyRow
                    label="Radius Fee"
                    value={0}
                    variant="warning"
                    description="Manual auditor input required"
                  />
                  <Separator className="my-2" />
                  <MoneyRow
                    label="Company Dollar"
                    value={0}
                    variant="warning"
                    description="Auditor enters Radius fee during final verification."
                  />
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
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {entry.time}
                        </div>
                        <div className="flex-1 text-sm">{entry.event}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* I. Approval Progress */}
            <section>
              <CDASectionHeader title="Approval Progress" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[
                      { label: "Agent Entry", status: "complete", icon: CheckCircle2 },
                      { label: "Team Lead Review", status: "current", icon: Clock },
                      { label: "Agent Confirmation", status: "pending", icon: UserCheck },
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

          {/* Right Sticky Review Panel */}
          <div className="sticky top-24 h-fit space-y-4">
            <FinanceSideSummary
              data={{
                grossCommission: 25000,
                totalDeductions: 750,
                companyDollar: 0,
                netCommission: selectedAgent.netAmount,
                status: "awaiting-tl",
              }}
              sticky={false}
              onExport={() => console.log("Export PDF")}
              onRequestApproval={() => console.log("Send to agent")}
            />

            {/* Validation Block */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium mb-3">Review Status</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="size-3 text-green-600" />
                    <span className="text-muted-foreground">Allocation total: 100%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <AlertCircle className="size-3 text-amber-600" />
                    <span className="text-muted-foreground">Missing Radius fee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="size-3 text-slate-400" />
                    <span className="text-muted-foreground">Agent confirmation pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unsaved Changes Warning */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                    Unsaved TL Changes
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Save your changes before sending to agent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <CDAActionBar
        status="awaiting-tl"
        isDirty={true}
        onSaveDraft={() => console.log("Save changes")}
        onRequestApproval={() => console.log("Send to agent")}
        onFinalize={() => console.log("Finalize")}
        onExportPDF={() => console.log("Export PDF")}
      />
    </div>
  );
}
