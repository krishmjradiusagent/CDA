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
  ChevronDown,
  CornerDownRight,
  Eye,
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
import { History, FileText, Paperclip } from "lucide-react";
import { cdaStateStyle, defaultActivityLog, type CdaState, type LogEntry } from "../lib/cda-state";
import { Popover, PopoverContent, PopoverTrigger } from "../components/v4/ui/popover";
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
import { Switch } from "../components/v4/ui/switch";
import { Label } from "../components/v4/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
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
import { CalculationBreakdownTooltip } from "../components/finance/calculation-breakdown-tooltip";
import {
  buildAgentNetLines,
  buildTeamCommissionLines,
  buildTeamDollarLines,
  getSideTotalAmount,
} from "../lib/commission-calc-breakdown";
import {
  createDefaultWireInstructionsStore,
  createEmptyWireInstruction,
  isWireInstructionComplete,
  maskSensitiveValue,
  readWireInstructionsStore,
  validateWireInstruction,
  writeWireInstructionsStore,
  type WireInstructionRecord,
  type WireInstructionsStore,
  type WireValidationErrors,
  type WireAccountType,
  type CDAType,
} from "../lib/wire-instructions";

type SideId = "listing" | "buyer";
type Role = "agent" | "team_lead" | "group_lead" | "radius_auditing" | "soul_auditor";

type Creator = {
  role: "team_lead" | "group_lead";
  id: string;
  name: string;
  groupName?: string;
};

const CURRENT_GROUP_LEAD_ID_CB = "a5";
const CREATOR_TL_CB: Creator = { role: "team_lead", id: "a3", name: "Sarah Jenkins" };
const CREATOR_GL_WEST_CB: Creator = { role: "group_lead", id: "a5", name: "Emma Wilson", groupName: "West" };
const CREATOR_GL_EAST_CB: Creator = { role: "group_lead", id: "a6", name: "James Miller", groupName: "East" };
type Agent = { id: string; name: string; role: string; payout: number; email?: string; avatarUrl?: string; external?: boolean; phone?: string; brokerageName?: string; brokerageLicenseNumber?: string; brokerageStreetAddress?: string; brokerageUnit?: string; brokerageCity?: string; brokerageState?: string; brokerageZip?: string; representing?: string };
type PayableToType = "team" | "agent" | "external";
type WireLinkMode = "external" | "team";
type SideDeduction = { id: string; name: string; amount: number; payableToType?: PayableToType; wireRequired?: boolean; wireMode?: WireLinkMode };
type AgentDeduction = { id: string; name: string; amount: number; payableToType?: PayableToType; isRadiusFee?: boolean; wireRequired?: boolean; wireMode?: WireLinkMode };

const EXTERNAL_WIRE_HELPER_MESSAGE = "Escrow to contact vendor directly for payment instructions.";

function getDeductionBadgeLabel(
  ded: { payableToType?: PayableToType; isRadiusFee?: boolean },
  context: "pre-split" | "post-split" | "gross",
) {
  if (ded.payableToType === "external" || ded.payableToType === "agent") {
    return context === "post-split" ? "Paid by Agent" : "Agent";
  }
  if (ded.payableToType === "team") return "Team";
  if (context === "post-split") return ded.isRadiusFee ? "Paid by Agent" : "Paid by Both";
  return "Deduction";
}

function getDeductionBadgeClassName(ded: { payableToType?: PayableToType }) {
  if (ded.payableToType === "team") return "bg-blue-50 text-blue-700";
  return "bg-muted text-muted-foreground";
}
type Side = {
  id: SideId;
  title: string;
  subline: string;
  award: number;
  gross: number;
  agents: Agent[];
  active: boolean;
  // Teams that want group behavior without full group-lead plan access: the
  // group leader is shown as a labeled node above the agents (not a co-agent).
  groupLead?: { id: string; name: string };
};

type PlanType = "standard" | "tiered";
type FeeType = "flat" | "percentage";
type ResetPeriod = "yearly" | "quarterly" | "monthly" | "never";
type BasedOn = "units" | "gci" | "sales-volume";
type RadiusFeePaidBy = "agent" | "team";

type CommissionPlanOption = {
  id: string;
  name: string;
  detail: string;
  feeType: FeeType;
  feeAmount: number;
  capAmount: number;
  agentSplit: number;
  teamSplit: number;
  radiusFeePaidBy?: RadiusFeePaidBy;
  dealScoped?: boolean;
  createdBy?: Creator;
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
  { id: "p1", name: "80/20 Standard", detail: "80% agent · 20% team", feeType: "flat", feeAmount: 495, capAmount: 18000, agentSplit: 80, teamSplit: 20, radiusFeePaidBy: "agent", createdBy: CREATOR_TL_CB },
  { id: "p2", name: "70/30 Standard", detail: "70% agent · 30% team", feeType: "flat", feeAmount: 495, capAmount: 15000, agentSplit: 70, teamSplit: 30, radiusFeePaidBy: "team", createdBy: CREATOR_TL_CB },
  { id: "p3", name: "Keystone Tiered", detail: "Tiered split plan", feeType: "flat", feeAmount: 0, capAmount: 0, agentSplit: 100, teamSplit: 0, radiusFeePaidBy: "agent", createdBy: CREATOR_GL_WEST_CB },
  { id: "p4", name: "Lease Referral Plan", detail: "60% agent · 40% team", feeType: "flat", feeAmount: 0, capAmount: 0, agentSplit: 60, teamSplit: 40, radiusFeePaidBy: "agent", createdBy: CREATOR_GL_EAST_CB },
];

