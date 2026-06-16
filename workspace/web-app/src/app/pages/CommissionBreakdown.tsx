import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  CircleDollarSign,
  Building2,
  ChevronRight,
  Download,
  Landmark,
  Info,
  MessageCircleMore,
  Pencil,
  Printer,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Sliders,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Radar,
  Calendar,
  Activity,
  AtSign,
  Check,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/v4/ui/button";
import { Badge } from "../components/v4/ui/badge";
import { Avatar, AvatarFallback } from "../components/v4/ui/avatar";
import { Card, CardContent } from "../components/v4/ui/card";
import { Input } from "../components/v4/ui/input";
import { Textarea } from "../components/v4/ui/textarea";
import { Alert, AlertDescription } from "../components/v4/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/v4/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/v4/ui/breadcrumb";
import { Separator } from "../components/v4/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/v4/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/v4/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../components/v4/ui/tooltip";
import { Checkbox } from "../components/v4/ui/checkbox";
import { Label } from "../components/v4/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/v4/ui/select";
import {
  SheetClose,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/v4/ui/sheet";

import { cn } from "../../lib/utils";
import { CDAFlowSwitcher } from "../components/v4/finance/cda-flow-switcher";
import { FeeBuilderModal } from "../components/finance/fee-builder-modal";
import type { ExistingFeeOption, FeeTypeDraft } from "../components/finance/fee-builder-modal";
import {
  createDefaultWireInstructionsStore,
  createEmptyWireInstruction,
  isWireInstructionComplete,
  maskSensitiveValue,
  readWireInstructionsStore,
  validateWireInstruction,
  writeWireInstructionsStore,
  type WireInstructionRecord,
  type WireValidationErrors,
  type WireAccountType,
  type CDAType,
} from "../lib/wire-instructions";

type SideId = "listing" | "buyer";
type Role = "agent" | "team_lead" | "radius_auditing" | "soul_auditor";
type Agent = { id: string; name: string; role: string; payout: number; email?: string; avatarUrl?: string; external?: boolean; phone?: string; brokerageName?: string; brokerageLicenseNumber?: string; brokerageStreetAddress?: string; brokerageUnit?: string; brokerageCity?: string; brokerageState?: string; brokerageZip?: string; representing?: string };
type SideDeduction = { id: string; name: string; amount: number };
type Side = {
  id: SideId;
  title: string;
  subline: string;
  award: number;
  gross: number;
  agents: Agent[];
  active: boolean;
};

type PlanType = "standard" | "tiered";
type FeeType = "flat" | "percentage";
type ResetPeriod = "yearly" | "quarterly" | "monthly";
type BasedOn = "units" | "gci" | "sales-volume";
type CommissionPlanOption = {
  id: string;
  name: string;
  detail: string;
  feeType: FeeType;
  feeAmount: number;
  capAmount: number;
  agentSplit: number;
  teamSplit: number;
};

type TierRow = {
  id: string;
  from: string;
  to: string;
  agentSplit: string;
  teamSplit: string;
};

type PlanForm = {
  editingPlanId: string | null;
  planName: string;
  planType: PlanType;
  agentSplit: string;
  teamSplit: string;
  resetPeriod: ResetPeriod;
  basedOn: BasedOn;
  feeType: FeeType;
  feeAmount: string;
  capAmount: string;
  applyAsDefault: boolean;
  selectedAgentIds: string[];
  tiers: TierRow[];
};

type PlanErrors = Partial<
  Record<"planName" | "splitTotal" | "selectedAgentIds", string>
> & {
  tiers?: Record<string, string>;
};

type PendingAgent = {
  id: string;
  name: string;
  email?: string;
  external?: boolean;
  phone?: string;
  brokerageName?: string;
  brokerageLicenseNumber?: string;
  brokerageStreetAddress?: string;
  brokerageUnit?: string;
  brokerageCity?: string;
  brokerageState?: string;
  brokerageZip?: string;
  representing?: string;
};

const CONTACTS = [
  { id: "c1", name: "Gabriel Morales" },
  { id: "c2", name: "Gabriel Navarro" },
  { id: "c3", name: "Gabriel Ryan Schwulst" },
  { id: "c4", name: "Gabriel Valdez" },
  { id: "c5", name: "Gabriel Cerda" },
  { id: "c6", name: "Juan Gabriel Padilla" },
  { id: "c7", name: "Priya Shah" },
  { id: "c8", name: "Scott Kato" },
  { id: "c9", name: "Vanessa Brown" },
  { id: "c10", name: "Rod Watson" },
];

const COMMISSION_PLANS: CommissionPlanOption[] = [
  { id: "p1", name: "80/20 Standard", detail: "80% agent · 20% team", feeType: "flat", feeAmount: 495, capAmount: 18000, agentSplit: 80, teamSplit: 20 },
  { id: "p2", name: "70/30 Standard", detail: "70% agent · 30% team", feeType: "flat", feeAmount: 495, capAmount: 15000, agentSplit: 70, teamSplit: 30 },
  { id: "p3", name: "Keystone Tiered", detail: "Tiered split plan", feeType: "flat", feeAmount: 0, capAmount: 0, agentSplit: 100, teamSplit: 0 },
  { id: "p4", name: "Lease Referral Plan", detail: "60% agent · 40% team", feeType: "flat", feeAmount: 0, capAmount: 0, agentSplit: 60, teamSplit: 40 },
];

const DEFAULT_FEE_LIBRARY: ExistingFeeOption[] = [
  { id: "f1", name: "TC Fee", type: "flat", amount: "500", timing: "pre-split", appliesToMode: "team", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split" },
  { id: "f2", name: "RM Fee", type: "flat", amount: "300", timing: "post-split", appliesToMode: "agent", agentIds: ["a1"], slidingScale: false, contributesToCap: true, tiers: [], percentageBase: "pre-split" },
  { id: "f3", name: "E&O Fee", type: "flat", amount: "125", timing: "post-split", appliesToMode: "agent", agentIds: ["a1"], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split" },
  { id: "f4", name: "Compliance Review", type: "flat", amount: "250", timing: "pre-split", appliesToMode: "both", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split" },
];

const AGENT_CAP_PROGRESS: Record<string, number> = {
  a1: 17420,
  a2: 13250,
  a3: 18000,
  a4: 9600,
  a5: 4100,
  a6: 8400,
  a7: 3200,
  a8: 1100,
};

const initialSides: Side[] = [
  {
    id: "listing",
    title: "Listing Side",
    subline: "Circle Real Estate",
    award: 1,
    gross: 49500,
    agents: [
      
    ],
    active: true,
  },
  {
    id: "buyer",
    title: "Buying Side",
    subline: "Jeanne Gould",
    award: 0,
    gross: 49500,
    agents: [
      { id: "a1", name: "Mark Perez", role: "Primary agent", payout: 29451 },
    ],
    active: false,
  },
];

const PDF_PREVIEW_DETAILS = [
  { label: "Property Address", value: "1284 Willow Creek Dr" },
  { label: "Client Name", value: "Michael Loft" },
  { label: "Gross Commission", value: "$25,000.00" },
  { label: "Agent Net Total", value: "$18,650.00" },
  { label: "Team Dollar", value: "$4,100.00" },
  { label: "Finalized By", value: "Jessica (Auditor)" },
];

const PDF_FINAL_NUMBERS = [
  { label: "Gross Commission", value: "$25,000.00", tone: "text-emerald-700" },
  { label: "Pre-Split Deductions", value: "-$750.00", badge: "Pre-Split", badgeClassName: "border-blue-200 bg-blue-50 text-blue-700" },
  { label: "Split Basis", value: "$24,250.00" },
  { label: "Agent Net Total", value: "$18,650.00", tone: "text-emerald-700", description: "Total to all agents after deductions" },
  { label: "Team Portion", value: "$4,850.00", description: "20% team split" },
  { label: "Radius Fee", value: "$750.00", badge: "Auditor Entry", badgeClassName: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700" },
  { label: "Team Dollar", value: "$4,100.00", tone: "text-emerald-700", description: "Final team revenue" },
];

const PROPERTY_ADDRESS = "1284 Willow Creek Dr";

function currency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function formatWireAccountType(accountType: WireInstructionRecord["accountType"]) {
  return accountType === "checking" ? "Checking" : "Savings";
}

const roleMeta: Record<string, { label: string; badge: string; avatar: string }> = {
  agent: { label: "Agent", badge: "bg-blue-50 text-blue-700 border-blue-200", avatar: "bg-blue-100 text-blue-700" },
  team_lead: { label: "Team Lead", badge: "bg-amber-50 text-amber-700 border-amber-200", avatar: "bg-amber-100 text-amber-700" },
  radius_auditing: { label: "Auditor", badge: "bg-purple-50 text-purple-700 border-purple-200", avatar: "bg-purple-100 text-purple-700" },
  soul_auditor: { label: "SOUL Auditor", badge: "bg-purple-50 text-purple-700 border-purple-200", avatar: "bg-purple-100 text-purple-700" },
};

function numericValue(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

const defaultTiers: TierRow[] = [
  { id: "tier-1", from: "1", to: "5", agentSplit: "80", teamSplit: "20" },
  { id: "tier-2", from: "6", to: "10", agentSplit: "85", teamSplit: "15" },
  { id: "tier-3", from: "11", to: "25", agentSplit: "90", teamSplit: "10" },
  { id: "tier-4", from: "26", to: "", agentSplit: "95", teamSplit: "5" },
];

const DEAL_SALE_PRICE = 4_950_000;
const DEAL_TOTAL_COMMISSION_RATE = 0.02;
const COMMISSION_BREAKDOWN_STORAGE_KEY = "cda-commission-breakdown-v1";
const CURRENT_TEAM_LEAD_ID = "a3";
const CURRENT_AGENT_ID = "a1";

type DerivedAgentSummary = {
  agent: Agent;
  side: Side;
  allocationPercent: number;
  commissionBasis: number;
  preSplitDeductionsTotal: number;
  afterPreSplit: number;
  split: number;
  splitRate: number;
  plan: CommissionPlanOption | null;
  radiusFee: number;
  postSplitDeductionsTotal: number;
  postSplitAgentCommission: number;
  netCommission: number;
  companyDollarContribution: number;
  capAmount: number;
  capUsed: number;
  capRemaining: number;
  capApplied: number;
  capWarning: boolean;
  capReached: boolean;
};

type DerivedSideSummary = {
  side: Side;
  grossCommission: number;
  grossDeductionsTotal: number;
  grossCommissionAfterDeductions: number;
  agents: DerivedAgentSummary[];
  toAgents: number;
  officeIncome: number;
  radiusFee: number;
};

type PersistedCommissionBreakdownState = {
  sidesData: Side[];
  sideGrossDeductions: Record<string, SideDeduction[]>;
  preSplitDeductions: Record<string, Array<{ id: string; name: string; amount: number }>>;
  postSplitDeductions: Record<string, Array<{ id: string; name: string; amount: number; isRadiusFee?: boolean }>>;
  awardValues: Record<SideId, number>;
  awardAmountValues: Record<SideId, number>;
  appliedPlans: Record<string, string | null>;
  agentRadiusFees: Record<string, number>;
  agentAllocationPercentages: Record<string, number>;
  commissionPlans: CommissionPlanOption[];
};

function roundCurrency(value: number) {
  return Math.round(value);
}

function clampCurrency(value: number) {
  return Math.max(value, 0);
}

function getDefaultAgentAllocationPercentages() {
  return initialSides.reduce<Record<string, number>>((acc, side) => {
    if (side.agents.length === 0) return acc;
    const base = side.agents.length === 1 ? 100 : roundCurrency(100 / side.agents.length);
    let remaining = 100;
    side.agents.forEach((agent, index) => {
      const allocation = index === side.agents.length - 1 ? remaining : Math.min(base, remaining);
      acc[agent.id] = allocation;
      remaining -= allocation;
    });
    return acc;
  }, {});
}

function normalizeSideAwards(awardValues: Record<SideId, number>) {
  const total = Object.values(awardValues).reduce((sum, value) => sum + Math.max(value, 0), 0);
  if (total <= 0) {
    return {
      listing: 50,
      buyer: 50,
    } satisfies Record<SideId, number>;
  }
  return {
    listing: (Math.max(awardValues.listing, 0) / total) * 100,
    buyer: (Math.max(awardValues.buyer, 0) / total) * 100,
  } satisfies Record<SideId, number>;
}

function getDefaultAwardAmountValues(
  sides: Side[] | undefined,
  awardValues: Record<SideId, number>,
) {
  const normalizedAwards = normalizeSideAwards(awardValues);
  const baseGrossCommission = DEAL_SALE_PRICE * DEAL_TOTAL_COMMISSION_RATE;

  return {
    listing: Math.max(
      roundCurrency(
        (sides?.find((side) => side.id === "listing")?.gross ?? 0) -
          (baseGrossCommission * ((normalizedAwards.listing ?? 0) / 100)),
      ),
      0,
    ),
    buyer: Math.max(
      roundCurrency(
        (sides?.find((side) => side.id === "buyer")?.gross ?? 0) -
          (baseGrossCommission * ((normalizedAwards.buyer ?? 0) / 100)),
      ),
      0,
    ),
  } satisfies Record<SideId, number>;
}

function normalizeAgentAllocations(agentIds: string[], values: Record<string, number>) {
  if (agentIds.length === 0) return {} as Record<string, number>;
  if (agentIds.length === 1) return { [agentIds[0]]: 100 };

  const sanitized = agentIds.map((id) => ({
    id,
    value: Math.max(values[id] ?? 0, 0),
  }));
  const total = sanitized.reduce((sum, entry) => sum + entry.value, 0);

  if (total <= 0) {
    const even = roundCurrency(100 / agentIds.length);
    let remainder = 100;
    return agentIds.reduce<Record<string, number>>((acc, id, index) => {
      const value = index === agentIds.length - 1 ? remainder : Math.min(even, remainder);
      acc[id] = value;
      remainder -= value;
      return acc;
    }, {});
  }

  let remainder = 100;
  return sanitized.reduce<Record<string, number>>((acc, entry, index) => {
    const normalized = index === sanitized.length - 1 ? remainder : roundCurrency((entry.value / total) * 100);
    const clamped = Math.max(Math.min(normalized, remainder), 0);
    acc[entry.id] = clamped;
    remainder -= clamped;
    return acc;
  }, {});
}

function deriveCommissionBreakdown(params: {
  sides: Side[];
  awardValues: Record<SideId, number>;
  awardAmountValues: Record<SideId, number>;
  sideGrossDeductions: Record<string, SideDeduction[]>;
  preSplitDeductions: Record<string, Array<{ id: string; name: string; amount: number }>>;
  postSplitDeductions: Record<string, Array<{ id: string; name: string; amount: number; isRadiusFee?: boolean }>>;
  appliedPlans: Record<string, string | null>;
  agentRadiusFees: Record<string, number>;
  agentAllocationPercentages: Record<string, number>;
  commissionPlans: CommissionPlanOption[];
}) {
  const normalizedAwards = normalizeSideAwards(params.awardValues);
  const baseGrossCommission = DEAL_SALE_PRICE * DEAL_TOTAL_COMMISSION_RATE;
  const totalGrossCommission =
    baseGrossCommission +
    Object.values(params.awardAmountValues).reduce((sum, value) => sum + Math.max(value, 0), 0);

  const sideSummaries = params.sides.map<DerivedSideSummary>((side) => {
    const sideAwardPercent = normalizedAwards[side.id] ?? 0;
    const grossCommission =
      (baseGrossCommission * (sideAwardPercent / 100)) +
      Math.max(params.awardAmountValues[side.id] ?? 0, 0);
    const grossDeductionsTotal = (params.sideGrossDeductions[side.id] ?? []).reduce((sum, deduction) => sum + deduction.amount, 0);
    const grossCommissionAfterDeductions = clampCurrency(grossCommission - grossDeductionsTotal);
    const normalizedAllocations = normalizeAgentAllocations(
      side.agents.map((agent) => agent.id),
      params.agentAllocationPercentages
    );

    const agents = side.agents.map<DerivedAgentSummary>((agent) => {
      const allocationPercent = normalizedAllocations[agent.id] ?? 0;
      const commissionBasis = side.agents.length <= 1
        ? grossCommissionAfterDeductions
        : grossCommissionAfterDeductions * (allocationPercent / 100);
      const preSplitDeductionsTotal = (params.preSplitDeductions[agent.id] ?? []).reduce((sum, deduction) => sum + deduction.amount, 0);
      const afterPreSplit = clampCurrency(commissionBasis - preSplitDeductionsTotal);
      const plan = params.commissionPlans.find((entry) => entry.id === params.appliedPlans[agent.id]) ?? null;
      const splitRate = plan ? Math.max(0, Math.min(1, plan.teamSplit / 100)) : 0;
      const rawSplit = afterPreSplit * splitRate;
      const capAmount = plan?.capAmount ?? 0;
      const capUsed = AGENT_CAP_PROGRESS[agent.id] ?? 0;
      const capRemaining = Math.max(capAmount - capUsed, 0);
      const split = capAmount > 0 ? Math.min(rawSplit, capRemaining) : rawSplit;
      const radiusFee = params.agentRadiusFees[agent.id] !== undefined
        ? params.agentRadiusFees[agent.id]
        : plan?.feeType === "percentage"
          ? grossCommissionAfterDeductions * ((plan.feeAmount ?? 0) / 100)
          : (plan?.feeAmount ?? 0);
      const postSplitAgentCommission = clampCurrency(afterPreSplit - split);
      const postSplitDeductionsTotal = (params.postSplitDeductions[agent.id] ?? []).reduce((sum, deduction) => sum + deduction.amount, 0);
      const netCommission = clampCurrency(postSplitAgentCommission - postSplitDeductionsTotal);
      const companyDollarContribution = split - radiusFee;

      return {
        agent,
        side,
        allocationPercent,
        commissionBasis,
        preSplitDeductionsTotal,
        afterPreSplit,
        split,
        splitRate,
        plan,
        radiusFee,
        postSplitDeductionsTotal,
        postSplitAgentCommission,
        netCommission,
        companyDollarContribution,
        capAmount,
        capUsed,
        capRemaining,
        capApplied: split,
        capWarning: capAmount > 0 && capRemaining > 0 && capRemaining < rawSplit,
        capReached: capAmount > 0 && capRemaining <= 0,
      };
    });

    const toAgents = agents.reduce((sum, agent) => sum + agent.netCommission, 0);
    const officeIncome = grossCommissionAfterDeductions - agents.reduce((sum, agent) => sum + agent.postSplitAgentCommission, 0);
    const radiusFee = agents.reduce((sum, agent) => sum + agent.radiusFee, 0);

    return {
      side,
      grossCommission,
      grossDeductionsTotal,
      grossCommissionAfterDeductions,
      agents,
      toAgents,
      officeIncome,
      radiusFee,
    };
  });

  return {
    totalGrossCommission,
    normalizedAwards,
    sideSummaries,
  };
}

function readPersistedCommissionBreakdownState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COMMISSION_BREAKDOWN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedCommissionBreakdownState>;
  } catch {
    return null;
  }
}

function getFreshPlanForm(): PlanForm {
  return {
    editingPlanId: null,
    planName: "",
    planType: "standard",
    agentSplit: "80",
    teamSplit: "20",
    resetPeriod: "yearly",
    basedOn: "units",
    feeType: "flat",
    feeAmount: "",
    capAmount: "18000",
    applyAsDefault: true,
    selectedAgentIds: [],
    tiers: defaultTiers.map((tier) => ({ ...tier })),
  };
}

/** Editable value for deduction rows — no clear X (row has its own delete) */
function DeductionValue({ value, onChange, readOnly }: { value: number; onChange: (v: number) => void; readOnly?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRaw(String(value)); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function commit() {
    setEditing(false);
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    onChange(isNaN(n) ? 0 : Math.round(n));
  }

  if (readOnly) {
    return <span className="text-sm font-semibold tabular-nums text-muted-foreground">{currency(value)}</span>;
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setRaw(String(value)); } }}
        className="h-7 w-24 text-right text-sm font-semibold tabular-nums"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm font-semibold tabular-nums underline underline-offset-2 cursor-pointer text-[#5A5FF2]"
    >
      {currency(value)}
    </button>
  );
}

function InlineDeductionDraftRow({
  label,
  amount,
  labelPlaceholder,
  onLabelChange,
  onAmountChange,
  onSave,
  onCancel,
}: {
  label: string;
  amount: string;
  labelPlaceholder: string;
  onLabelChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const canSave = label.trim().length > 0 && amount.trim().length > 0;

  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/[0.03] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Input
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={labelPlaceholder}
          className="h-8 border-input bg-background text-xs"
        />
        <div className="relative w-28 shrink-0">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            inputMode="decimal"
            className="h-8 border-input bg-background pl-6 text-right text-xs"
          />
        </div>
        <Button size="sm" className="h-8 shrink-0 px-3 text-xs" disabled={!canSave} onClick={onSave}>
          Add
        </Button>
        <Button variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/** Inline editable dollar value — click to edit, X on hover to clear */
function EditableValue({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRaw(String(value)); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function commit() {
    setEditing(false);
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    onChange(isNaN(n) ? 0 : Math.round(n));
  }

  if (readOnly) {
    return <span className="text-sm font-semibold tabular-nums text-muted-foreground">{currency(value)}</span>;
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setRaw(String(value)); } }}
        className="h-7 w-28 text-right text-sm font-bold tabular-nums"
      />
    );
  }

  return (
    <div className="group relative flex items-center justify-end">
      <button
        onClick={() => setEditing(true)}
        className="text-sm font-semibold tabular-nums underline underline-offset-2 cursor-pointer text-[#5A5FF2]"
      >
        {currency(value)}
      </button>
      <button
        onClick={() => onChange(0)}
        className="absolute -left-5 invisible size-4 text-muted-foreground/40 hover:text-destructive group-hover:visible"
        tabIndex={-1}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}


function getCursorXY(input: HTMLTextAreaElement, selectionPoint: number) {
  const div = document.createElement('div');
  const copyStyle = getComputedStyle(input);
  for (const prop of Array.from(copyStyle)) {
    div.style.setProperty(prop, copyStyle.getPropertyValue(prop), copyStyle.getPropertyPriority(prop));
  }
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.textContent = input.value.substring(0, selectionPoint);
  const span = document.createElement('span');
  span.textContent = input.value.substring(selectionPoint) || '.';
  div.appendChild(span);
  document.body.appendChild(div);
  const x = span.offsetLeft;
  const y = span.offsetTop;
  document.body.removeChild(div);
  return { x, y };
}

export function CommissionBreakdown() {
  const [agentComment, setAgentComment] = useState("");
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionCoords, setMentionCoords] = useState<{x: number, y: number} | null>(null);
  type ActivityEntry = { id: string; author: string; role: Role; text: string; timestamp: string; kind: "comment" | "activity"; taggedUserIds?: string[] };
  type ActivityView = "comments" | "activity" | "all";
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([
    { id: "ac1", author: "Jessica Hall", role: "radius_auditing", text: `Commission breakdown draft created for ${PROPERTY_ADDRESS}.`, timestamp: "May 12, 2026 · 10:08 AM", kind: "activity" },
    { id: "ac2", author: "Jessica Hall", role: "radius_auditing", text: "Award allocation updated for Listing Side to 1%.", timestamp: "May 12, 2026 · 10:14 AM", kind: "activity" },
    { id: "ac3", author: "Jessica Hall", role: "radius_auditing", text: "Added pre-split deduction Credits on Listing Side at $200.", timestamp: "May 12, 2026 · 10:16 AM", kind: "activity" },
    { id: "ac4", author: "Jessica Hall", role: "radius_auditing", text: "Added pre-split deduction Referrals on Listing Side at $50.", timestamp: "May 12, 2026 · 10:18 AM", kind: "activity" },
    { id: "ac5", author: "Jessica Hall", role: "radius_auditing", text: "Applied commission plan 80/20 Standard to Mark Perez.", timestamp: "May 12, 2026 · 10:24 AM", kind: "activity" },
    { id: "ac6", author: "Jessica Hall", role: "radius_auditing", text: "Updated Radius Fee for Listing Side to $495.", timestamp: "May 12, 2026 · 10:31 AM", kind: "activity" },
    { id: "cm1", author: "Sarah Kim", role: "team_lead", text: "Please double-check the RERM amount, it looks lower than the standard rate.", timestamp: "May 12, 2026 · 3:14 PM", kind: "comment" },
    { id: "cm2", author: "Mark Perez", role: "agent", text: "Updated. The RERM was adjusted per the new schedule effective May 1.", timestamp: "May 12, 2026 · 4:02 PM", kind: "comment" },
    { id: "ac7", author: "Mark Perez", role: "agent", text: `Agent confirmed commission breakdown for ${PROPERTY_ADDRESS}`, timestamp: "May 12, 2026 · 4:05 PM", kind: "activity" },
    { id: "cm3", author: "Sarah Kim", role: "team_lead", text: "Numbers look good now. I am confirming the listing side.", timestamp: "May 12, 2026 · 4:18 PM", kind: "comment" },
    { id: "ac8", author: "Sarah Kim", role: "team_lead", text: `Team lead confirmed commission breakdown for ${PROPERTY_ADDRESS}`, timestamp: "May 12, 2026 · 4:19 PM", kind: "activity" },
    { id: "ac9", author: "Jessica Hall", role: "radius_auditing", text: "Added Olivia Chen to Buying Side.", timestamp: "May 13, 2026 · 8:42 AM", kind: "activity" },
    { id: "ac10", author: "Jessica Hall", role: "radius_auditing", text: "Added post-split deduction E&O on Buying Side.", timestamp: "May 13, 2026 · 8:49 AM", kind: "activity" },
    { id: "cm4", author: "Jessica Hall", role: "radius_auditing", text: "Adding external agent details for buyer side. Please verify payout split before final commission breakdown.", timestamp: "May 13, 2026 · 8:53 AM", kind: "comment" },
    { id: "ac11", author: "Jessica Hall", role: "radius_auditing", text: "Updated Radius Fee for Buying Side to $495.", timestamp: "May 13, 2026 · 8:58 AM", kind: "activity" },
    { id: "ac12", author: "Jessica Hall", role: "radius_auditing", text: `Commission breakdown for ${PROPERTY_ADDRESS} finalized`, timestamp: "May 13, 2026 · 9:06 AM", kind: "activity" },
  ]);
  const [showActivitySheet, setShowActivitySheet] = useState(false);
  const [showWireSheet, setShowWireSheet] = useState(false);
  const [openWireItemId, setOpenWireItemId] = useState<string | null>(null);
  const [wireFormMode, setWireFormMode] = useState<"none" | "team" | "agent" | "external">("none");
  const [wireFormDraft, setWireFormDraft] = useState<WireInstructionRecord>(createEmptyWireInstruction());
  const [wireFormErrors, setWireFormErrors] = useState<WireValidationErrors>({});
  const [wireExternalName, setWireExternalName] = useState("");
  const [wireExternalNameError, setWireExternalNameError] = useState("");
  const [wireFormAgentId, setWireFormAgentId] = useState<string>("");
  const [wireStoreVersion, setWireStoreVersion] = useState(0);
  const [wireSelectionMode, setWireSelectionMode] = useState<string | undefined>(undefined);

  function openWireForm(mode: "team" | "agent" | "external", agentIdOverride?: string, externalNameOverride?: string) {
    setWireFormMode(mode);
    setWireSelectionMode(undefined);
    setWireFormErrors({});
    if (mode === "team") {
      setWireFormDraft({ ...wireStore.teamWireInstructions });
    } else if (mode === "agent") {
      const firstAgentId = agentIdOverride ?? (sidesData.flatMap((s) => s.agents).find((a) => !a.external)?.id ?? CURRENT_AGENT_ID);
      setWireFormAgentId(firstAgentId);
      setWireFormDraft({ ...(wireStore.agentWireInstructions[firstAgentId] ?? createEmptyWireInstruction()) });
    } else {
      const extName = externalNameOverride ?? "";
      if (extName) {
        const existing = [...wireStore.sharedRecipients, ...Object.values(wireStore.privateRecipients || {}).flat()].find(
          (r) => r.id === `ext-${extName}` || (r.payableName?.toLowerCase() === extName.toLowerCase()) || (r.accountHolderName?.toLowerCase() === extName.toLowerCase())
        );
        if (existing) {
          setWireSelectionMode(existing.id);
          setWireExternalName(existing.payableName || extName);
          setWireFormDraft({ ...existing, id: `ext-${extName}`, _oldId: existing.id !== `ext-${extName}` ? existing.id : undefined } as any);
          return;
        }
      }
      setWireExternalName(extName);
      setWireFormDraft({ ...createEmptyWireInstruction(extName ? `ext-${extName}` : undefined), accountHolderName: extName, payableName: extName });
    }
  }
  function saveWireForm() {
    if (wireFormMode === "external" && !wireExternalName.trim()) {
      setWireExternalNameError("Name is mandatory for external wire");
      return;
    }
    const errors = validateWireInstruction(wireFormDraft, { requireBankDetails: true, requireCdaType: false });
    if (Object.keys(errors).length > 0) {
      setWireFormErrors(errors);
      return;
    }
    const currentStore = readWireInstructionsStore(
      createDefaultWireInstructionsStore(
        CURRENT_TEAM_LEAD_ID,
        Array.from(new Set(sidesData.flatMap((side) => side.agents.map((a) => a.id)).concat([CURRENT_TEAM_LEAD_ID, CURRENT_AGENT_ID]))),
      ),
    );
    const now = new Date().toISOString();
    const updatedRecord = { ...wireFormDraft, updatedAt: now };
    if (wireFormMode === "team") {
      currentStore.teamWireInstructions = updatedRecord;
    } else if (wireFormMode === "agent") {
      currentStore.agentWireInstructions[wireFormAgentId] = updatedRecord;
    } else {
      updatedRecord.payableName = wireExternalName.trim();
      const draftRecord = updatedRecord as any;
      if (draftRecord._oldId) {
        const oldIdx = currentStore.sharedRecipients.findIndex((r) => r.id === draftRecord._oldId);
        if (oldIdx >= 0) {
          currentStore.sharedRecipients.splice(oldIdx, 1);
        }
        delete draftRecord._oldId;
      }
      const existingIdx = currentStore.sharedRecipients.findIndex((r) => r.id === updatedRecord.id);
      if (existingIdx >= 0) {
        currentStore.sharedRecipients[existingIdx] = updatedRecord;
      } else {
        currentStore.sharedRecipients.push(updatedRecord);
      }
    }
    writeWireInstructionsStore(currentStore);
    setWireStoreVersion((v) => v + 1);
    const label = wireFormMode === "team" ? "Team" : wireFormMode === "agent" ? "Agent" : `External (${wireExternalName.trim()})`;
    toast.success(`${label} wire instructions saved`);
    setWireFormMode("none");
  }
  const [activityView, setActivityView] = useState<ActivityView>("all");
  const commentTagPeople = [
    { id: "agent-a1", name: "Mark Perez", label: "Agent" },
    { id: "tl-a3", name: "Sarah Kim", label: "Team Lead" },
    { id: "auditor-u1", name: "Jessica Hall", label: "Auditor" },
  ];
  const roleNames: Record<Role, string> = { agent: "You", team_lead: "You", radius_auditing: "You", soul_auditor: "You" };
  function makeTimestamp() {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date()).replace(",", " ·");
  }
  function logActivity(text: string, kind: "comment" | "activity" = "activity", taggedUserIds: string[] = []) {
    setActivityFeed((prev) => [
      ...prev,
      {
        id: `act-${Date.now()}-${prev.length}`,
        author: roleNames[role],
        role,
        text,
        timestamp: makeTimestamp(),
        kind,
        taggedUserIds,
      },
    ]);
  }
  function handleSendComment() {
    const text = agentComment.trim();
    if (!text) return;
    const taggedUserIds = commentTagPeople
      .filter((person) => text.toLowerCase().includes(`@${person.name}`.toLowerCase()))
      .map((person) => person.id);
    logActivity(text, "comment", taggedUserIds);
    setAgentComment("");
    toast.success(taggedUserIds.length ? "Comment sent to tagged user" : "Comment sent");
  }
  function renderCommentTrigger() {
    return (
      <button
        type="button"
        onClick={() => setShowActivitySheet(true)}
        className="relative flex size-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Open comments"
      >
        <MessageCircleMore className="size-4" />
        {(hasCommentNotification || taggedCommentCount > 0) && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
            {hasCommentNotification ? 1 : taggedCommentCount}
          </span>
        )}
      </button>
    );
  }
  const latestFeed = [...activityFeed].reverse();
  const commentFeed = latestFeed.filter((entry) => entry.kind === "comment");
  const activityOnlyFeed = latestFeed.filter((entry) => entry.kind === "activity");
  const [role, setRole] = useState<Role>("radius_auditing");
  const [selectedSide, setSelectedSide] = useState<SideId>("listing");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  // Connector refs & state
  const gridRef = useRef<HTMLDivElement>(null);
  const [connectorTop, setConnectorTop] = useState(0);
  const [showGrossInfo, setShowGrossInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feeDialogTiming, setFeeDialogTiming] = useState<"pre-split" | "post-split" | null>(null);
  const [feeDialogTarget, setFeeDialogTarget] = useState<"side" | "agent">("side");
  const [showInlineSidePreSplitDraft, setShowInlineSidePreSplitDraft] = useState(false);

  // New dedicated popup for Credits / Referrals (simplified)
  const [showCreditReferralDialog, setShowCreditReferralDialog] = useState(false);
  const [creditPayableTo, setCreditPayableTo] = useState("external");
  const [creditPayableName, setCreditPayableName] = useState("");
  const [inlineSidePreSplitLabel, setInlineSidePreSplitLabel] = useState("");
  const [inlineSidePreSplitAmount, setInlineSidePreSplitAmount] = useState("");
  // Keep retired hooks stable for dev fast-refresh on this page.
  const [_showInlineAgentPreSplitDraft] = useState(false);
  const [_inlineAgentPreSplitLabel] = useState("");
  const [_inlineAgentPreSplitAmount] = useState("");
  const feeDialogTitle = "Fee Type";
  const [showCDCDialog, setShowCDCDialog] = useState(false);
  const [showNetCommissionDialog, setShowNetCommissionDialog] = useState(false);
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [statementNotes, setStatementNotes] = useState("");
  const [includeProgressInfo, setIncludeProgressInfo] = useState(false);
  const persistedState = readPersistedCommissionBreakdownState();
  const [commissionPlans, setCommissionPlans] = useState<CommissionPlanOption[]>(
    persistedState?.commissionPlans?.length ? persistedState.commissionPlans : COMMISSION_PLANS
  );
  const [appliedPlans, setAppliedPlans] = useState<Record<string, string | null>>(
    persistedState?.appliedPlans ?? { a1: "p1" }
  );
  const [agentRadiusFees, setAgentRadiusFees] = useState<Record<string, number>>(
    persistedState?.agentRadiusFees ?? {}
  );
  type TxStatus = "draft" | "agent_confirmed" | "team_lead_confirmed" | "processed" | "rejected";
  // txStatus drives confirmation flow: Agent confirms → Team Lead confirms → Admin processes
  const [txStatus, setTxStatus] = useState<TxStatus>("draft");
  const [rejectionNote, setRejectionNote] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfCdaType, setPdfCdaType] = useState<CDAType | "">("full-transparency");
  const [rejectInput, setRejectInput] = useState("");
  const hasCommentNotification = Boolean(rejectionNote);
  const taggedCommentCount = activityFeed.filter((entry) => entry.kind === "comment" && entry.taggedUserIds?.length).length;
  const [expandedSideAgentId, setExpandedSideAgentId] = useState<string | null>(null);
  const [_showAgentPreSplitDialog] = useState(false);
  const [_agentPreSplitLabel] = useState("");
  const [_agentPreSplitAmount] = useState("");
  const [feeLibrary, setFeeLibrary] = useState<ExistingFeeOption[]>(DEFAULT_FEE_LIBRARY);
  const [preSplitDeductions, setPreSplitDeductions] = useState<Record<string, Array<{ id: string; name: string; amount: number }>>>(
    persistedState?.preSplitDeductions ?? {}
  );

  const [sideGrossDeductions, setSideGrossDeductions] = useState<Record<string, SideDeduction[]>>(
    persistedState?.sideGrossDeductions ?? {
      listing: [
        { id: "sg1", name: "Credits", amount: 200 },
        { id: "sg2", name: "Referrals", amount: 50 },
      ],
      buyer: [],
    }
  );


  const [postSplitDeductions, setPostSplitDeductions] = useState<Record<string, Array<{ id: string; name: string; amount: number; isRadiusFee?: boolean }>>>(
    persistedState?.postSplitDeductions ?? {
      a1: [
        { id: "d1", name: "File Review Fee", amount: 25, isRadiusFee: true },
        { id: "d2", name: "RERM", amount: 124, isRadiusFee: true },
        { id: "d3", name: "SBTC", amount: 400 },
        { id: "d4", name: "E&O", amount: 250 },
      ],
    }
  );
  const [pendingPlanChange, setPendingPlanChange] = useState<{ agentId: string; plan: CommissionPlanOption } | null>(null);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [awardValues, setAwardValues] = useState<Record<SideId, number>>(
    persistedState?.awardValues ?? { listing: 50, buyer: 50 }
  );
  const [awardAmountValues, setAwardAmountValues] = useState<Record<SideId, number>>(
    persistedState?.awardAmountValues ??
      getDefaultAwardAmountValues(
        persistedState?.sidesData,
        persistedState?.awardValues ?? { listing: 50, buyer: 50 },
      )
  );
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [editPlanForm, setEditPlanForm] = useState({ planName: "", agentSplit: "80", teamSplit: "20", feeType: "flat" as "flat" | "percentage", feeAmount: "495", capAmount: "18000" });
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [addAgentSideId, setAddAgentSideId] = useState<SideId | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [pendingAgent, setPendingAgent] = useState<PendingAgent | null>(null);
  const [showExternalAgentDialog, setShowExternalAgentDialog] = useState(false);
  const [externalAgentForm, setExternalAgentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    brokerageName: "",
    agentLicenseNumber: "",
    brokerageLicenseNumber: "",
    brokerageStreetAddress: "",
    brokerageUnit: "",
    brokerageCity: "",
    brokerageState: "",
    brokerageZip: "",
    representing: addAgentSideId === "buyer" ? "Buyer" : "Seller",
  });
  const [agentAllocations, setAgentAllocations] = useState<Record<string, number>>({});
  const [agentAllocationPercentages, setAgentAllocationPercentages] = useState<Record<string, number>>(
    persistedState?.agentAllocationPercentages ?? getDefaultAgentAllocationPercentages()
  );

  // Compute connector top position from selected anchor
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const anchorId = selectedAgentId
      ? `agent-${selectedAgentId}`
      : `${selectedSide}-side`;
    const update = () => {
      const anchor = grid.querySelector(`[data-connector-anchor="${anchorId}"]`);
      if (!anchor) return;
      const gridRect = grid.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      setConnectorTop(anchorRect.top - gridRect.top + anchorRect.height / 2);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [selectedSide, selectedAgentId]);

  // mutable sides so delete works
  const [sidesData, setSidesData] = useState<Side[]>(
    persistedState?.sidesData?.length ? persistedState.sidesData : initialSides
  );
  const wireStore = useMemo(
    () =>
      readWireInstructionsStore(
        createDefaultWireInstructionsStore(
          CURRENT_TEAM_LEAD_ID,
          Array.from(new Set(sidesData.flatMap((side) => side.agents.map((agent) => agent.id)).concat([CURRENT_TEAM_LEAD_ID, CURRENT_AGENT_ID]))),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sidesData, wireStoreVersion],
  );
  const teamWireComplete = isWireInstructionComplete(wireStore.teamWireInstructions, { requireCdaType: false });
  const agentWireComplete = isWireInstructionComplete(
    wireStore.agentWireInstructions[CURRENT_AGENT_ID] ?? createEmptyWireInstruction(),
  );
  const auditorWireParties = useMemo(() => {
    const parties: any[] = [];

    if (wireStore.teamWireInstructions?.updatedAt) {
      parties.push({
        id: "team",
        name: `${sidesData.find((side) => side.id === "listing")?.subline ?? "Brokerage"} - Team`,
        roleLabel: "Team",
        detailLabel: "Brokerage wire instructions",
        complete: teamWireComplete,
        record: wireStore.teamWireInstructions,
      });
    }

    Object.keys(wireStore.agentWireInstructions).forEach((agentId) => {
      const record = wireStore.agentWireInstructions[agentId];
      if (record?.updatedAt) {
        const agentName = sidesData.flatMap((s) => s.agents).find((a) => a.id === agentId)?.name ?? "Agent";
        parties.push({
          id: `agent-${agentId}`,
          name: agentName,
          roleLabel: "Agent",
          detailLabel: "Agent wire instructions",
          complete: isWireInstructionComplete(record),
          record,
        });
      }
    });

    wireStore.sharedRecipients.forEach((record) => {
      if (record?.updatedAt) {
        const displayName = record.payableName || record.accountHolderName;
        parties.push({
          id: record.id,
          name: displayName,
          roleLabel: "External",
          detailLabel: "Deduction payee",
          complete: isWireInstructionComplete(record, { requireBankDetails: true }),
          record: record,
        });
      }
    });

    return parties;
  }, [sidesData, teamWireComplete, wireStore]);
  const incompleteWirePartyNames = auditorWireParties.filter((party) => !party.complete).map((party) => party.name);
  const allAuditorWiresComplete = incompleteWirePartyNames.length === 0;

  const checkDeductionWireStatus = (dedName: string) => {
    const matching = [...wireStore.sharedRecipients, ...Object.values(wireStore.privateRecipients || {}).flat()].find(
      (r) => r.id === `ext-${dedName}` || (r.payableName?.toLowerCase() === dedName.toLowerCase()) || (r.accountHolderName?.toLowerCase() === dedName.toLowerCase())
    );
    return matching ? isWireInstructionComplete(matching, { requireBankDetails: true }) : false;
  };

  const DeductionWireIcon = ({ dedName, onClick }: { dedName: string; onClick: () => void }) => {
    const isFilled = checkDeductionWireStatus(dedName);

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            className={cn(
              "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer",
              isFilled ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-600" : "bg-[#5A5FF2]/10 hover:bg-[#5A5FF2]/20 text-[#5A5FF2]"
            )} 
            onClick={() => {
              openWireForm("external", undefined, dedName);
              onClick();
            }}
          >
            {isFilled ? <CheckCircle2 className="size-4" /> : <Landmark className="size-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          {isFilled ? "Wire instructions complete. Click to view/edit." : "Add wire instructions"}
        </TooltipContent>
      </Tooltip>
    );
  };



  const allSavedWires = useMemo(() => {
    const raw = [
      ...wireStore.sharedRecipients,
      ...Object.values(wireStore.privateRecipients || {}).flat(),
      ...Object.values(wireStore.agentWireInstructions),
      wireStore.teamWireInstructions
    ].filter(r => r && r.updatedAt);
    
    const unique = new Map();
    for (const item of raw) {
      const id = String(item.id || `fallback-id-${Math.random()}`);
      if (!unique.has(id)) {
        unique.set(id, { ...item, id });
      }
    }
    const uniqueArray = Array.from(unique.values());
    if (uniqueArray.length === 0) {
      uniqueArray.push({
        id: "dummy-1",
        accountHolderName: "John Doe",
        bankName: "Chase Bank",
        accountNumber: "123456789",
        routingNumber: "987654321",
        accountType: "checking",
        bankStreet: "123 Main St",
        bankCity: "San Francisco",
        bankState: "CA",
        bankZip: "94105",
        recipientStreet: "456 Oak St",
        recipientCity: "San Francisco",
        recipientState: "CA",
        recipientZip: "94105",
        email: "john@example.com",
        phone: "555-1234",
        updatedAt: new Date().toISOString()
      });
      uniqueArray.push({
        id: "dummy-2",
        payableName: "Keller Williams",
        accountHolderName: "Keller Williams Realty",
        bankName: "Wells Fargo",
        accountNumber: "987654321",
        routingNumber: "123456789",
        accountType: "savings",
        bankStreet: "789 Market St",
        bankCity: "New York",
        bankState: "NY",
        bankZip: "10001",
        recipientStreet: "101 Broadway",
        recipientCity: "New York",
        recipientState: "NY",
        recipientZip: "10001",
        email: "finance@kw.com",
        phone: "800-555-5555",
        updatedAt: new Date().toISOString()
      });
    }
    return uniqueArray;
  }, [wireStore]);

  const sides = useMemo(
    () => sidesData.map((s) => s.id === selectedSide ? { ...s, active: true } : { ...s, active: false }),
    [sidesData, selectedSide]
  );

  const activeSide = sides.find((s) => s.id === selectedSide) ?? sides[0];
  const derivedBreakdown = useMemo(
    () =>
      deriveCommissionBreakdown({
        sides,
        awardValues,
        awardAmountValues,
        sideGrossDeductions,
        preSplitDeductions,
        postSplitDeductions,
        appliedPlans,
        agentRadiusFees,
        agentAllocationPercentages,
        commissionPlans,
      }),
    [
      sides,
      awardValues,
      awardAmountValues,
      sideGrossDeductions,
      preSplitDeductions,
      postSplitDeductions,
      appliedPlans,
      agentRadiusFees,
      agentAllocationPercentages,
      commissionPlans,
    ]
  );

  const activeSideSummary =
    derivedBreakdown.sideSummaries.find((entry) => entry.side.id === activeSide.id) ??
    derivedBreakdown.sideSummaries[0];
  const selectedAgent = selectedAgentId
    ? derivedBreakdown.sideSummaries
        .flatMap((sideSummary) => sideSummary.agents)
        .find((agentSummary) => agentSummary.agent.id === selectedAgentId) ?? null
    : null;
  const selectedPlan = selectedAgent?.plan ?? null;
  const activeSideAgentSummaries = activeSideSummary?.agents ?? [];
  const selectedAgentIsExternal = Boolean(selectedAgent?.agent.external);
  const selectedCapAmount = selectedAgent?.capAmount ?? 0;
  const selectedCapUsed = selectedAgent?.capUsed ?? 0;
  const selectedCapRemaining = selectedAgent?.capRemaining ?? 0;
  const selectedCapRatio = selectedCapAmount > 0 ? selectedCapUsed / selectedCapAmount : 0;
  const selectedCapStatus = selectedCapAmount <= 0
    ? "none"
    : selectedAgent?.capReached
      ? "reached"
      : selectedAgent?.capWarning || selectedCapRatio >= 0.9
        ? "near"
        : "normal";

  function handleDeleteAgent() {
    if (!selectedAgentId || !selectedAgent) return;
    const agentName = selectedAgent.agent.name;
    const remainingAgentIds = selectedAgent.side.agents
      .filter((agent) => agent.id !== selectedAgentId)
      .map((agent) => agent.id);
    setSidesData((prev) =>
      prev.map((side) => ({ ...side, agents: side.agents.filter((a) => a.id !== selectedAgentId) }))
    );
    setAgentAllocationPercentages((prev) => {
      const next = { ...prev };
      delete next[selectedAgentId];
      return {
        ...next,
        ...normalizeAgentAllocations(remainingAgentIds, next),
      };
    });
    setSelectedAgentId(null);
    setShowDeleteConfirm(false);
    logActivity(`Removed ${agentName} from ${selectedAgent.side.title}.`);
    toast.success(`${agentName} removed`);
  }

  function resetExternalAgentForm() {
    setExternalAgentForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      brokerageName: "",
      agentLicenseNumber: "",
      brokerageLicenseNumber: "",
      brokerageStreetAddress: "",
      brokerageUnit: "",
      brokerageCity: "",
      brokerageState: "",
      brokerageZip: "",
      representing: addAgentSideId === "buyer" ? "Buyer" : "Seller",
    });
  }

  function seedPendingAgent(agent: PendingAgent) {
    const sideAgents = sidesData.find((s) => s.id === addAgentSideId)?.agents ?? [];
    const equal = Math.floor(100 / (sideAgents.length + 1));
    const allocs: Record<string, number> = {};
    sideAgents.forEach((a) => { allocs[a.id] = equal; });
    allocs[agent.id] = 100 - equal * sideAgents.length;
    setAgentAllocations(allocs);
    setPendingAgent(agent);
  }

  function resetInlineSidePreSplitDraft() {
    setShowInlineSidePreSplitDraft(false);
    setInlineSidePreSplitLabel("");
    setInlineSidePreSplitAmount("");
  }

  function handleInlineSidePreSplitSave() {
    const name = inlineSidePreSplitLabel.trim();
    const amount = Math.round(Number(inlineSidePreSplitAmount) || 0);
    if (!name || !amount) return;
    setSideGrossDeductions((prev) => ({
      ...prev,
      [activeSide.id]: [...(prev[activeSide.id] ?? []), { id: `sg-${Date.now()}`, name, amount }],
    }));
    logActivity(`Added ${name} fee for ${activeSide.title} at ${currency(amount)}.`);
    toast.success(`"${name}" added`);
    resetInlineSidePreSplitDraft();
  }

  function handleFeeAdded(fee: FeeTypeDraft) {
    const amount = Math.round(Number(fee.amount) || 0);
    if (!fee.id) {
      const newFeeId = `fee-${Date.now()}`;
      setFeeLibrary((prev) => [
        ...prev,
        {
          ...fee,
          id: newFeeId,
        },
      ]);
      fee = { ...fee, id: newFeeId };
    }
    if (fee.timing === "pre-split") {
      if (feeDialogTarget === "agent" && selectedAgentId) {
        setPreSplitDeductions((prev) => ({
          ...prev,
          [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { id: `pre-${Date.now()}`, name: fee.name, amount }],
        }));
        logActivity(`Added ${fee.name} pre-split deduction for ${selectedAgent?.agent.name ?? "agent"}.`);
      } else {
        // Pre-split → side-level gross deductions
        setSideGrossDeductions((prev) => ({
          ...prev,
          [activeSide.id]: [...(prev[activeSide.id] ?? []), { id: `sg-${Date.now()}`, name: fee.name, amount }],
        }));
        logActivity(`Added ${fee.name} pre-split deduction for ${activeSide.title}.`);
      }
    } else if (fee.timing === "post-split" && selectedAgentId) {
      // Post-split → agent-level deductions
      setPostSplitDeductions((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { id: `ps-${Date.now()}`, name: fee.name, amount }],
      }));
      logActivity(`Added ${fee.name} post-split deduction for ${selectedAgent?.agent.name ?? "agent"}.`);
    }
    toast.success(`"${fee.name}" added`);
    setFeeDialogTiming(null);
    setFeeDialogTarget("side");
  }

  const availableFeeOptions = useMemo(
    () => feeLibrary.filter((fee) => fee.timing === (feeDialogTiming ?? fee.timing)),
    [feeDialogTiming, feeLibrary]
  );

  const grossIncome = activeSideSummary?.grossCommission ?? 0;
  const totalGrossCommission = derivedBreakdown.totalGrossCommission;
  const totalAgentPayout = activeSideSummary?.toAgents ?? 0;
  const totalSideGrossDeductions = activeSideSummary?.grossDeductionsTotal ?? 0;
  const grossCommissionAfterDeductions = activeSideSummary?.grossCommissionAfterDeductions ?? 0;
  const officeNet = activeSideSummary?.officeIncome ?? 0;
  const activeSideOfficeShare = officeNet;
  const activeSideRadiusFee = activeSideSummary?.radiusFee ?? 0;
  const radiusFeeRequiredForApproval = derivedBreakdown.sideSummaries.some((sideSummary) => sideSummary.agents.length > 0 && sideSummary.radiusFee <= 0);

  // Permission helpers
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [planForm, setPlanForm] = useState<PlanForm>(getFreshPlanForm());
  const [planErrors, setPlanErrors] = useState<PlanErrors>({});

  const isAgent = role === "agent";
  const isTL = role === "team_lead";
  const isAuditor = role === "radius_auditing" || role === "soul_auditor";
  const canEditAll = isAuditor;
  const isLocked = txStatus === "processed" && !isAuditor;
  const STATUS_LABELS: Record<TxStatus, string> = {
    draft: "Awaiting Agent confirmation",
    agent_confirmed: "Awaiting Team Lead confirmation",
    team_lead_confirmed: "Awaiting Auditor finalization",
    processed: "Commission breakdown finalized",
    rejected: "Returned for confirmation",
  };
  const STATUS_COLORS: Record<TxStatus, string> = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    agent_confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    team_lead_confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
    processed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const flowNote =
    role === "agent"
      ? "Agent confirms first. Team Lead confirms next."
      : role === "team_lead"
        ? "Agent confirms first. Team Lead confirms next."
        : "Finalize after Agent and Team Lead confirm. Auditor return restarts Agent confirmation.";
  const confirmActionLabel =
    isAuditor ? "Finalize" : "Confirm";
  const confirmDialogTitle =
    isAuditor
      ? "Finalize commission breakdown?"
      : role === "team_lead"
        ? "Confirm by Team Lead?"
        : "Confirm by Agent?";
  const confirmDialogBody =
    isAuditor
      ? "Finalize after Agent and Team Lead confirm. Auditor edits can return this for confirmation."
      : role === "team_lead"
        ? "Confirm the numbers after Agent confirmation. If you edit later, your confirmation re-activates automatically."
        : "Confirm the numbers. Team Lead confirms next before finalization.";
  const canConfirmNow =
    (role === "agent" && txStatus === "draft") ||
    (role === "team_lead" && txStatus === "agent_confirmed") ||
    (isAuditor && txStatus === "team_lead_confirmed");
  const canAuditorApprove = canConfirmNow && !radiusFeeRequiredForApproval;

  function getActivityNode(entry: ActivityEntry) {
    const iconClassName = entry.text.toLowerCase().includes("confirmed") || entry.text.toLowerCase().includes("finalized")
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : entry.text.toLowerCase().includes("updated")
        ? "bg-amber-50 text-amber-600 border-amber-100"
        : "bg-blue-50 text-blue-600 border-blue-100";

    return (
      <div className={cn("mt-0.5 flex size-8 items-center justify-center rounded-full border shadow-sm", iconClassName)}>
        {entry.text.toLowerCase().includes("confirmed") || entry.text.toLowerCase().includes("finalized") ? (
          <Shield className="size-3.5" />
        ) : entry.text.toLowerCase().includes("updated") ? (
          <RefreshCw className="size-3.5" />
        ) : (
          <Plus className="size-3.5" />
        )}
      </div>
    );
  }

  function renderTimelineItems(items: ActivityEntry[], options?: { compact?: boolean; dense?: boolean; commentsOnly?: boolean }) {
    const compact = options?.compact ?? false;
    const dense = options?.dense ?? false;
    const commentsOnly = options?.commentsOnly ?? false;

    return items.map((entry, index) => {
      const meta = roleMeta[entry.role] ?? roleMeta.agent;
      const isComment = entry.kind === "comment";

      return (
        <div key={entry.id} className={cn("relative flex", compact ? "gap-2.5" : "gap-3")}>
          {!commentsOnly && (
            <div className={cn("relative flex shrink-0 justify-center", compact ? "w-7" : "w-8")}>
              {!isComment && getActivityNode(entry)}
              {index < items.length - 1 && (
                <div className={cn("absolute w-px bg-border/80", isComment ? "top-0" : "top-9", compact ? "bottom-[-8px]" : "bottom-[-12px]")} />
              )}
            </div>
          )}

          <div className={cn("min-w-0 flex-1", compact ? "pb-2" : dense ? "pb-2.5" : "pb-3")}>
            {isComment ? (
              <div className={cn("border border-border/80 bg-background shadow-[0_1px_0_rgba(15,23,42,0.03)]", compact ? "rounded-xl px-3 py-2.5" : dense ? "rounded-2xl px-3.5 py-2.5" : "rounded-2xl px-4 py-3")}>
                <div className={cn("flex items-start", compact ? "gap-2.5" : "gap-3")}>
                  <Avatar className={cn("shrink-0 border border-border/70 bg-background shadow-sm", compact ? "mt-0 size-7" : dense ? "mt-0.5 size-7.5" : "mt-0.5 size-8")}>
                    <AvatarFallback className={`text-[11px] font-semibold ${(roleMeta[entry.role] ?? roleMeta.agent).avatar}`}>
                      {initials(entry.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={cn("font-semibold text-foreground", compact ? "text-[13px]" : dense ? "text-[13px]" : "text-sm")}>{entry.author}</span>
                      <span className={cn(`rounded-full border font-medium ${meta.badge}`, compact || dense ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]")}>
                        {meta.label}
                      </span>
                      <span className={cn("text-muted-foreground", compact || dense ? "text-[11px]" : "text-xs")}>·</span>
                      <span className={cn("text-muted-foreground", compact || dense ? "text-[11px]" : "text-xs")}>{entry.timestamp}</span>
                    </div>
                    <p className={cn("text-foreground/85", compact ? "mt-1.5 line-clamp-2 text-[13px] leading-5" : dense ? "mt-1.5 text-[13px] leading-5" : "mt-2 text-sm leading-6")}>{entry.text}</p>
                    {entry.taggedUserIds?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {entry.taggedUserIds.map((taggedUserId) => {
                          const person = commentTagPeople.find((item) => item.id === taggedUserId);
                          if (!person) return null;
                          return (
                            <Badge key={taggedUserId} variant="outline" className="h-5 rounded-full px-2 text-[10px] bg-primary/10 text-primary border-primary/20">
                              <AtSign className="size-3" />
                              {person.name} notified
                            </Badge>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className={cn(compact ? "pt-0.5" : "pt-1")}>
                <p className={cn("text-foreground", compact ? "line-clamp-2 text-[13px] leading-5" : dense ? "text-[13px] leading-5" : "text-sm leading-6")}>
                  <span className="font-semibold">{entry.author}</span>{" "}
                  <span className="text-foreground/80">{entry.text}</span>
                </p>
                <p className={cn("text-muted-foreground", compact ? "mt-0.5 text-xs" : dense ? "mt-0.5 text-[11px]" : "mt-1 text-xs")}>
                  {meta.label} · {entry.timestamp}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    });
  }

  function renderActivitySurface(options?: { preview?: boolean; inSheet?: boolean }) {
    const preview = options?.preview ?? false;
    const inSheet = options?.inSheet ?? false;
    const dense = inSheet && !preview;
    const commentsOnly = preview || activityView === "comments";
    const items =
      preview || activityView === "comments"
        ? commentFeed
        : activityView === "activity"
          ? activityOnlyFeed
          : latestFeed;
    const visibleItems = preview ? items.slice(0, 4) : items;

    return (
        <div className={cn(preview ? "space-y-2.5" : dense ? "space-y-2.5" : "space-y-3", inSheet ? "pt-1" : "pt-0", dense && "pb-2")}>
        <div className="flex items-center justify-between">
          <div>
            {preview && <h3 className="text-sm font-semibold tracking-tight text-foreground">Comments & Activity</h3>}
          </div>
          <div className="flex items-center gap-2">
            {!preview && !inSheet && (
              <Select value={activityView} onValueChange={(value) => setActivityView(value as ActivityView)}>
                <SelectTrigger className="h-8 rounded-full border-border/80 bg-background px-3 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comments">Comments</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            )}
            {preview && (
              <Button variant="ghost" size="sm" className="h-7 rounded-full px-2.5 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => { setActivityView("comments"); setShowActivitySheet(true); }}>
                View all
              </Button>
            )}
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <div className="space-y-0">{renderTimelineItems(visibleItems, { compact: preview, dense, commentsOnly })}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-background px-4 py-6 text-sm text-muted-foreground">
            No history yet.
          </div>
        )}

        <div className={cn(dense && "sticky bottom-0 z-10 -mx-1 bg-gradient-to-t from-background via-background/95 to-transparent px-1 pt-3", !dense && "static")}>
        <div className={cn("rounded-xl border border-border/80 bg-background shadow-sm", preview ? "px-4 py-3" : dense ? "px-3.5 py-2.5 shadow-lg" : "px-5 py-3.5")}>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {commentTagPeople.map((person) => (
              <button
                key={person.id}
                type="button"
                className="inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] text-primary bg-primary/5 border-primary/10 transition-colors hover:bg-primary/10 hover:text-primary"
                onClick={() => setAgentComment((current) => `${current}${current.trim() ? " " : ""}@${person.name} `)}
              >
                <AtSign className="size-3" />
                {person.name}
              </button>
            ))}
          </div>
          
          <div className="relative">
            {mentionSearch !== null && (
              <div
                className="absolute z-50 bg-background border border-border shadow-md rounded-md overflow-hidden min-w-[150px] max-h-[150px] overflow-y-auto"
                style={{ left: mentionCoords?.x ?? 0, top: (mentionCoords?.y ?? 0) + 20 }}
              >
                {commentTagPeople
                  .filter((p) => p.name.toLowerCase().includes(mentionSearch.toLowerCase()))
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="block w-full text-left px-3 py-1.5 text-sm hover:bg-muted"
                      onClick={() => {
                        const before = agentComment.slice(0, mentionIndex);
                        const after = agentComment.slice(mentionIndex + mentionSearch.length + 1);
                        setAgentComment(`${before}@${p.name} ${after}`);
                        setMentionSearch(null);
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                  {commentTagPeople.filter((p) => p.name.toLowerCase().includes(mentionSearch.toLowerCase())).length === 0 && (
                    <div className="px-3 py-1.5 text-sm text-muted-foreground">No matches</div>
                  )}
              </div>
            )}
            <Textarea
              value={agentComment}
              onChange={(e) => {
                const val = e.target.value;
                setAgentComment(val);
                const caret = e.target.selectionStart;
                const textBeforeCaret = val.slice(0, caret);
                const match = textBeforeCaret.match(/@([\w\s]*)$/);
                if (match) {
                  setMentionSearch(match[1]);
                  setMentionIndex(match.index!);
                  setMentionCoords(getCursorXY(e.target, match.index!));
                } else {
                  setMentionSearch(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mentionSearch === null) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              placeholder="Add comment. Use @name to notify only tagged people."
              rows={preview ? 2 : 3}
              className={cn("resize-none border-0 bg-transparent px-1 py-1 pr-12 shadow-none focus-visible:ring-0", preview ? "min-h-[68px] text-sm" : dense ? "min-h-[56px] text-[13px]" : "min-h-[88px] text-sm")}
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn("absolute right-0 rounded-full text-lg text-muted-foreground", dense ? "bottom-0.5 size-7" : "bottom-0 size-8")}
              disabled={!agentComment.trim()}
              onClick={handleSendComment}
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  const editableSnapshot = useMemo(
    () => JSON.stringify({
      sidesData,
      sideGrossDeductions,
      agentRadiusFees,
      postSplitDeductions,
      appliedPlans,
      awardValues,
      awardAmountValues,
      preSplitDeductions,
      agentAllocationPercentages,
      commissionPlans,
    }),
    [sidesData, sideGrossDeductions, agentRadiusFees, postSplitDeductions, appliedPlans, awardValues, awardAmountValues, preSplitDeductions, agentAllocationPercentages, commissionPlans]
  );
  const previousEditableSnapshot = useRef(editableSnapshot);
  useEffect(() => {
    if (previousEditableSnapshot.current === editableSnapshot) return;
    previousEditableSnapshot.current = editableSnapshot;
    if (typeof window !== "undefined") {
      const persistedPayload: PersistedCommissionBreakdownState = {
        sidesData,
        sideGrossDeductions,
        preSplitDeductions,
        postSplitDeductions,
        awardValues,
        awardAmountValues,
        appliedPlans,
        agentRadiusFees,
        agentAllocationPercentages,
        commissionPlans,
      };
      window.localStorage.setItem(COMMISSION_BREAKDOWN_STORAGE_KEY, JSON.stringify(persistedPayload));
    }
    if (txStatus !== "draft") {
      if (role === "team_lead") {
        setTxStatus(txStatus === "team_lead_confirmed" || txStatus === "processed" ? "agent_confirmed" : txStatus === "rejected" ? "draft" : txStatus);
      } else {
        setTxStatus("draft");
      }    };
  }, [editableSnapshot, txStatus, role, sidesData, sideGrossDeductions, preSplitDeductions, postSplitDeductions, awardValues, awardAmountValues, appliedPlans, agentRadiusFees, agentAllocationPercentages, commissionPlans]);

  function renderWireInstructionForm() {
    return (
      <Dialog open={true} onOpenChange={(open) => {
        if (!open) {
          setWireFormMode("none");
          setOpenWireItemId(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[85vh] p-0 gap-0">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <DialogTitle className="text-lg font-semibold text-foreground">
              {wireFormMode === "team" ? "Team Wire Instruction" : wireFormMode === "agent" ? "Agent Wire Instruction" : wireFormMode === "external" ? "External Wire Instruction" : "Wire Instruction"}
            </DialogTitle>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <div className="flex flex-col gap-4 px-6 py-4">

            {wireSelectionMode !== undefined && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium">Wire Type</Label>
                  <Select value={wireFormMode} onValueChange={(v) => openWireForm(v as "team" | "agent" | "external")}>
                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agent selector */}
                {wireFormMode === "agent" && (
                  <div className="flex flex-col gap-1.5 mb-4">
                    <Label className="text-sm font-medium">Select Agent</Label>
                    <Select
                      value={wireFormAgentId}
                      onValueChange={(id) => {
                        setWireFormAgentId(id);
                        setWireSelectionMode(undefined);
                        setWireFormErrors({});
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(new Map(sidesData.flatMap((s) => s.agents).filter((a) => !a.external).map(a => [a.id, a])).values()).map((agent) => (
                          <SelectItem key={agent.id} value={agent.id || `agent-${Math.random()}`}>{agent.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {wireFormMode === "external" && (
                  <div className="flex flex-col gap-1.5 mb-4">
                    <Label className="text-sm font-medium">Select or Add Recipient</Label>
                    <Select value={wireSelectionMode} onValueChange={(v) => {
                      setWireSelectionMode(v);
                      setWireFormErrors({});
                      if (v === "manual") {
                        const d = createEmptyWireInstruction(`ext-${wireExternalName}`);
                        d.payableName = wireExternalName;
                        d.accountHolderName = wireExternalName;
                        setWireFormDraft(d);
                      } else if (v) {
                        const match = allSavedWires.find(r => r.id === v);
                        if (match) {
                          setWireFormDraft({ ...createEmptyWireInstruction(wireFormDraft.id), ...match, id: wireFormDraft.id, _oldId: match.id, payableName: wireExternalName } as any);
                        }
                      }
                    }}>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder="Select existing or manually enter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manually enter (+)</SelectItem>
                        {allSavedWires.length > 0 && <SelectGroup>
                          <SelectLabel>Existing Instructions</SelectLabel>
                          {allSavedWires.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.payableName || r.accountHolderName || r.bankName}</SelectItem>
                          ))}
                        </SelectGroup>}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {wireSelectionMode === undefined && (
              <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border/60 p-8 text-center bg-muted/10 mt-2">
                <Landmark className="size-10 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No instruction selected</h3>
                <p className="mt-1 mb-4 text-xs text-muted-foreground max-w-[280px]">
                  Only one instruction can be added. It can be team, agent, or external.
                </p>
                <Button 
                  size="sm" 
                  className="h-8 rounded-lg text-xs bg-[#5A5FF2] hover:bg-[#5A5FF2]/90" 
                  onClick={() => {
                    setWireSelectionMode("manual");
                    setWireFormErrors({});
                    const d = createEmptyWireInstruction(wireFormMode === "external" ? `ext-${wireExternalName}` : undefined);
                    d.payableName = wireExternalName;
                    d.accountHolderName = wireFormMode === "team" ? "Brokerage" : wireFormMode === "agent" ? (sidesData.flatMap((s) => s.agents).find(a => a.id === wireFormAgentId)?.name || "") : wireExternalName;
                    setWireFormDraft(d);
                  }}
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Instruction
                </Button>
              </div>
            )}

            {wireSelectionMode !== undefined && (
              <>
                <Separator />

            {/* Recipient */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Recipient / Account Holder Name <span className="text-destructive">*</span></Label>
              <Input value={wireFormDraft.accountHolderName} onChange={(e) => setWireFormDraft((d) => ({ ...d, accountHolderName: e.target.value }))} className="h-9 text-sm" placeholder="Full legal name" />
              {wireFormErrors.accountHolderName && <p className="text-[11px] text-destructive">{wireFormErrors.accountHolderName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Email</Label>
                <Input value={wireFormDraft.recipientEmail} onChange={(e) => setWireFormDraft((d) => ({ ...d, recipientEmail: e.target.value }))} className="h-9 text-sm" placeholder="contact@example.com" />
                {wireFormErrors.recipientEmail && <p className="text-[11px] text-destructive">{wireFormErrors.recipientEmail}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Phone</Label>
                <Input value={wireFormDraft.recipientPhone} onChange={(e) => setWireFormDraft((d) => ({ ...d, recipientPhone: e.target.value }))} className="h-9 text-sm" placeholder="(555) 123-4567" />
                {wireFormErrors.recipientPhone && <p className="text-[11px] text-destructive">{wireFormErrors.recipientPhone}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Street Address</Label>
              <Input value={wireFormDraft.recipientStreet} onChange={(e) => setWireFormDraft((d) => ({ ...d, recipientStreet: e.target.value }))} className="h-9 text-sm" placeholder="123 Main St" />
              {wireFormErrors.recipientStreet && <p className="text-[11px] text-destructive">{wireFormErrors.recipientStreet}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">City</Label>
                <Input value={wireFormDraft.recipientCity} onChange={(e) => setWireFormDraft((d) => ({ ...d, recipientCity: e.target.value }))} className="h-9 text-sm" placeholder="City" />
                {wireFormErrors.recipientCity && <p className="text-[11px] text-destructive">{wireFormErrors.recipientCity}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">State</Label>
                <Input value={wireFormDraft.recipientState} onChange={(e) => setWireFormDraft((d) => ({ ...d, recipientState: e.target.value }))} className="h-9 text-sm" placeholder="CA" />
                {wireFormErrors.recipientState && <p className="text-[11px] text-destructive">{wireFormErrors.recipientState}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">ZIP</Label>
                <Input value={wireFormDraft.recipientZip} onChange={(e) => setWireFormDraft((d) => ({ ...d, recipientZip: e.target.value }))} className="h-9 text-sm" placeholder="94105" />
              </div>
            </div>

            <Separator />

            {/* Banking */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Bank Name <span className="text-destructive">*</span></Label>
              <Input value={wireFormDraft.bankName} onChange={(e) => setWireFormDraft((d) => ({ ...d, bankName: e.target.value }))} className="h-9 text-sm" placeholder="e.g., Chase Bank" />
              {wireFormErrors.bankName && <p className="text-[11px] text-destructive">{wireFormErrors.bankName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Routing Number (ABA) <span className="text-destructive">*</span></Label>
                <Input value={wireFormDraft.routingNumber} onChange={(e) => setWireFormDraft((d) => ({ ...d, routingNumber: e.target.value.replace(/\D/g, "").slice(0, 9) }))} className="h-9 text-sm font-mono" placeholder="9 digits" inputMode="numeric" maxLength={9} />
                {wireFormErrors.routingNumber && <p className="text-[11px] text-destructive">{wireFormErrors.routingNumber}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Account Number <span className="text-destructive">*</span></Label>
                <Input value={wireFormDraft.accountNumber} onChange={(e) => setWireFormDraft((d) => ({ ...d, accountNumber: e.target.value }))} className="h-9 text-sm font-mono" placeholder="Account number" />
                {wireFormErrors.accountNumber && <p className="text-[11px] text-destructive">{wireFormErrors.accountNumber}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">Account Type</Label>
                <Select value={wireFormDraft.accountType || "checking"} onValueChange={(v) => setWireFormDraft((d) => ({ ...d, accountType: v as WireAccountType }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Bank Street Address <span className="text-destructive">*</span></Label>
              <Input value={wireFormDraft.bankStreet} onChange={(e) => setWireFormDraft((d) => ({ ...d, bankStreet: e.target.value }))} className="h-9 text-sm" placeholder="123 Main St" />
              {wireFormErrors.bankStreet && <p className="text-[11px] text-destructive">{wireFormErrors.bankStreet}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">City <span className="text-destructive">*</span></Label>
                <Input value={wireFormDraft.bankCity} onChange={(e) => setWireFormDraft((d) => ({ ...d, bankCity: e.target.value }))} className="h-9 text-sm" placeholder="City" />
                {wireFormErrors.bankCity && <p className="text-[11px] text-destructive">{wireFormErrors.bankCity}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">State <span className="text-destructive">*</span></Label>
                <Input value={wireFormDraft.bankState} onChange={(e) => setWireFormDraft((d) => ({ ...d, bankState: e.target.value }))} className="h-9 text-sm" placeholder="CA" />
                {wireFormErrors.bankState && <p className="text-[11px] text-destructive">{wireFormErrors.bankState}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium">ZIP <span className="text-destructive">*</span></Label>
                <Input value={wireFormDraft.bankZip} onChange={(e) => setWireFormDraft((d) => ({ ...d, bankZip: e.target.value }))} className="h-9 text-sm" placeholder="94105" />
                {wireFormErrors.bankZip && <p className="text-[11px] text-destructive">{wireFormErrors.bankZip}</p>}
              </div>
            </div>

            {/* Special instructions */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">Special Instructions / Memo</Label>
              <Textarea value={wireFormDraft.specialInstructions} onChange={(e) => setWireFormDraft((d) => ({ ...d, specialInstructions: e.target.value }))} className="min-h-[60px] text-sm" placeholder="Optional memo or reference" />
            </div>
          </>
        )}

            {/* Save */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => { setWireFormMode("none"); setOpenWireItemId(null); }}>Cancel</Button>
              <Button size="sm" className="h-8 rounded-lg text-xs bg-[#5A5FF2] hover:bg-[#5A5FF2]/90 text-white" onClick={saveWireForm} disabled={wireSelectionMode === undefined}>Save Instructions</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-muted/40">
      <main className="flex flex-1 flex-col">

        {/* ── Breadcrumb + role bar ── */}
        <div className="flex items-center justify-between border-b bg-background px-6 py-2.5">
          <div className="flex items-center gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs">Commission Breakdown</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator orientation="vertical" className="!h-4" />
            <CDAFlowSwitcher />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg px-3 text-xs">
                {role === "agent" ? <User className="size-3.5" /> : role === "team_lead" ? <Users className="size-3.5" /> : <Shield className="size-3.5" />}
                {role === "agent" ? "Agent view" : role === "team_lead" ? "Team Lead view" : role === "soul_auditor" ? "SOUL Auditor view" : "Auditor view"}
                <ChevronRight className="size-3 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["agent", "team_lead", "radius_auditing", "soul_auditor"] as Role[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRole(r)} className={cn(role === r && "bg-accent")}>
                  <div className="flex items-center gap-2">
                    {r === "agent" ? <User className="size-3.5" /> : r === "team_lead" ? <Users className="size-3.5" /> : <Shield className="size-3.5" />}
                    <span>{r === "agent" ? "Agent view" : r === "team_lead" ? "Team Lead view" : r === "soul_auditor" ? "SOUL Auditor view" : "Auditor view"}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Page title bar ── */}
        <div className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="size-8 text-muted-foreground hover:text-foreground">
              <Link to="/"><ChevronRight className="size-4 rotate-180" /></Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <h1 className="min-w-0 truncate text-sm font-semibold">Commission Breakdown — 1284 Willow Creek Dr</h1>
            <Separator orientation="vertical" className="h-4 shrink-0" />
            <Badge variant="secondary" className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium font-sans shadow-sm border bg-muted/30">
              <Calendar className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">Closing</span>
              <span className="text-foreground">May 13, 2026</span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {role !== "agent" && (
              <Badge variant="outline" className={cn("rounded-full px-3", STATUS_COLORS[txStatus])}>
                {STATUS_LABELS[txStatus]}
              </Badge>
            )}
            {isAuditor && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative flex size-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setShowWireSheet(true)}
                aria-label="Open wire instructions status"
              >
                <Landmark className="size-4" />
                {!allAuditorWiresComplete && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                    {incompleteWirePartyNames.length}
                  </span>
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative flex size-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => { setActivityView("activity"); setShowActivitySheet(true); }}
              aria-label="Open activity log"
            >
              <Activity className="size-4" />
            </Button>
            {rejectionNote ? (
              <Tooltip>
                <TooltipTrigger asChild>{renderCommentTrigger()}</TooltipTrigger>
                <TooltipContent className="max-w-64">{rejectionNote}</TooltipContent>
              </Tooltip>
            ) : (
              renderCommentTrigger()
            )}
            {/* Role action */}
            {role === "agent" && (
              <Button
                size="sm"
                className="h-8 shrink-0 rounded-lg px-4 text-xs"
                disabled={!canConfirmNow}
                onClick={() => setShowConfirmDialog(true)}
              >
                Confirm
              </Button>
            )}
            {role === "team_lead" && (
              <Button
                size="sm"
                className="h-8 shrink-0 rounded-lg px-4 text-xs"
                disabled={!canConfirmNow}
                onClick={() => setShowConfirmDialog(true)}
              >
                Confirm
              </Button>
            )}
            {isAuditor && (
              <Button
                size="sm"
                className="h-8 shrink-0 rounded-lg px-4 text-xs"
                disabled={!canAuditorApprove}
                onClick={() => setShowProcessDialog(true)}
              >
                Finalize
              </Button>
            )}
            {/* Download PDF — visible to all when processed */}
            {txStatus === "processed" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 rounded-lg border-primary px-4 text-xs text-primary"
                disabled={isAuditor && !allAuditorWiresComplete}
                onClick={() => { setPdfCdaType(wireStore.teamWireInstructions.cdaType || "full-transparency"); setShowPdfPreview(true); }}
              >
                <Download className="size-3.5" />
                PDF
              </Button>
            )}
            {/* Auditor return when review needs edits */}
            {isAuditor && txStatus === "team_lead_confirmed" && (
              <>
                <Button size="sm" variant="outline" className="h-8 rounded-lg px-4 text-xs text-destructive border-destructive/40 hover:bg-destructive/5" onClick={() => setShowRejectDialog(true)}>
                  Return
                </Button>
              </>
            )}
          </div>
        </div>

        {role === "agent" && !agentWireComplete && (
          <div className="border-b bg-background px-6 py-3">
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <Info className="text-amber-700" />
              <AlertDescription className="text-amber-800">
                Complete your wire instructions in settings before commission breakdown can be finalized.
              </AlertDescription>
            </Alert>
          </div>
        )}
        {role === "team_lead" && !teamWireComplete && (
          <div className="border-b bg-background px-6 py-3">
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <Info className="text-amber-700" />
              <AlertDescription className="text-amber-800">
                Complete team wire instructions in settings before commission breakdown can be finalized.
              </AlertDescription>
            </Alert>
          </div>
        )}
        {isAuditor && !allAuditorWiresComplete && (
          <div className="border-b bg-background px-6 py-4">
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <Info className="text-amber-700" />
              <AlertDescription className="text-amber-800">
                Wire instructions incomplete for {incompleteWirePartyNames.join(", ")}. PDF download blocked.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-[1fr_1px_1fr] items-stretch border-b bg-background">
          <div className="px-6 py-5">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <CircleDollarSign className="size-3.5" />
              Total Gross Commission
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowGrossInfo(true)} className="transition-colors hover:text-foreground">
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Total before payouts &amp; deductions</TooltipContent>
              </Tooltip>
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{currency(totalGrossCommission)}</p>
          </div>
          <div className="bg-border" />
          <div className="px-6 py-5">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Building2 className="size-3.5" />Sale Price
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{currency(DEAL_SALE_PRICE)}</p>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div ref={gridRef} className="relative grid min-h-0 flex-1 items-start lg:grid-cols-[3fr_2fr]">

          {/* ── Horizontal connector line ── */}
          {connectorTop > 0 && (
            <div
              className="absolute h-px bg-[#5A5FF2]/20 rounded-full pointer-events-none hidden xl:block z-10"
              style={{
                top: `${connectorTop}px`,
                left: 'calc(60% - 16px)',
                width: '20px',
              }}
            />
          )}

          {/* LEFT — unified side card */}
          <section className="bg-muted/30 p-4 lg:sticky lg:top-4 lg:self-start">
            <div className="space-y-4">
              <Card className="rounded-xl border bg-card overflow-hidden p-0 gap-0 block shadow-sm">
                <div className="w-full">
                  {sides.map((side, index) => {
                    const sideSummary = derivedBreakdown.sideSummaries.find((entry) => entry.side.id === side.id);
                    return (
                    <React.Fragment key={side.id}>
                      <div className="border-none">
                        <div
                          data-connector-anchor={`${side.id}-side`}
                          className={cn(
                            "flex items-start justify-between px-5 py-4 transition-colors duration-150",
                            index === 0 && "rounded-t-xl",
                            selectedSide === side.id && "bg-[#5A5FF2]/[0.035]"
                          )}>
                          <div className="flex flex-1 items-start justify-between">
                            <div className="min-w-0">
                              <span className="text-base font-semibold">{side.title}</span>
                              <div className="flex items-center gap-3 mt-1" data-testid={`${side.id}-meta-row`}>
                                <span className="text-xs text-muted-foreground">{side.subline}</span>

                                <Separator
                                  orientation="vertical"
                                  data-testid={`${side.id}-separator-1`}
                                  className="!h-4 w-px shrink-0 bg-[#D7DAE5] opacity-100"
                                />

                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "rounded-full px-2 py-0 text-[11px] font-medium border-[#5A5FF2] text-[#5A5FF2] bg-transparent",
                                    !isAgent && !isLocked && "cursor-pointer hover:opacity-80"
                                  )}
                                  onClick={!isAgent && !isLocked ? (e) => { e.stopPropagation(); setShowAwardDialog(true); } : undefined}
                                >
                                  Award {roundCurrency(derivedBreakdown.normalizedAwards[side.id] ?? 0)}%
                                </Badge>

                                <Separator
                                  orientation="vertical"
                                  data-testid={`${side.id}-separator-2`}
                                  className="!h-4 w-px shrink-0 bg-[#D7DAE5] opacity-100"
                                />

                                {!isAgent && !isLocked && (
                                  <Badge
                                    variant="secondary"
                                    className="border border-[#5A5FF2] text-[#5A5FF2] bg-[#5A5FF210] hover:bg-[#5A5FF214] cursor-pointer px-2 py-0 text-[11px] font-medium h-5 flex items-center justify-center rounded-md shadow-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAddAgentSideId(side.id);
                                      setAgentSearch("");
                                      setPendingAgent(null);
                                      setAgentAllocations({});
                                      setShowAddAgentDialog(true);
                                    }}
                                  >
                                    + Agent
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 mr-1">
                              <div className="text-right">
                                <p className="text-xs font-medium text-muted-foreground">Side total</p>
                                <p className="text-xl font-bold tracking-tight tabular-nums">{currency(sideSummary?.toAgents ?? 0)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSide(side.id);
                                  setSelectedAgentId(null);
                                }}
                              >
                                <ChevronRight className="size-4 text-muted-foreground/50" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="px-5 pb-4">
                          <div className="mt-1 space-y-2">
                            {side.agents.map((agent) => {
                              const agentSummary = sideSummary?.agents.find((entry) => entry.agent.id === agent.id);
                              return (
                              <div
                                data-connector-anchor={`agent-${agent.id}`}
                                key={agent.id}
                                role="button" tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); setSelectedSide(side.id); setSelectedAgentId(agent.id); }}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setSelectedSide(side.id); setSelectedAgentId(agent.id); } }}
                                className={cn(
                                  "flex cursor-pointer items-center justify-between gap-4 px-4 py-3 min-h-[64px] rounded-lg outline-none transition-colors",
                                  selectedAgentId === agent.id ? "bg-muted ring-1 ring-border shadow-sm" : "bg-muted/50 hover:bg-muted/80"
                                )}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <Avatar className="size-8 shrink-0 border">
                                    <AvatarFallback className="bg-background text-xs font-semibold">{initials(agent.name)}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{agent.name}</p>
                                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right">
                                    <p className="text-xs font-medium text-muted-foreground">Payout</p>
                                    <p className="text-base font-bold tracking-tight tabular-nums">{currency(agentSummary?.netCommission ?? 0)}</p>
                                  </div>
                                  <ChevronRight className="size-4 text-muted-foreground/50" />
                                </div>
                              </div>
                            )})}
                          </div>
                        </div>
                      </div>
                      {index === 0 && <Separator />}
                    </React.Fragment>
                  )})}
                </div>
              </Card>
            </div>
          </section>

          {/* RIGHT — agent detail OR side breakdown */}
          <aside className="py-4 pr-4 pl-1 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
           <Card
            className="rounded-xl border bg-card shadow-sm overflow-hidden p-0"
           >
            {selectedAgent ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Agent header */}
                <div className="shrink-0 border-b px-5 py-4 bg-[#5A5FF2]/[0.035]">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                    <span>{selectedAgent.side.title}</span>
                    <ChevronRight className="size-2.5" />
                    <span>{selectedAgent.agent.role}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border">
                        <AvatarFallback className="text-sm font-bold">{initials(selectedAgent.agent.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-base font-bold uppercase tracking-wide text-foreground">{selectedAgent.agent.name}</h2>
                        <p className="text-xs text-muted-foreground">{selectedAgent.agent.role} · {selectedAgent.side.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                    {/* Apply plan — dropdown (team_lead + radius only) */}
                    {role !== "agent" && !selectedAgentIsExternal ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("h-7 rounded-lg px-3 text-xs gap-1", !appliedPlans[selectedAgent.agent.id] && "text-muted-foreground")}>
                            {appliedPlans[selectedAgent.agent.id]
                              ? commissionPlans.find((p) => p.id === appliedPlans[selectedAgent.agent.id])?.name
                              : "No plan selected"}
                            <ChevronRight className="size-3 rotate-90" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Commission plans</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {commissionPlans.map((plan) => (
                            <DropdownMenuItem
                              key={plan.id}
                              onClick={() => {
                                const current = appliedPlans[selectedAgent.agent.id];
                                if (current && current !== plan.id) {
                                  setPendingPlanChange({ agentId: selectedAgent.agent.id, plan });
                                } else {
                                  setAppliedPlans((p) => ({ ...p, [selectedAgent.agent.id]: plan.id }));
                                  logActivity(`Applied commission plan ${plan.name} to ${selectedAgent.agent.name}.`);
                                  toast.success(`"${plan.name}" applied to ${selectedAgent.agent.name}`);
                                }
                              }}
                            >
                              <div>
                                <p className="text-sm font-medium">{plan.name}</p>
                                <p className="text-xs text-muted-foreground">{plan.detail}</p>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                    {selectedAgentIsExternal && (
                      <Badge variant="outline" className="h-7 rounded-lg border-primary/20 bg-primary/5 px-2.5 text-[11px] font-medium text-primary">
                        Manual agent
                      </Badge>
                    )}

                    {!selectedAgentIsExternal && !appliedPlans[selectedAgent.agent.id] && role !== "agent" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 rounded-lg border-primary/40 px-3 text-xs text-primary hover:bg-primary/[0.03]"
                        onClick={() => {
                          setPlanForm({
                            ...getFreshPlanForm(),
                            selectedAgentIds: [selectedAgent.agent.id]
                          });
                          setShowAddPlanDialog(true);
                        }}
                      >
                        <Plus className="size-3" /> Commission plan
                      </Button>
                    )}
                    {!isAgent && !isLocked && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-lg p-0 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                    </div>
                  </div>
                </div>

                {/* Agent empty state or ledger */}
                {!selectedAgentIsExternal && !appliedPlans[selectedAgent.agent.id] ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-muted/5">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CircleDollarSign className="size-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">No commission plan selected</h3>
                    <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                      Apply an existing plan or create a new one to calculate splits and deductions for this agent.
                    </p>
                    {role !== "agent" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-5 border-primary text-primary hover:bg-primary/[0.03] rounded-lg"
                        onClick={() => {
                          setPlanForm({
                            ...getFreshPlanForm(),
                            selectedAgentIds: [selectedAgent.agent.id]
                          });
                          setShowAddPlanDialog(true);
                        }}
                      >
                        <Plus className="size-4" /> Create commission plan
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Agent ledger */}
                <div className="px-5 py-4">

                  {selectedAgentIsExternal && (
                    <Alert className="mb-4 border border-primary/15 bg-primary/[0.04] px-3 py-2">
                      <AlertDescription className="text-[11px] leading-5 text-foreground/80">
                        Manual external agent. No Radius commission plan or fee automation. Split and payout stay manual until Biju confirms rules.
                      </AlertDescription>
                    </Alert>
                  )}
                  {selectedCapStatus !== "none" && (
                    <Alert className={cn(
                      "mb-4 border px-3 py-2",
                      selectedCapStatus === "reached"
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-orange-200 bg-orange-50 text-orange-900"
                    )}>
                      <AlertDescription className="text-[11px] leading-5">
                        <span className="font-semibold">
                          {selectedCapStatus === "reached" ? "Capped already." : "You will cap with this deal."}
                        </span>{" "}
                        {selectedCapStatus === "reached"
                          ? `${currency(selectedCapUsed)} used of ${currency(selectedCapAmount)} cap.`
                          : `Estimated progress to cap: ${currency(selectedCapUsed + selectedAgent.capApplied)} of ${currency(selectedCapAmount)}.`}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commission Basis</p>
                    <div className="min-w-[120px] text-right">
                      <EditableValue value={selectedAgent.commissionBasis} onChange={() => undefined} readOnly />
                    </div>
                  </div>
                  {(isTL || canEditAll) && !isLocked && (
                  <>
                  {(preSplitDeductions[selectedAgent.agent.id] ?? []).map((ded) => (
                      <React.Fragment key={ded.id}>
                        <div className="group flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground">{ded.name}</p>
                            <DeductionWireIcon dedName={ded.name} dedId={ded.id} onClick={() => setOpenWireItemId(openWireItemId === ded.id ? null : ded.id)} />
                            <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">Deduction</span>
                          </div>
                      <div className="flex items-center gap-2">
                          <DeductionValue
                            value={ded.amount}
                            onChange={(v) => setPreSplitDeductions((prev) => ({
                              ...prev,
                              [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).map((d) => d.id === ded.id ? { ...d, amount: v } : d),
                            }))}
                          />
                        <button
                          onClick={() => setPreSplitDeductions((prev) => ({
                            ...prev,
                            [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).filter((d) => d.id !== ded.id),
                          }))}
                          className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-destructive group-hover:inline-flex items-center justify-center"
                          tabIndex={-1}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    </div>
                    {openWireItemId === ded.id && renderWireInstructionForm()}
                  </React.Fragment>
                  ))}
                  <div className="pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]"
                      onClick={() => {
                        setFeeDialogTarget("agent");
                        setFeeDialogTiming("pre-split");
                      }}
                    >
                      <Plus className="size-3.5 mr-1" />Add Credit or Referral
                    </Button>
                  </div>
                  </>
                  )}
                  <Separator className="my-3" />

                  <div className="flex items-start justify-between py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Split</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCapStatus === "reached"
                          ? "Adjusted by cap logic"
                          : selectedCapStatus === "near"
                            ? `Cap warning: ${currency(selectedCapRemaining)} left`
                            : `${roundCurrency(selectedAgent.splitRate * 100)}% team split`}
                      </p>
                    </div>
                    <div className="min-w-[120px] text-right">
                      <EditableValue value={selectedAgent.split} onChange={() => undefined} readOnly />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Radius Fee</p>
                      {selectedPlan && (
                        <p className="text-xs text-muted-foreground">
                          {selectedPlan.name}
                        </p>
                      )}
                    </div>
                    <div className="min-w-[120px] text-right">
                      <EditableValue
                        value={selectedAgent.radiusFee}
                        readOnly={!canEditAll || isLocked}
                        onChange={(value) => {
                          setAgentRadiusFees((prev) => ({
                            ...prev,
                            [selectedAgent.agent.id]: value,
                          }));
                          logActivity(`Updated Radius Fee for ${selectedAgent.agent.name} to ${currency(value)}.`);
                        }}
                      />
                    </div>
                  </div>
                  <Separator className="my-3" />

                  {/* Post-split deductions */}
                  <div className="py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post-split deductions</p>
                  </div>
                  {(postSplitDeductions[selectedAgent.agent.id] ?? []).map((ded) => {
                    const dedReadOnly = isLocked;
                    const canDelete = !isLocked;
                    return (
                      <React.Fragment key={ded.id}>
                        <div className="group flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground">{ded.name}</p>
                            <DeductionWireIcon dedName={ded.name} dedId={ded.id} onClick={() => setOpenWireItemId(openWireItemId === ded.id ? null : ded.id)} />
                            <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">{ded.isRadiusFee ? "Paid by Agent" : "Paid by Both"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DeductionValue
                              value={ded.amount}
                              readOnly={dedReadOnly}
                              onChange={(v) => {
                                setPostSplitDeductions((prev) => ({
                                  ...prev,
                                  [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).map((d) => d.id === ded.id ? { ...d, amount: v } : d),
                                }));
                                logActivity(`Updated ${ded.name} for ${selectedAgent.agent.name} to ${currency(v)}.`);
                              }}
                            />
                            {canDelete && (
                              <button
                                onClick={() => {
                                  setPostSplitDeductions((prev) => ({
                                    ...prev,
                                    [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).filter((d) => d.id !== ded.id),
                                  }));
                                  logActivity(`Removed ${ded.name} from ${selectedAgent.agent.name}.`);
                                }}
                                className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-destructive group-hover:inline-flex items-center justify-center"
                                tabIndex={-1}
                              >
                                <X className="size-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {openWireItemId === ded.id && renderWireInstructionForm()}
                      </React.Fragment>
                    );
                  })}

                  {/* Empty state + CTAs for post-split */}
                  <div className="flex items-center gap-3 pt-1 pb-0.5">
                    {!isLocked && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => setFeeDialogTiming("post-split")}>
                        <Plus className="size-3.5 mr-1" />Post-split deduction
                      </Button>
                    )}
                  </div>

                  {/* Radius fee nudge strip */}
                  {canEditAll && !isLocked && !(postSplitDeductions[selectedAgent.agent.id] ?? []).some((d) => d.isRadiusFee) && (
                    <button
                      onClick={() => setFeeDialogTiming("post-split")}
                      className="mt-2 flex w-full items-center gap-3 rounded-lg border border-[#5A5FF2]/15 bg-[#5A5FF2]/[0.04] px-3.5 py-2.5 text-left transition-all hover:border-[#5A5FF2]/30 hover:bg-[#5A5FF2]/[0.08]"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#5A5FF2]/10">
                        <Plus className="size-3.5 text-[#5A5FF2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">Add Radius Fee</p>
                        <p className="text-[11px] text-muted-foreground truncate">Apply standard Radius fees to this agent</p>
                      </div>
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40" />
                    </button>
                  )}

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Commission</p>
                    <div className="min-w-[120px] text-right">
                      <button onClick={() => setShowNetCommissionDialog(true)} className="text-sm font-semibold tabular-nums underline underline-offset-2 cursor-pointer text-[#5A5FF2]">
                        {currency(selectedAgent.netCommission)}
                      </button>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Dollar Contribution</p>
                    <div className="min-w-[120px] text-right">
                      <button onClick={() => setShowCDCDialog(true)} className="text-sm font-semibold tabular-nums underline underline-offset-2 cursor-pointer text-[#5A5FF2]">
                        {currency(selectedAgent.companyDollarContribution)}
                      </button>
                    </div>
                  </div>
                  <Separator className="my-3" />

                  {renderActivitySurface({ preview: true })}
                  </div>
                </>
              )}
            </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="shrink-0 border-b px-5 py-4 bg-[#5A5FF2]/[0.035]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                        <Building2 className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">{activeSide.title}</h2>
                        <p className="text-xs text-muted-foreground">{activeSide.subline}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                    {[
                      { label: "Gross", value: currency(grossIncome), icon: TrendingUp, gradient: "linear-gradient(135deg, #c7d2fe, #a5b4fc)", muted: "#6366f1", strong: "#1e1b4b" },
                      { label: "After Deductions", value: currency(grossCommissionAfterDeductions), icon: CircleDollarSign, gradient: "linear-gradient(135deg, #ddd6fe, #c4b5fd)", muted: "#7c3aed", strong: "#2e1065" },
                      { label: "To Agents", value: currency(totalAgentPayout), icon: User, gradient: "linear-gradient(135deg, #bbf7d0, #86efac)", muted: "#16a34a", strong: "#14532d" },
                      { label: "To Team", value: currency(activeSideOfficeShare), icon: Building2, gradient: "linear-gradient(135deg, #fef3c7, #fde68a)", muted: "#d97706", strong: "#451a03" },
                    ].map(({ label, value, icon: Icon, gradient, muted, strong }) => (
                      <div key={label} className="rounded-lg px-3 py-2.5" style={{ background: gradient }}>
                        <div className="flex items-center gap-1.5">
                          <Icon className="size-3" style={{ color: muted }} />
                          <p className="text-xs font-medium" style={{ color: muted }}>{label}</p>
                        </div>
                        <p className="mt-0.5 text-sm font-bold tracking-tight" style={{ color: strong }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross Commission</p>
                    <div className="min-w-[120px] text-right">
                      <p className="text-base font-bold text-foreground tabular-nums">{currency(grossIncome)}</p>
                    </div>
                  </div>
                  {/* Side-level gross deductions: Credits, Referrals */}
                  {(sideGrossDeductions[activeSide.id] ?? []).map((ded) => (
                    <React.Fragment key={ded.id}>
                      <div className="group flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-muted-foreground">{ded.name}</p>
                          <DeductionWireIcon dedName={ded.name} dedId={ded.id} onClick={() => setOpenWireItemId(openWireItemId === ded.id ? null : ded.id)} />
                          <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">Deduction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(!isLocked && (isAgent || isTL || canEditAll)) ? (
                            <DeductionValue
                              value={ded.amount}
                              readOnly={false}
                              onChange={(v) => {
                                setSideGrossDeductions((prev) => ({
                                  ...prev,
                                  [activeSide.id]: (prev[activeSide.id] ?? []).map((d) => d.id === ded.id ? { ...d, amount: v } : d),
                                }));
                                logActivity(`Updated ${ded.name} on ${activeSide.title} to ${currency(v)}.`);
                              }}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground tabular-nums min-w-[80px] text-right">{currency(ded.amount)}</span>
                          )}
                          {(!isLocked && (isAgent || isTL || canEditAll)) && (
                            <button
                              onClick={() => {
                                setSideGrossDeductions((prev) => ({
                                  ...prev,
                                  [activeSide.id]: (prev[activeSide.id] ?? []).filter((d) => d.id !== ded.id),
                                }));
                                logActivity(`Removed ${ded.name} from ${activeSide.title}.`);
                              }}
                              className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-destructive group-hover:inline-flex items-center justify-center"
                              tabIndex={-1}
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {openWireItemId === ded.id && renderWireInstructionForm()}
                    </React.Fragment>
                  ))}
                  {showInlineSidePreSplitDraft && (
                    <div className="pt-1">
                      <InlineDeductionDraftRow
                        label={inlineSidePreSplitLabel}
                        amount={inlineSidePreSplitAmount}
                        labelPlaceholder="Fee name"
                        onLabelChange={setInlineSidePreSplitLabel}
                        onAmountChange={setInlineSidePreSplitAmount}
                        onSave={handleInlineSidePreSplitSave}
                        onCancel={resetInlineSidePreSplitDraft}
                      />
                    </div>
                  )}
                  {isAgent && !isLocked && (
                  <div className="pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]"
                      onClick={() => {
                        setFeeDialogTarget("side");
                        setFeeDialogTiming("pre-split");
                      }}
                    >
                      <Plus className="size-3.5 mr-1" />Add credit or referral fee
                    </Button>
                  </div>
                  )}
                  {(isTL || canEditAll) && !isLocked && (
                  <div className="pt-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => { setShowCreditReferralDialog(true); }}>
                      <Plus className="size-3.5 mr-1" />Add Credit or Referral
                    </Button>
                  </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-3 mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross Commission After Deductions</p>
                    <div className="min-w-[120px] text-right">
                      <p className="text-base font-bold text-foreground tabular-nums">{currency(grossCommissionAfterDeductions)}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 pt-1">
                    {activeSideAgentSummaries.map(({ agent, netCommission, preSplitDeductionsTotal, postSplitDeductionsTotal }) => {
                      const isExpanded = expandedSideAgentId === agent.id;
                      return (
                        <div
                          key={agent.id}
                          className={cn(
                            "rounded-xl border bg-card transition-colors",
                            isExpanded ? "border-border bg-muted/30 shadow-sm" : "border-border"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedSideAgentId((prev) => (prev === agent.id ? null : agent.id))}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">{agent.name} commissions</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">Net amount only</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-base font-bold tabular-nums text-foreground">{currency(netCommission)}</p>
                              <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="border-t px-4 py-3">
                              <div className="flex items-center justify-between py-1.5">
                                <p className="text-xs font-medium text-muted-foreground">Pre-split amount</p>
                                <p className="text-sm font-semibold tabular-nums text-foreground">{currency(preSplitDeductionsTotal)}</p>
                              </div>
                              <div className="flex items-center justify-between py-1.5">
                                <p className="text-xs font-medium text-muted-foreground">Post-split amount</p>
                                <p className="text-sm font-semibold tabular-nums text-foreground">{currency(postSplitDeductionsTotal)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Team income</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">After pre-split deductions and agent payouts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold tabular-nums text-foreground">{currency(officeNet)}</p>
                      </div>
                    </div>
                  </div>

                  {(canEditAll || activeSideRadiusFee > 0) && (
                    <div className="mt-3 rounded-xl border bg-card px-4 py-3.5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-muted-foreground">
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="12" r="6" strokeDasharray="6 4" />
                              <circle cx="12" cy="12" r="10" strokeDasharray="8 4" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">Radius Fee</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {activeSide.agents.length > 1
                                ? "Summation of all agents' Radius fees"
                                : "Team-side fee applied to this side"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <EditableValue
                            value={activeSideRadiusFee}
                            readOnly={!canEditAll || isLocked || activeSide.agents.length !== 1}
                            onChange={(value) => {
                              if (activeSide.agents.length === 1) {
                                const agentId = activeSide.agents[0].id;
                                setAgentRadiusFees((prev) => ({
                                  ...prev,
                                  [agentId]: value,
                                }));
                                logActivity(`Updated Radius Fee for ${activeSide.agents[0].name} to ${currency(value)}.`);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {renderActivitySurface({ preview: true })}
                </div>
              </motion.div>
            )}
           </Card>
          </aside>
        </div>
      </main>

      {/* Confirm / Process */}
      <AlertDialog
        open={showConfirmDialog || showProcessDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmDialog(false);
            setShowProcessDialog(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialogBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary"
              onClick={() => {
                if (showProcessDialog) {
                  setTxStatus("processed");
                  const message = `Commission breakdown for ${PROPERTY_ADDRESS} finalized`;
                  logActivity(message);
                  toast.success(message);
                } else if (role === "team_lead") {
                  setTxStatus("team_lead_confirmed");
                  const message = `Team lead confirmed commission breakdown for ${PROPERTY_ADDRESS}`;
                  logActivity(message);
                  toast.success("Breakdown Confirmed");
                } else {
                  setTxStatus("agent_confirmed");
                  const message = `Agent confirmed commission breakdown for ${PROPERTY_ADDRESS}`;
                  logActivity(message);
                  toast.success("Breakdown Confirmed");
                }
                setRejectionNote("");
                setShowConfirmDialog(false);
                setShowProcessDialog(false);
              }}
            >
              {confirmActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="flex h-[94vh] max-h-[94vh] flex-col gap-0 overflow-hidden border-border bg-background p-0 sm:max-w-[min(96vw,1440px)] [&>[data-slot=dialog-close]]:hidden">
          <DialogHeader className="border-b bg-muted/40 px-7 py-4">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-2xl font-semibold text-slate-800">
                Commission Disbursement Authorization
              </DialogTitle>
              <div className="flex items-center gap-2">
                {isAuditor && (
                  <div className="flex items-center gap-2 mr-4">
                    <span className="text-sm font-medium text-slate-600">CDA Type:</span>
                    <Select value={pdfCdaType} onValueChange={(v) => setPdfCdaType(v as CDAType)}>
                      <SelectTrigger className="w-[180px] h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-transparency">Full Transparency</SelectItem>
                        <SelectItem value="team-hidden">Team Hidden</SelectItem>
                        <SelectItem value="radius-hidden">Radius Hidden</SelectItem>
                        <SelectItem value="full-gross">Full Gross</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button variant="outline" className="h-11 rounded-[10px] px-5 text-[15px] text-slate-700" onClick={() => window.print()}>
                  <Printer className="mr-2 size-4" />
                  Print
                </Button>
                <Button className="h-11 rounded-[10px] bg-blue-600 px-5 text-[15px] hover:bg-blue-700" onClick={() => toast.success("Commission breakdown PDF downloaded")}>
                  <Download className="mr-2 size-4" />
                  Download
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="size-11 rounded-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                    <X className="size-5" />
                    <span className="sr-only">Close PDF preview</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-[clamp(16px,5vw,84px)] py-8">
            <div className="mx-auto w-full max-w-[1020px] rounded-[14px] bg-white px-[clamp(20px,4vw,72px)] py-[clamp(24px,4vw,56px)] shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-start md:justify-between">
                <div className="mx-auto max-w-[520px] text-center md:mx-0 md:flex-1">
                  <h2 className="text-[clamp(28px,3vw,40px)] font-bold uppercase tracking-[0.03em] text-slate-800">
                    Commission Disbursement Authorization
                  </h2>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-500">
                    California Real Estate Transaction
                  </p>
                </div>
                <div className="space-y-1 text-right text-[11px] font-medium text-slate-500">
                  <p><span className="font-semibold text-slate-700">Transaction ID:</span> TXN-DEFIJ</p>
                  <p><span className="font-semibold text-slate-700">Escrow #:</span> ESC-097388</p>
                  <p><span className="font-semibold text-slate-700">Prepared:</span> April 22, 2026</p>
                </div>
              </div>

              <div className="mt-14 space-y-6">
                <Card className="rounded-[14px] border border-black/10 shadow-none p-0 gap-0 block">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <h3 className="text-base font-medium text-black">PDF Preview</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={() => toast.success("Commission breakdown PDF downloaded")}>
                          <Download className="mr-2 size-3.5" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={() => window.print()}>
                          <Printer className="mr-2 size-3.5" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={() => toast.success("PDF regenerated")}>
                          <RefreshCw className="mr-2 size-3.5" />
                          Regenerate PDF
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[10px] border border-black/10 bg-white px-8 py-8">
                      <div className="text-center">
                        <h4 className="text-[28px] font-semibold text-black">Commission Disbursement Authorization</h4>
                        <p className="mt-1 text-sm text-[#717182]">Final Commission Distribution</p>
                      </div>

                      <Separator className="my-6 bg-black/10" />

                      <div className="grid gap-x-4 gap-y-6 md:grid-cols-2">
                        {PDF_PREVIEW_DETAILS.map((item) => (
                          <div key={item.label}>
                            <p className="text-sm text-[#717182]">{item.label}</p>
                            <p className="mt-1 text-sm font-medium text-black">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-6 bg-black/10" />

                      <p className="text-center text-xs text-[#717182]">Finalized: Today, 1:22 PM</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[14px] border border-black/10 shadow-none p-0 gap-0 block">
                  <CardContent className="p-6">
                    <h3 className="text-base font-medium text-black">Final Numbers</h3>
                    <div className="mt-5 space-y-0">
                      {PDF_FINAL_NUMBERS.map((item, index) => (
                        <div key={item.label}>
                          <div className="flex items-start justify-between gap-6 px-3 py-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={cn("text-base font-medium text-slate-700", item.tone)}>{item.label}</p>
                                {item.badge ? (
                                  <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 text-[11px] font-medium", item.badgeClassName)}>
                                    {item.badge}
                                  </Badge>
                                ) : null}
                              </div>
                              {item.description ? (
                                <p className="mt-1 text-xs text-[#717182]">{item.description}</p>
                              ) : null}
                            </div>
                            <p className={cn("pt-0.5 text-base font-medium text-slate-800", item.tone)}>{item.value}</p>
                          </div>
                          {index === 1 || index === 5 ? <Separator className="my-1 bg-black/10" /> : null}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-14 border-t border-slate-200 pt-4 text-center">
                <p className="text-[10px] font-semibold text-slate-500">
                  Prepared by Radius Agent, Inc. • California Licensed Real Estate Brokerage
                </p>
                <p className="mx-auto mt-2 max-w-[760px] text-[8px] leading-[1.5] text-slate-400">
                  This document authorizes payment of earned commission only in accordance with California Real Estate Law and DFPI guidelines.
                  555 Market Street, Suite 1200, San Francisco, CA 94105 • (555) 123-4567 • hello@radiusagent.com • CA DRE #01234567
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return for edits */}
      <Dialog open={showRejectDialog} onOpenChange={(open) => { setShowRejectDialog(open); if (!open) setRejectInput(""); }}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Return for edits</DialogTitle>
            <DialogDescription>Add a note explaining what needs to be changed.</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <textarea
              value={rejectInput}
              onChange={(e) => setRejectInput(e.target.value)}
              placeholder="e.g. Commission basis needs to reflect the updated gross…"
              rows={4}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!rejectInput.trim()}
              onClick={() => {
                const note = rejectInput.trim();
                setTxStatus("draft");
                setRejectionNote(note);
                logActivity(`Auditor edited commission breakdown for ${PROPERTY_ADDRESS}. Request confirmation.`);
                logActivity(`"${note}"`, "comment");
                setRejectInput("");
                setShowRejectDialog(false);
                toast.warning("Returned for confirmation");
              }}
            >
              Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {selectedAgent?.agent.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the agent from {selectedAgent?.side.title}. Their payout allocation will be unassigned. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="size-3.5" />
              Remove agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single fee modal — pre-split or post-split based on feeDialogTiming */}
      <FeeBuilderModal
        open={feeDialogTiming !== null}
        title={feeDialogTitle}
        onOpenChange={(open) => {
          if (!open) {
            setFeeDialogTiming(null);
            setFeeDialogTarget("side");
          }
        }}
        initialData={{ timing: feeDialogTiming ?? "pre-split" }}
        onSave={handleFeeAdded}
        hideTimingField={feeDialogTiming !== null}
        hidePostSplitBase={feeDialogTiming === "pre-split"}
        hideSlidingScale
        existingFeeOptions={availableFeeOptions}
      />

      {/* Credits / Referrals simplified popup (new) */}
      <Dialog open={showCreditReferralDialog} onOpenChange={setShowCreditReferralDialog}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Add Credit or Referral</DialogTitle>
            <DialogDescription>
              Payable to is set in this flow. Wire instructions come later.
            </DialogDescription>
          </DialogHeader>

            <div className="space-y-4 px-6 py-5 text-sm">
              <div>
                <Label className="text-xs">Description</Label>
                <Input placeholder="Referral fee - John Smith" className="mt-1.5" />
              </div>

              <div>
                <Label className="text-xs">Amount</Label>
                <Input placeholder="500" className="mt-1.5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Payable To</Label>
                  <Select value={creditPayableTo} onValueChange={setCreditPayableTo}>
                    <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radius">Radius</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="external">External / Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Payable Name</Label>
                  {creditPayableTo === "external" ? (
                    <Input 
                      placeholder="e.g., Keller Williams Realty" 
                      className="mt-1.5"
                      value={creditPayableName}
                      onChange={(e) => setCreditPayableName(e.target.value)}
                    />
                  ) : (
                    <Input 
                      className="mt-1.5 bg-muted/50 text-muted-foreground cursor-not-allowed border-dashed"
                      value={creditPayableTo === "radius" ? "Radius" : "Brokerage"}
                      readOnly
                      disabled
                    />
                  )}
                </div>
              </div>
            </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowCreditReferralDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowCreditReferralDialog(false);
              toast.success("Credit/Referral added");
            }}>
              Add Credit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Dollar Contribution dialog */}
      <Dialog open={showCDCDialog} onOpenChange={setShowCDCDialog}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Team dollar contribution</DialogTitle>
            <DialogDescription>Learn more about how this value is calculated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-6 py-4">
            <p className="text-sm text-muted-foreground">Team dollar contribution consists of the following things:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>— Team portion of the split</li>
              <li>— Total amount of all pre and post-split deductions paid back to the team</li>
            </ul>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowCDCDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowCDCDialog(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Net Commission dialog */}
      <Dialog open={showNetCommissionDialog} onOpenChange={setShowNetCommissionDialog}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Net commission</DialogTitle>
            <DialogDescription>Learn more about how this value is calculated.</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground">Net commission is the net amount earned by an agent after split and all deductions.</p>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowNetCommissionDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowNetCommissionDialog(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Statement dialog */}
      <Dialog open={showStatementDialog} onOpenChange={(open) => { setShowStatementDialog(open); if (!open) { setStatementNotes(""); setIncludeProgressInfo(false); } }}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Agent statement</DialogTitle>
            <DialogDescription>For: {selectedAgent?.agent.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6 py-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              <textarea
                value={statementNotes}
                onChange={(e) => setStatementNotes(e.target.value)}
                placeholder="Type in notes here"
                rows={4}
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={includeProgressInfo}
                onChange={(e) => setIncludeProgressInfo(e.target.checked)}
                className="size-4 rounded border accent-primary"
              />
              <span className="text-sm text-muted-foreground">Include commission tier progress information</span>
            </label>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowStatementDialog(false)}>Close</Button>
            <Button onClick={() => { toast.success("Statement generated"); setShowStatementDialog(false); }}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Award Distribution dialog */}
      {/* Edit Plan dialog */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Edit Commission Plan</DialogTitle>
            <DialogDescription>Modify plan details for this side.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Plan Name</Label>
                <Input value={editPlanForm.planName} onChange={(e) => setEditPlanForm((f) => ({ ...f, planName: e.target.value }))} className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Agent Split %</Label>
                  <Input value={editPlanForm.agentSplit} inputMode="numeric" onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setEditPlanForm((f) => ({ ...f, agentSplit: v, teamSplit: String(100 - (Number(v) || 0)) })); }} className="h-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Team Split %</Label>
                  <Input value={editPlanForm.teamSplit} inputMode="numeric" onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setEditPlanForm((f) => ({ ...f, teamSplit: v, agentSplit: String(100 - (Number(v) || 0)) })); }} className="h-10" />
                </div>
              </div>
              <p className={`text-xs ${Number(editPlanForm.agentSplit) + Number(editPlanForm.teamSplit) !== 100 ? "text-destructive" : "text-muted-foreground"}`}>
                Split total: {Number(editPlanForm.agentSplit) + Number(editPlanForm.teamSplit)}%{Number(editPlanForm.agentSplit) + Number(editPlanForm.teamSplit) !== 100 ? " — must equal 100%" : ""}
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">{editPlanForm.feeType === "flat" ? "Fixed Fee" : "Fee Percentage"}</Label>
                  <div className="relative">
                    {editPlanForm.feeType === "flat" && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>}
                    <Input value={editPlanForm.feeAmount} inputMode="decimal" className={`h-10 ${editPlanForm.feeType === "flat" ? "pl-7" : "pr-7"}`} onChange={(e) => setEditPlanForm((f) => ({ ...f, feeAmount: e.target.value }))} />
                    {editPlanForm.feeType === "percentage" && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Cap Amount</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input value={editPlanForm.capAmount} inputMode="decimal" className="h-10 pl-7" onChange={(e) => setEditPlanForm((f) => ({ ...f, capAmount: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowEditPlanDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success(`Plan "${editPlanForm.planName}" updated`); setShowEditPlanDialog(false); }}>Save Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Award distribution</DialogTitle>
            <DialogDescription>Set award percentage and flat amount per side of the deal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6 py-4">
            {sidesData.map((side) => (
              <div key={side.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{side.title}</p>
                  <p className="text-xs text-muted-foreground">{side.subline}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="relative">
                    <Input
                      value={awardValues[side.id]}
                      onChange={(e) => setAwardValues((prev) => ({ ...prev, [side.id]: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 }))}
                      className="h-9 w-20 pr-8 text-right text-sm"
                      inputMode="decimal"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">+</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      value={awardAmountValues[side.id]}
                      onChange={(e) => setAwardAmountValues((prev) => ({ ...prev, [side.id]: roundCurrency(Number(e.target.value.replace(/[^0-9.]/g, "")) || 0) }))}
                      className="h-9 w-28 pl-7 text-right text-sm"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowAwardDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              const normalizedAwards = normalizeSideAwards(awardValues);
              setAwardValues(normalizedAwards);
              setSidesData((prev) => prev.map((side) => ({ ...side, award: roundCurrency(normalizedAwards[side.id]) })));
              logActivity("Updated award allocation.");
              toast.success("Award distribution saved");
              setShowAwardDialog(false);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Agent dialog */}
      <Dialog open={showAddAgentDialog} onOpenChange={(open) => { setShowAddAgentDialog(open); if (!open) { setAgentSearch(""); setPendingAgent(null); setAgentAllocations({}); } }}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Add agent</DialogTitle>
            {pendingAgent
              ? <DialogDescription>Allocation of {addAgentSideId} side gross commission between multiple agents.</DialogDescription>
              : <DialogDescription>Search for an agent to add to this side.</DialogDescription>
            }
          </DialogHeader>

          {!pendingAgent ? (
            /* Step 1 — search */
            <div className="px-6 py-4">
              <div className="relative">
                <Input
                  autoFocus
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  placeholder="Search agents…"
                  className="h-10 pr-8"
                />
                {agentSearch && (
                  <button onClick={() => setAgentSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-52 overflow-y-auto rounded-md border">
                {CONTACTS.filter((c) => !agentSearch || c.name.toLowerCase().includes(agentSearch.toLowerCase())).map((contact, i, arr) => (
                  <button
                    key={contact.id}
                    onClick={() => seedPendingAgent(contact)}
                    className={cn("flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-muted/60", i < arr.length - 1 && "border-b")}
                  >
                    <span>{contact.name}</span>
                    <span className="text-xs text-muted-foreground">contact</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    resetExternalAgentForm();
                    setShowExternalAgentDialog(true);
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-[#5A5FF2] hover:bg-[#5A5FF2]/5"
                >
                  + Add external agent manually
                </button>
              </div>
            </div>
          ) : (
            /* Step 2 — allocation */
            <div className="px-6 py-4">
              <div className="mb-3 flex items-center justify-end">
                <span className="text-xs text-muted-foreground">
                  {pendingAgent?.external ? "Manual split required" : <>Sales volume: <span className="font-medium text-primary">Auto-calculated</span></>}
                </span>
              </div>
              {pendingAgent?.external && (
                <div className="mb-3 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2 text-[11px] text-foreground/80">
                  External agent. Auto commission-plan logic stays off. Enter split manually.
                </div>
              )}
              <div className="space-y-3">
                {[...(sidesData.find((s) => s.id === addAgentSideId)?.agents ?? []), { id: pendingAgent.id, name: pendingAgent.name, role: pendingAgent.external ? "External agent" : "Agent", payout: 0, external: pendingAgent.external }].map((agent) => {
                  const pct = agentAllocations[agent.id] ?? 0;
                  return (
                    <div key={agent.id} className="flex items-center gap-3">
                      <p className="w-28 shrink-0 truncate text-sm font-medium">{agent.name.split(" ")[0]} {agent.name.split(" ")[1]?.slice(0, 5) ?? ""}…</p>
                      <div className="relative">
                        <Input
                          value={pct}
                          onChange={(e) => setAgentAllocations((prev) => ({ ...prev, [agent.id]: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 }))}
                          className="h-9 w-24 pr-7 text-right text-sm"
                          inputMode="decimal"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">of shared gross commission</p>
                        <p className="text-xs font-medium">{pct}% of deal price</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => { if (pendingAgent) { setPendingAgent(null); } else { setShowAddAgentDialog(false); } }}>
              {pendingAgent ? "Back" : "Cancel"}
            </Button>
            <Button onClick={() => {
              if (!pendingAgent) return;
              const nextSideAgentIds = [
                ...(sidesData.find((s) => s.id === addAgentSideId)?.agents.map((agent) => agent.id) ?? []),
                pendingAgent.id,
              ];
              const normalizedAllocations = normalizeAgentAllocations(nextSideAgentIds, agentAllocations);
              setSidesData((prev) => prev.map((side) => side.id !== addAgentSideId ? side : {
                ...side,
                agents: [...side.agents, { id: pendingAgent.id, name: pendingAgent.name, role: pendingAgent.external ? "External agent" : "Agent", payout: 0, email: pendingAgent.email, phone: pendingAgent.phone, brokerageName: pendingAgent.brokerageName, brokerageLicenseNumber: pendingAgent.brokerageLicenseNumber, brokerageStreetAddress: pendingAgent.brokerageStreetAddress, brokerageUnit: pendingAgent.brokerageUnit, brokerageCity: pendingAgent.brokerageCity, brokerageState: pendingAgent.brokerageState, brokerageZip: pendingAgent.brokerageZip, representing: pendingAgent.representing, external: pendingAgent.external }],
              }));
              setAgentAllocationPercentages((prev) => ({
                ...prev,
                ...normalizedAllocations,
              }));
              logActivity(`Added ${pendingAgent.name} to ${addAgentSideId === "buyer" ? "Buying Side" : "Listing Side"}.`);
              toast.success(`${pendingAgent.name} added`);
              setShowAddAgentDialog(false);
            }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExternalAgentDialog} onOpenChange={(open) => { setShowExternalAgentDialog(open); if (!open) resetExternalAgentForm(); }}>
        <DialogContent className="gap-0 p-0 sm:max-w-4xl">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>{addAgentSideId === "buyer" ? "Buyer Agent Information" : "Listing Agent Information"}</DialogTitle>
            <DialogDescription>
              Add external agent manually. Keep fields minimal. Radius plan and fee automation stay off.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 py-5">
            <div className="rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2 text-[11px] text-foreground/80">
              If agent is part of Radius, use search list. Use this form only for external agents.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="external-first-name">First Name<span className="text-destructive">*</span></Label>
                <Input id="external-first-name" value={externalAgentForm.firstName} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, firstName: e.target.value }))} placeholder="Ashuthosh" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-last-name">Last Name<span className="text-destructive">*</span></Label>
                <Input id="external-last-name" value={externalAgentForm.lastName} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, lastName: e.target.value }))} placeholder="iOSacc" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-email">Email<span className="text-destructive">*</span></Label>
                <Input id="external-email" value={externalAgentForm.email} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="agent@brokerage.com" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-phone">Phone</Label>
                <Input id="external-phone" value={externalAgentForm.phone} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="177-288-2900" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-license">Agent License Number</Label>
                <Input id="external-license" value={externalAgentForm.agentLicenseNumber} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, agentLicenseNumber: e.target.value }))} placeholder="Agent License Number" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-brokerage">Brokerage Name</Label>
                <Input id="external-brokerage" value={externalAgentForm.brokerageName} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, brokerageName: e.target.value }))} placeholder="Avengers DBA" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-brokerage-license">Brokerage License Number</Label>
                <Input id="external-brokerage-license" value={externalAgentForm.brokerageLicenseNumber} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, brokerageLicenseNumber: e.target.value }))} placeholder="270601052607" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-brokerage-street">Brokerage Street Address</Label>
                <Input id="external-brokerage-street" value={externalAgentForm.brokerageStreetAddress} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, brokerageStreetAddress: e.target.value }))} placeholder="123 Mission Street" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-brokerage-unit">Brokerage Apt/Unit/Suite</Label>
                <Input id="external-brokerage-unit" value={externalAgentForm.brokerageUnit} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, brokerageUnit: e.target.value }))} placeholder="Brokerage Apt/Unit/Suite" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-brokerage-city">Brokerage City</Label>
                <Input id="external-brokerage-city" value={externalAgentForm.brokerageCity} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, brokerageCity: e.target.value }))} placeholder="San Francisco" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-brokerage-state">Brokerage State</Label>
                <Input id="external-brokerage-state" value={externalAgentForm.brokerageState} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, brokerageState: e.target.value }))} placeholder="California" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="external-brokerage-zip">Brokerage Zip Code</Label>
                <Input id="external-brokerage-zip" value={externalAgentForm.brokerageZip} onChange={(e) => setExternalAgentForm((prev) => ({ ...prev, brokerageZip: e.target.value }))} placeholder="94105" className="h-10" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowExternalAgentDialog(false)}>Cancel</Button>
            <Button
              className="bg-[#5A5FF2] text-white hover:bg-[#5A5FF2]/90"
              disabled={!externalAgentForm.firstName.trim() || !externalAgentForm.lastName.trim() || !externalAgentForm.email.trim()}
              onClick={() => {
                const agent: PendingAgent = {
                  id: `ext-${Date.now()}`,
                  name: `${externalAgentForm.firstName.trim()} ${externalAgentForm.lastName.trim()}`.trim(),
                  email: externalAgentForm.email.trim(),
                  phone: externalAgentForm.phone.trim(),
                  brokerageName: externalAgentForm.brokerageName.trim(),
                  brokerageLicenseNumber: externalAgentForm.brokerageLicenseNumber.trim(),
                  brokerageStreetAddress: externalAgentForm.brokerageStreetAddress.trim(),
                  brokerageUnit: externalAgentForm.brokerageUnit.trim(),
                  brokerageCity: externalAgentForm.brokerageCity.trim(),
                  brokerageState: externalAgentForm.brokerageState.trim(),
                  brokerageZip: externalAgentForm.brokerageZip.trim(),
                  representing: addAgentSideId === "buyer" ? "Buyer" : "Seller",
                  external: true,
                };
                seedPendingAgent(agent);
                setShowExternalAgentDialog(false);
                resetExternalAgentForm();
              }}
            >
              Save & Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace plan confirmation */}
      <Dialog open={pendingPlanChange !== null} onOpenChange={(open) => { if (!open) setPendingPlanChange(null); }}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Replace commission plan?</DialogTitle>
            <DialogDescription>
              {pendingPlanChange && (() => {
                const current = commissionPlans.find((p) => p.id === appliedPlans[pendingPlanChange.agentId]);
                return `"${current?.name}" will be replaced with "${pendingPlanChange.plan.name}".`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setPendingPlanChange(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!pendingPlanChange) return;
              setAppliedPlans((p) => ({ ...p, [pendingPlanChange.agentId]: pendingPlanChange.plan.id }));
              logActivity(`Applied commission plan ${pendingPlanChange.plan.name}.`);
              toast.success(`"${pendingPlanChange.plan.name}" applied`);
              setPendingPlanChange(null);
            }}>
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={showActivitySheet} onOpenChange={setShowActivitySheet}>
        <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-xl">
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-[15px] leading-6">Commission Breakdown Comments & Activity</SheetTitle>
                <SheetDescription className="mt-0.5 text-[13px]">All notes and changes for this commission breakdown.</SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={activityView} onValueChange={(value) => setActivityView(value as ActivityView)}>
                  <SelectTrigger className="h-9 rounded-full border-border/80 bg-background px-3 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comments">Comments</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <SheetClose className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="size-4" />
                  <span className="sr-only">Close</span>
                </SheetClose>
              </div>
            </div>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {renderActivitySurface({ inSheet: true })}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showWireSheet} onOpenChange={(open) => { setShowWireSheet(open); if (!open) setWireFormMode("none"); }}>
        <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-xl">
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-[15px] leading-6">Wire Instructions Status</SheetTitle>
                <SheetDescription className="mt-0.5 text-[13px]">Manage wire instructions for team, agents, and external parties on this deal.</SheetDescription>
              </div>
              <SheetClose className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              {wireFormMode === "none" && auditorWireParties.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border/60 p-8 text-center bg-muted/10">
                  <Landmark className="size-10 text-muted-foreground/30 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">No wire instructions added</h3>
                  <p className="mt-1 mb-4 text-xs text-muted-foreground max-w-[280px]">
                    Add wire instructions for the brokerage, agents, and external payees to ensure secure and timely payout.
                  </p>
                  <Button size="sm" className="h-8 rounded-lg text-xs bg-[#5A5FF2] hover:bg-[#5A5FF2]/90" onClick={() => openWireForm("team")}>
                    <Plus className="size-3.5 mr-1.5" />
                    Instructions
                  </Button>
                </div>
              )}
              
              {wireFormMode === "none" && !wireStore.teamWireInstructions?.updatedAt && auditorWireParties.length > 0 && (
                <div className="flex justify-end">
                  <Button size="sm" className="h-8 rounded-lg text-xs bg-[#5A5FF2] hover:bg-[#5A5FF2]/90" onClick={() => openWireForm("team")}>
                    <Plus className="size-3.5 mr-1.5" />
                    Instructions
                  </Button>
                </div>
              )}

              {/* ── Wire Instruction Inline Form ── */}
              {wireFormMode !== "none" && renderWireInstructionForm()}

              {auditorWireParties.map((party) => (
                <Card key={party.id} className="rounded-[14px] border-border py-0 gap-0 shadow-none overflow-hidden">
                  <CardContent className="px-4 py-3">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{party.name}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{party.roleLabel} · {party.detailLabel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {party.complete ? (
                            <Badge variant="secondary" className="border-emerald-200 bg-emerald-50 text-emerald-700">Complete</Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Incomplete - Action needed</Badge>
                          )}
                          <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              aria-label="Edit wire instruction"
                              onClick={() => {
                                if (party.id === "team") {
                                  openWireForm("team");
                                } else if (party.id.startsWith("ext-")) {
                                  openWireForm("external", undefined, party.id.replace("ext-", ""));
                                } else {
                                  const agentId = party.id.split("-").slice(1).join("-");
                                  openWireForm("agent", agentId);
                                }
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                        </div>
                      </div>
                      {party.complete ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Account Holder Name</p>
                            <p className="text-sm text-foreground">{party.record.accountHolderName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Bank Name</p>
                            <p className="text-sm text-foreground">{party.record.bankName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Routing Number</p>
                            <p className="text-sm text-foreground">{maskSensitiveValue(party.record.routingNumber)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Account Number</p>
                            <p className="text-sm text-foreground">{maskSensitiveValue(party.record.accountNumber)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Account Type</p>
                            <p className="text-sm text-foreground">{formatWireAccountType(party.record.accountType)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Address</p>
                            <p className="text-sm text-foreground">{[party.record.bankStreet, party.record.bankCity, party.record.bankState, party.record.bankZip].filter(Boolean).join(", ") || "—"}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Wire details missing for this party.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Gross info dialog */}
      <Dialog open={showGrossInfo} onOpenChange={setShowGrossInfo}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Total gross commission</DialogTitle>
            <DialogDescription>Total commission earned before deductions or agent payouts. Used as starting amount for split math.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t px-6 py-4">
            <Button onClick={() => setShowGrossInfo(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </TooltipProvider>
  );
}

function AddPlanDialog({
  open,
  title,
  form,
  errors,
  onFormChange,
  onAgentSplitChange,
  onTeamSplitChange,
  onUpdateTier,
  onAddTier,
  onRemoveTier,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  title: string;
  form: PlanForm;
  errors: PlanErrors;
  onFormChange: (patch: Partial<PlanForm>) => void;
  onAgentSplitChange: (value: string) => void;
  onTeamSplitChange: (value: string) => void;
  onUpdateTier: (tierId: string, patch: Partial<TierRow>) => void;
  onAddTier: () => void;
  onRemoveTier: (tierId: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  const splitTotal = numericValue(form.agentSplit) + numericValue(form.teamSplit);
  const feeLabel = "Fixed Fee";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex !h-auto !max-h-[82vh] !w-[560px] !max-w-[calc(100vw-48px)] !flex-col !gap-0 !overflow-hidden !rounded-[12px] !p-0 sm:!max-w-[560px] [&>button[data-slot=dialog-close]]:hidden">
        <DialogHeader className="border-b px-6 pt-6 pb-4 !text-left">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-base font-semibold leading-5">{title}</DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                Define split rules, caps, and transaction types for this plan.
              </DialogDescription>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <PlanSetupFields
            form={form}
            errors={errors}
            feeLabel={feeLabel}
            splitTotal={splitTotal}
            onFormChange={onFormChange}
            onAgentSplitChange={onAgentSplitChange}
            onTeamSplitChange={onTeamSplitChange}
            onUpdateTier={onUpdateTier}
            onAddTier={onAddTier}
            onRemoveTier={onRemoveTier}
          />

          <Separator />

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Assign To</Label>
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20">
              {form.selectedAgentIds.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No agents selected</p>
              )}
              {form.selectedAgentIds.map(id => {
                const name = id.startsWith("a")
                  ? initialSides.flatMap(s => s.agents).find(a => a.id === id)?.name
                  : CONTACTS.find(c => c.id === id)?.name;
                return (
                  <Badge key={id} variant="secondary" className="gap-1 pl-2 pr-1 h-6">
                    {name || id}
                    <button onClick={() => onFormChange({ selectedAgentIds: form.selectedAgentIds.filter(aid => aid !== id) })}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                );
              })}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0">
                    <Plus className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Select Agent</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {initialSides.flatMap(s => s.agents).map(agent => (
                    <DropdownMenuItem
                      key={agent.id}
                      disabled={form.selectedAgentIds.includes(agent.id)}
                      onClick={() => onFormChange({ selectedAgentIds: [...form.selectedAgentIds, agent.id] })}
                    >
                      {agent.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <DialogFooter className="!flex !flex-row !items-center !justify-end !gap-3 shrink-0 border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} className="bg-[#5A5FF2] hover:bg-[#5A5FF2]/90">Save Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanSetupFields({
  form,
  errors,
  feeLabel,
  splitTotal,
  onFormChange,
  onAgentSplitChange,
  onTeamSplitChange,
  onUpdateTier,
  onAddTier,
  onRemoveTier,
}: {
  form: PlanForm;
  errors: PlanErrors;
  feeLabel: string;
  splitTotal: number;
  onFormChange: (patch: Partial<PlanForm>) => void;
  onAgentSplitChange: (value: string) => void;
  onTeamSplitChange: (value: string) => void;
  onUpdateTier: (tierId: string, patch: Partial<TierRow>) => void;
  onAddTier: () => void;
  onRemoveTier: (tierId: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="plan-name" className="text-sm font-medium">Plan Name</Label>
        <Input
          id="plan-name"
          value={form.planName}
          placeholder="e.g., 80/20 Standard"
          className="h-10 w-full"
          onChange={(event) => onFormChange({ planName: event.target.value })}
        />
        {errors.planName && <p className="text-xs text-destructive">{errors.planName}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Plan Type</Label>
        <Select value={form.planType} onValueChange={(value) => onFormChange({ planType: value as PlanType })}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="tiered">Tiered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.planType === "standard" ? (
        <>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="agent-split" className="text-sm font-medium">Agent Split %</Label>
              <Input
                id="agent-split"
                value={form.agentSplit}
                inputMode="numeric"
                className="h-10 w-full"
                onChange={(event) => onAgentSplitChange(event.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="team-split" className="text-sm font-medium">Team Split %</Label>
              <Input
                id="team-split"
                value={form.teamSplit}
                inputMode="numeric"
                className="h-10 w-full"
                onChange={(event) => onTeamSplitChange(event.target.value)}
              />
            </div>
          </div>
          <p className={errors.splitTotal ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
            {errors.splitTotal ?? `Split total must equal 100%. Current: ${splitTotal}%`}
          </p>
        </>
      ) : (
        <div className="grid w-full grid-cols-2 gap-4">
          <div className="flex w-full flex-col gap-2">
            <Label className="text-sm font-medium">Reset Period</Label>
            <Select value={form.resetPeriod} onValueChange={(value) => onFormChange({ resetPeriod: value as ResetPeriod })}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Label className="text-sm font-medium">Based On</Label>
            <Select value={form.basedOn} onValueChange={(value) => onFormChange({ basedOn: value as BasedOn })}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="units">Units</SelectItem>
                <SelectItem value="gci">Gross Commission</SelectItem>
                <SelectItem value="sales-volume">Sales Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {form.planType === "tiered" && (
        <>
          <Separator />
          <TierBuilder
            form={form}
            errors={errors}
            onUpdateTier={onUpdateTier}
            onAddTier={onAddTier}
            onRemoveTier={onRemoveTier}
          />
        </>
      )}

      <Separator />

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Fee</Label>
        <Input
          value={(form.feeType ?? "flat") === "flat" ? "Flat" : "Percentage"}
          readOnly
          className="h-10 w-full bg-muted/30 text-foreground"
        />
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="fee-amount" className="text-sm font-medium">
            {(form.feeType ?? "flat") === "flat" ? "Fixed Fee" : "Fee Percentage"}
          </Label>
          <AdornedInput
            id="fee-amount"
            value={form.feeAmount}
            placeholder={(form.feeType ?? "flat") === "flat" ? "495" : "2.5"}
            adornment={(form.feeType ?? "flat") === "flat" ? "$" : "%"}
            adornmentSide={(form.feeType ?? "flat") === "flat" ? "start" : "end"}
            onChange={(value) => onFormChange({ feeAmount: value })}
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="cap" className="text-sm font-medium">Cap Amount</Label>
          <AdornedInput
            id="cap"
            value={form.capAmount}
            placeholder="18000"
            adornment="$"
            onChange={(value) => onFormChange({ capAmount: value })}
          />
        </div>
      </div>
    </>
  );
}

function TierBuilder({
  form,
  errors,
  onUpdateTier,
  onAddTier,
  onRemoveTier,
}: {
  form: PlanForm;
  errors: PlanErrors;
  onUpdateTier: (id: string, patch: Partial<TierRow>) => void;
  onAddTier: () => void;
  onRemoveTier: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Tiers ({form.basedOn === "units" ? "Units" : form.basedOn === "gci" ? "GCI" : "Volume"})</Label>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={onAddTier}>
          <Plus className="size-3 mr-1" /> Add Tier
        </Button>
      </div>
      <div className="space-y-3">
        {form.tiers.map((tier, idx) => (
          <div key={tier.id} className="flex items-start gap-3">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <AdornedInput
                id={`tier-from-${tier.id}`}
                value={tier.from}
                adornment="From"
                onChange={(v) => onUpdateTier(tier.id, { from: v })}
              />
              <AdornedInput
                id={`tier-to-${tier.id}`}
                value={tier.to}
                adornment="To"
                onChange={(v) => onUpdateTier(tier.id, { to: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <AdornedInput
                id={`tier-agent-${tier.id}`}
                value={tier.agentSplit}
                adornment="Agent"
                adornmentSide="end"
                onChange={(v) => onUpdateTier(tier.id, { agentSplit: v })}
              />
              <AdornedInput
                id={`tier-team-${tier.id}`}
                value={tier.teamSplit}
                adornment="Team"
                adornmentSide="end"
                onChange={(v) => onUpdateTier(tier.id, { teamSplit: v })}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveTier(tier.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdornedInput({
  id,
  value,
  placeholder,
  adornment,
  adornmentSide = "start",
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  adornment: string;
  adornmentSide?: "start" | "end";
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      {adornmentSide === "start" && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground/60">
          {adornment}
        </span>
      )}
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full",
          adornmentSide === "start" ? "pl-12" : "pr-8"
        )}
        onChange={(e) => onChange(e.target.value)}
      />
      {adornmentSide === "end" && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground/60">
          {adornment}
        </span>
      )}
    </div>
  );
}
