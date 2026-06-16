import { useState } from "react";
import { Link } from "react-router";
import {
  FinanceSummaryCard,
  MoneyRow,
  SplitAllocationBar,
  FeeBadge,
  ApprovalStatus,
  CDASectionHeader,
  AgentBreakdownCard,
  TierBuilderRow,
  FeeBuilderModal,
  CDAActionBar,
  BuyerSellerToggle,
  FinanceEmptyState,
  FinanceInput,
  FinanceSideSummary,
  type FinanceSummaryData,
  type AgentBreakdownData,
  type TierData,
  type FeeTypeDraft,
  type TransactionSide,
} from "../components/finance";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Plus, Receipt, Users, TrendingUp, ExternalLink, AlertTriangle, MoreVertical, ChevronDown, Edit, Copy, Archive, Trash2, Flag, FileDown, Mail, Link as LinkIcon, Eye } from "lucide-react";

export function ComponentLibrary() {
  const [transactionSide, setTransactionSide] = useState<TransactionSide>("buyer");
  const [feeModalOpen, setFeeModalOpen] = useState(false);

  // Sample data for Finance Summary Card
  const summaryData: FinanceSummaryData = {
    grossCommission: 24500,
    preSplitDeductions: [
      { label: "Brokerage Fee", value: 2450 },
      { label: "Transaction Coordinator", value: 395 },
    ],
    agentSplit: 17647.5,
    postSplitDeductions: [
      { label: "E&O Insurance", value: 125 },
      { label: "Tech Package", value: 89 },
    ],
    netCommission: 17433.5,
  };

  // Sample data for Agent Breakdown Cards
  const agentData: AgentBreakdownData[] = [
    {
      agentId: "1",
      agentName: "Sarah Mitchell",
      agentInitials: "SM",
      splitPercentage: 60,
      grossAmount: 14700,
      deductions: [
        {
          id: "d1",
          label: "E&O Insurance",
          value: 125,
          badges: [{ label: "Post-Split", variant: "post-split" }],
          editable: false,
        },
        {
          id: "d2",
          label: "Marketing Budget",
          value: 500,
          badges: [
            { label: "Post-Split", variant: "post-split" },
            { label: "Editable", variant: "agent" },
          ],
          editable: true,
        },
      ],
      netAmount: 14075,
      approvalStatus: "awaiting-tl",
    },
    {
      agentId: "2",
      agentName: "Marcus Chen",
      agentInitials: "MC",
      splitPercentage: 40,
      grossAmount: 9800,
      deductions: [
        {
          id: "d3",
          label: "Referral Fee",
          value: 980,
          badges: [
            { label: "Percentage", variant: "percentage" },
            { label: "Post-Split", variant: "post-split" },
          ],
          editable: false,
        },
      ],
      netAmount: 8820,
      approvalStatus: "draft",
    },
  ];

  // Sample data for Tier Builder
  const [tiers, setTiers] = useState<TierData[]>([
    {
      id: "t1",
      rangeStart: 0,
      rangeEnd: 50000,
      splitPercentage: 60,
      resetPeriod: "annual",
      dealType: "all",
    },
    {
      id: "t2",
      rangeStart: 50000,
      rangeEnd: 100000,
      splitPercentage: 70,
      resetPeriod: "annual",
      dealType: "all",
    },
    {
      id: "t3",
      rangeStart: 100000,
      rangeEnd: null,
      splitPercentage: 80,
      resetPeriod: "annual",
      dealType: "all",
    },
  ]);

  const handleSaveFee = (data: FeeTypeDraft) => {
    console.log("Fee saved:", data);
  };

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
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-medium mb-1">CDA Component Library</h1>
                  <p className="text-sm text-muted-foreground">
                    Atomic components for real estate finance workflows
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <BuyerSellerToggle value={transactionSide} onChange={setTransactionSide} />
                  <Link to="/breakdown">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open CDA Breakdown
                    </Button>
                  </Link>
                  <Link to="/team-lead-review">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open TL Review
                    </Button>
                  </Link>
                  <Link to="/auditor-verification">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Auditor Verification
                    </Button>
                  </Link>
                  <Link to="/cda-settings">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open CDA Settings
                    </Button>
                  </Link>
                  <Link to="/agent-confirmation">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Agent Confirmation
                    </Button>
                  </Link>
                  <Link to="/commission-plan-builder">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Plan Builder
                    </Button>
                  </Link>
                  <Link to="/fee-type-builder">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Fee Builder
                    </Button>
                  </Link>
                  <Link to="/assign-defaults">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Assign Defaults
                    </Button>
                  </Link>
                  <Link to="/finalized-pdf">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Finalized PDF
                    </Button>
                  </Link>
                  <Link to="/edge-cases">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Edge Cases
                    </Button>
                  </Link>
                  <Link to="/insertion-map">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Insertion Map
                    </Button>
                  </Link>
                  <Link to="/calculator-breakdown">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Open Calculator
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-12">
              {/* Section 1: Status & Badges */}
              <section>
                <h2 className="text-lg font-medium mb-4">Status & Badges</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Approval Status Pills</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <ApprovalStatus status="draft" />
                    <ApprovalStatus status="awaiting-tl" />
                    <ApprovalStatus status="awaiting-agent" />
                    <ApprovalStatus status="auditor-review" />
                    <ApprovalStatus status="finalized" />
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Fee Badges</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <FeeBadge label="Pre-Split" variant="pre-split" />
                    <FeeBadge label="Post-Split" variant="post-split" />
                    <FeeBadge label="Flat Fee" variant="flat" />
                    <FeeBadge label="Percentage" variant="percentage" />
                    <FeeBadge label="Agent" variant="agent" />
                    <FeeBadge label="Team" variant="team" />
                    <FeeBadge label="Cap Contribution" variant="cap" />
                  </CardContent>
                </Card>
              </section>

              {/* Section 2: Money Rows */}
              <section>
                <h2 className="text-lg font-medium mb-4">Money Row Variants</h2>
                <Card>
                  <CardContent className="pt-6 space-y-1">
                    <MoneyRow
                      label="Neutral Value"
                      value={12500}
                      variant="neutral"
                      description="Standard display with hover state"
                    />
                    <MoneyRow
                      label="Positive Value"
                      value={24500}
                      variant="positive"
                      description="Emphasized positive amount"
                    />
                    <MoneyRow
                      label="Deduction"
                      value={-1250}
                      variant="deduction"
                      badges={[{ label: "Pre-Split", variant: "pre-split" }]}
                    />
                    <MoneyRow
                      label="Warning Value"
                      value={5000}
                      variant="warning"
                      description="Requires attention"
                    />
                    <MoneyRow
                      label="Editable Amount"
                      value={895}
                      variant="editable"
                      editable
                      onChange={(val) => console.log("Changed to:", val)}
                      badges={[
                        { label: "Post-Split", variant: "post-split" },
                        { label: "Editable", variant: "agent" },
                      ]}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* Section 3: Finance Summary Card */}
              <section>
                <h2 className="text-lg font-medium mb-4">Finance Summary Card</h2>
                <div className="max-w-md">
                  <FinanceSummaryCard data={summaryData} />
                </div>
              </section>

              {/* Section 4: Split Allocation Bar */}
              <section>
                <h2 className="text-lg font-medium mb-4">Split Allocation Bar</h2>
                <Card>
                  <CardContent className="pt-6">
                    <SplitAllocationBar
                      allocations={[
                        { agentName: "Sarah Mitchell", percentage: 60 },
                        { agentName: "Marcus Chen", percentage: 40 },
                      ]}
                    />
                    <Separator className="my-6" />
                    <SplitAllocationBar
                      allocations={[
                        { agentName: "Lead Agent", percentage: 50 },
                        { agentName: "Co-Agent 1", percentage: 25 },
                        { agentName: "Co-Agent 2", percentage: 15 },
                        { agentName: "Referral", percentage: 10 },
                      ]}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* Section 5: Finance Inputs */}
              <section>
                <h2 className="text-lg font-medium mb-4">Finance Input Fields</h2>
                <Card>
                  <CardContent className="pt-6 space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Currency Input</label>
                      <FinanceInput variant="currency" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Percentage Input</label>
                      <FinanceInput variant="percentage" placeholder="0.0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Calculated Value</label>
                      <FinanceInput
                        variant="currency"
                        value="24,500.00"
                        calculated
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Error State</label>
                      <FinanceInput variant="currency" value="Invalid" error />
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 6: Section Headers */}
              <section>
                <h2 className="text-lg font-medium mb-4">CDA Section Headers</h2>
                <div className="space-y-4 border rounded-lg overflow-hidden">
                  <CDASectionHeader
                    title="Commission Details"
                    status={<ApprovalStatus status="draft" />}
                    action={
                      <Button variant="outline" size="sm">
                        <Plus className="size-4 mr-2" />
                        Add Deduction
                      </Button>
                    }
                  />
                  <CDASectionHeader
                    title="Agent Allocations"
                    status={<ApprovalStatus status="awaiting-tl" />}
                  />
                  <CDASectionHeader
                    title="Historical Transactions"
                    sticky
                  />
                </div>
              </section>

              {/* Section 7: Agent Breakdown Cards */}
              <section>
                <h2 className="text-lg font-medium mb-4">Agent Breakdown Cards</h2>
                <div className="space-y-3">
                  {agentData.map((agent) => (
                    <AgentBreakdownCard
                      key={agent.agentId}
                      data={agent}
                      onDeductionChange={(deductionId, value) =>
                        console.log("Deduction changed:", deductionId, value)
                      }
                    />
                  ))}
                </div>
              </section>

              {/* Section 8: Tier Builder Rows */}
              <section>
                <h2 className="text-lg font-medium mb-4">Commission Tier Builder</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Commission Plan Tiers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tiers.map((tier) => (
                      <TierBuilderRow
                        key={tier.id}
                        data={tier}
                        onChange={(updated) => {
                          setTiers((prev) =>
                            prev.map((t) => (t.id === tier.id ? updated : t))
                          );
                        }}
                        onDelete={() => {
                          setTiers((prev) => prev.filter((t) => t.id !== tier.id));
                        }}
                      />
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="size-4 mr-2" />
                      Add Tier
                    </Button>
                  </CardContent>
                </Card>
              </section>

              {/* Section 9: Empty States */}
              <section>
                <h2 className="text-lg font-medium mb-4">Empty States</h2>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <FinanceEmptyState
                      icon={Receipt}
                      title="No deductions"
                      description="Add your first deduction to get started"
                      action={{
                        label: "Add Deduction",
                        onClick: () => console.log("Add deduction"),
                      }}
                    />
                  </Card>
                  <Card>
                    <FinanceEmptyState
                      icon={Users}
                      title="No agents assigned"
                      description="Assign agents to split commission"
                      action={{
                        label: "Add Agent",
                        onClick: () => console.log("Add agent"),
                      }}
                    />
                  </Card>
                  <Card>
                    <FinanceEmptyState
                      icon={TrendingUp}
                      title="No tiers configured"
                      description="Set up commission tiers for this plan"
                      action={{
                        label: "Create Tier",
                        onClick: () => console.log("Create tier"),
                      }}
                    />
                  </Card>
                </div>
              </section>

              {/* Section 10: Fee Builder Modal */}
              <section>
                <h2 className="text-lg font-medium mb-4">Fee Builder Modal</h2>
                <Card>
                  <CardContent className="pt-6">
                    <Button onClick={() => setFeeModalOpen(true)}>
                      <Plus className="size-4 mr-2" />
                      Open Fee Builder
                    </Button>
                  </CardContent>
                </Card>
              </section>

              {/* Section 11: Side Summary Panel */}
              <section>
                <h2 className="text-lg font-medium mb-4">Finance Side Summary Panel</h2>
                <FinanceSideSummary
                  data={{
                    grossCommission: 24500,
                    totalDeductions: 3059,
                    companyDollar: 4905,
                    netCommission: 17433.5,
                    status: "draft",
                  }}
                  sticky={false}
                  onExport={() => console.log("Export PDF")}
                  onRequestApproval={() => console.log("Request approval")}
                />
              </section>

              {/* Section 12: CDA Column Only */}
              <section>
                <h2 className="text-lg font-medium mb-4">CDA Column Only</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="w-[140px] border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-3 py-2 border-b">
                        <span className="text-xs font-medium text-muted-foreground">CDA</span>
                      </div>
                      <div className="divide-y">
                        {/* 1. Setup needed */}
                        <div className="px-3 py-3">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100 mb-1.5">
                            Setup needed
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            Complete details
                          </button>
                        </div>

                        {/* 2. Not started */}
                        <div className="px-3 py-3">
                          <Badge variant="secondary" className="text-[10px] h-5 mb-1.5">
                            Not started
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            Start CDA
                          </button>
                        </div>

                        {/* 3. Draft */}
                        <div className="px-3 py-3">
                          <Badge variant="outline" className="text-[10px] h-5 mb-1.5">
                            Draft
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            Continue
                          </button>
                        </div>

                        {/* 4. Awaiting TL */}
                        <div className="px-3 py-3">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 mb-1.5">
                            Awaiting TL
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            Review
                          </button>
                        </div>

                        {/* 5. Awaiting agent */}
                        <div className="px-3 py-3">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 mb-1.5">
                            Awaiting agent
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            View
                          </button>
                        </div>

                        {/* 6. Auditor review */}
                        <div className="px-3 py-3">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 mb-1.5">
                            Auditor review
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            View
                          </button>
                        </div>

                        {/* 7. Needs correction */}
                        <div className="px-3 py-3">
                          <Badge variant="destructive" className="text-[10px] h-5 bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100 mb-1.5">
                            Needs correction
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            Review
                          </button>
                        </div>

                        {/* 8. Finalized */}
                        <div className="px-3 py-3">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 mb-1.5">
                            Finalized
                          </Badge>
                          <button className="text-xs text-primary hover:underline block">
                            View PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 13: Default Assignments Components */}
              <section>
                <h2 className="text-lg font-medium mb-4">Default Assignments Components</h2>

                {/* 1. Default Assignments Entry Block */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Default Assignments Entry Block</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Default Assignments</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              Assign plans and fee types to agents so CDA estimates calculate automatically.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Manage defaults
                            </Button>
                            <Button variant="outline" size="sm">
                              Bulk assign
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">18 assigned</Badge>
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                            3 setup needed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {/* Row A */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              IC
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">Ila Corcoran</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">80/20 Standard</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">TC Fee, RM Fee, E&O Fee</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                              Complete
                            </Badge>
                            <button className="text-sm text-primary hover:underline">Edit</button>
                          </div>
                        </div>

                        {/* Row B */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              MT
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">Michael Tran</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Keystone Tiered</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">TC Fee, E&O Fee</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                              Complete
                            </Badge>
                            <button className="text-sm text-primary hover:underline">Edit</button>
                          </div>
                        </div>

                        {/* Row C */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              AP
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">Ava Patel</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Not assigned</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">No fees</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                              Setup needed
                            </Badge>
                            <button className="text-sm text-primary hover:underline">Assign</button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* 2. Default Assignments Empty State */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Default Assignments Empty State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FinanceEmptyState
                      icon={Users}
                      title="No defaults assigned yet"
                      description="Assign commission plans and fee types to agents so CDA estimates calculate automatically."
                      action={{
                        label: "Manage defaults",
                        onClick: () => console.log("Manage defaults"),
                      }}
                    />
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        Bulk assign
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Defaults apply when transaction details are filled.
                    </p>
                  </CardContent>
                </Card>

                {/* 3. Default Assignments Table Header & Rows */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Default Assignments Table</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Agent
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Commission Plan
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Default Fees
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Active Deals
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {/* A. Complete Row */}
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  IC
                                </div>
                                <span className="font-medium">Ila Corcoran</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">80/20 Standard</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                <Badge variant="secondary" className="text-[10px] h-5">TC Fee</Badge>
                                <Badge variant="secondary" className="text-[10px] h-5">RM Fee</Badge>
                                <Badge variant="secondary" className="text-[10px] h-5">E&O</Badge>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">2 under contract</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                                Complete
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-sm text-primary hover:underline">Edit</button>
                            </td>
                          </tr>

                          {/* B. Missing Plan Row */}
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  AP
                                </div>
                                <span className="font-medium">Ava Patel</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">Not assigned</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                <Badge variant="secondary" className="text-[10px] h-5">TC Fee</Badge>
                                <Badge variant="secondary" className="text-[10px] h-5">E&O</Badge>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">0</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                                Missing plan
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-sm text-primary hover:underline">Assign</button>
                            </td>
                          </tr>

                          {/* C. Missing Fees Row */}
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  MT
                                </div>
                                <span className="font-medium">Michael Tran</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">70/30 Standard</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">No fees</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">1 under contract</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                                Missing fees
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-sm text-primary hover:underline">Edit</button>
                            </td>
                          </tr>

                          {/* D. No Defaults Row */}
                          <tr className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  RW
                                </div>
                                <span className="font-medium">Rod Watson</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">Not assigned</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">No fees</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">4 under contract</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                                Setup needed
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-sm text-primary hover:underline">Assign</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* 6. Bulk Assign Toolbar */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Bulk Assign Toolbar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <Badge variant="secondary" className="text-xs">3 selected</Badge>
                      <Separator orientation="vertical" className="h-5" />
                      <Button variant="outline" size="sm">
                        Commission Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        Add Fee Types
                      </Button>
                      <div className="flex items-center gap-2 text-xs">
                        <input type="checkbox" id="apply-under-contract" className="size-3.5" />
                        <label htmlFor="apply-under-contract" className="text-muted-foreground">
                          Apply to under-contract deals
                        </label>
                      </div>
                      <div className="flex-1" />
                      <Button size="sm">Apply</Button>
                      <button className="text-sm text-muted-foreground hover:text-foreground">
                        Clear selection
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* 7. Edit Defaults Drawer */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Edit Defaults Drawer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card className="max-w-md">
                      <CardHeader className="border-b">
                        <CardTitle className="text-base">Edit agent defaults</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Ila Corcoran</p>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Commission Plan</label>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="text-sm">80/20 Standard</span>
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Default Fee Types</label>
                          <div className="border rounded-lg p-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">TC Fee</Badge>
                              <Badge variant="secondary" className="text-xs">RM Fee</Badge>
                              <Badge variant="secondary" className="text-xs">E&O Fee</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                          <input type="checkbox" id="apply-changes" className="size-4" />
                          <label htmlFor="apply-changes" className="text-sm">
                            Apply changes to under-contract deals
                          </label>
                        </div>
                        <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
                          <p className="text-xs text-blue-900 dark:text-blue-100">
                            2 under contract deals may recalculate.
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                          <p className="text-xs text-amber-900 dark:text-amber-100">
                            Changing defaults can update CDA estimates for active under-contract deals.
                          </p>
                        </div>
                      </CardContent>
                      <div className="border-t p-4 flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">Cancel</Button>
                        <Button size="sm">Save defaults</Button>
                      </div>
                    </Card>
                  </CardContent>
                </Card>

                {/* 8. Assign Defaults Empty Drawer */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Assign Defaults Empty Drawer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card className="max-w-md">
                      <CardHeader className="border-b">
                        <CardTitle className="text-base">Assign defaults</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Ava Patel</p>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Commission Plan</label>
                          <Button variant="outline" className="w-full justify-between text-muted-foreground">
                            <span className="text-sm">Select commission plan</span>
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Default Fee Types</label>
                          <Button variant="outline" className="w-full justify-between text-muted-foreground">
                            <span className="text-sm">Select fee types</span>
                          </Button>
                        </div>
                        <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                          <p className="text-xs text-amber-900 dark:text-amber-100">
                            Commission plan is required.
                          </p>
                        </div>
                      </CardContent>
                      <div className="border-t p-4 flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">Cancel</Button>
                        <Button size="sm">Save defaults</Button>
                      </div>
                    </Card>
                  </CardContent>
                </Card>

                {/* 9. Recalculation Warning Component */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recalculation Warning Component</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="size-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-medium text-amber-900 dark:text-amber-100">
                              Active CDA estimates may update
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              Applying new defaults to under-contract deals can recalculate CDA estimates and may require review again.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Button variant="outline" size="sm">
                                View affected deals
                              </Button>
                              <Button size="sm">Continue</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </section>

              {/* Section 14: CDA Dropdown Components */}
              <section>
                <h2 className="text-lg font-medium mb-4">CDA Dropdown Components</h2>

                {/* Commission Plan Select */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Commission Plan Select</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Closed State</p>
                        <Select defaultValue="80-20">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="80-20">80/20 Standard</SelectItem>
                            <SelectItem value="70-30">70/30 Standard</SelectItem>
                            <SelectItem value="keystone">Keystone Tiered</SelectItem>
                            <SelectItem value="lease">Lease Referral Plan</SelectItem>
                            <SelectItem value="none">Not assigned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Open State (Visual)</p>
                        <div className="relative">
                          <Select defaultValue="80-20">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                          <div className="mt-2 border rounded-lg bg-popover shadow-lg p-1">
                            <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">80/20 Standard</div>
                            <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">70/30 Standard</div>
                            <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Keystone Tiered</div>
                            <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Lease Referral Plan</div>
                            <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer text-muted-foreground">Not assigned</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Type & Splits */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Plan Type & Split Selects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Plan Type</p>
                        <Select defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="tiered">Tiered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Agent Split</p>
                        <Select defaultValue="80">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50%</SelectItem>
                            <SelectItem value="60">60%</SelectItem>
                            <SelectItem value="70">70%</SelectItem>
                            <SelectItem value="80">80%</SelectItem>
                            <SelectItem value="90">90%</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Team Split</p>
                        <Select defaultValue="20">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                            <SelectItem value="30">30%</SelectItem>
                            <SelectItem value="40">40%</SelectItem>
                            <SelectItem value="50">50%</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Agent Split - Expanded State (Visual)</p>
                      <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">50%</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">60%</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">70%</div>
                        <div className="px-2 py-1.5 text-sm bg-accent rounded cursor-pointer">80%</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">90%</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Custom</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cap & Reset Period */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Cap Amount & Reset Period</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Cap Amount</p>
                        <Select defaultValue="18000">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No cap</SelectItem>
                            <SelectItem value="8000">$8,000</SelectItem>
                            <SelectItem value="12000">$12,000</SelectItem>
                            <SelectItem value="15000">$15,000</SelectItem>
                            <SelectItem value="18000">$18,000</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Reset Period</p>
                        <Select defaultValue="yearly">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transaction">Per transaction</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="anniversary">Since last anniversary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Cap Amount - Expanded (Visual)</p>
                        <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer text-muted-foreground">No cap</div>
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">$8,000</div>
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">$12,000</div>
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">$15,000</div>
                          <div className="px-2 py-1.5 text-sm bg-accent rounded cursor-pointer">$18,000</div>
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Custom</div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Reset Period - Expanded (Visual)</p>
                        <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Per transaction</div>
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Monthly</div>
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Quarterly</div>
                          <div className="px-2 py-1.5 text-sm bg-accent rounded cursor-pointer">Yearly</div>
                          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Since last anniversary</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Configuration Selects */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Fee Configuration Selects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Fee Type</p>
                        <Select defaultValue="flat">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat">Flat</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Fee Timing</p>
                        <Select defaultValue="post-split">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pre-split">Pre-split</SelectItem>
                            <SelectItem value="post-split">Post-split</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Applies To</p>
                        <Select defaultValue="agent">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Percentage Basis</p>
                        <Select defaultValue="gci">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="property">Property value</SelectItem>
                            <SelectItem value="gci">Gross Commission Income</SelectItem>
                            <SelectItem value="split-basis">Split basis</SelectItem>
                            <SelectItem value="net">Net commission</SelectItem>
                            <SelectItem value="post-split">Post-split commission</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Accrued By</p>
                        <Select defaultValue="agent">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="transaction">Transaction</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2 text-muted-foreground">Calculation Period</p>
                      <Select defaultValue="transaction">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transaction">Per transaction</SelectItem>
                          <SelectItem value="anniversary">Since last anniversary</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium mb-2 text-muted-foreground">Percentage Basis - Expanded (Visual)</p>
                      <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[250px]">
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Property value</div>
                        <div className="px-2 py-1.5 text-sm bg-accent rounded cursor-pointer">Gross Commission Income</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Split basis</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Net commission</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Post-split commission</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction & Status Selects */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Transaction & Status Selects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Transaction Side</p>
                        <Select defaultValue="buyer">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                            <SelectItem value="both">Both sides</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Award Allocation</p>
                        <Select defaultValue="buyer-side">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer-side">Buyer side</SelectItem>
                            <SelectItem value="seller-side">Seller side</SelectItem>
                            <SelectItem value="split">Split across both sides</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">CDA Status</p>
                        <Select defaultValue="draft">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="setup">Setup needed</SelectItem>
                            <SelectItem value="estimate">Estimate ready</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="awaiting-tl">Awaiting TL</SelectItem>
                            <SelectItem value="awaiting-agent">Awaiting agent</SelectItem>
                            <SelectItem value="auditor">Auditor review</SelectItem>
                            <SelectItem value="correction">Needs correction</SelectItem>
                            <SelectItem value="finalized">Finalized</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium mb-2 text-muted-foreground">CDA Status - Expanded (Visual)</p>
                      <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Setup needed</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Estimate ready</div>
                        <div className="px-2 py-1.5 text-sm bg-accent rounded cursor-pointer">Draft</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Awaiting TL</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Awaiting agent</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Auditor review</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Needs correction</div>
                        <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Finalized</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Multi-select Examples */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Multi-select Examples</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Default Fee Types</p>
                        <div className="border rounded-lg p-2 bg-background">
                          <div className="flex items-center gap-1 flex-wrap mb-2">
                            <Badge variant="secondary" className="text-xs">TC Fee</Badge>
                            <Badge variant="secondary" className="text-xs">RM Fee</Badge>
                            <Badge variant="secondary" className="text-xs">E&O Fee</Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Add fee type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tc">TC Fee</SelectItem>
                              <SelectItem value="rm">RM Fee</SelectItem>
                              <SelectItem value="eo">E&O Fee</SelectItem>
                              <SelectItem value="compliance">Compliance Review</SelectItem>
                              <SelectItem value="broker">Broker Admin Fee</SelectItem>
                              <SelectItem value="sliding">Sliding Scale Team Fee</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Deal Types</p>
                        <div className="border rounded-lg p-2 bg-background">
                          <div className="flex items-center gap-1 flex-wrap mb-2">
                            <Badge variant="secondary" className="text-xs">Purchase</Badge>
                            <Badge variant="secondary" className="text-xs">Seller</Badge>
                          </div>
                          <Select>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Add deal type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buyer">Purchase</SelectItem>
                              <SelectItem value="seller">Seller</SelectItem>
                              <SelectItem value="lease">Lease</SelectItem>
                              <SelectItem value="landlord">Landlord</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2 text-muted-foreground">Agent Multi-select</p>
                      <div className="border rounded-lg p-2 bg-background">
                        <div className="flex items-center gap-1 flex-wrap mb-2">
                          <Badge variant="secondary" className="text-xs">Ila Corcoran</Badge>
                          <Badge variant="secondary" className="text-xs">Michael Tran</Badge>
                        </div>
                        <Select>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Add agent..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ila">Ila Corcoran</SelectItem>
                            <SelectItem value="michael">Michael Tran</SelectItem>
                            <SelectItem value="ava">Ava Patel</SelectItem>
                            <SelectItem value="rod">Rod Watson</SelectItem>
                            <SelectItem value="jessica">Jessica Taylor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Row Action Menus */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">Row Action Menus</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Commission Plan Actions - Closed</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="size-4 mr-2" />
                              Edit plan
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="size-4 mr-2" />
                              Assign to agents
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="size-4 mr-2" />
                              Duplicate plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Archive className="size-4 mr-2" />
                              Archive plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Commission Plan Actions - Expanded (Visual)</p>
                        <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Edit className="size-4 mr-2" />
                            Edit plan
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Users className="size-4 mr-2" />
                            Assign to agents
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Copy className="size-4 mr-2" />
                            Duplicate plan
                          </div>
                          <Separator className="my-1" />
                          <div className="flex items-center px-2 py-1.5 text-sm text-destructive hover:bg-accent rounded cursor-pointer">
                            <Archive className="size-4 mr-2" />
                            Archive plan
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Fee Type Actions - Closed</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="size-4 mr-2" />
                              Edit fee
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="size-4 mr-2" />
                              Assign default
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="size-4 mr-2" />
                              Duplicate fee
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Archive className="size-4 mr-2" />
                              Archive fee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Fee Type Actions - Expanded (Visual)</p>
                        <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Edit className="size-4 mr-2" />
                            Edit fee
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Users className="size-4 mr-2" />
                            Assign default
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Copy className="size-4 mr-2" />
                            Duplicate fee
                          </div>
                          <Separator className="my-1" />
                          <div className="flex items-center px-2 py-1.5 text-sm text-destructive hover:bg-accent rounded cursor-pointer">
                            <Archive className="size-4 mr-2" />
                            Archive fee
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Default Assignment Actions - Closed</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="size-4 mr-2" />
                              Edit defaults
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="size-4 mr-2" />
                              Apply to under-contract deals
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="size-4 mr-2" />
                              View affected deals
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="size-4 mr-2" />
                              Clear defaults
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Default Assignment Actions - Expanded (Visual)</p>
                        <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[220px]">
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Edit className="size-4 mr-2" />
                            Edit defaults
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Users className="size-4 mr-2" />
                            Apply to under-contract deals
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Eye className="size-4 mr-2" />
                            View affected deals
                          </div>
                          <Separator className="my-1" />
                          <div className="flex items-center px-2 py-1.5 text-sm text-destructive hover:bg-accent rounded cursor-pointer">
                            <Trash2 className="size-4 mr-2" />
                            Clear defaults
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Auditor Actions - Closed</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="size-4 mr-2" />
                              View change log
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Flag className="size-4 mr-2" />
                              Flag discrepancy
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="size-4 mr-2" />
                              Reopen review
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileDown className="size-4 mr-2" />
                              Export audit log
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Auditor Actions - Expanded (Visual)</p>
                        <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Eye className="size-4 mr-2" />
                            View change log
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Flag className="size-4 mr-2" />
                            Flag discrepancy
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Edit className="size-4 mr-2" />
                            Reopen review
                          </div>
                          <Separator className="my-1" />
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <FileDown className="size-4 mr-2" />
                            Export audit log
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Finalized CDA Actions - Closed</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileDown className="size-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="size-4 mr-2" />
                              Send via DocuSign
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <LinkIcon className="size-4 mr-2" />
                              Copy CDA link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="size-4 mr-2" />
                              View audit trail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Finalized CDA Actions - Expanded (Visual)</p>
                        <div className="border rounded-lg bg-popover shadow-lg p-1 max-w-[200px]">
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <FileDown className="size-4 mr-2" />
                            Download PDF
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Mail className="size-4 mr-2" />
                            Send via DocuSign
                          </div>
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <LinkIcon className="size-4 mr-2" />
                            Copy CDA link
                          </div>
                          <Separator className="my-1" />
                          <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
                            <Eye className="size-4 mr-2" />
                            View audit trail
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
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
        </div>
      </div>

      {/* Fee Builder Modal */}
      <FeeBuilderModal
        open={feeModalOpen}
        onOpenChange={setFeeModalOpen}
        onSave={handleSaveFee}
      />
    </div>
  );
}
