import { useState } from "react";
import { Link } from "react-router";
import {
  MoneyRow,
  SplitAllocationBar,
  ApprovalStatus,
  CDASectionHeader,
  BuyerSellerToggle,
  FinanceSideSummary,
  CDAActionBar,
  type AgentBreakdownData,
  type TransactionSide,
} from "../components/finance";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
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
  Circle,
  FileText,
  UserCheck,
  Library,
  ExternalLink,
} from "lucide-react";
import { cn } from "../components/ui/utils";

export function BreakdownPage() {
  const [transactionSide, setTransactionSide] = useState<TransactionSide>("buyer");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("1");

  // Sample data for Agent Breakdown
  const agentData: AgentBreakdownData[] = [
    {
      agentId: "1",
      agentName: "Ila Corcoran",
      agentInitials: "IC",
      splitPercentage: 60,
      grossAmount: 15000,
      deductions: [
        {
          id: "d1",
          label: "RM Fee",
          value: 300,
          badges: [{ label: "Post-Split", variant: "post-split" }],
          editable: false,
        },
        {
          id: "d2",
          label: "E&O Fee",
          value: 125,
          badges: [{ label: "Post-Split", variant: "post-split" }],
          editable: false,
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
      grossAmount: 10000,
      deductions: [
        {
          id: "d3",
          label: "RM Fee",
          value: 200,
          badges: [{ label: "Post-Split", variant: "post-split" }],
          editable: false,
        },
      ],
      netAmount: 7760,
      approvalStatus: "awaiting-tl",
    },
  ];

  const selectedAgent = agentData.find((a) => a.agentId === selectedAgentId) || agentData[0];
  const auditRows = [
    { property: "1284 Willow Creek Dr", agent: "Ila Corcoran", agentConfirmed: true, tlConfirmed: false },
    { property: "45 Rosemont Ave", agent: "Michael Tran", agentConfirmed: false, tlConfirmed: true },
    { property: "910 Market St", agent: "Sarah Jenkins", agentConfirmed: true, tlConfirmed: true },
    { property: "22 Palm Court", agent: "David Chen", agentConfirmed: false, tlConfirmed: false },
  ];
  function confirmationLabel(row: { agentConfirmed: boolean; tlConfirmed: boolean }) {
    if (row.agentConfirmed && row.tlConfirmed) return "Confirmed";
    if (row.agentConfirmed) return "TL Pending";
    if (row.tlConfirmed) return "Agent Pending";
    return "Agent Pending";
  }

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
            <span className="text-foreground font-medium">CDA Breakdown</span>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to Components
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold mb-1">CDA Breakdown</h1>
                <p className="text-sm text-muted-foreground">
                  Review commission, deductions, and payout before approval.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ApprovalStatus status="draft" />
              <Link to="/team-lead-review">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="size-4 mr-2" />
                  Open TL Review
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
              <Button size="sm">Request Approval</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1320px] mx-auto px-8 py-6">
        {/* Transaction Context Card */}
        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Auditor dashboard list view</h2>
                <p className="text-xs text-muted-foreground">Commission approval confirmation status per CDA.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Property</span>
                <span>Agent</span>
                <span>Commission approval confirmation</span>
              </div>
              {auditRows.map((row) => {
                const label = confirmationLabel(row);
                return (
                  <div key={row.property} className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-t px-4 py-3 text-sm">
                    <span className="font-medium">{row.property}</span>
                    <span className="text-muted-foreground">{row.agent}</span>
                    <Badge variant={label === "Confirmed" ? "secondary" : "outline"} className="w-fit">{label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                <p className="text-xs text-muted-foreground mb-0.5">Commission Rate</p>
                <p className="text-sm font-medium">2.5%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Gross Commission</p>
                <p className="text-sm font-semibold">$25,000</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Primary Agent</p>
                <p className="text-sm font-medium">Ila Corcoran</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer/Seller Toggle */}
        <div className="mb-6">
          <BuyerSellerToggle value={transactionSide} onChange={setTransactionSide} />
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-[70%_30%] gap-6">
          {/* Left Content */}
          <div className="space-y-6">
            {/* A. Gross Commission */}
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

            {/* B. Pre-Split Deductions */}
            <section>
              <CDASectionHeader
                title="Pre-Split Deductions"
                action={
                  <Button variant="outline" size="sm">
                    <Plus className="size-4 mr-2" />
                    Add Deduction
                  </Button>
                }
              />
              <Card>
                <CardContent className="pt-6 space-y-1">
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
                </CardContent>
              </Card>
            </section>

            {/* C. Split Allocation */}
            <section>
              <CDASectionHeader title="Split Allocation" />
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ila Corcoran (60%)</span>
                      <span className="font-medium">$14,550</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Michael Tran (40%)</span>
                      <span className="font-medium">$9,700</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* D. Agent Breakdown */}
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
                      <ApprovalStatus status={agent.approvalStatus} />
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
                      <ApprovalStatus status={selectedAgent.approvalStatus} />
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <MoneyRow
                        label="Split Basis"
                        value={14550}
                        variant="neutral"
                      />
                      <MoneyRow
                        label="Commission Plan"
                        value={0}
                        variant="neutral"
                        description="80/20 Standard"
                      />
                      <MoneyRow label="Team Split" value={20} variant="neutral" description="20%" />
                      <MoneyRow label="Team Portion" value={-2910} variant="deduction" />
                      <MoneyRow
                        label="Agent Gross (after team split)"
                        value={11640}
                        variant="positive"
                      />
                    </div>

                    <Separator />

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Post-Split Deductions
                      </p>
                      <div className="space-y-1">
                        {selectedAgent.deductions.map((deduction) => (
                          <MoneyRow
                            key={deduction.id}
                            label={deduction.label}
                            value={-deduction.value}
                            variant="deduction"
                            editable={deduction.editable}
                            badges={deduction.badges}
                          />
                        ))}
                      </div>
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

            {/* E. Company Dollar */}
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
                    description="Pending auditor input"
                  />
                </CardContent>
              </Card>
            </section>

            {/* F. Approval Progress */}
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

          {/* Right Sticky Summary */}
          <div className="sticky top-24 h-fit">
            <FinanceSideSummary
              data={{
                grossCommission: 25000,
                totalDeductions: 750,
                companyDollar: 0,
                netCommission: selectedAgent.netAmount,
                status: "draft",
              }}
              sticky={false}
              onExport={() => console.log("Export PDF")}
              onRequestApproval={() => console.log("Request approval")}
            />
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                    Unsaved Changes
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Save your changes before requesting approval
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <CDAActionBar
        status="draft"
        isDirty={true}
        onSaveDraft={() => console.log("Save draft")}
        onRequestApproval={() => console.log("Request approval")}
        onFinalize={() => console.log("Finalize")}
        onExportPDF={() => console.log("Export PDF")}
      />
    </div>
  );
}
