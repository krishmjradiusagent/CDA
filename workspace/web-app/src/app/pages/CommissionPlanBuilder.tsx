import { useState } from "react";
import { Link } from "react-router";
import {
  CDASectionHeader,
  TierBuilderRow,
  FinanceInput,
  FeeBadge,
  type TierData,
} from "../components/finance";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Library,
  Settings,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Users,
  DollarSign,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { Checkbox } from "../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { PLAN_DEAL_TYPE_OPTIONS, getCdaTypeLabel } from "../lib/cda-types";

const dealTypeOptions = PLAN_DEAL_TYPE_OPTIONS;

function DealTypeMultiSelect({
  selectedTypes,
  onChange,
}: {
  selectedTypes: Record<string, boolean>;
  onChange: (types: Record<string, boolean>) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedKeys = Object.keys(selectedTypes).filter((k) => selectedTypes[k as keyof typeof selectedTypes]);

  const allSelected = selectedKeys.length === dealTypeOptions.length;
  let triggerLabel = "Select deal types";
  if (allSelected) {
    triggerLabel = "Selected all deal types";
  } else if (selectedKeys.length === 1) {
    triggerLabel = getCdaTypeLabel(selectedKeys[0]);
  } else if (selectedKeys.length > 1) {
    triggerLabel = `${getCdaTypeLabel(selectedKeys[0])} +${selectedKeys.length - 1} others`;
  }

  function toggle(key: string) {
    onChange({
      ...selectedTypes,
      [key]: !selectedTypes[key as keyof typeof selectedTypes],
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 w-full justify-between font-normal px-3 overflow-hidden">
          <span className={cn("truncate text-sm", selectedKeys.length === 0 ? "text-muted-foreground" : "text-foreground font-medium")}>
            {triggerLabel}
          </span>
          <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={() => {
            const nextAllSelected = !allSelected;
            const next: any = {};
            dealTypeOptions.forEach((opt) => {
              next[opt.key] = nextAllSelected;
            });
            onChange(next);
          }}
          className="gap-3 cursor-pointer border-b rounded-none pb-2 mb-1"
        >
          <Checkbox checked={allSelected} className="pointer-events-none" />
          <span className="flex-1 text-sm font-medium">Select All</span>
        </DropdownMenuItem>
        {dealTypeOptions.map((type) => (
          <DropdownMenuItem
            key={type.key}
            onSelect={(e) => e.preventDefault()}
            onClick={() => toggle(type.key)}
            className="gap-3 cursor-pointer"
          >
            <Checkbox checked={Boolean(selectedTypes[type.key as keyof typeof selectedTypes])} className="pointer-events-none" />
            <span className="flex-1 text-sm font-medium">{type.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CommissionPlanBuilder() {
  const [planName, setPlanName] = useState("80/20 Standard");
  const [planType, setPlanType] = useState<"standard" | "tiered">("standard");
  const [agentSplit, setAgentSplit] = useState("80");
  const [teamSplit, setTeamSplit] = useState("20");
  const [capAmount, setCapAmount] = useState("18000");
  const [overrideCap, setOverrideCap] = useState(false);

  const [dealTypes, setDealTypes] = useState({
    buyer: true,
    seller: true,
    lease: false,
    landlord: false,
  });

  const [defaultFees, setDefaultFees] = useState({
    tcFee: true,
    rmFee: true,
    eoFee: true,
    complianceReview: false,
  });

  const [tiers, setTiers] = useState<TierData[]>([
    {
      id: "t1",
      rangeStart: 1,
      rangeEnd: 5,
      splitPercentage: 80,
      resetPeriod: "annual",
      dealType: "all",
    },
    {
      id: "t2",
      rangeStart: 6,
      rangeEnd: 10,
      splitPercentage: 85,
      resetPeriod: "annual",
      dealType: "all",
    },
    {
      id: "t3",
      rangeStart: 11,
      rangeEnd: null,
      splitPercentage: 90,
      resetPeriod: "annual",
      dealType: "all",
    },
  ]);

  const splitTotal = parseInt(agentSplit || "0") + parseInt(teamSplit || "0");
  const splitValid = splitTotal === 100;

  const grossCommission = 25000;
  const agentPortion = (grossCommission * parseInt(agentSplit || "0")) / 100;
  const teamPortion = (grossCommission * parseInt(teamSplit || "0")) / 100;

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
            <span className="text-xs text-muted-foreground">Settings</span>
            <ChevronRight className="size-3" />
            <Link to="/cda-settings" className="hover:text-foreground transition-colors">
              CDA
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Commission Plan</span>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link to="/cda-settings">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to CDA Settings
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold mb-1">Add Commission Plan</h1>
                <p className="text-sm text-muted-foreground">
                  Define default split rules, caps, reset periods, and deal types.
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
              </div>
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
              <Button size="sm">Save Plan</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1320px] mx-auto px-8 py-6">
        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-[65%_35%] gap-6">
          {/* Left Builder Form */}
          <div className="space-y-6">
            {/* A. Basic Details */}
            <section className="bg-background border rounded-lg overflow-hidden shadow-sm">
              <CDASectionHeader title="Basic Details" className="bg-muted/30" />
              <div className="p-4 space-y-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., 80/20 Standard"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description for internal use..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="plan-status">Plan Status</Label>
                  <Select defaultValue="draft">
                    <SelectTrigger id="plan-status" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* B. Plan Type */}
            <section className="bg-background border rounded-lg overflow-hidden shadow-sm">
              <CDASectionHeader title="Plan Type" className="bg-muted/30" />
              <div className="p-4">
                <Select value={planType} onValueChange={(v) => setPlanType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="tiered">Tiered</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-3">
                  {planType === "standard"
                    ? "Standard plans use fixed agent/team splits for all deals."
                    : "Tiered plans adjust splits based on deal volume or units."}
                </p>
              </div>
            </section>

            {/* C. Standard Plan Fields */}
            {planType === "standard" && (
              <section className="bg-background border rounded-lg overflow-hidden shadow-sm">
                <CDASectionHeader title="Split Configuration" className="bg-muted/30" />
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agent-split">Agent Split %</Label>
                      <FinanceInput
                        id="agent-split"
                        variant="percentage"
                        value={agentSplit}
                        onChange={(e) => setAgentSplit(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="team-split">Team Split %</Label>
                      <FinanceInput
                        id="team-split"
                        variant="percentage"
                        value={teamSplit}
                        onChange={(e) => setTeamSplit(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2 text-xs p-2 rounded",
                      splitValid
                        ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {splitValid ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <AlertCircle className="size-3" />
                    )}
                    <span>
                      Split total: {splitTotal}% {splitValid ? "(Valid)" : "(Must equal 100%)"}
                    </span>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="cap-amount">Cap Amount</Label>
                    <FinanceInput
                      id="cap-amount"
                      variant="currency"
                      value={capAmount}
                      onChange={(e) => setCapAmount(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cap-anniversary">Cap Anniversary Basis</Label>
                    <Select defaultValue="calendar-year">
                      <SelectTrigger id="cap-anniversary" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calendar-year">Calendar Year</SelectItem>
                        <SelectItem value="anniversary">Anniversary Date</SelectItem>
                        <SelectItem value="rolling">Rolling 12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-1.5 block">Deal Types</Label>
                    <DealTypeMultiSelect
                      selectedTypes={dealTypes}
                      onChange={setDealTypes}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* D. Tiered Plan Fields */}
            {planType === "tiered" && (
              <section className="bg-background border rounded-lg overflow-hidden shadow-sm">
                <CDASectionHeader title="Tier Configuration" className="bg-muted/30" />
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="based-on">Based On</Label>
                      <Select defaultValue="units">
                        <SelectTrigger id="based-on" className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="units">Units (Deals)</SelectItem>
                          <SelectItem value="volume">Volume (GCI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reset-period">Reset Period</Label>
                      <Select defaultValue="yearly">
                        <SelectTrigger id="reset-period" className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-sm font-semibold">Tier Structure</Label>
                    <div className="space-y-3">
                      {tiers.map((tier, index) => (
                        <div key={tier.id} className="p-3 border rounded-lg bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Tier {index + 1}</span>
                            {tiers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => setTiers(tiers.filter((t) => t.id !== tier.id))}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Range</p>
                              <p className="font-medium">
                                {tier.rangeStart}–{tier.rangeEnd || "∞"} deals
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Agent Split</p>
                              <p className="font-medium">{tier.splitPercentage}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Team Split</p>
                              <p className="font-medium">{100 - tier.splitPercentage}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full h-9" size="sm">
                        <Plus className="size-4 mr-2" />
                        Add Tier
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* E. Cap Behavior */}
            <section className="bg-background border rounded-lg overflow-hidden shadow-sm">
              <CDASectionHeader title="Cap Behavior" className="bg-muted/30" />
              <div className="p-4 space-y-4">
                <div>
                  <Label htmlFor="plan-cap">Plan Cap Amount</Label>
                  <FinanceInput
                    id="plan-cap"
                    variant="currency"
                    value={capAmount}
                    onChange={(e) => setCapAmount(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Switch
                    id="override-cap"
                    checked={overrideCap}
                    onCheckedChange={setOverrideCap}
                  />
                  <div className="flex-1">
                    <label htmlFor="override-cap" className="text-sm font-medium cursor-pointer">
                      Override existing agent cap
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      If enabled, this plan cap replaces the agent cap on file.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* F. Default Fees */}
            <section className="bg-background border rounded-lg overflow-hidden shadow-sm">
              <CDASectionHeader title="Default Fees" className="bg-muted/30" />
              <div className="p-4">
                <Label className="mb-3 block text-sm font-semibold">Apply these fees by default</Label>
                <div className="space-y-2">
                  {[
                    { key: "tcFee", label: "TC Fee", amount: "$500" },
                    { key: "rmFee", label: "RM Fee", amount: "$300" },
                    { key: "eoFee", label: "E&O Fee", amount: "$125" },
                    { key: "complianceReview", label: "Compliance Review", amount: "$250" },
                  ].map((fee) => (
                    <label
                      key={fee.key}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={defaultFees[fee.key as keyof typeof defaultFees]}
                          onCheckedChange={(checked) =>
                            setDefaultFees({
                              ...defaultFees,
                              [fee.key]: Boolean(checked),
                            })
                          }
                        />
                        <span className="text-sm font-medium">{fee.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{fee.amount}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* G. Assignment Preview */}
            <section className="bg-background border rounded-lg overflow-hidden shadow-sm">
              <CDASectionHeader title="Assignment" className="bg-muted/30" />
              <div className="p-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-dashed">
                  <Users className="size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assigned Agents</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      0 agents assigned to this plan
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                    Assign After Saving
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                  Save the plan first, then assign it to specific agents.
                </p>
              </div>
            </section>
          </div>

          {/* Right Live Preview */}
          <div className="sticky top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Plan Details</p>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{planName}</p>
                      <FeeBadge
                        label={planType === "standard" ? "Standard" : "Tiered"}
                        variant={planType === "standard" ? "flat" : "percentage"}
                      />
                    </div>
                    {planType === "standard" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Agent Split</span>
                          <span className="font-medium">{agentSplit}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Team Split</span>
                          <span className="font-medium">{teamSplit}%</span>
                        </div>
                      </>
                    )}
                    {planType === "tiered" && (
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Tiers</p>
                        {tiers.map((tier, i) => (
                          <p key={tier.id} className="text-xs">
                            Tier {i + 1}: {tier.rangeStart}–{tier.rangeEnd || "∞"} deals →{" "}
                            {tier.splitPercentage}% agent
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cap</span>
                      <span className="font-medium">${parseInt(capAmount || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reset</span>
                      <span className="font-medium">Yearly</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deal Types</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(dealTypes)
                          .filter(([_, checked]) => checked)
                          .map(([key]) => (
                            <span
                              key={key}
                              className="text-xs px-2 py-0.5 bg-background rounded"
                            >
                              {getCdaTypeLabel(key)}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Sample Calculation</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-muted-foreground" />
                      <div className="flex-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Commission</span>
                        <span className="font-medium">${grossCommission.toLocaleString()}</span>
                      </div>
                    </div>
                    {planType === "standard" && (
                      <>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4 text-muted-foreground" />
                          <div className="flex-1 flex justify-between text-sm">
                            <span className="text-muted-foreground">Agent Portion</span>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                              ${agentPortion.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-muted-foreground" />
                          <div className="flex-1 flex justify-between text-sm">
                            <span className="text-muted-foreground">Team Portion</span>
                            <span className="font-medium">${teamPortion.toLocaleString()}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    This preview updates as you configure the plan. Sample uses $25,000 gross
                    commission.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-[14px] mt-auto">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {splitValid ? "Ready to save" : "Fix validation errors to continue"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/cda-settings">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              Save Draft
            </Button>
            <Button size="sm" disabled={!splitValid}>
              Save Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
