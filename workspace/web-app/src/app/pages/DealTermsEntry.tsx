import { useState } from "react";
import { Link } from "react-router";
import {
  ApprovalStatus,
  CDASectionHeader,
  SplitAllocationBar,
  FeeBadge,
} from "../components/finance";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft,
  ChevronRight,
  Building2,
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Edit,
  Library,
  ExternalLink,
  FileText,
  Settings,
  Calculator,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { CDAFlowSwitcher } from "../components/v4/finance/cda-flow-switcher";

export function DealTermsEntry() {
  const [purchasePrice, setPurchasePrice] = useState("1000000");
  const [commissionRate, setCommissionRate] = useState("2.5");

  const grossCommission = (parseFloat(purchasePrice) * parseFloat(commissionRate)) / 100;
  const preSplitDeductions = 750;
  const splitBasis = grossCommission - preSplitDeductions;

  const agentAllocations = [
    { name: "Ila Corcoran", role: "Primary Agent", percentage: 60, initials: "IC" },
    { name: "Michael Tran", role: "Co-Agent", percentage: 40, initials: "MT" },
  ];

  const defaultFees = [
    { name: "TC Fee", amount: "$500" },
    { name: "RM Fee", amount: "$300" },
    { name: "E&O Fee", amount: "$125" },
  ];

  const checklistItems = [
    { label: "Purchase price entered", complete: !!purchasePrice },
    { label: "Commission rate entered", complete: !!commissionRate },
    { label: "Agent allocation totals 100%", complete: true },
    { label: "Commission plan selected", complete: true },
    { label: "Required fees applied", complete: true },
  ];

  const allComplete = checklistItems.every((item) => item.complete);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background border-b">
        {/* Universal CDA Navigation Header */}
        <div className="flex items-center justify-between border-b bg-background px-6 py-2.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Library className="size-3.5" />
                    Financials
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">Deal Terms</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <CDAFlowSwitcher />
        </div>

        {/* Title Row */}
        <div className="max-w-[1320px] mx-auto px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to Transaction
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold mb-1">Deal Terms</h1>
                <p className="text-sm text-muted-foreground">
                  Review contract terms, commission details, and CDA calculation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 pr-3 border-r mr-3">
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
              </div>
              <ApprovalStatus status="draft" />
              <Button variant="outline" size="sm">
                Save Changes
              </Button>
              <Button size="sm">Continue</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Transaction Context Strip */}
      <div className="border-b bg-background">
        <div className="max-w-[1320px] mx-auto px-6 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Property</p>
                <p className="text-sm font-medium">1284 Willow Creek Dr</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="text-sm font-medium">Michael Loft</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Side</p>
              <p className="text-sm font-medium">Buyer</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium">Pending</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Closing Date</p>
                <p className="text-sm font-medium">Jun 18, 2026</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Team</p>
              <p className="text-sm font-medium">Keystone Team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 py-6">
        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-[68%_32%] gap-6">
          {/* Left Form Content */}
          <div className="space-y-6">
            {/* A. Contract Details */}
            <section>
              <CDASectionHeader title="Contract Details" />
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchase-price">Purchase Price</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="purchase-price"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="acceptance-date">Acceptance Date</Label>
                      <Input
                        id="acceptance-date"
                        type="date"
                        defaultValue="2026-05-10"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="closing-date">Closing Date</Label>
                      <Input
                        id="closing-date"
                        type="date"
                        defaultValue="2026-06-18"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="transaction-side">Transaction Side</Label>
                      <Select defaultValue="buyer">
                        <SelectTrigger id="transaction-side" className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="seller">Seller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="property-type">Property Type</Label>
                      <Select defaultValue="single-family">
                        <SelectTrigger id="property-type" className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-family">Single Family</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="multi-family">Multi-Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mls-id">MLS ID</Label>
                      <Input
                        id="mls-id"
                        defaultValue="RA-248193"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* B. Commission Details */}
            <section>
              <CDASectionHeader title="Commission Details" />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="commission-type">Commission Type</Label>
                      <Select defaultValue="percentage">
                        <SelectTrigger id="commission-type" className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="flat">Flat Fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="commission-rate">Commission Rate</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="commission-rate"
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gross-commission">Gross Commission</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="gross-commission"
                          value={grossCommission.toLocaleString()}
                          readOnly
                          className="pl-9 bg-muted/50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Calculated from purchase price and commission rate
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="commission-paid-by">Commission Paid By</Label>
                      <Select defaultValue="seller">
                        <SelectTrigger id="commission-paid-by" className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seller">Seller</SelectItem>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="split">Split</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="commission-notes">Commission Notes</Label>
                    <Textarea
                      id="commission-notes"
                      placeholder="Add any notes about commission structure..."
                      className="mt-1.5 min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* C. Agent Allocation */}
            <section>
              <CDASectionHeader
                title="Agent Allocation"
                action={
                  <Button variant="outline" size="sm">
                    <Plus className="size-4 mr-2" />
                    Add Co-Agent
                  </Button>
                }
              />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    {agentAllocations.map((agent, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                              {agent.initials}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{agent.percentage}%</span>
                            <Button variant="ghost" size="sm" className="h-7">
                              <Edit className="size-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        {index < agentAllocations.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <SplitAllocationBar
                      allocations={agentAllocations.map((a) => ({
                        agentName: a.name,
                        percentage: a.percentage,
                      }))}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="size-3 text-green-600" />
                    <span className="text-muted-foreground">
                      Agent allocation must total 100% before CDA review
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* D. Commission Plan */}
            <section>
              <CDASectionHeader title="Commission Plan" />
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Selected Plan</Label>
                      <Button variant="outline" size="sm">
                        <Edit className="size-4 mr-2" />
                        Change Plan
                      </Button>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">80/20 Standard</p>
                        <FeeBadge label="Standard" variant="flat" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Agent 80% / Team 20% · Cap $18,000
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Default Fees Applied</Label>
                      <Button variant="outline" size="sm">
                        <Settings className="size-4 mr-2" />
                        Manage Fees
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {defaultFees.map((fee, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-muted-foreground" />
                            <span className="text-sm">{fee.name}</span>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {fee.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                      Defaults are assigned from CDA Settings and can be adjusted before review.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* E. CDA Readiness Checklist */}
            <section>
              <CDASectionHeader title="CDA Readiness Checklist" />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 py-2">
                        {item.complete ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : (
                          <Circle className="size-5 text-slate-300" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            !item.complete && "text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex items-center gap-3 py-2">
                      {allComplete ? (
                        <CheckCircle2 className="size-5 text-green-600" />
                      ) : (
                        <AlertCircle className="size-5 text-amber-600" />
                      )}
                      <span className={cn("text-sm font-medium", allComplete && "text-green-700")}>
                        {allComplete ? "Ready for CDA review" : "Complete all items to proceed"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right CDA Summary Card */}
          <div className="sticky top-24 h-fit">
            <Card className={cn(
              "border-2",
              allComplete ? "border-green-200 dark:border-green-800" : "border-slate-200"
            )}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4" />
                  CDA Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Commission</span>
                    <span className="font-medium">${grossCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pre-split Deductions</span>
                    <span className="font-medium text-muted-foreground">
                      ${preSplitDeductions} estimated
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Split Basis</span>
                    <span className="font-medium">${splitBasis.toLocaleString()} estimated</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agent Net Estimate</span>
                    <span className="font-medium text-muted-foreground">Pending review</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Company Dollar</span>
                    <span className="font-medium text-muted-foreground">
                      Pending auditor verification
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Circle className="size-3 text-slate-400" />
                    <p className="text-xs font-medium text-muted-foreground">CDA not started</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link to="/breakdown">
                    <Button className="w-full" size="sm" disabled={!allComplete}>
                      <FileText className="size-4 mr-2" />
                      Open CDA Breakdown
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" size="sm">
                    Preview Estimate
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                  Open CDA Breakdown to review deductions, splits, and approvals.
                </p>

                {!allComplete && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                          Action Required
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          Complete all checklist items to enable CDA Breakdown
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