const DEFAULT_FEE_LIBRARY: ExistingFeeOption[] = [
  { id: "f1", name: "TC Fee", type: "flat", amount: "500", timing: "pre-split", appliesToMode: "team", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split" },
  { id: "f2", name: "RM Fee", type: "flat", amount: "300", timing: "post-split", appliesToMode: "agent", agentIds: ["a1"], slidingScale: false, contributesToCap: true, tiers: [], percentageBase: "pre-split" },
  { id: "f3", name: "E&O Fee", type: "flat", amount: "125", timing: "post-split", appliesToMode: "agent", agentIds: ["a1"], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split" },
  { id: "f4", name: "Compliance Review", type: "flat", amount: "250", timing: "pre-split", appliesToMode: "both", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split" },
];

const FEE_CREATORS: Record<string, Creator> = {
  f1: CREATOR_TL_CB,
  f2: CREATOR_TL_CB,
  f3: CREATOR_GL_WEST_CB,
  f4: CREATOR_TL_CB,
};

function creatorLabelCB(creator: Creator | undefined, currentRole: Role): string | null {
  if (!creator) return null;
  const selfId =
    currentRole === "team_lead" ? "a3" :
    currentRole === "group_lead" ? CURRENT_GROUP_LEAD_ID_CB : null;
  if (selfId != null && creator.id === selfId) return "Created by you";
  if (creator.role === "team_lead") return "Created by Team Lead";
  return `Created by Group Lead${creator.groupName ? ` (${creator.groupName})` : ""}`;
}

function canEditByCreator(creator: Creator | undefined, currentRole: Role): boolean {
  if (currentRole === "team_lead" || currentRole === "radius_auditing" || currentRole === "soul_auditor") return true;
  if (currentRole === "group_lead") return !creator || creator.id === CURRENT_GROUP_LEAD_ID_CB;
  return false;
}

const RADIUS_CAP_AMOUNT = 12000;

const AGENT_CAP_PROGRESS: Record<string, number> = {
  a1: 18000,
  a2: 13250,
  a3: 18000,
  a4: 9600,
  a5: 4100,
  a6: 8400,
  a7: 3200,
  a8: 1100,
};

const AGENT_RADIUS_CAP_PROGRESS: Record<string, number> = {
  a1: 12000,
  a2: 9400,
  a3: 12000,
  a4: 4950,
  a5: 2475,
  a6: 6435,
  a7: 1980,
  a8: 990,
};

const initialSides: Side[] = [
  {
    id: "listing",
    title: "Listing Side",
    subline: "Circle Real Estate",
    award: 1,
    gross: 49500,
    groupLead: { id: "gl1", name: "Andy Martin" },
    agents: [
      { id: "a1", name: "Mark Perez", role: "Primary agent", payout: 29451 },
    ],
    active: true,
  },
  {
    id: "buyer",
    title: "Buying Side",
    subline: "Jeanne Gould",
    award: 0,
    gross: 49500,
    agents: [],
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
const COMMISSION_BREAKDOWN_STORAGE_KEY = "cda-commission-breakdown-v5";

const DEFAULT_POST_SPLIT_DEDUCTIONS: Record<string, AgentDeduction[]> = {
  a1: [
    { id: "d1", name: "File Review Fee", amount: 25, isRadiusFee: true },
    { id: "d2", name: "RERM", amount: 124, isRadiusFee: true },
    { id: "d3", name: "SBTC", amount: 400, wireRequired: true },
    { id: "d4", name: "E&O", amount: 250, wireRequired: true },
    { id: "d5", name: "TC Fee", amount: 500, isRadiusFee: true, wireRequired: true },
    { id: "d6", name: "RM Fee", amount: 300 },
    { id: "d7", name: "Team Admin Fee", amount: 250, payableToType: "team", wireRequired: true, wireMode: "team" },
    { id: "d8", name: "Vendor Referral Fee", amount: 500, payableToType: "agent", wireRequired: true, wireMode: "external" },
  ],
};

function createSeededWireInstructionsStore(teamLeadAgentId: string, agentIds: string[]): WireInstructionsStore {
  const base = createDefaultWireInstructionsStore(teamLeadAgentId, agentIds);
  const now = new Date().toISOString();
  const makeCompleteWire = (id: string, name: string, bankName: string): WireInstructionRecord => ({
    ...createEmptyWireInstruction(id),
    payableName: name,
    accountHolderName: `${name} Payee`,
    email: "payments@vendor.com",
    phone: "(555) 123-4567",
    recipientStreet: "100 Market St",
    recipientCity: "San Francisco",
    recipientState: "CA",
    recipientZip: "94105",
    bankName,
    routingNumber: "121000248",
    accountNumber: "9876543210",
    accountType: "checking",
    updatedAt: now,
  });

  return {
    ...base,
    sharedRecipients: [
      makeCompleteWire("ext-SBTC", "SBTC", "Wells Fargo"),
      makeCompleteWire("ext-E&O", "E&O", "Bank of America"),
    ],
  };
}
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
  radiusCapAmount: number;
  radiusCapUsed: number;
  radiusCapRemaining: number;
  radiusCapApplied: number;
  radiusCapWarning: boolean;
  radiusCapReached: boolean;
  radiusFeePaidBy: RadiusFeePaidBy;
  postCapFee: number;
  postCapFeeApplies: boolean;
  postCapPlanName: string | null;
  postCapPlanTypeText: string | null;
  teamPostCapFee: number;
  teamPostCapFeeApplies: boolean;
  teamPostCapPlanName: string | null;
  teamPostCapPlanTypeText: string | null;
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
  preSplitDeductions: Record<string, AgentDeduction[]>;
  postSplitDeductions: Record<string, AgentDeduction[]>;
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


function mergeSeededSides(persisted: Side[] | undefined | null): Side[] {
  if (!persisted?.length) return initialSides;
  return persisted.map((side) => {
    const seed = initialSides.find((s) => s.id === side.id);
    if (!seed) return side;
    // Keep user edits, but re-apply prototype seed fields that older localStorage
    // snapshots never had (e.g. groupLead tree under Listing Side).
    return {
      ...side,
      groupLead: side.groupLead ?? seed.groupLead,
    };
  });
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
  preSplitDeductions: Record<string, AgentDeduction[]>;
  postSplitDeductions: Record<string, AgentDeduction[]>;
  appliedPlans: Record<string, string | null>;
  agentRadiusFees: Record<string, number>;
  agentAllocationPercentages: Record<string, number>;
  commissionPlans: CommissionPlanOption[];
  appliedPostCapPlans: Record<string, { agent?: string; team?: string }>;
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
      const radiusCapAmount = RADIUS_CAP_AMOUNT;
      const radiusCapUsed = AGENT_RADIUS_CAP_PROGRESS[agent.id] ?? 0;
      const radiusCapRemaining = Math.max(radiusCapAmount - radiusCapUsed, 0);
      const radiusCapApplied = radiusCapAmount > 0 ? Math.min(radiusFee, radiusCapRemaining) : radiusFee;
      const postSplitAgentCommission = clampCurrency(afterPreSplit - split);
      const postSplitDeductionsTotal = (params.postSplitDeductions[agent.id] ?? []).reduce((sum, deduction) => sum + deduction.amount, 0);
      const capReached = capAmount > 0 && capRemaining <= 0;
      const pickedPostCap = params.appliedPostCapPlans[agent.id] ?? {};
      const agentScopePlan = POSTCAP_PLAN_OPTIONS.find((p) => p.scope === "agent" && p.id === (pickedPostCap.agent ?? "pc-agent-default"));
      const teamScopePlan = POSTCAP_PLAN_OPTIONS.find((p) => p.scope === "team" && p.id === (pickedPostCap.team ?? "pc-team-default"));
      function computePostCapFee(pcPlan: PostCapDisplay | undefined) {
        if (!pcPlan) return 0;
        const base = pcPlan.basis === "gross" ? grossCommissionAfterDeductions : postSplitAgentCommission;
        if (pcPlan.feeType === "fixed") return pcPlan.feeAmount;
        if (pcPlan.feeType === "percentage") return base * (pcPlan.feeAmount / 100);
        return base * (pcPlan.feeAmount / 100) + (pcPlan.fixedAmount ?? 0);
      }
      function planTypeText(pcPlan: PostCapDisplay | undefined) {
        if (!pcPlan) return null;
        const basisText = pcPlan.basis === "gross" ? "of gross" : "of gross post-ded.";
        if (pcPlan.feeType === "fixed") return `${currency(pcPlan.feeAmount)} flat`;
        if (pcPlan.feeType === "percentage") return `${pcPlan.feeAmount}% ${basisText}`;
        return `${pcPlan.feeAmount}% ${basisText} + ${currency(pcPlan.fixedAmount ?? 0)} flat`;
      }
      const postCapFee = capReached ? computePostCapFee(agentScopePlan) : 0;
      const teamPostCapFee = capReached ? computePostCapFee(teamScopePlan) : 0;
      const netCommission = clampCurrency(postSplitAgentCommission - postSplitDeductionsTotal - postCapFee);
      const companyDollarContribution = split - radiusFee - teamPostCapFee;

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
        capReached,
        postCapFee,
        postCapFeeApplies: capReached && !!agentScopePlan && postCapFee > 0,
        postCapPlanName: agentScopePlan?.label ?? null,
        postCapPlanTypeText: planTypeText(agentScopePlan),
        teamPostCapFee,
        teamPostCapFeeApplies: capReached && !!teamScopePlan && teamPostCapFee > 0,
        teamPostCapPlanName: teamScopePlan?.label ?? null,
        teamPostCapPlanTypeText: planTypeText(teamScopePlan),
        radiusCapAmount,
        radiusCapUsed,
        radiusCapRemaining,
        radiusCapApplied,
        radiusCapWarning: radiusCapAmount > 0 && radiusCapRemaining > 0 && radiusCapRemaining < radiusFee,
        radiusCapReached: radiusCapAmount > 0 && radiusCapRemaining <= 0,
        radiusFeePaidBy: plan?.radiusFeePaidBy ?? "agent",
      };
    });

    const toAgents = agents.reduce((sum, agent) => sum + agent.netCommission, 0);
    const teamPostCapFeeTotal = agents.reduce((sum, agent) => sum + agent.teamPostCapFee, 0);
    const officeIncome = grossCommissionAfterDeductions - agents.reduce((sum, agent) => sum + agent.postSplitAgentCommission, 0) - teamPostCapFeeTotal;
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

type CapDisplayStatus = "none" | "normal" | "near" | "reached";

function getCapDisplayStatus(capAmount: number, capUsed: number, capRemaining: number, dealContribution: number): CapDisplayStatus {
  if (capAmount <= 0) return "none";
  if (capRemaining <= 0) return "reached";
  if (capRemaining < dealContribution || capUsed / capAmount >= 0.9) return "near";
  return "normal";
}

function AgentCapCard({
  variant,
  label,
  capAmount,
  capUsed,
  capRemaining,
  dealContribution,
  status,
  note,
  postCapFee,
  postCapPlanName,
  postCapOptions,
  onSelectPostCap,
}: {
  variant: "radius" | "team";
  label: string;
  capAmount: number;
  capUsed: number;
  capRemaining: number;
  dealContribution: number;
  status: CapDisplayStatus;
  note?: string;
  postCapFee?: { feeType: "fixed" | "percentage" | "both"; feeAmount: number; fixedAmount?: number; basis: "gross" | "gross-post-deduction" };
  postCapPlanName?: string;
  postCapOptions?: PostCapDisplay[];
  onSelectPostCap?: (id: string | null) => void;
}) {
  const progressValue = capAmount > 0 ? Math.min(100, (capUsed / capAmount) * 100) : 0;
  const CapIcon = variant === "radius" ? Radar : Building2;
  const isReached = status === "reached";
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const feeText = postCapFee
    ? postCapFee.feeType === "both"
      ? `${postCapFee.feeAmount}% ${postCapFee.basis === "gross" ? "of gross" : "of gross post-ded."} + ${currency(postCapFee.fixedAmount ?? 0)} flat`
      : postCapFee.feeType === "percentage"
        ? `${postCapFee.feeAmount}% ${postCapFee.basis === "gross" ? "of gross" : "of gross post-ded."}`
        : `${currency(postCapFee.feeAmount)} flat`
    : null;
  const filteredOptions = (postCapOptions ?? []).filter((o) =>
    !pickerSearch.trim() ? true : o.label.toLowerCase().includes(pickerSearch.trim().toLowerCase()),
  );

  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3 shadow-sm",
        isReached
          ? "border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-white to-[#5A5FF2]/[0.04]"
          : status === "near"
            ? "border-[#5A5FF2]/20 bg-gradient-to-br from-[#5A5FF2]/[0.06] via-white to-amber-50/50"
            : "border-[#5A5FF2]/15 bg-gradient-to-br from-[#5A5FF2]/[0.04] to-white",
      )}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg border",
              variant === "radius"
                ? "border-[#5A5FF2]/20 bg-[#5A5FF2]/10 text-[#5A5FF2]"
                : "border-amber-200/70 bg-amber-50 text-amber-600",
            )}
          >
            <CapIcon className="size-3.5" strokeWidth={2.25} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/70">{label}</p>
        </div>
        {isReached ? (
          <Badge variant="outline" className="h-5 shrink-0 rounded-md border-amber-300/80 bg-amber-50 px-1.5 text-[10px] text-amber-700">
            Capped
          </Badge>
        ) : status === "near" ? (
          <Badge variant="outline" className="h-5 shrink-0 rounded-md border-[#E8A838]/40 bg-amber-50 px-1.5 text-[10px] text-amber-700">
            Near cap
          </Badge>
        ) : null}
      </div>
      {capAmount > 0 ? (
        <>
          {isReached ? (
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold tabular-nums text-foreground">{currency(capAmount)}</span>
              <span className="text-[11px] text-muted-foreground">reached</span>
            </div>
          ) : (
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold tabular-nums text-foreground">{currency(capUsed)}</span>
              <span className="text-[11px] text-muted-foreground">of {currency(capAmount)}</span>
            </div>
          )}
          {isReached ? (
            <div
              className="flex h-2 gap-0.5"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={capAmount}
              aria-valuenow={capUsed}
              aria-label={`${label}: capped, post-cap active`}
            >
              <div className="h-full flex-[0.8] overflow-hidden rounded-l-full bg-amber-400/80" />
              <div
                className="h-full flex-[0.2] overflow-hidden rounded-r-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgb(251 191 36 / 0.85) 0 3px, rgb(251 191 36 / 0.25) 3px 6px)",
                }}
                aria-label="Post-cap zone"
              />
            </div>
          ) : (
            <div
              className="relative h-2 overflow-hidden rounded-full bg-[#5A5FF2]/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={capAmount}
              aria-valuenow={capUsed}
              aria-label={`${label}: ${currency(capUsed)} of ${currency(capAmount)}`}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#5A5FF2] transition-all"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          )}
          {isReached && feeText ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <CircleDollarSign className="size-3.5 shrink-0 text-amber-600/80" strokeWidth={2.25} aria-label="Post-cap fee" />
                      <p className="truncate text-[11px] leading-4 text-muted-foreground">
                        <span className="font-medium text-foreground">{feeText}</span>
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-[11px]">
                    {postCapPlanName ? `Post-cap fee · ${postCapPlanName}` : "Post-cap fee"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {postCapOptions && postCapOptions.length > 0 && onSelectPostCap && (
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 text-[10px] font-medium text-primary hover:underline"
                    >
                      Change
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[280px] p-0">
                    <div className="border-b p-2">
                      <Input
                        autoFocus
                        placeholder="Search post-cap plans…"
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="max-h-[240px] overflow-y-auto">
                      {filteredOptions.length === 0 ? (
                        <p className="px-3 py-4 text-center text-[11px] text-muted-foreground">No plans found</p>
                      ) : (
                        filteredOptions.map((opt) => {
                          const optFeeText =
                            opt.feeType === "both"
                              ? `${opt.feeAmount}% ${opt.basis === "gross" ? "of gross" : "of gross post-ded."} + ${currency(opt.fixedAmount ?? 0)}`
                              : opt.feeType === "percentage"
                                ? `${opt.feeAmount}% ${opt.basis === "gross" ? "of gross" : "of gross post-ded."}`
                                : `${currency(opt.feeAmount)} flat`;
                          const active = postCapPlanName === opt.label;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                onSelectPostCap(opt.id);
                                setPickerOpen(false);
                                setPickerSearch("");
                              }}
                              className={cn(
                                "flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-muted/50",
                                active && "bg-muted/40",
                              )}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-foreground">{opt.label}</p>
                                <p className="truncate text-[10px] text-muted-foreground">{optFeeText}</p>
                              </div>
                              {active && <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              {status === "near"
                ? `This deal adds ${currency(dealContribution)}. ${currency(capRemaining)} left.`
                : `${currency(capRemaining)} remaining · +${currency(dealContribution)} this deal`}
            </p>
          )}
        </>
      ) : (
        <p className="text-[11px] text-muted-foreground">No cap configured</p>
      )}
      {note ? <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground/80">{note}</p> : null}
    </div>
  );
}

type PostCapDisplay = {
  id: string;
  scope: "agent" | "team";
  label: string;
  feeType: "fixed" | "percentage" | "both";
  feeAmount: number;
  fixedAmount?: number;
  basis: "gross" | "gross-post-deduction";
};
const POSTCAP_PLAN_OPTIONS: PostCapDisplay[] = [
  { id: "pc-agent-default", scope: "agent", label: "Radius Post-Cap Fee", feeType: "both", feeAmount: 5, fixedAmount: 495, basis: "gross" },
  { id: "pc-agent-flat", scope: "agent", label: "Radius Post-Cap Flat", feeType: "fixed", feeAmount: 750, basis: "gross" },
  { id: "pc-agent-percent-low", scope: "agent", label: "Radius Post-Cap 3%", feeType: "percentage", feeAmount: 3, basis: "gross" },
  { id: "pc-team-default", scope: "team", label: "Team Post-Cap Fee", feeType: "fixed", feeAmount: 250, basis: "gross" },
  { id: "pc-team-percent", scope: "team", label: "Team Post-Cap 2%", feeType: "percentage", feeAmount: 2, basis: "gross" },
];
const MOCK_POST_CAP = POSTCAP_PLAN_OPTIONS.filter((p) => p.id === "pc-agent-default" || p.id === "pc-team-default");

export function CommissionBreakdown() {
  const [agentComment, setAgentComment] = useState("");
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionCoords, setMentionCoords] = useState<{x: number, y: number} | null>(null);
  type ActivityEntry = { id: string; author: string; role: Role; text: string; timestamp: string; kind: "comment" | "activity"; taggedUserIds?: string[] };
  type ActivityView = "comments" | "activity" | "all";
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([
    { id: "ac1", author: "Jessica Hall", role: "radius_auditing", text: `Commission breakdown draft created for ${PROPERTY_ADDRESS}.`, timestamp: "May 12, 2026 · 10:08 AM", kind: "activity" },
    { id: "ac2", author: "Jessica Hall", role: "radius_auditing", text: "Commission allocation updated for Listing Side to 1%.", timestamp: "May 12, 2026 · 10:14 AM", kind: "activity" },
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
    setWireSelectionMode("manual");
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

  function dropWireForDeduction(dedName: string) {
    const currentStore = readWireInstructionsStore(
      createDefaultWireInstructionsStore(
        CURRENT_TEAM_LEAD_ID,
        Array.from(new Set(sidesData.flatMap((side) => side.agents.map((a) => a.id)).concat([CURRENT_TEAM_LEAD_ID, CURRENT_AGENT_ID]))),
      ),
    );
    const target = dedName.toLowerCase();
    const matches = (r: WireInstructionRecord) =>
      r.id === `ext-${dedName}` ||
      r.payableName?.toLowerCase() === target ||
      r.accountHolderName?.toLowerCase() === target;
    currentStore.sharedRecipients = currentStore.sharedRecipients.filter((r) => !matches(r));
    if (currentStore.privateRecipients) {
      Object.keys(currentStore.privateRecipients).forEach((k) => {
        currentStore.privateRecipients![k] = currentStore.privateRecipients![k].filter((r) => !matches(r));
      });
    }
    writeWireInstructionsStore(currentStore);
    setWireStoreVersion((v) => v + 1);
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
  const [creditDescription, setCreditDescription] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(null);
  const [editingFeeIndex, setEditingFeeIndex] = useState<number | null>(null);
  const [editingPostSplit, setEditingPostSplit] = useState<{ agentId: string; deductionId: string } | null>(null);
  const isEditingDeduction = editingDeductionId !== null;
  const isEditingPayableFee = editingFeeIndex !== null;
  const isEditingPostSplit = editingPostSplit !== null;
  const resetCreditDialog = () => {
    setCreditDescription("");
    setCreditAmount("");
    setCreditPayableTo("external");
    setCreditPayableName("");
    setEditingDeductionId(null);
    setEditingFeeIndex(null);
    setEditingPostSplit(null);
  };

  // Payable-to-Radius fee modal (mirrors magicpath FeeModal)
  type PayableFeeForm = {
    feeName: string;
    feeType: "Flat Fee" | "Percentage";
    flatAmount: string;
    percentAmount: string;
    whenApplied: "Pre-Split" | "Post-Split";
    feePayer: "Team" | "Agent";
    coAgentSplits: "Split equally" | "Proportional to split" | "Higher-cap agent pays";
    slidingScale: boolean;
    contributesToCap: boolean;
  };
  const blankPayableFee = (): PayableFeeForm => ({
    feeName: "",
    feeType: "Flat Fee",
    flatAmount: "",
    percentAmount: "",
    whenApplied: "Post-Split",
    feePayer: "Team",
    coAgentSplits: "Split equally",
    slidingScale: false,
    contributesToCap: false,
  });
  const [showPayableFeeDialog, setShowPayableFeeDialog] = useState(false);
  const [payableFeeForm, setPayableFeeForm] = useState<PayableFeeForm>(blankPayableFee);
  const updatePayableFee = <K extends keyof PayableFeeForm>(key: K, val: PayableFeeForm[K]) =>
    setPayableFeeForm((prev) => ({ ...prev, [key]: val }));
  const [inlineSidePreSplitLabel, setInlineSidePreSplitLabel] = useState("");
  const [inlineSidePreSplitAmount, setInlineSidePreSplitAmount] = useState("");
  // Keep retired hooks stable for dev fast-refresh on this page.
  const [_showInlineAgentPreSplitDraft] = useState(false);
  const [_inlineAgentPreSplitLabel] = useState("");
  const [_inlineAgentPreSplitAmount] = useState("");
  const feeDialogTitle = "Fee Type";

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
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [cdaState, setCdaState] = useState<CdaState>("generated");
  const [cdaVersion, setCdaVersion] = useState(1);
  const [activityLog, setActivityLog] = useState<LogEntry[]>(defaultActivityLog);
  const [logOpen, setLogOpen] = useState(false);
  const [transparency, setTransparency] = useState<"full"|"radius"|"team">("full");
  const [cdaKind, setCdaKind] = useState<"cda"|"gross">("cda");
  const comboLabel = () => `${transparency==="full"?"Full transparency":transparency==="radius"?"Radius hidden":"Team hidden"} + ${cdaKind==="cda"?"CDA":"Gross CDA"}`;
  const [genPickerOpen, setGenPickerOpen] = useState(false);
  const [regenPickerOpen, setRegenPickerOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendTo, setSendTo] = useState<string[]>(["escrow@example.com"]);
  const [sendCc, setSendCc] = useState<string[]>([]);
  const [sendToInput, setSendToInput] = useState("");
  const [sendCcInput, setSendCcInput] = useState("");
  const [sendSubject, setSendSubject] = useState("Commission Disbursement Authorization — 1284 Willow Creek Dr");
  const [sendBody, setSendBody] = useState("Hi,\n\nPlease find attached the Commission Disbursement Authorization for 1284 Willow Creek Dr.\nKindly review and confirm receipt so we can proceed to close on the scheduled COE date.\n\nReach out with any questions.\n\nThanks");
  function pushLog(entry: LogEntry) { setActivityLog(prev => [...prev, entry]); }
  function nowLabel() { return new Date().toLocaleString("en-US", {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}); }
  function handleCdaSend() {
    if(sendTo.length === 0) return;
    const to = sendTo[0];
    const cc = sendCc;
    setCdaState("sent");
    const note = `Emailed to ${to}${cc.length?` · CC ${cc.join(", ")}`:""} · ${comboLabel()}`;
    pushLog({ action:"sent", ts: nowLabel(), actor:"You", version:`v${cdaVersion}`, note });
    toast.success("CDA sent to closing party");
    setSendModalOpen(false);
  }
  function handleCdaRegenWithCombo() {
    const next = cdaVersion + 1;
    setCdaVersion(next);
    setCdaState("generated");
    pushLog({ action:"generated", ts: nowLabel(), actor:"You", version:`v${next}`, note:`Regenerated · ${comboLabel()}` });
    toast.success(`CDA regenerated — ${comboLabel()}`);
    setRegenPickerOpen(false);
  }
  function handleCdaGenerateWithCombo() {
    setCdaVersion(1);
    setCdaState("generated");
    pushLog({ action:"generated", ts: nowLabel(), actor:"You", version:"v1", note:comboLabel() });
    toast.success(`CDA generated — ${comboLabel()}`);
  }
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  function handleCdaDelete() {
    setDeleteConfirmOpen(true);
  }
  function confirmCdaDelete() {
    setCdaState("none");
    setCdaVersion(1);
    pushLog({ action:"none", ts: nowLabel(), actor:"You", note:"CDA deleted" });
    toast.success("CDA deleted — Generate a new one when ready");
    setDeleteConfirmOpen(false);
  }
  const [pdfCdaType, setPdfCdaType] = useState<CDAType | "">("full-transparency");
  const [rejectInput, setRejectInput] = useState("");
  const hasCommentNotification = Boolean(rejectionNote);
  const taggedCommentCount = activityFeed.filter((entry) => entry.kind === "comment" && entry.taggedUserIds?.length).length;
  const [expandedSideAgentId, setExpandedSideAgentId] = useState<string | null>(null);
  const [_showAgentPreSplitDialog] = useState(false);
  const [_agentPreSplitLabel] = useState("");
  const [_agentPreSplitAmount] = useState("");
  const [feeLibrary, setFeeLibrary] = useState<ExistingFeeOption[]>(DEFAULT_FEE_LIBRARY);
  const [preSplitDeductions, setPreSplitDeductions] = useState<Record<string, AgentDeduction[]>>(
    persistedState?.preSplitDeductions ?? {}
  );

  const [sideGrossDeductions, setSideGrossDeductions] = useState<Record<string, SideDeduction[]>>({
    listing: [
      { id: "sg1", name: "Credits", amount: 50 },
      { id: "sg2", name: "Referral", amount: 20 },
    ],
    buyer: [
      { id: "sg1", name: "Credits", amount: 50 },
      { id: "sg2", name: "Referral", amount: 20 },
    ],
  });


  const [postSplitDeductions, setPostSplitDeductions] = useState<Record<string, AgentDeduction[]>>(
    persistedState?.postSplitDeductions ?? DEFAULT_POST_SPLIT_DEDUCTIONS
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
    mergeSeededSides(persistedState?.sidesData)
  );
  const wireStore = useMemo(
    () =>
      readWireInstructionsStore(
        createSeededWireInstructionsStore(
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

  const checkFeeWireStatus = (dedName: string, wireMode: WireLinkMode = "external") => {
    if (wireMode === "team") {
      return isWireInstructionComplete(wireStore.teamWireInstructions, { requireCdaType: false });
    }
    const matching = [...wireStore.sharedRecipients, ...Object.values(wireStore.privateRecipients || {}).flat()].find(
      (r) => r.id === `ext-${dedName}` || (r.payableName?.toLowerCase() === dedName.toLowerCase()) || (r.accountHolderName?.toLowerCase() === dedName.toLowerCase())
    );
    return matching ? isWireInstructionComplete(matching, { requireBankDetails: true }) : false;
  };

  const openFeeWireForm = (dedName: string, wireMode: WireLinkMode = "external") => {
    if (wireMode === "team") {
      openWireForm("team");
      return;
    }
    openWireForm("external", undefined, dedName);
  };

  const ExternalWireInfoIcon = () => {
    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);

    return (
      <Tooltip open={hovered || pinned} onOpenChange={(next) => { if (!next) setPinned(false); }}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="External payment instructions info"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setPinned((prev) => !prev);
            }}
          >
            <Info className="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-xs leading-relaxed" side="top">
          {EXTERNAL_WIRE_HELPER_MESSAGE}
        </TooltipContent>
      </Tooltip>
    );
  };

  const DeductionWireIcon = ({
    dedName,
    wireMode = "external",
    onClick,
  }: {
    dedName: string;
    wireMode?: WireLinkMode;
    onClick: () => void;
  }) => {
    const isFilled = checkFeeWireStatus(dedName, wireMode);

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            className={cn(
              "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer",
              isFilled ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-600" : "bg-[#5A5FF2]/10 hover:bg-[#5A5FF2]/20 text-[#5A5FF2]"
            )} 
            onClick={() => {
              openFeeWireForm(dedName, wireMode);
              onClick();
            }}
          >
            {isFilled ? <CheckCircle2 className="size-3" /> : <Landmark className="size-3" />}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          {isFilled ? "Wire instructions complete. Click to view/edit." : "Add wire instructions"}
        </TooltipContent>
      </Tooltip>
    );
  };

  const DeductionWireStatusIcon = ({
    dedName,
    payableToType,
    wireMode = "external",
    onClick,
  }: {
    dedName: string;
    payableToType?: PayableToType;
    wireMode?: WireLinkMode;
    onClick: () => void;
  }) => {
    const resolvedWireMode = wireMode ?? (payableToType === "team" ? "team" : "external");
    const showInfoHelper = resolvedWireMode === "external" && !checkFeeWireStatus(dedName, resolvedWireMode);

    return (
      <div className="flex items-center gap-0.5">
        <DeductionWireIcon dedName={dedName} wireMode={resolvedWireMode} onClick={onClick} />
        {showInfoHelper && <ExternalWireInfoIcon />}
      </div>
    );
  };

  const resolveDeductionWireMode = (ded: { payableToType?: PayableToType; wireMode?: WireLinkMode }) =>
    ded.wireMode ?? (ded.payableToType === "team" ? "team" : "external");





  const sides = useMemo(
    () => sidesData.map((s) => s.id === selectedSide ? { ...s, active: true } : { ...s, active: false }),
    [sidesData, selectedSide]
  );

  const activeSide = sides.find((s) => s.id === selectedSide) ?? sides[0];
  const [appliedPostCapPlans, setAppliedPostCapPlans] = useState<Record<string, { agent?: string; team?: string }>>({});
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
        appliedPostCapPlans,
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
      appliedPostCapPlans,
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
  const selectedRadiusCapAmount = selectedAgent?.radiusCapAmount ?? 0;
  const selectedRadiusCapUsed = selectedAgent?.radiusCapUsed ?? 0;
  const selectedRadiusCapRemaining = selectedAgent?.radiusCapRemaining ?? 0;
  const selectedRadiusCapApplied = selectedAgent?.radiusCapApplied ?? 0;
  const selectedRadiusCapStatus = getCapDisplayStatus(
    selectedRadiusCapAmount,
    selectedRadiusCapUsed,
    selectedRadiusCapRemaining,
    selectedRadiusCapApplied,
  );
  const selectedTeamCapStatus = getCapDisplayStatus(
    selectedCapAmount,
    selectedCapUsed,
    selectedCapRemaining,
    selectedAgent?.capApplied ?? 0,
  );
  const radiusFeePaidByTeam = selectedAgent?.radiusFeePaidBy === "team";
  const showRadiusFeeToViewer = role !== "agent" || !radiusFeePaidByTeam;

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
    const usesExternalWire = fee.payableToType === "external";
    const payableToType: PayableToType | undefined =
      usesExternalWire || fee.appliesToMode === "agent"
        ? "agent"
        : fee.payableToType === "team" || fee.appliesToMode === "team"
          ? "team"
          : fee.payableToType === "radius"
            ? undefined
            : undefined;
    const wireMode: WireLinkMode | undefined = usesExternalWire
      ? "external"
      : payableToType === "team"
        ? "team"
        : undefined;
    const wireRequired = usesExternalWire ? true : undefined;
    const deductionExtras = { payableToType, ...(wireMode ? { wireMode } : {}), ...(wireRequired ? { wireRequired } : {}) };

    if (fee.timing === "pre-split") {
      if (feeDialogTarget === "agent" && selectedAgentId) {
        setPreSplitDeductions((prev) => ({
          ...prev,
          [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { id: `pre-${Date.now()}`, name: fee.name, amount, ...deductionExtras }],
        }));
        logActivity(`Added ${fee.name} pre-split deduction for ${selectedAgent?.agent.name ?? "agent"}.`);
      } else {
        // Pre-split → side-level gross deductions
        setSideGrossDeductions((prev) => ({
          ...prev,
          [activeSide.id]: [...(prev[activeSide.id] ?? []), { id: `sg-${Date.now()}`, name: fee.name, amount, ...deductionExtras }],
        }));
        logActivity(`Added ${fee.name} pre-split deduction for ${activeSide.title}.`);
      }
    } else if (fee.timing === "post-split" && selectedAgentId) {
      // Post-split → agent-level deductions
      setPostSplitDeductions((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { id: `ps-${Date.now()}`, name: fee.name, amount, ...deductionExtras }],
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
  const [feeBreakdownOverride, setFeeBreakdownOverride] = useState<Array<{ name: string; payer: string; amount: number }> | null>(null);
  const defaultFeeBreakdown = useMemo<Array<{ name: string; payer: string; amount: number }>>(() => {
    if (activeSideRadiusFee <= 0) return [];
    const tc = Math.round(activeSideRadiusFee * 0.6);
    const compliance = activeSideRadiusFee - tc;
    return [
      { name: "Transaction Coordinator Fee", payer: "Team", amount: tc },
      { name: "Compliance Fee", payer: "Agent", amount: compliance },
    ];
  }, [activeSideRadiusFee]);
  const activeSideFeeBreakdown = feeBreakdownOverride ?? defaultFeeBreakdown;
  const radiusFeeRequiredForApproval = derivedBreakdown.sideSummaries.some((sideSummary) => sideSummary.agents.length > 0 && sideSummary.radiusFee <= 0);

  // Permission helpers
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [planForm, setPlanForm] = useState<PlanForm>(getFreshPlanForm());
  const [planErrors, setPlanErrors] = useState<PlanErrors>({});
  const [dealScopedPlans, setDealScopedPlans] = useState<CommissionPlanOption[]>([]);
  const [planFormDirty, setPlanFormDirty] = useState(false);
  const [showDiscardPlanConfirm, setShowDiscardPlanConfirm] = useState(false);

  const isAgent = role === "agent";
  const isTL = role === "team_lead";
  const isAuditor = role === "radius_auditing" || role === "soul_auditor";
  const canEditAll = isAuditor;
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [hasReopened, setHasReopened] = useState(false);
  const [skipApprovalRestart, setSkipApprovalRestart] = useState(false);
  const isLocked = txStatus === "processed" && isAuditor && !hasReopened;
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
  const canAuditorApprove = canConfirmNow;
  const showFullBreakdown = !isAgent;
  const scopedAgentId = isAgent ? CURRENT_AGENT_ID : undefined;
  const transactionGross = DEAL_SALE_PRICE * DEAL_TOTAL_COMMISSION_RATE;
  const visibleSideAgents = isAgent
    ? activeSideAgentSummaries.filter((entry) => entry.agent.id === CURRENT_AGENT_ID)
    : activeSideAgentSummaries;

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
      if (isAuditor && skipApprovalRestart) {
        // Auditor opted to bypass — keep current status, edits apply silently
      } else if (role === "team_lead") {
        setTxStatus(txStatus === "team_lead_confirmed" || txStatus === "processed" ? "agent_confirmed" : txStatus === "rejected" ? "draft" : txStatus);
      } else {
        setTxStatus("draft");
      }    };
  }, [editableSnapshot, txStatus, role, sidesData, sideGrossDeductions, preSplitDeductions, postSplitDeductions, awardValues, awardAmountValues, appliedPlans, agentRadiusFees, agentAllocationPercentages, commissionPlans]);

  function renderWireInstructionForm() {
    return (
      <Sheet open={true} onOpenChange={(open) => {
        if (!open) {
          setWireFormMode("none");
          setOpenWireItemId(null);
        }
      }}>
        <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="border-b px-6 py-4 flex flex-row items-center justify-between shrink-0">
            <SheetTitle className="text-lg font-semibold text-foreground">
              {wireFormMode === "team" ? "Team Wire Instruction" : wireFormMode === "agent" ? "Agent Wire Instruction" : wireFormMode === "external" ? "External Wire Instruction" : "Wire Instruction"}
            </SheetTitle>
            <SheetClose className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">

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
                        setWireSelectionMode("manual");
                        setWireFormErrors({});
                        setWireFormDraft({ ...(wireStore.agentWireInstructions[id] ?? createEmptyWireInstruction()) });
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
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
              </>
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

            {/* Special instructions */}
            <div className="flex flex-col gap-1.5 pb-4">
              <Label className="text-xs font-medium">Special Instructions / Memo</Label>
              <Textarea value={wireFormDraft.specialInstructions} onChange={(e) => setWireFormDraft((d) => ({ ...d, specialInstructions: e.target.value }))} className="min-h-[60px] text-sm" placeholder="Optional memo or reference" />
            </div>
          </>
        )}
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/30 shrink-0">
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => { setWireFormMode("none"); setOpenWireItemId(null); }}>Cancel</Button>
            <Button size="sm" className="h-8 rounded-lg text-xs bg-[#5A5FF2] hover:bg-[#5A5FF2]/90 text-white" onClick={saveWireForm} disabled={wireSelectionMode === undefined}>Save Instructions</Button>
          </div>
        </SheetContent>
      </Sheet>
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
                {role === "agent" ? <User className="size-3.5" /> : role === "team_lead" || role === "group_lead" ? <Users className="size-3.5" /> : <Shield className="size-3.5" />}
                {role === "agent" ? "Agent view" : role === "team_lead" ? "Team Lead view" : role === "group_lead" ? "Group Lead view" : role === "soul_auditor" ? "SOUL Auditor view" : "Auditor view"}
                <ChevronRight className="size-3 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["agent", "team_lead", "group_lead", "radius_auditing", "soul_auditor"] as Role[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRole(r)} className={cn(role === r && "bg-accent")}>
                  <div className="flex items-center gap-2">
                    {r === "agent" ? <User className="size-3.5" /> : r === "team_lead" || r === "group_lead" ? <Users className="size-3.5" /> : <Shield className="size-3.5" />}
                    <span>{r === "agent" ? "Agent view" : r === "team_lead" ? "Team Lead view" : r === "group_lead" ? "Group Lead view" : r === "soul_auditor" ? "SOUL Auditor view" : "Auditor view"}</span>
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
            {isAuditor && txStatus !== "processed" && (
              <Button
                size="sm"
                className="h-8 shrink-0 rounded-lg px-4 text-xs"
                disabled={!canAuditorApprove}
                onClick={() => setShowProcessDialog(true)}
              >
                Finalize
              </Button>
            )}
            {isAuditor && txStatus === "processed" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 shrink-0 rounded-lg p-0"
                  title="Download signed CDA"
                  onClick={() => toast.success("Signed CDA downloaded")}
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 shrink-0 rounded-lg p-0"
                  title="View CDA"
                  onClick={() => { setPdfCdaType(wireStore.teamWireInstructions.cdaType || "full-transparency"); setShowPdfPreview(true); }}
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  size="sm"
                  className="h-8 shrink-0 gap-1 rounded-lg px-2 text-xs"
                  title="Send CDA (pick layout)"
                  onClick={() => setShowSendConfirm(true)}
                >
                  <Send className="size-3.5" />
                  <ChevronDown className="size-3" />
                </Button>
              </>
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
        {txStatus === "processed" && isAuditor && !hasReopened && (
          <div className="border-b bg-background px-6 py-3">
            <Alert className="items-center border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:translate-y-0">
              <Shield className="text-emerald-700" />
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3 text-emerald-900">
                <span>
                  <span className="font-semibold">Commission breakdown finalized.</span>{" "}
                  Need to change something? Reopening will restart the approval flow.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg border-emerald-300 bg-white px-3 text-xs text-emerald-800 hover:bg-emerald-50"
                  onClick={() => setShowReopenDialog(true)}
                >
                  Reopen for edits
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        {hasReopened && txStatus !== "processed" && (
          <div className="border-b bg-background px-6 py-3">
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <RefreshCw className="text-amber-700" />
              <AlertDescription className="text-amber-800">
                <span className="font-semibold">Reopened for edits.</span>{" "}
                Make your changes — the breakdown will need to be re-approved by Agent, Team Lead, and Auditor before it's finalized again.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ── CDA state strip ── */}
        <div className="border-b bg-background px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">CDA Status</span>
            <Badge variant="outline" className={`rounded-lg px-2.5 py-0.5 text-[11.5px] font-semibold border ${cdaStateStyle(cdaState).cls}`}>
              {cdaStateStyle(cdaState).label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {cdaState === "none" && isAuditor && (
              <Popover open={genPickerOpen} onOpenChange={setGenPickerOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" className="h-8 rounded-lg px-3 text-xs">
                    Generate CDA<ChevronDown className="ml-1 size-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[280px] p-2">
                  <CdaComboPicker
                    transparency={transparency} setTransparency={setTransparency}
                    cdaKind={cdaKind} setCdaKind={setCdaKind}
                    onConfirm={() => { handleCdaGenerateWithCombo(); setGenPickerOpen(false); }}
                    confirmLabel="Generate"
                  />
                </PopoverContent>
              </Popover>
            )}
            {cdaState === "none" && !isAuditor && (
              <span className="text-[11.5px] text-muted-foreground italic">Awaiting Auditor to generate CDA</span>
            )}
            {cdaState === "generated" && (
              <Button size="sm" className="h-8 rounded-lg px-3 text-xs" onClick={() => setSendModalOpen(true)}>
                <Send className="mr-1.5 size-3.5" />Send CDA
              </Button>
            )}
            {cdaState !== "none" && cdaState !== "signed" && (
              <Popover open={regenPickerOpen} onOpenChange={setRegenPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg px-3 text-xs">
                    <RefreshCw className="mr-1.5 size-3.5" />Regenerate<ChevronDown className="ml-1 size-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[280px] p-2">
                  <CdaComboPicker
                    transparency={transparency} setTransparency={setTransparency}
                    cdaKind={cdaKind} setCdaKind={setCdaKind}
                    onConfirm={handleCdaRegenWithCombo}
                    confirmLabel="Regenerate"
                  />
                </PopoverContent>
              </Popover>
            )}
            {cdaState !== "none" && cdaState !== "signed" && (
              <Button variant="outline" size="sm" className="h-8 rounded-lg px-3 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={handleCdaDelete}>
                <Trash2 className="mr-1.5 size-3.5" />Delete
              </Button>
            )}
          </div>
        </div>

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
                                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0 text-[11px] font-medium border-[#5A5FF2] text-[#5A5FF2] bg-transparent",
                                    !isAgent && !isLocked && "cursor-pointer hover:opacity-80"
                                  )}
                                  onClick={!isAgent && !isLocked ? (e) => { e.stopPropagation(); setShowAwardDialog(true); } : undefined}
                                >
                                  {roundCurrency(derivedBreakdown.normalizedAwards[side.id] ?? 0)}% commission
                                  {!isAgent && !isLocked && <ChevronRight className="size-3 shrink-0 opacity-70" />}
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
                                <p className="text-xl font-bold tracking-tight tabular-nums">
                                  {currency(
                                    sideSummary
                                      ? getSideTotalAmount(sideSummary, showFullBreakdown, scopedAgentId)
                                      : 0,
                                  )}
                                </p>
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
                        <div className="px-5 pb-5">
                          {side.groupLead && side.agents.filter((agent) => !isAgent || agent.id === CURRENT_AGENT_ID).length > 0 && (
                            <div className="mb-2.5 mt-2 flex items-center gap-1.5 pl-2">
                              <CornerDownRight className="size-4 shrink-0 text-[#5A5FF2]" />
                              <span className="text-sm font-semibold text-foreground">{side.groupLead.name}</span>
                              <Badge variant="outline" className="ml-1 h-5 rounded-full border-[#5A5FF2]/40 bg-[#5A5FF2]/5 px-2 text-[10px] font-medium text-[#5A5FF2]">Group Lead</Badge>
                            </div>
                          )}
                          <div className="mt-1 space-y-2">
                            {side.agents.filter((agent) => !isAgent || agent.id === CURRENT_AGENT_ID).map((agent) => {
                              const agentSummary = sideSummary?.agents.find((entry) => entry.agent.id === agent.id);
                              return (
                              <div key={agent.id} className={cn(side.groupLead ? "flex items-stretch gap-3" : "")}>
                                {side.groupLead && (
                                  <div className="relative w-3 shrink-0">
                                    <span aria-hidden className="pointer-events-none absolute left-[11px] top-1 bottom-0 w-px bg-[#5A5FF2]/35" />
                                  </div>
                                )}
                              <div
                                data-connector-anchor={`agent-${agent.id}`}
                                role="button" tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); setSelectedSide(side.id); setSelectedAgentId(agent.id); }}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setSelectedSide(side.id); setSelectedAgentId(agent.id); } }}
                                className={cn(
                                  "flex cursor-pointer items-center justify-between gap-4 px-4 py-3 min-h-[64px] rounded-lg outline-none transition-colors",
                                  side.groupLead && "min-w-0 flex-1",
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
                    {/* Apply plan — dropdown (team_lead + auditors) */}
                    {role !== "agent" && !selectedAgentIsExternal ? (
                      <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("h-7 rounded-lg px-3 text-xs gap-1", !appliedPlans[selectedAgent.agent.id] && "text-muted-foreground")}>
                            {(() => {
                              const applied = appliedPlans[selectedAgent.agent.id];
                              const plan = applied ? [...commissionPlans, ...dealScopedPlans].find((p) => p.id === applied) : null;
                              return (
                                <span className="flex items-center gap-1.5">
                                  {plan ? plan.name : "No plan selected"}
                                  {plan?.dealScoped && (
                                    <span className="inline-flex h-4 items-center rounded-full bg-muted px-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Deal-only</span>
                                  )}
                                </span>
                              );
                            })()}
                            <ChevronRight className="size-3 rotate-90" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Commission plans</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {[...commissionPlans, ...dealScopedPlans].map((plan) => (
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
                              <div className="flex w-full items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{plan.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {[creatorLabelCB(plan.createdBy, role), plan.detail].filter(Boolean).join(" · ")}
                                  </p>
                                </div>
                                {plan.dealScoped && (
                                  <span className="inline-flex h-4 shrink-0 items-center rounded-full bg-muted px-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Deal-only</span>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setPlanForm({
                                ...getFreshPlanForm(),
                                selectedAgentIds: [selectedAgent.agent.id],
                              });
                              setPlanErrors({});
                              setPlanFormDirty(false);
                              setShowAddPlanDialog(true);
                            }}
                          >
                            <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                              <Plus className="size-3.5" /> Create plan for this deal
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {(() => {
                        const applied = appliedPlans[selectedAgent.agent.id];
                        const plan = applied ? dealScopedPlans.find((p) => p.id === applied) : null;
                        if (!plan) return null;
                        if (!canEditByCreator(plan.createdBy, role)) return null;
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label="Edit deal-only plan"
                            className="h-7 w-7 rounded-lg p-0"
                            onClick={() => {
                              setPlanForm({
                                editingPlanId: plan.id,
                                planName: plan.name,
                                planType: "flat",
                                agentSplit: String(plan.agentSplit),
                                teamSplit: String(plan.teamSplit),
                                resetPeriod: "annually",
                                basedOn: "gross_commission",
                                feeType: plan.feeType,
                                feeAmount: String(plan.feeAmount),
                                capAmount: String(plan.capAmount),
                                applyAsDefault: false,
                                selectedAgentIds: [selectedAgent.agent.id],
                                tiers: [],
                              });
                              setPlanErrors({});
                              setPlanFormDirty(false);
                              setShowAddPlanDialog(true);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        );
                      })()}
                      </>
                    ) : null}
                    {selectedAgentIsExternal && (
                      <Badge variant="outline" className="h-7 rounded-lg border-primary/20 bg-primary/5 px-2.5 text-[11px] font-medium text-primary">
                        Manual agent
                      </Badge>
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
                          setPlanErrors({});
                          setPlanFormDirty(false);
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
                  {!selectedAgentIsExternal && appliedPlans[selectedAgent.agent.id] && (() => {
                    const agentPicked = appliedPostCapPlans[selectedAgent.agent.id];
                    const agentScopeSelection = agentPicked?.agent
                      ? POSTCAP_PLAN_OPTIONS.find((p) => p.id === agentPicked.agent && p.scope === "agent")
                      : undefined;
                    const teamScopeSelection = agentPicked?.team
                      ? POSTCAP_PLAN_OPTIONS.find((p) => p.id === agentPicked.team && p.scope === "team")
                      : undefined;
                    const radiusFee = agentScopeSelection ?? POSTCAP_PLAN_OPTIONS.find((p) => p.scope === "agent" && p.id === "pc-agent-default");
                    const teamFee = teamScopeSelection ?? POSTCAP_PLAN_OPTIONS.find((p) => p.scope === "team" && p.id === "pc-team-default");
                    return (
                      <div className="mb-4 grid gap-2 sm:grid-cols-2">
                        <AgentCapCard
                          variant="radius"
                          label="Radius Cap"
                          capAmount={selectedRadiusCapAmount}
                          capUsed={selectedRadiusCapUsed}
                          capRemaining={selectedRadiusCapRemaining}
                          dealContribution={selectedRadiusCapApplied}
                          status={selectedRadiusCapStatus}
                          note={radiusFeePaidByTeam && role === "agent" ? "Radius fee paid by team — folded into team commission." : undefined}
                          postCapFee={radiusFee}
                          postCapPlanName={radiusFee?.label}
                          postCapOptions={POSTCAP_PLAN_OPTIONS.filter((p) => p.scope === "agent")}
                          onSelectPostCap={(id) => {
                            setAppliedPostCapPlans((prev) => ({
                              ...prev,
                              [selectedAgent.agent.id]: { ...prev[selectedAgent.agent.id], agent: id ?? undefined },
                            }));
                            if (id) {
                              const plan = POSTCAP_PLAN_OPTIONS.find((p) => p.id === id);
                              toast.success(`"${plan?.label}" applied to ${selectedAgent.agent.name}`);
                            } else {
                              toast.success(`Radius post-cap reset to default`);
                            }
                          }}
                        />
                        <AgentCapCard
                          variant="team"
                          label="Team Cap"
                          capAmount={selectedCapAmount}
                          capUsed={selectedCapUsed}
                          capRemaining={selectedCapRemaining}
                          dealContribution={selectedAgent.capApplied}
                          status={selectedTeamCapStatus}
                          postCapFee={teamFee}
                          postCapPlanName={teamFee?.label}
                          postCapOptions={POSTCAP_PLAN_OPTIONS.filter((p) => p.scope === "team")}
                          onSelectPostCap={(id) => {
                            setAppliedPostCapPlans((prev) => ({
                              ...prev,
                              [selectedAgent.agent.id]: { ...prev[selectedAgent.agent.id], team: id ?? undefined },
                            }));
                            if (id) {
                              const plan = POSTCAP_PLAN_OPTIONS.find((p) => p.id === id);
                              toast.success(`"${plan?.label}" applied to ${selectedAgent.agent.name}`);
                            } else {
                              toast.success(`Team post-cap reset to default`);
                            }
                          }}
                        />
                      </div>
                    );
                  })()}
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
                            <DeductionWireStatusIcon dedName={ded.name} payableToType={ded.payableToType} onClick={() => setOpenWireItemId(openWireItemId === ded.id ? null : ded.id)} />
                            <span className={cn(
                              "rounded px-1 py-0 text-[10px] font-medium",
                              getDeductionBadgeClassName(ded),
                            )}>{getDeductionBadgeLabel(ded, "pre-split")}</span>
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
                      <Plus className="size-3.5 mr-1" />Add credit or referral
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
                  {selectedAgent.teamPostCapFeeApplies && (
                    <div className="-mt-1 flex items-center justify-between pb-2 pl-3 text-[11px] text-muted-foreground">
                      <span>
                        Team post-cap fee
                        {selectedAgent.teamPostCapPlanTypeText && (
                          <span className="ml-1 text-muted-foreground/70">· {selectedAgent.teamPostCapPlanTypeText}</span>
                        )}
                      </span>
                      <span className="tabular-nums">−{currency(selectedAgent.teamPostCapFee)}</span>
                    </div>
                  )}
                  {showRadiusFeeToViewer && (
                    <>
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
                    </>
                  )}

                  {selectedAgent.postCapFeeApplies && (
                    <>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post-cap fee</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedAgent.postCapPlanName}
                            {selectedAgent.postCapPlanTypeText && (
                              <>
                                <span className="mx-1.5 text-muted-foreground/50">·</span>
                                {selectedAgent.postCapPlanTypeText}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="min-w-[120px] text-right">
                          <EditableValue value={selectedAgent.postCapFee} onChange={() => undefined} readOnly />
                        </div>
                      </div>
                      <Separator className="my-3" />
                    </>
                  )}

                  {/* Post-split deductions */}
                  <div className="py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post-split deductions</p>
                  </div>
                  {(postSplitDeductions[selectedAgent.agent.id] ?? [])
                    .filter((ded) => showRadiusFeeToViewer || !ded.isRadiusFee)
                    .map((ded) => {
                    const dedReadOnly = isLocked;
                    const canDelete = !isLocked;
                    return (
                      <React.Fragment key={ded.id}>
                        <div className="group flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground">{ded.name}</p>
                            {ded.wireRequired && (
                              <DeductionWireStatusIcon
                                dedName={ded.name}
                                payableToType={ded.payableToType}
                                wireMode={resolveDeductionWireMode(ded)}
                                onClick={() => setOpenWireItemId(openWireItemId === ded.id ? null : ded.id)}
                              />
                            )}
                            <span className={cn(
                              "rounded px-1 py-0 text-[10px] font-medium",
                              getDeductionBadgeClassName(ded),
                            )}>{getDeductionBadgeLabel(ded, "post-split")}</span>
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
                              <>
                                <button
                                  onClick={() => {
                                    setEditingPostSplit({ agentId: selectedAgent.agent.id, deductionId: ded.id });
                                    setCreditDescription(ded.name);
                                    setCreditAmount(String(ded.amount));
                                    setCreditPayableTo("radius");
                                    setCreditPayableName("Radius");
                                    setShowCreditReferralDialog(true);
                                  }}
                                  className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-[#5A5FF2] group-hover:inline-flex items-center justify-center"
                                  tabIndex={-1}
                                  aria-label={`Edit ${ded.name}`}
                                >
                                  <Pencil className="size-3" />
                                </button>
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
                                  aria-label={`Remove ${ded.name}`}
                                >
                                  <X className="size-3" />
                                </button>
                              </>
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

                  {/* Payable to Radius — fees added from magicpath */}
                  {activeSideFeeBreakdown.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payable to Radius</p>
                      <ul className="space-y-0">
                      {activeSideFeeBreakdown.map((f, i) => (
                        <li key={i} className="group flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground">{f.name}</p>
                            <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">{f.payer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tabular-nums underline underline-offset-2 text-[#5A5FF2]">{currency(f.amount)}</span>
                            {isAuditor && !isLocked && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFeeIndex(i);
                                  setPayableFeeForm({
                                    ...blankPayableFee(),
                                    feeName: f.name,
                                    feeType: "Flat Fee",
                                    flatAmount: String(f.amount),
                                    feePayer: f.payer === "Team" ? "Team" : "Agent",
                                  });
                                  setShowPayableFeeDialog(true);
                                }}
                                className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-[#5A5FF2] group-hover:inline-flex items-center justify-center"
                                tabIndex={-1}
                                aria-label={`Edit ${f.name}`}
                              >
                                <Pencil className="size-3" />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                      </ul>
                    </>
                  )}

                  {/* Radius fee nudge strip */}
                  {showRadiusFeeToViewer && canEditAll && !isLocked && !(postSplitDeductions[selectedAgent.agent.id] ?? []).some((d) => d.isRadiusFee) && (
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
                    <div className="flex min-w-[120px] items-center justify-end gap-1 text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {currency(selectedAgent.netCommission)}
                      </p>
                      <CalculationBreakdownTooltip
                        title="Net commission"
                        tone="payout"
                        lines={buildAgentNetLines(
                          selectedAgent,
                          preSplitDeductions[selectedAgent.agent.id] ?? [],
                          postSplitDeductions[selectedAgent.agent.id] ?? [],
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Commission</p>
                    <div className="flex min-w-[120px] items-center justify-end gap-1 text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {currency(selectedAgent.companyDollarContribution)}
                      </p>
                      <CalculationBreakdownTooltip
                        title="Team commission"
                        tone="payout"
                        lines={buildTeamDollarLines(selectedAgent)}
                      />
                    </div>
                  </div>

                  {(role === "team_lead" || role === "group_lead" || role === "radius_auditing" || role === "soul_auditor") && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between py-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Group Commission</p>
                        <div className="flex min-w-[120px] items-center justify-end gap-1 text-right">
                          <p className="text-sm font-semibold tabular-nums text-foreground">
                            {currency(Math.round(selectedAgent.companyDollarContribution * 0.25))}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
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
                      {
                        label: "Gross",
                        value: currency(grossIncome),
                        icon: TrendingUp,
                        gradient: "linear-gradient(135deg, #c7d2fe, #a5b4fc)",
                        muted: "#6366f1",
                        strong: "#1e1b4b",
                      },
                      {
                        label: "After Deductions",
                        value: currency(grossCommissionAfterDeductions),
                        icon: CircleDollarSign,
                        gradient: "linear-gradient(135deg, #ddd6fe, #c4b5fd)",
                        muted: "#7c3aed",
                        strong: "#2e1065",
                      },
                      {
                        label: "To Agents",
                        value: currency(
                          showFullBreakdown
                            ? totalAgentPayout
                            : (activeSideSummary?.agents.find((entry) => entry.agent.id === scopedAgentId)?.netCommission ?? 0),
                        ),
                        icon: User,
                        gradient: "linear-gradient(135deg, #bbf7d0, #86efac)",
                        muted: "#16a34a",
                        strong: "#14532d",
                      },
                      {
                        label: "To Team",
                        value: currency(activeSideOfficeShare),
                        icon: Building2,
                        gradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
                        muted: "#d97706",
                        strong: "#451a03",
                      },
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
                          {ded.amount > 0 && (
                            <DeductionWireStatusIcon
                              dedName={ded.name}
                              payableToType={ded.payableToType}
                              wireMode={resolveDeductionWireMode(ded)}
                              onClick={() => setOpenWireItemId(openWireItemId === ded.id ? null : ded.id)}
                            />
                          )}
                          <span className={cn(
                            "rounded px-1 py-0 text-[10px] font-medium",
                            getDeductionBadgeClassName(ded),
                          )}>{getDeductionBadgeLabel(ded, "gross")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(!isLocked && (isAgent || isTL || canEditAll)) ? (
                            <DeductionValue
                              value={ded.amount}
                              readOnly={false}
                              onChange={(v) => {
                                if (v === 0) {
                                  setSideGrossDeductions((prev) => ({
                                    ...prev,
                                    [activeSide.id]: (prev[activeSide.id] ?? []).filter((d) => d.id !== ded.id),
                                  }));
                                  dropWireForDeduction(ded.name);
                                  logActivity(`Removed ${ded.name} from ${activeSide.title}.`);
                                  return;
                                }
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
                            <>
                              <button
                                onClick={() => {
                                  setEditingDeductionId(ded.id);
                                  setCreditDescription(ded.name);
                                  setCreditAmount(String(ded.amount));
                                  setCreditPayableTo("radius");
                                  setCreditPayableName("Radius");
                                  setShowCreditReferralDialog(true);
                                }}
                                className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-[#5A5FF2] group-hover:inline-flex items-center justify-center"
                                tabIndex={-1}
                                aria-label={`Edit ${ded.name}`}
                              >
                                <Pencil className="size-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setSideGrossDeductions((prev) => ({
                                    ...prev,
                                    [activeSide.id]: (prev[activeSide.id] ?? []).filter((d) => d.id !== ded.id),
                                  }));
                                  dropWireForDeduction(ded.name);
                                  logActivity(`Removed ${ded.name} from ${activeSide.title}.`);
                                }}
                                className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-destructive group-hover:inline-flex items-center justify-center"
                                tabIndex={-1}
                                aria-label={`Remove ${ded.name}`}
                              >
                                <X className="size-3" />
                              </button>
                            </>
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
                      <Plus className="size-3.5 mr-1" />Add credit or referral
                    </Button>
                  </div>
                  )}
                  {canEditAll && !isLocked && (
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
                      <Plus className="size-3.5 mr-1" />Add pre-split deduction
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
                    {visibleSideAgents.map((agentSummary) => {
                      const { agent, netCommission, preSplitDeductionsTotal, postSplitDeductionsTotal } = agentSummary;
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
                              {activeSideRadiusFee > 0 && activeSideFeeBreakdown.length > 0 && agent.id === activeSide.agents[0]?.id && (
                                <div className="mt-2 border-t pt-2">
                                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payable to Radius</p>
                                  <ul className="space-y-1">
                                    {activeSideFeeBreakdown.map((f, i) => (
                                      <li key={i} className="group flex items-center justify-between gap-3 text-xs py-0.5">
                                        <div className="flex min-w-0 items-center gap-2">
                                          <span className="font-medium text-foreground">{f.name}</span>
                                          <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">{f.payer}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="tabular-nums font-semibold underline underline-offset-2 text-[#5A5FF2]">{currency(f.amount)}</span>
                                          {isAuditor && !isLocked && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingFeeIndex(i);
                                                setPayableFeeForm({
                                                  ...blankPayableFee(),
                                                  feeName: f.name,
                                                  feeType: "Flat Fee",
                                                  flatAmount: String(f.amount),
                                                  feePayer: f.payer === "Team" ? "Team" : "Agent",
                                                });
                                                setShowPayableFeeDialog(true);
                                              }}
                                              className="hidden size-4 shrink-0 text-muted-foreground/40 hover:text-[#5A5FF2] group-hover:inline-flex items-center justify-center"
                                              tabIndex={-1}
                                              aria-label={`Edit ${f.name}`}
                                            >
                                              <Pencil className="size-3" />
                                            </button>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Net commission</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Total paid to agents on this side</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold tabular-nums text-foreground">{currency(totalAgentPayout)}</p>
                      </div>
                    </div>
                    {(canEditAll || activeSideRadiusFee > 0) && (
                      <div className="rounded-xl border bg-card px-4 py-3.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-muted-foreground">
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="12" r="6" strokeDasharray="6 4" />
                                <circle cx="12" cy="12" r="10" strokeDasharray="8 4" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">Radius commission</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold tabular-nums text-foreground">{currency(activeSideRadiusFee)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Team commission</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">After pre-split deductions and agent payouts</p>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-right">
                        <p className="text-base font-bold tabular-nums text-foreground">{currency(officeNet)}</p>
                        {activeSideSummary && (
                          <CalculationBreakdownTooltip
                            title="Team commission"
                            tone="payout"
                            lines={buildTeamCommissionLines(
                              activeSideSummary,
                              sideGrossDeductions[activeSide.id] ?? [],
                            )}
                          />
                        )}
                      </div>
                    </div>
                    {(role === "team_lead" || role === "group_lead" || role === "radius_auditing" || role === "soul_auditor") && (
                      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Group commission</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Group Lead portion of the team split</p>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-right">
                          <p className="text-base font-bold tabular-nums text-foreground">{currency(Math.round(officeNet * 0.25))}</p>
                        </div>
                      </div>
                    )}
                  </div>

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

      <AlertDialog open={showReopenDialog} onOpenChange={(open) => { setShowReopenDialog(open); if (!open) setSkipApprovalRestart(false); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                <RefreshCw className="size-5 text-amber-700" />
              </div>
              <AlertDialogTitle className="text-base">Reopen finalized breakdown?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-sm leading-relaxed">
              This commission breakdown has already been finalized.{" "}
              {isAuditor
                ? "By default, reopening restarts the approval workflow. As an Auditor, you can choose to bypass it."
                : "Any edits you make will require re-approval from Agent, Team Lead, and the Auditor before it's finalized again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isAuditor && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/60 p-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox
                  checked={skipApprovalRestart}
                  onCheckedChange={(v) => setSkipApprovalRestart(v === true)}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-amber-900">Bypass approval restart</span>
                  <span className="text-[11px] text-amber-800/80 leading-snug">
                    Apply changes directly without restarting Agent/Team Lead/Auditor confirmations. Use for minor auditor-led corrections.
                  </span>
                </div>
              </label>
            </div>
          )}
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                setHasReopened(true);
                if (!(isAuditor && skipApprovalRestart)) {
                  setTxStatus("draft");
                }
                const message = isAuditor && skipApprovalRestart
                  ? `Auditor reopened commission breakdown for ${PROPERTY_ADDRESS} — approval workflow bypassed`
                  : `Commission breakdown for ${PROPERTY_ADDRESS} reopened for edits — approval restarted`;
                logActivity(message);
                toast.success(isAuditor && skipApprovalRestart ? "Auditor edit mode — changes apply directly" : "Breakdown reopened — make your changes");
                setShowReopenDialog(false);
              }}
            >
              {isAuditor && skipApprovalRestart ? "Edit without restart" : "Restart approval"}
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
                <Button variant="outline" className="h-11 rounded-[10px] px-5 text-[15px] text-slate-700" onClick={() => toast.success("Commission breakdown PDF downloaded")}>
                  <Download className="mr-2 size-4" />
                  Download
                </Button>
                {isAuditor && (
                  <Button className="h-11 rounded-[10px] bg-primary px-5 text-[15px] hover:bg-primary/90" onClick={() => setShowSendConfirm(true)}>
                    <Send className="mr-2 size-4" />
                    Send for Signature
                  </Button>
                )}
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="size-11 rounded-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                    <X className="size-5" />
                    <span className="sr-only">Close PDF preview</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden bg-slate-50">
            <iframe
              key={pdfCdaType}
              src={`/cda/templates?tab=${pdfCdaType === "full-transparency" ? "tab1" : pdfCdaType === "radius-hidden" ? "tab2" : pdfCdaType === "team-hidden" ? "tab4" : pdfCdaType === "full-gross" ? "tab5" : "tab1"}`}
              title="CDA Document Templates"
              className="h-full w-full border-0 bg-white"
            />
          </div>
          <div className="hidden">
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
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-medium text-black">PDF Preview</h3>
                        <Badge variant="outline" className={`rounded-lg px-2.5 py-0.5 text-[11px] font-medium border ${cdaStateStyle(cdaState).cls}`}>
                          {cdaStateStyle(cdaState).label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={() => toast.success("Commission breakdown PDF downloaded")}>
                          <Download className="mr-2 size-3.5" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={() => window.print()}>
                          <Printer className="mr-2 size-3.5" />
                          Print
                        </Button>
                        {cdaState === "generated" && (
                          <Button size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={handleCdaSend}>
                            <Send className="mr-2 size-3.5" />
                            Send CDA
                          </Button>
                        )}
                        {cdaState !== "signed" && (
                          <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={handleCdaRegenWithCombo}>
                            <RefreshCw className="mr-2 size-3.5" />
                            Regenerate
                          </Button>
                        )}
                        {cdaState !== "signed" && (
                          <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={handleCdaDelete}>
                            <Trash2 className="mr-2 size-3.5" />
                            Delete CDA
                          </Button>
                        )}
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

      {/* Send CDA to broker confirmation */}
      <Dialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send CDA for signature?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>
              Sending the <strong className="text-foreground">{pdfCdaType.replace("-", " ")}</strong> CDA to the managing broker via DocuSign.
            </p>
            <p>Once sent, drafts lock until the broker signs or rejects.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSendConfirm(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setShowSendConfirm(false);
                toast.success(`CDA (${pdfCdaType}) sent to broker for signature`);
              }}
            >
              <Send className="mr-2 size-4" />
              Send
            </Button>
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
      <Dialog open={showCreditReferralDialog} onOpenChange={(open) => { setShowCreditReferralDialog(open); if (!open) resetCreditDialog(); }}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>{(isEditingDeduction || isEditingPostSplit) ? `Edit ${creditDescription || "Fee"}` : "Add credit or referral"}</DialogTitle>
            <DialogDescription>
              {(isEditingDeduction || isEditingPostSplit) ? "Update the fee details below." : "Payable to is set in this flow. Wire instructions come later."}
            </DialogDescription>
          </DialogHeader>

            <div className="space-y-4 px-6 py-5 text-sm">
              <div>
                <Label className="text-xs">Fee type</Label>
                <Select value={creditDescription} onValueChange={setCreditDescription}>
                  <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credits">Credits</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Amount</Label>
                <Input value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="500" className="mt-1.5" />
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
            <Button variant="outline" onClick={() => { setShowCreditReferralDialog(false); resetCreditDialog(); }}>Cancel</Button>
            <Button onClick={() => {
              const amt = parseFloat(creditAmount) || 0;
              if (isEditingPostSplit && editingPostSplit) {
                setPostSplitDeductions((prev) => ({
                  ...prev,
                  [editingPostSplit.agentId]: (prev[editingPostSplit.agentId] ?? []).map((d) => d.id === editingPostSplit.deductionId ? { ...d, name: creditDescription || d.name, amount: amt } : d),
                }));
                const agentName = sidesData.flatMap(s => s.agents).find(a => a.id === editingPostSplit.agentId)?.name || "agent";
                logActivity(`Updated ${creditDescription || "post-split deduction"} for ${agentName} to ${currency(amt)}.`);
                toast.success("Deduction updated");
              } else if (isEditingDeduction && editingDeductionId) {
                setSideGrossDeductions((prev) => ({
                  ...prev,
                  [activeSide.id]: (prev[activeSide.id] ?? []).map((d) => d.id === editingDeductionId ? { ...d, name: creditDescription || d.name, amount: amt } : d),
                }));
                logActivity(`Updated ${creditDescription || "fee"} on ${activeSide.title} to ${currency(amt)}.`);
                toast.success("Fee updated");
              } else {
                const name = creditDescription || "Credit";
                setSideGrossDeductions((prev) => ({
                  ...prev,
                  [activeSide.id]: [
                    ...(prev[activeSide.id] ?? []),
                    { id: `sg-${Date.now()}`, name, amount: amt },
                  ],
                }));
                logActivity(`Added ${name} on ${activeSide.title} at ${currency(amt)}.`);
                toast.success("Credit/Referral added");
              }
              setShowCreditReferralDialog(false);
              resetCreditDialog();
            }}>
              {(isEditingDeduction || isEditingPostSplit) ? "Save changes" : "Add Credit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payable to Radius — Edit Fee dialog (mirrors magicpath FeeModal) */}
      <Dialog open={showPayableFeeDialog} onOpenChange={(open) => { setShowPayableFeeDialog(open); if (!open) { setEditingFeeIndex(null); setPayableFeeForm(blankPayableFee()); } }}>
        <DialogContent className="gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>{isEditingPayableFee ? "Edit Fee" : "Add Fee"}</DialogTitle>
            <DialogDescription>Configure fee type details.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5 text-sm">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Fee Name</Label>
              <Input value={payableFeeForm.feeName} onChange={(e) => updatePayableFee("feeName", e.target.value)} placeholder="e.g., Transaction Coordinator Fee" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Fee Type</Label>
                <Select value={payableFeeForm.feeType} onValueChange={(v) => updatePayableFee("feeType", v as PayableFeeForm["feeType"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flat Fee">Flat Fee</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">{payableFeeForm.feeType === "Flat Fee" ? "Flat Fee" : "Percentage"}</Label>
                {payableFeeForm.feeType === "Flat Fee" ? (
                  <div className="flex items-center border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring">
                    <span className="px-3 py-2 text-sm text-muted-foreground bg-muted/50 border-r select-none">$</span>
                    <Input value={payableFeeForm.flatAmount} onChange={(e) => updatePayableFee("flatAmount", e.target.value)} placeholder="495" className="border-0 focus-visible:ring-0" />
                  </div>
                ) : (
                  <div className="flex items-center border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring">
                    <Input value={payableFeeForm.percentAmount} onChange={(e) => updatePayableFee("percentAmount", e.target.value)} placeholder="1.5" className="border-0 focus-visible:ring-0" />
                    <span className="px-3 py-2 text-sm text-muted-foreground bg-muted/50 border-l select-none">%</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">When Applied</Label>
                <div className="w-full border rounded-md px-3 py-2 text-sm text-muted-foreground bg-muted/40 cursor-not-allowed select-none">Post-Split</div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Fee Payer</Label>
                <Select value={payableFeeForm.feePayer} onValueChange={(v) => updatePayableFee("feePayer", v as PayableFeeForm["feePayer"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Team">Team</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Co-Agent Splits</Label>
                <Select value={payableFeeForm.coAgentSplits} onValueChange={(v) => updatePayableFee("coAgentSplits", v as PayableFeeForm["coAgentSplits"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Split equally">Split equally</SelectItem>
                    <SelectItem value="Proportional to split">Proportional to split</SelectItem>
                    <SelectItem value="Higher-cap agent pays">Higher-cap agent pays</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Payable To</Label>
                <div className="w-full border rounded-md px-3 py-2 text-sm text-muted-foreground bg-muted/40 cursor-not-allowed select-none">Radius</div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Payable Name</Label>
                <div className="w-full border rounded-md px-3 py-2 text-sm text-muted-foreground bg-muted/40 cursor-not-allowed select-none">Radius</div>
              </div>
              <p className="col-span-2 -mt-1 text-xs text-muted-foreground">Payable to Radius — this is a Radius fee.</p>
            </div>
            <div className="flex items-center justify-between border rounded-md px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Sliding Scale</div>
                <div className="text-xs text-muted-foreground mt-0.5">Enable tiered fee values.</div>
              </div>
              <Switch checked={payableFeeForm.slidingScale} onCheckedChange={(v) => updatePayableFee("slidingScale", v)} />
            </div>
            <div className="flex items-center justify-between border rounded-md px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Contributes to Cap</div>
                <div className="text-xs text-muted-foreground mt-0.5">Count toward cap.</div>
              </div>
              <Switch checked={payableFeeForm.contributesToCap} onCheckedChange={(v) => updatePayableFee("contributesToCap", v)} />
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => { setShowPayableFeeDialog(false); setEditingFeeIndex(null); setPayableFeeForm(blankPayableFee()); }}>Cancel</Button>
            <Button
              disabled={payableFeeForm.feeName.trim().length === 0}
              onClick={() => {
                const amt = payableFeeForm.feeType === "Flat Fee"
                  ? parseFloat(payableFeeForm.flatAmount) || 0
                  : Math.round(activeSideRadiusFee * ((parseFloat(payableFeeForm.percentAmount) || 0) / 100));
                if (isEditingPayableFee && editingFeeIndex !== null) {
                  const next = activeSideFeeBreakdown.map((f, idx) => idx === editingFeeIndex
                    ? { ...f, name: payableFeeForm.feeName, payer: payableFeeForm.feePayer, amount: amt }
                    : f);
                  setFeeBreakdownOverride(next);
                  logActivity(`Updated ${payableFeeForm.feeName} (payable to Radius) to ${currency(amt)}.`);
                  toast.success("Fee updated");
                }
                setShowPayableFeeDialog(false);
                setEditingFeeIndex(null);
                setPayableFeeForm(blankPayableFee());
              }}
            >Save Fee Type</Button>
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

      {/* Commission distribution dialog */}
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
            <DialogTitle>Commission distribution</DialogTitle>
            <DialogDescription>Set commission percentage and flat amount per side of the deal.</DialogDescription>
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
              logActivity("Updated commission allocation.");
              toast.success("Commission distribution saved");
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

      {/* Delete CDA confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Delete CDA draft?</DialogTitle>
            <DialogDescription>
              This will remove the current CDA and reset status back to <strong>Confirmed by Team Lead and Agent</strong>. You'll need to Generate CDA again from scratch.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmCdaDelete}>
              <Trash2 className="mr-1.5 size-3.5" />Delete CDA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send CDA modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Send CDA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold mb-1.5">To</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {sendTo.map(e => (
                  <span key={e} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">
                    {e}
                    <button type="button" onClick={() => setSendTo(prev => prev.filter(x => x !== e))} className="text-indigo-400 hover:text-indigo-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={sendToInput} onChange={e => setSendToInput(e.target.value)} placeholder="Add email address" className="flex-1 h-9"
                  onKeyDown={e => { if(e.key==="Enter" && sendToInput.trim()){ e.preventDefault(); setSendTo(prev => [...prev, sendToInput.trim()]); setSendToInput(""); }}}/>
                <Button variant="outline" onClick={() => { if(sendToInput.trim()){ setSendTo(prev => [...prev, sendToInput.trim()]); setSendToInput(""); }}}>+ Add Email</Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5">CC</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {sendCc.map(e => (
                  <span key={e} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">
                    {e}
                    <button type="button" onClick={() => setSendCc(prev => prev.filter(x => x !== e))} className="text-indigo-400 hover:text-indigo-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={sendCcInput} onChange={e => setSendCcInput(e.target.value)} placeholder="Add CC email" className="flex-1 h-9"
                  onKeyDown={e => { if(e.key==="Enter" && sendCcInput.trim()){ e.preventDefault(); setSendCc(prev => [...prev, sendCcInput.trim()]); setSendCcInput(""); }}}/>
                <Button variant="outline" onClick={() => { if(sendCcInput.trim()){ setSendCc(prev => [...prev, sendCcInput.trim()]); setSendCcInput(""); }}}>+ Add CC</Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5">Subject</p>
              <Input value={sendSubject} onChange={e => setSendSubject(e.target.value)} className="h-9"/>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5">Message</p>
              <Textarea value={sendBody} onChange={e => setSendBody(e.target.value)} rows={7}/>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5">Attachment</p>
              <div className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 border px-3 py-1.5 text-xs">
                <Paperclip className="size-3 text-muted-foreground" />
                <span>CDA-Willow-Creek.pdf</span>
                <span className="text-muted-foreground">· {comboLabel()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCdaSend} disabled={sendTo.length === 0}>
              <Send className="mr-1.5 size-3.5" />Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Deal-scoped commission plan create/edit dialog */}
      <AddPlanDialog
        open={showAddPlanDialog}
        title={planForm.editingPlanId ? "Edit deal-only plan" : "Create plan for this deal"}
        subtitle="Applies to this CDA only. Won't save to settings."
        saveLabel={planForm.editingPlanId ? "Save changes" : "Create & apply"}
        form={planForm}
        errors={planErrors}
        onFormChange={(patch) => { setPlanForm((f) => ({ ...f, ...patch })); setPlanFormDirty(true); }}
        onAgentSplitChange={(value) => {
          const num = value.replace(/[^0-9]/g, "");
          const a = Number(num) || 0;
          setPlanForm((f) => ({ ...f, agentSplit: num, teamSplit: String(Math.max(0, 100 - a)) }));
          setPlanFormDirty(true);
        }}
        onTeamSplitChange={(value) => {
          const num = value.replace(/[^0-9]/g, "");
          const t = Number(num) || 0;
          setPlanForm((f) => ({ ...f, teamSplit: num, agentSplit: String(Math.max(0, 100 - t)) }));
          setPlanFormDirty(true);
        }}
        onUpdateTier={(tierId, patch) => {
          setPlanForm((f) => ({ ...f, tiers: f.tiers.map((t) => (t.id === tierId ? { ...t, ...patch } : t)) }));
          setPlanFormDirty(true);
        }}
        onAddTier={() => {
          setPlanForm((f) => ({ ...f, tiers: [...f.tiers, { id: `t-${Date.now()}`, from: "", to: "", agentSplit: "", teamSplit: "" }] }));
          setPlanFormDirty(true);
        }}
        onRemoveTier={(tierId) => {
          setPlanForm((f) => ({ ...f, tiers: f.tiers.filter((t) => t.id !== tierId) }));
          setPlanFormDirty(true);
        }}
        onOpenChange={(open) => {
          if (!open && planFormDirty) {
            setShowDiscardPlanConfirm(true);
            return;
          }
          setShowAddPlanDialog(open);
          if (!open) setPlanFormDirty(false);
        }}
        onSave={() => {
          const errors: PlanErrors = {};
          if (!planForm.planName.trim()) errors.planName = "Name required";
          const splitTotal = (Number(planForm.agentSplit) || 0) + (Number(planForm.teamSplit) || 0);
          if (splitTotal !== 100) errors.splitTotal = "Splits must total 100%";
          if (Object.keys(errors).length) { setPlanErrors(errors); return; }

          const agentSplit = Number(planForm.agentSplit) || 0;
          const teamSplit = Number(planForm.teamSplit) || 0;
          const feeAmount = Number(planForm.feeAmount) || 0;
          const capAmount = Number(planForm.capAmount) || 0;
          const detail = `${agentSplit}% agent · ${teamSplit}% team`;

          if (planForm.editingPlanId) {
            setDealScopedPlans((plans) => plans.map((p) => p.id === planForm.editingPlanId ? {
              ...p,
              name: planForm.planName,
              detail,
              feeType: planForm.feeType,
              feeAmount,
              capAmount,
              agentSplit,
              teamSplit,
            } : p));
            logActivity(`Updated deal-only plan ${planForm.planName}.`);
            toast.success(`"${planForm.planName}" updated`);
          } else {
            const newPlan: CommissionPlanOption = {
              id: `deal-${Date.now()}`,
              name: planForm.planName,
              detail,
              feeType: planForm.feeType,
              feeAmount,
              capAmount,
              agentSplit,
              teamSplit,
              dealScoped: true,
            };
            setDealScopedPlans((plans) => [...plans, newPlan]);
            const targetAgent = planForm.selectedAgentIds[0];
            if (targetAgent) {
              setAppliedPlans((p) => ({ ...p, [targetAgent]: newPlan.id }));
              const agentName = initialSides.flatMap((s) => s.agents).find((a) => a.id === targetAgent)?.name ?? "agent";
              logActivity(`Created deal-only plan ${newPlan.name} and applied to ${agentName}.`);
              toast.success(`"${newPlan.name}" created & applied`);
            }
          }
          setShowAddPlanDialog(false);
          setPlanFormDirty(false);
          setPlanErrors({});
        }}
      />

      {/* Discard deal-only plan changes confirm */}
      <AlertDialog open={showDiscardPlanConfirm} onOpenChange={setShowDiscardPlanConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this plan?</AlertDialogTitle>
            <AlertDialogDescription>Your changes won't be saved.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDiscardPlanConfirm(false);
                setShowAddPlanDialog(false);
                setPlanFormDirty(false);
                setPlanErrors({});
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
    </TooltipProvider>
  );
}

function AddPlanDialog({
  open,
  title,
  subtitle,
  saveLabel = "Save Plan",
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
  subtitle?: string;
  saveLabel?: string;
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
                {subtitle ?? "Define split rules, caps, and transaction types for this plan."}
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
          <Button onClick={onSave} className="bg-[#5A5FF2] hover:bg-[#5A5FF2]/90">{saveLabel}</Button>
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
                <SelectItem value="never">Never</SelectItem>
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

function CdaComboPicker({
  transparency, setTransparency, cdaKind, setCdaKind, onConfirm, confirmLabel
}: {
  transparency: "full"|"radius"|"team";
  setTransparency: (v: "full"|"radius"|"team") => void;
  cdaKind: "cda"|"gross";
  setCdaKind: (v: "cda"|"gross") => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  const tOpts: Array<{id:"full"|"radius"|"team"; label:string; preferred?:boolean}> = [
    { id:"full", label:"Full transparency", preferred:true },
    { id:"radius", label:"Radius hidden" },
    { id:"team", label:"Team hidden" }
  ];
  const cOpts: Array<{id:"cda"|"gross"; label:string; preferred?:boolean}> = [
    { id:"cda", label:"CDA", preferred:true },
    { id:"gross", label:"Gross CDA" }
  ];
  const tLabel = tOpts.find(o => o.id === transparency)!.label;
  const cLabel = cOpts.find(o => o.id === cdaKind)!.label;
  return (
    <div className="space-y-1">
      <div className="px-3 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Transparency Settings</div>
      {tOpts.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => setTransparency(o.id)}
          className="w-full flex items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-[12.5px] hover:bg-neutral-100"
        >
          <span className={`size-3.5 rounded-full border-[1.5px] flex-shrink-0 grid place-items-center ${transparency===o.id?"border-primary":"border-neutral-300"}`}>
            {transparency===o.id && <span className="size-1.5 rounded-full bg-primary"/>}
          </span>
          <span className="flex-1">{o.label}</span>
          {o.preferred && <span className="text-[10px] text-muted-foreground">Default</span>}
        </button>
      ))}
      <div className="my-2 h-px bg-neutral-200"/>
      <div className="px-3 pt-1 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">CDA Settings</div>
      {cOpts.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => setCdaKind(o.id)}
          className="w-full flex items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-[12.5px] hover:bg-neutral-100"
        >
          <span className={`size-3.5 rounded-full border-[1.5px] flex-shrink-0 grid place-items-center ${cdaKind===o.id?"border-primary":"border-neutral-300"}`}>
            {cdaKind===o.id && <span className="size-1.5 rounded-full bg-primary"/>}
          </span>
          <span className="flex-1">{o.label}</span>
          {o.preferred && <span className="text-[10px] text-muted-foreground">Default</span>}
        </button>
      ))}
      <div className="pt-2">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full h-9 rounded-lg bg-primary text-white text-[12.5px] font-semibold hover:bg-primary/90"
        >
          {confirmLabel} — <span className="font-normal opacity-90">{tLabel} + {cLabel}</span>
        </button>
      </div>
    </div>
  );
}
