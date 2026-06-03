import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  CircleDollarSign,
  Building2,
  ChevronRight,
  Download,
  HelpCircle,
  Info,
  MessageSquare,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/v4/ui/accordion";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/v4/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/v4/ui/sheet";

import { cn } from "../../lib/utils";
import { CDAFlowSwitcher } from "../components/v4/finance/cda-flow-switcher";
import { FeeBuilderModal } from "../components/finance/fee-builder-modal";
import type { FeeTier, FeeTypeDraft } from "../components/finance/fee-builder-modal";

type SideId = "listing" | "buyer";
type Role = "agent" | "team_lead" | "radius_auditing";
type Agent = { id: string; name: string; role: string; payout: number; email?: string; avatarUrl?: string; external?: boolean; phone?: string; brokerageName?: string; brokerageLicenseNumber?: string; brokerageStreetAddress?: string; brokerageUnit?: string; brokerageCity?: string; brokerageState?: string; brokerageZip?: string; representing?: string };
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

type TierRow = {
  id: string;
  from: string;
  to: string;
  agentSplit: string;
  teamSplit: string;
};

type LimitRule = {
  enabled: boolean;
  amount: string;
};

type SidePostSplitDeduction = {
  id: string;
  name: string;
  amount: number;
  slidingScale: boolean;
  tiers: FeeTier[];
  notLessThan: LimitRule;
  notToExceed: LimitRule;
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

const COMMISSION_PLANS = [
  { id: "p1", name: "80/20 Standard", detail: "80% agent · 20% office", feeType: "flat" as const, feeAmount: 495, capAmount: 18000 },
  { id: "p2", name: "70/30 Standard", detail: "70% agent · 30% office", feeType: "flat" as const, feeAmount: 495, capAmount: 15000 },
  { id: "p3", name: "Keystone Tiered", detail: "Tiered split plan", feeType: "flat" as const, feeAmount: 0, capAmount: 0 },
  { id: "p4", name: "Lease Referral Plan", detail: "60% agent · 40% office", feeType: "flat" as const, feeAmount: 0, capAmount: 0 },
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
      { id: "a1", name: "Mark Perez", role: "Primary agent", payout: 29451 },
      { id: "a2", name: "Sarah Kim", role: "Co-agent", payout: 10000 },
      { id: "a4", name: "Taylor Brooks", role: "Showing agent", payout: 5000 },
      { id: "a5", name: "Nina Patel", role: "Referral partner", payout: 3000 },
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
      { id: "a3", name: "Ryan Torres", role: "Primary agent", payout: 35000 },
      { id: "a6", name: "Olivia Chen", role: "Co-agent", payout: 9000 },
      { id: "a7", name: "Marcus Lee", role: "ISA partner", payout: 4500 },
      { id: "a8", name: "Jade Foster", role: "Referral partner", payout: 1000 },
    ],
    active: false,
  },
];

const PDF_PREVIEW_DETAILS = [
  { label: "Property Address", value: "1284 Willow Creek Dr" },
  { label: "Client Name", value: "Michael Loft" },
  { label: "Gross Commission", value: "$25,000.00" },
  { label: "Agent Net Total", value: "$18,650.00" },
  { label: "Company Dollar", value: "$4,100.00" },
  { label: "Finalized By", value: "Jessica (Auditor)" },
];

const PDF_FINAL_NUMBERS = [
  { label: "Gross Commission", value: "$25,000.00", tone: "text-emerald-700" },
  { label: "Pre-Split Deductions", value: "-$750.00", badge: "Pre-Split", badgeClassName: "border-blue-200 bg-blue-50 text-blue-700" },
  { label: "Split Basis", value: "$24,250.00" },
  { label: "Agent Net Total", value: "$18,650.00", tone: "text-emerald-700", description: "Total to all agents after deductions" },
  { label: "Team Portion", value: "$4,850.00", description: "20% team split" },
  { label: "Radius Fee", value: "$750.00", badge: "Auditor Entry", badgeClassName: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700" },
  { label: "Company Dollar", value: "$4,100.00", tone: "text-emerald-700", description: "Final company revenue" },
];

function currency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

const roleMeta: Record<string, { label: string; badge: string; avatar: string }> = {
  agent: { label: "Agent", badge: "bg-blue-50 text-blue-700 border-blue-200", avatar: "bg-blue-100 text-blue-700" },
  team_lead: { label: "Team Lead", badge: "bg-amber-50 text-amber-700 border-amber-200", avatar: "bg-amber-100 text-amber-700" },
  radius_auditing: { label: "Admin", badge: "bg-purple-50 text-purple-700 border-purple-200", avatar: "bg-purple-100 text-purple-700" },
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

function SlidingScaleTierRows({
  tiers,
  onChange,
}: {
  tiers: FeeTier[];
  onChange: (tiers: FeeTier[]) => void;
}) {
  function updateTier(tierId: string, patch: Partial<FeeTier>) {
    onChange(tiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)));
  }

  function addTier() {
    onChange([...tiers, { id: crypto.randomUUID(), from: "", to: "", fee: "" }]);
  }

  function removeTier(tierId: string) {
    onChange(tiers.filter((tier) => tier.id !== tierId));
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {tiers.map((tier) => (
          <div key={tier.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 rounded-md border p-2">
            <Input
              className="h-9 text-xs"
              placeholder="Over"
              value={tier.from}
              onChange={(event) => updateTier(tier.id, { from: event.target.value })}
            />
            <Input
              className="h-9 text-xs"
              placeholder="Up to"
              value={tier.to}
              onChange={(event) => updateTier(tier.id, { to: event.target.value })}
            />
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                className="h-9 pl-6 text-xs"
                placeholder="0.00"
                inputMode="decimal"
                value={tier.fee}
                onChange={(event) => updateTier(tier.id, { fee: event.target.value })}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-muted-foreground hover:text-foreground"
              onClick={() => removeTier(tier.id)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addTier} className="w-full">
        <Plus className="size-4" />
        Add Tier
      </Button>
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

export function CommissionBreakdown() {
  const [agentComment, setAgentComment] = useState("");
  type ActivityEntry = { id: string; author: string; role: Role; text: string; timestamp: string; kind: "comment" | "activity" };
  type ActivityView = "comments" | "activity" | "all";
  type CollapsedActivityEntry = ActivityEntry & { count?: number };
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([
    { id: "ch1", author: "Sarah Kim", role: "team_lead", text: "Please double-check the RERM amount — it looks lower than the standard rate.", timestamp: "May 12, 2026 · 3:14 PM", kind: "comment" },
    { id: "ch2", author: "Mark Perez", role: "agent", text: "Updated. The RERM was adjusted per the new schedule effective May 1.", timestamp: "May 12, 2026 · 4:02 PM", kind: "comment" },
  ]);
  const [showActivitySheet, setShowActivitySheet] = useState(false);
  const [activityView, setActivityView] = useState<ActivityView>("comments");
  const roleNames: Record<Role, string> = { agent: "You", team_lead: "You", radius_auditing: "You" };
  function makeTimestamp() {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date()).replace(",", " ·");
  }
  function logActivity(text: string, kind: "comment" | "activity" = "activity") {
    setActivityFeed((prev) => [
      ...prev,
      {
        id: `act-${Date.now()}-${prev.length}`,
        author: roleNames[role],
        role,
        text,
        timestamp: makeTimestamp(),
        kind,
      },
    ]);
  }
  function handleSendComment() {
    const text = agentComment.trim();
    if (!text) return;
    logActivity(text, "comment");
    setAgentComment("");
    toast.success("Comment sent");
  }
  const latestFeed = [...activityFeed].reverse();
  const commentFeed = latestFeed.filter((entry) => entry.kind === "comment");
  const commentsPreview = commentFeed.slice(0, 3);
  function collapseActivityEntries(entries: ActivityEntry[]) {
    return entries.reduce<CollapsedActivityEntry[]>((acc, entry) => {
      const last = acc[acc.length - 1];
      if (
        entry.kind === "activity" &&
        last &&
        last.kind === "activity" &&
        last.author === entry.author &&
        last.role === entry.role &&
        last.text === entry.text
      ) {
        last.count = (last.count ?? 1) + 1;
        return acc;
      }
      acc.push({ ...entry, count: 1 });
      return acc;
    }, []);
  }
  const collapsedActivityFeed = collapseActivityEntries(latestFeed.filter((entry) => entry.kind === "activity"));
  const collapsedAllFeed = collapseActivityEntries(latestFeed);
  const [role, setRole] = useState<Role>("radius_auditing");
  const [selectedSide, setSelectedSide] = useState<SideId>("listing");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  // Connector refs & state
  const gridRef = useRef<HTMLDivElement>(null);
  const [connectorTop, setConnectorTop] = useState(0);
  const [showGrossInfo, setShowGrossInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feeDialogTiming, setFeeDialogTiming] = useState<"pre-split" | "post-split" | null>(null);
  const [showInlineSidePreSplitDraft, setShowInlineSidePreSplitDraft] = useState(false);
  const [inlineSidePreSplitLabel, setInlineSidePreSplitLabel] = useState("");
  const [inlineSidePreSplitAmount, setInlineSidePreSplitAmount] = useState("");
  const [showInlineSidePostSplitDraft, setShowInlineSidePostSplitDraft] = useState(false);
  const [inlineSidePostSplitLabel, setInlineSidePostSplitLabel] = useState("");
  const [inlineSidePostSplitAmount, setInlineSidePostSplitAmount] = useState("");
  const [showSlidingScaleDialog, setShowSlidingScaleDialog] = useState(false);
  const [inlineSidePostSplitSlidingScale, setInlineSidePostSplitSlidingScale] = useState(false);
  const [inlineSidePostSplitTiers, setInlineSidePostSplitTiers] = useState<FeeTier[]>([]);
  const [inlineSidePostSplitNotLessThan, setInlineSidePostSplitNotLessThan] = useState<LimitRule>({ enabled: false, amount: "0.00" });
  const [inlineSidePostSplitNotToExceed, setInlineSidePostSplitNotToExceed] = useState<LimitRule>({ enabled: false, amount: "0.00" });
  const [showInlineAgentPreSplitDraft, setShowInlineAgentPreSplitDraft] = useState(false);
  const [inlineAgentPreSplitLabel, setInlineAgentPreSplitLabel] = useState("");
  const [inlineAgentPreSplitAmount, setInlineAgentPreSplitAmount] = useState("");
  const feeDialogTitle = "Fee Type";
  const [showCDCDialog, setShowCDCDialog] = useState(false);
  const [showNetCommissionDialog, setShowNetCommissionDialog] = useState(false);
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [statementNotes, setStatementNotes] = useState("");
  const [includeProgressInfo, setIncludeProgressInfo] = useState(false);
  const [appliedPlans, setAppliedPlans] = useState<Record<string, string | null>>({});
  type TxStatus = "draft" | "agent_confirmed" | "team_lead_confirmed" | "processed" | "rejected";
  // txStatus drives confirmation flow: Agent confirms → Team Lead confirms → Admin processes
  const [txStatus, setTxStatus] = useState<TxStatus>("draft");
  const [rejectionNote, setRejectionNote] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [rejectInput, setRejectInput] = useState("");
  // Simple pre-split deduction for agent role (Credits / Referral Fees)
  const [showAgentPreSplitDialog, setShowAgentPreSplitDialog] = useState(false);
  const [agentPreSplitLabel, setAgentPreSplitLabel] = useState("");
  const [agentPreSplitAmount, setAgentPreSplitAmount] = useState("");


  // Sliding scale dialog


  const [preSplitDeductions, setPreSplitDeductions] = useState<Record<string, Array<{ id: string; name: string; amount: number }>>>({});

  // Side-level gross deductions (Credits, Referrals) — keyed by SideId
  type SideDeduction = { id: string; name: string; amount: number };
  const [sideGrossDeductions, setSideGrossDeductions] = useState<Record<string, SideDeduction[]>>({
    listing: [
      { id: "sg1", name: "Credits", amount: 200 },
      { id: "sg2", name: "Referrals", amount: 50 },
    ],
    buyer: [],
  });
  const [sidePostSplitDeductions, setSidePostSplitDeductions] = useState<Record<SideId, SidePostSplitDeduction[]>>({
    listing: [],
    buyer: [],
  });
  const [sideRadiusFees, setSideRadiusFees] = useState<Record<SideId, number>>({
    listing: 0,
    buyer: 0,
  });


  const [postSplitDeductions, setPostSplitDeductions] = useState<Record<string, Array<{ id: string; name: string; amount: number; isRadiusFee?: boolean }>>>({
    a1: [
      { id: "d1", name: "File Review Fee", amount: 25, isRadiusFee: true },
      { id: "d2", name: "RERM", amount: 124, isRadiusFee: true },
      { id: "d3", name: "SBTC", amount: 400 },
      { id: "d4", name: "E&O", amount: 250 },
    ],
  });
  const [pendingPlanChange, setPendingPlanChange] = useState<{ agentId: string; plan: typeof COMMISSION_PLANS[0] } | null>(null);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [awardValues, setAwardValues] = useState<Record<SideId, number>>({ listing: 1, buying: 0 });
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
  const [sidesData, setSidesData] = useState(initialSides);

  // per-agent editable field overrides: { [agentId]: { commissionBasis, split } }
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, { commissionBasis: number; split: number }>>({
    a1: { commissionBasis: 29451, split: 7500 },
  });

  const sides = useMemo(
    () => sidesData.map((s) => s.id === selectedSide ? { ...s, active: true } : { ...s, active: false }),
    [sidesData, selectedSide]
  );

  const activeSide = sides.find((s) => s.id === selectedSide) ?? sides[0];

  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    for (const side of sides) {
      const agent = side.agents.find((a) => a.id === selectedAgentId);
      if (agent) {
        const overrides = fieldOverrides[agent.id] ?? {};
        const commissionBasis = overrides.commissionBasis ?? agent.payout;
        const split = overrides.split ?? 0;
        const planId = appliedPlans[agent.id];
        const plan = COMMISSION_PLANS.find((entry) => entry.id === planId) ?? null;
        const planFixedFee = plan?.feeType === "flat" ? plan.feeAmount : 0;
        const totalPostSplitDeductions = (postSplitDeductions[agent.id] ?? []).reduce((sum, deduction) => sum + deduction.amount, 0);
        const netCommission = commissionBasis - split - planFixedFee - totalPostSplitDeductions;
        const companyDollar = Math.max(side.gross - commissionBasis, 0);
        return { agent, side, commissionBasis, split, planFixedFee, totalPostSplitDeductions, netCommission, companyDollar };
      }
    }
    return null;
  }, [selectedAgentId, sides, fieldOverrides, appliedPlans, postSplitDeductions]);

  const selectedPlan = selectedAgentId
    ? COMMISSION_PLANS.find((plan) => plan.id === appliedPlans[selectedAgentId])
    : null;
  const selectedAgentIsExternal = Boolean(selectedAgent?.agent.external);
  const selectedCapAmount = selectedPlan?.capAmount ?? 0;
  const selectedCapUsed = selectedAgentId ? (AGENT_CAP_PROGRESS[selectedAgentId] ?? 0) : 0;
  const selectedCapRemaining = Math.max(selectedCapAmount - selectedCapUsed, 0);
  const selectedCapRatio = selectedCapAmount > 0 ? selectedCapUsed / selectedCapAmount : 0;
  const selectedCapStatus = selectedCapAmount <= 0
    ? "none"
    : selectedCapRemaining <= 0
      ? "reached"
      : selectedCapRatio >= 0.9
        ? "near"
        : "normal";

  function setAgentField(field: "commissionBasis" | "split", value: number) {
    if (!selectedAgentId) return;
    const fieldLabel = field === "commissionBasis" ? "commission basis" : "split";
    const agentName = selectedAgent?.agent.name ?? "agent";
    setFieldOverrides((prev) => ({
      ...prev,
      [selectedAgentId]: { ...(prev[selectedAgentId] ?? {}), [field]: value },
    }));
    logActivity(`Updated ${fieldLabel} for ${agentName} to ${currency(value)}.`);
  }

  function handleDeleteAgent() {
    if (!selectedAgentId || !selectedAgent) return;
    const agentName = selectedAgent.agent.name;
    setSidesData((prev) =>
      prev.map((side) => ({ ...side, agents: side.agents.filter((a) => a.id !== selectedAgentId) }))
    );
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

  function resetInlineSidePostSplitDraft() {
    setShowInlineSidePostSplitDraft(false);
    setInlineSidePostSplitLabel("");
    setInlineSidePostSplitAmount("");
    setInlineSidePostSplitSlidingScale(false);
    setInlineSidePostSplitTiers([]);
    setInlineSidePostSplitNotLessThan({ enabled: false, amount: "0.00" });
    setInlineSidePostSplitNotToExceed({ enabled: false, amount: "0.00" });
    setShowSlidingScaleDialog(false);
  }

  function resetInlineAgentPreSplitDraft() {
    setShowInlineAgentPreSplitDraft(false);
    setInlineAgentPreSplitLabel("");
    setInlineAgentPreSplitAmount("");
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

  function handleInlineSidePostSplitSave() {
    const name = inlineSidePostSplitLabel.trim();
    const amount = Math.round(Number(inlineSidePostSplitAmount) || 0);
    if (!name || (!amount && !(inlineSidePostSplitSlidingScale && inlineSidePostSplitTiers.length > 0))) return;
    setSidePostSplitDeductions((prev) => ({
      ...prev,
      [activeSide.id]: [
        ...(prev[activeSide.id] ?? []),
        {
          id: `sp-${Date.now()}`,
          name,
          amount,
          slidingScale: inlineSidePostSplitSlidingScale,
          tiers: inlineSidePostSplitTiers,
          notLessThan: inlineSidePostSplitNotLessThan,
          notToExceed: inlineSidePostSplitNotToExceed,
        },
      ],
    }));
    logActivity(`Added ${name} post-commission deduction for ${activeSide.title}.`);
    toast.success(`"${name}" added`);
    resetInlineSidePostSplitDraft();
  }

  function handleInlineAgentPreSplitSave() {
    const agentId = selectedAgent?.agent.id;
    const name = inlineAgentPreSplitLabel.trim();
    const amount = Math.round(Number(inlineAgentPreSplitAmount) || 0);
    if (!agentId || !name || !amount) return;
    setPreSplitDeductions((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] ?? []), { id: `pre-${Date.now()}`, name, amount }],
    }));
    logActivity(`Added ${name} pre-commission deduction for ${selectedAgent?.agent.name ?? "agent"}.`);
    toast.success(`"${name}" added`);
    resetInlineAgentPreSplitDraft();
  }

  function handleFeeAdded(fee: FeeTypeDraft) {
    const amount = Math.round(Number(fee.amount) || 0);
    if (fee.timing === "pre-split") {
      // Pre-split → side-level gross deductions
      setSideGrossDeductions((prev) => ({
        ...prev,
        [activeSide.id]: [...(prev[activeSide.id] ?? []), { id: `sg-${Date.now()}`, name: fee.name, amount }],
      }));
      logActivity(`Added ${fee.name} pre-commission deduction for ${activeSide.title}.`);
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
  }

  const grossIncome = activeSide.gross;
  const totalAgentPayout = activeSide.agents.reduce((s, a) => s + a.payout, 0);
  const totalSidePostSplitDeductions = (sidePostSplitDeductions[activeSide.id] ?? []).reduce((sum, deduction) => sum + deduction.amount, 0);
  const officeNet = grossIncome - totalAgentPayout - totalSidePostSplitDeductions;
  const activeSideOfficeShare = Math.max(grossIncome - totalAgentPayout, 0);
  const activeSideRadiusFee = sideRadiusFees[activeSide.id] ?? 0;
  const radiusFeeRequiredForApproval = sides.some((side) => side.agents.length > 0 && (sideRadiusFees[side.id] ?? 0) <= 0);

  // Permission helpers
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [planForm, setPlanForm] = useState<PlanForm>(getFreshPlanForm());
  const [planErrors, setPlanErrors] = useState<PlanErrors>({});

  const isAgent = role === "agent";
  const isTL = role === "team_lead";
  const canEditAll = role === "radius_auditing";
  const isLocked = txStatus === "processed" && role !== "radius_auditing";
  const STATUS_LABELS: Record<TxStatus, string> = {
    draft: "Awaiting Agent confirmation",
    agent_confirmed: "Confirmed by Agent",
    team_lead_confirmed: "Confirmed by Team Lead",
    processed: "CDA generated",
    rejected: "Returned for edits",
  };
  const STATUS_COLORS: Record<TxStatus, React.ComponentProps<typeof Badge>["variant"]> = {
    draft: "outline",
    agent_confirmed: "secondary",
    team_lead_confirmed: "secondary",
    processed: "secondary",
    rejected: "destructive",
  };
  const flowNote =
    role === "agent"
      ? "Agent confirms first. Team Lead confirms next."
      : role === "team_lead"
        ? "Agent confirms first. Team Lead confirms next."
        : "Confirm CDA after Agent and Team Lead confirm. Any edit restarts flow.";
  const confirmActionLabel =
    role === "radius_auditing" ? "Confirm CDA" : "Confirm";
  const confirmDialogTitle =
    role === "radius_auditing"
      ? "Confirm CDA?"
      : role === "team_lead"
        ? "Confirm by Team Lead?"
        : "Confirm by Agent?";
  const confirmDialogBody =
    role === "radius_auditing"
      ? "Confirm and generate CDA after Agent and Team Lead confirm. Any edit after this restarts confirmation."
      : role === "team_lead"
        ? "Confirm the numbers after Agent confirmation. If anything changes later, Agent must confirm again."
        : "Confirm the numbers. Team Lead confirms next before CDA processing.";
  const canConfirmNow =
    (role === "agent" && txStatus === "draft") ||
    (role === "team_lead" && txStatus === "agent_confirmed") ||
    (role === "radius_auditing" && txStatus === "team_lead_confirmed");
  const canAuditorApprove = canConfirmNow && !radiusFeeRequiredForApproval;

  function renderCommentItems(items: ActivityEntry[]) {
    return items.map((entry, index) => (
      <div key={entry.id} className="flex gap-3">
        <div className="relative flex w-7 shrink-0 justify-center">
          <Avatar className="size-6 mt-0.5">
            <AvatarFallback className={`text-[10px] font-semibold ${(roleMeta[entry.role] ?? roleMeta.agent).avatar}`}>
              {initials(entry.author)}
            </AvatarFallback>
          </Avatar>
          {index < items.length - 1 && (
            <div className="absolute top-7 bottom-[-14px] w-px bg-border" />
          )}
        </div>
        <div className="min-w-0 space-y-1.5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-foreground">{entry.author}</span>
            <span className={`rounded-full border px-1.5 py-0 text-[9px] font-medium ${(roleMeta[entry.role] ?? roleMeta.agent).badge}`}>
              {(roleMeta[entry.role] ?? roleMeta.agent).label}
            </span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/80">{entry.text}</p>
        </div>
      </div>
    ));
  }
  function renderCollapsedActivityItems(items: CollapsedActivityEntry[]) {
    return items.map((entry) => (
      <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5">
        <div className="mt-1 size-2 shrink-0 rounded-full bg-primary/55" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-medium text-foreground">{entry.text}</p>
            {(entry.count ?? 1) > 1 && (
              <span className="rounded-full border border-border bg-muted px-1.5 py-0 text-[9px] font-medium text-muted-foreground">
                {entry.count}x
              </span>
            )}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {entry.author} · {(roleMeta[entry.role] ?? roleMeta.agent).label} · {entry.timestamp}
          </p>
        </div>
      </div>
    ));
  }

  const editableSnapshot = useMemo(
    () => JSON.stringify({
      sidesData,
      fieldOverrides,
      sideGrossDeductions,
      sidePostSplitDeductions,
      sideRadiusFees,
      postSplitDeductions,
      appliedPlans,
      awardValues,
      preSplitDeductions,
    }),
    [sidesData, fieldOverrides, sideGrossDeductions, sidePostSplitDeductions, sideRadiusFees, postSplitDeductions, appliedPlans, awardValues, preSplitDeductions]
  );
  const previousEditableSnapshot = useRef(editableSnapshot);
  useEffect(() => {
    if (previousEditableSnapshot.current === editableSnapshot) return;
    previousEditableSnapshot.current = editableSnapshot;
    if (txStatus !== "draft") {
      setTxStatus("draft");
      setRejectionNote("");
    }
  }, [editableSnapshot, txStatus]);

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
                {role === "agent" ? "Agent view" : role === "team_lead" ? "Team Lead view" : "Auditor view"}
                <ChevronRight className="size-3 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["agent", "team_lead", "radius_auditing"] as Role[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRole(r)} className={cn(role === r && "bg-accent")}>
                  <div className="flex items-center gap-2">
                    {r === "agent" ? <User className="size-3.5" /> : r === "team_lead" ? <Users className="size-3.5" /> : <Shield className="size-3.5" />}
                    <span>{r === "agent" ? "Agent view" : r === "team_lead" ? "Team Lead view" : "Auditor view"}</span>
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
            <span className="shrink-0 text-xs text-muted-foreground">May 13, 2026</span>
          </div>
          <div className="flex items-center gap-2">
            {role !== "agent" && (
              <Badge variant={STATUS_COLORS[txStatus]} className="rounded-full px-3">
                {STATUS_LABELS[txStatus]}
              </Badge>
            )}
            {rejectionNote && txStatus === "draft" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 text-xs font-medium text-destructive cursor-default">
                    Returned — see note
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">{rejectionNote}</TooltipContent>
              </Tooltip>
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
            {role === "radius_auditing" && (
              <Button
                size="sm"
                className="h-8 shrink-0 rounded-lg px-4 text-xs"
                disabled={!canAuditorApprove}
                onClick={() => setShowProcessDialog(true)}
              >
                Confirm CDA
              </Button>
            )}
            {/* Download CDA — visible to all when processed */}
            {txStatus === "processed" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 rounded-lg border-primary px-4 text-xs text-primary"
                onClick={() => setShowPdfPreview(true)}
              >
                <Download className="size-3.5" />
                CDA
              </Button>
            )}
            {/* Admin / TL: return when review needs edits */}
            {!isAgent && txStatus === "agent_confirmed" && (
              <>
                <Button size="sm" variant="outline" className="h-8 rounded-lg px-4 text-xs text-destructive border-destructive/40 hover:bg-destructive/5" onClick={() => setShowRejectDialog(true)}>
                  Return
                </Button>
              </>
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
            <p className="mt-1 text-3xl font-bold tracking-tight">{currency(99000)}</p>
          </div>
          <div className="bg-border" />
          <div className="px-6 py-5">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Building2 className="size-3.5" />Sale Price
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{currency(4950000)}</p>
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
          <section className="bg-muted/30 p-4">
            <Card className="rounded-xl border bg-card overflow-hidden p-0 gap-0 block shadow-sm">
              <div className="w-full">
                {sides.map((side, index) => (
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
                                Award {side.award}%
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
                              <p className="text-xl font-bold tracking-tight tabular-nums">{currency(side.agents.reduce((s, a) => s + a.payout, 0))}</p>
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
                          {side.agents.map((agent) => (
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
                                  <p className="text-base font-bold tracking-tight tabular-nums">{currency(agent.payout)}</p>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground/50" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {index === 0 && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            </Card>
          </section>

          {/* RIGHT — agent detail OR side breakdown */}
          <aside className="py-4 pr-4 pl-1">
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
                              ? COMMISSION_PLANS.find((p) => p.id === appliedPlans[selectedAgent.agent.id])?.name
                              : "No plan selected"}
                            <ChevronRight className="size-3 rotate-90" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Commission plans</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {COMMISSION_PLANS.map((plan) => (
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
                    {selectedCapStatus !== "none" && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-7 rounded-lg px-2.5 text-[11px] font-medium",
                          selectedCapStatus === "reached"
                            ? "border-amber-300 bg-amber-50 text-amber-800"
                            : selectedCapStatus === "near"
                              ? "border-orange-300 bg-orange-50 text-orange-800"
                              : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {selectedCapStatus === "reached" ? "Cap reached" : `${currency(selectedCapRemaining)} to cap`}
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
                  {/* Tentative notice */}
                  <div className="mb-4 rounded-lg bg-blue-50/50 border border-blue-100 px-3 py-2 text-[11px] text-blue-700 flex items-center gap-2">
                    <Info className="size-3.5 text-blue-500" />
                    <span>{flowNote}</span>
                  </div>
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
                          {selectedCapStatus === "reached" ? "Cap reached." : "Cap almost reached."}
                        </span>{" "}
                        {selectedCapStatus === "reached"
                          ? `This deal uses capped split logic, so payout may be lower than straight calculation. ${currency(selectedCapUsed)} used of ${currency(selectedCapAmount)} cap.`
                          : `${currency(selectedCapRemaining)} remaining on ${currency(selectedCapAmount)} cap. If this deal crosses cap, split math adjusts automatically.`}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commission Basis</p>
                    <div className="min-w-[120px] text-right">
                      <EditableValue value={selectedAgent.commissionBasis} onChange={(v) => setAgentField("commissionBasis", v)} readOnly={isAgent || isLocked} />
                    </div>
                  </div>
                  {!isAgent && !isLocked && (
                  <>
                  {(preSplitDeductions[selectedAgent.agent.id] ?? []).map((ded) => (
                    <div key={ded.id} className="group flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-muted-foreground">{ded.name}</p>
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
                  ))}
                  {showInlineAgentPreSplitDraft && (
                    <div className="pt-1">
                      <InlineDeductionDraftRow
                        label={inlineAgentPreSplitLabel}
                        amount={inlineAgentPreSplitAmount}
                        labelPlaceholder="Fee name"
                        onLabelChange={setInlineAgentPreSplitLabel}
                        onAmountChange={setInlineAgentPreSplitAmount}
                        onSave={handleInlineAgentPreSplitSave}
                        onCancel={resetInlineAgentPreSplitDraft}
                      />
                    </div>
                  )}
                  <div className="pt-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => setShowInlineAgentPreSplitDraft(true)}>
                      <Plus className="size-3.5 mr-1" />Pre-commission deduction
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
                            : "0% of remaining balance"}
                      </p>
                    </div>
                    <div className="min-w-[120px] text-right">
                      <EditableValue value={selectedAgent.split} onChange={(v) => setAgentField("split", v)} readOnly={isAgent || isLocked} />
                    </div>
                  </div>
                  {selectedAgent.planFixedFee > 0 && (
                    <>
                      <div className="group flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-muted-foreground">Plan fixed fee</p>
                          <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">
                            {selectedPlan?.name ?? "Plan"}
                          </span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                          {currency(selectedAgent.planFixedFee)}
                        </span>
                      </div>
                      <Separator className="my-3" />
                    </>
                  )}
                  {selectedAgent.planFixedFee <= 0 && <Separator className="my-3" />}

                  {/* Post-split deductions */}
                  <div className="py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post-split deductions</p>
                  </div>
                  {(postSplitDeductions[selectedAgent.agent.id] ?? []).map((ded) => {
                    const dedReadOnly = isLocked || (ded.isRadiusFee && !canEditAll);
                    const canDelete = !isLocked && (!ded.isRadiusFee || canEditAll);
                    return (
                      <div key={ded.id} className="group flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-muted-foreground">{ded.name}</p>
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Dollar Contribution</p>
                    <div className="min-w-[120px] text-right">
                      <button onClick={() => setShowCDCDialog(true)} className="text-sm font-semibold tabular-nums underline underline-offset-2 cursor-pointer text-[#5A5FF2]">
                        {currency(selectedAgent.companyDollar)}
                      </button>
                    </div>
                  </div>
                  <Separator className="my-3" />

                  <div className="space-y-3 pb-2">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="size-3 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">Comment for Team Lead</p>
                    </div>
                    {commentsPreview.length > 0 ? (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                        {renderCommentItems(commentsPreview)}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2.5 text-[11px] text-muted-foreground">
                        No comments yet.
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">Recent discussion only</p>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => setShowActivitySheet(true)}>
                        View all
                      </Button>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={agentComment}
                        onChange={(e) => setAgentComment(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                        placeholder="Add a note about this breakdown…"
                        rows={2}
                        className="min-h-[60px] resize-none border border-input bg-background pr-10 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 bottom-1.5 size-7 text-[#5A5FF2] hover:bg-[#5A5FF2]/10 hover:text-[#5A5FF2] disabled:opacity-50"
                        disabled={!agentComment.trim()}
                        onClick={handleSendComment}
                      >
                        <Send className="size-3.5" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">Flag incorrect splits or add context before confirmation. Press Enter to send.</p>
                  </div>
                  <div className="flex items-center pb-4">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground">
                      <HelpCircle className="size-4" />Need help?
                    </Button>
                  </div>
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
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Gross", value: currency(activeSide.gross), icon: TrendingUp, gradient: "linear-gradient(135deg, #c7d2fe, #a5b4fc)", muted: "#6366f1", strong: "#1e1b4b" },
                      { label: "Agent", value: currency(totalAgentPayout), icon: User, gradient: "linear-gradient(135deg, #bbf7d0, #86efac)", muted: "#16a34a", strong: "#14532d" },
                      { label: "Office", value: currency(activeSideOfficeShare), icon: Building2, gradient: "linear-gradient(135deg, #fef3c7, #fde68a)", muted: "#d97706", strong: "#451a03" },
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross Income</p>
                    <div className="min-w-[120px] text-right">
                      <p className="text-base font-bold text-foreground tabular-nums">{currency(grossIncome)}</p>
                    </div>
                  </div>
                  {/* Side-level gross deductions: Credits, Referrals */}
                  {(sideGrossDeductions[activeSide.id] ?? []).map((ded) => (
                    <div key={ded.id} className="group flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-muted-foreground">{ded.name}</p>
                        <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">Deduction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isAgent && !isLocked ? (
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
                        {!isAgent && !isLocked && (
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
                  {isAgent && (sideGrossDeductions[activeSide.id] ?? []).length === 0 && (
                  <div className="pt-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => setFeeDialogTiming("pre-split")}>
                      <Plus className="size-3.5 mr-1" />Add credit or referral fee
                    </Button>
                  </div>
                  )}
                  {!isAgent && !isLocked && (
                  <div className="pt-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => setShowInlineSidePreSplitDraft(true)}>
                      <Plus className="size-3.5 mr-1" />Pre-commission deduction
                    </Button>
                  </div>
                  )}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent Commissions</p>
                    <div className="min-w-[120px] text-right">
                      <p className="text-base font-bold text-foreground tabular-nums">{currency(totalAgentPayout)}</p>
                    </div>
                  </div>
                  {(sidePostSplitDeductions[activeSide.id] ?? []).map((ded) => (
                    <div key={ded.id} className="group flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-muted-foreground">{ded.name}</p>
                        {ded.slidingScale && (
                          <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">Sliding scale</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <DeductionValue
                          value={ded.amount}
                          readOnly={isAgent || isLocked}
                          onChange={(v) => {
                            setSidePostSplitDeductions((prev) => ({
                              ...prev,
                              [activeSide.id]: (prev[activeSide.id] ?? []).map((d) => d.id === ded.id ? { ...d, amount: v } : d),
                            }));
                            logActivity(`Updated ${ded.name} on ${activeSide.title} to ${currency(v)}.`);
                          }}
                        />
                        {!isAgent && !isLocked && (
                          <button
                            onClick={() => {
                              setSidePostSplitDeductions((prev) => ({
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
                  ))}
                  {showInlineSidePostSplitDraft && (
                    <div className="pt-2">
                      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/[0.03] px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Input
                            value={inlineSidePostSplitLabel}
                            onChange={(e) => setInlineSidePostSplitLabel(e.target.value)}
                            placeholder="Fee name"
                            className="h-8 border-input bg-background text-xs"
                          />
                          <div className="relative w-28 shrink-0">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                            <Input
                              value={inlineSidePostSplitAmount}
                              onChange={(e) => setInlineSidePostSplitAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                              placeholder="0"
                              inputMode="decimal"
                              className="h-8 border-input bg-background pl-6 text-right text-xs"
                            />
                          </div>
                          <Button size="sm" className="h-8 shrink-0 px-3 text-xs" disabled={!inlineSidePostSplitLabel.trim() || (!inlineSidePostSplitAmount.trim() && !(inlineSidePostSplitSlidingScale && inlineSidePostSplitTiers.length > 0))} onClick={handleInlineSidePostSplitSave}>
                            Add
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs" onClick={resetInlineSidePostSplitDraft}>
                            Cancel
                          </Button>
                        </div>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setShowSlidingScaleDialog(true)}
                            className="text-[11px] font-medium text-[#5A5FF2] underline underline-offset-2"
                          >
                            {inlineSidePostSplitSlidingScale ? "Sliding scale configured" : "Sliding scale"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isLocked && (
                    <div className="pt-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => setShowInlineSidePostSplitDraft(true)}>
                        <Plus className="size-3.5 mr-1" />Post-commission deduction
                      </Button>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Office Net card */}
                  <div className="rounded-xl border bg-card px-4 py-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Office Net</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/60">After agent commissions &amp; deductions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold tracking-tight text-foreground">{currency(officeNet)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{Math.round((officeNet / (grossIncome || 1)) * 100)}% of gross</p>
                      </div>
                    </div>
                  </div>

                  {(canEditAll || activeSideRadiusFee > 0) && (
                    <div className="mt-3 rounded-xl border bg-card px-4 py-3.5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Radius Fee</p>
                        </div>
                        <div className="text-right">
                          <EditableValue
                            value={activeSideRadiusFee}
                            readOnly={!canEditAll || isLocked}
                            onChange={(value) => {
                              setSideRadiusFees((prev) => ({
                                ...prev,
                                [activeSide.id]: value,
                              }));
                              logActivity(`Updated Radius Fee for ${activeSide.title} to ${currency(value)}.`);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-3 pb-2">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="size-3 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">Comment for Team Lead</p>
                    </div>
                    {/* Comment history */}
                    {commentsPreview.length > 0 ? (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                        {renderCommentItems(commentsPreview)}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2.5 text-[11px] text-muted-foreground">
                        No comments yet.
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">Recent discussion only</p>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A5FF2] hover:bg-[#5A5FF2]/8 hover:text-[#5A5FF2]" onClick={() => setShowActivitySheet(true)}>
                        View all
                      </Button>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={agentComment}
                        onChange={(e) => setAgentComment(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                        placeholder="Add a note about this breakdown…"
                        rows={2}
                        className="min-h-[60px] resize-none border border-input bg-background pr-10 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 bottom-1.5 size-7 text-[#5A5FF2] hover:bg-[#5A5FF2]/10 hover:text-[#5A5FF2] disabled:opacity-50"
                        disabled={!agentComment.trim()}
                        onClick={handleSendComment}
                      >
                        <Send className="size-3.5" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">Flag incorrect splits or add context before confirmation. Press Enter to send.</p>
                  </div>
                  <div className="flex items-center pb-4">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground">
                      <HelpCircle className="size-4" />Need help?
                    </Button>
                  </div>
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
                  logActivity("Confirmed CDA and generated final output.");
                  toast.success("CDA generated");
                } else if (role === "team_lead") {
                  setTxStatus("team_lead_confirmed");
                  logActivity("Confirmed CDA as Team Lead.");
                  toast.success("Confirmed by Team Lead");
                } else {
                  setTxStatus("agent_confirmed");
                  logActivity("Confirmed CDA as Agent.");
                  toast.success("Confirmed by Agent");
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
                <Button variant="outline" className="h-11 rounded-[10px] px-5 text-[15px] text-slate-700" onClick={() => window.print()}>
                  <Printer className="mr-2 size-4" />
                  Print
                </Button>
                <Button className="h-11 rounded-[10px] bg-blue-600 px-5 text-[15px] hover:bg-blue-700" onClick={() => toast.success("CDA PDF downloaded")}>
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
                        <Button variant="outline" size="sm" className="h-8 rounded-lg px-4 text-xs" onClick={() => toast.success("CDA PDF downloaded")}>
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
              onClick={() => { setTxStatus("draft"); setRejectionNote(rejectInput.trim()); logActivity(`Returned CDA for edits: ${rejectInput.trim()}`); setRejectInput(""); setShowRejectDialog(false); toast.warning("Returned to agent for edits"); }}
            >
              Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent: add credit or referral fee (gross pre-split) */}
      <Dialog open={showAgentPreSplitDialog} onOpenChange={(open) => { setShowAgentPreSplitDialog(open); if (!open) { setAgentPreSplitLabel(""); setAgentPreSplitAmount(""); } }}>
        <DialogContent className="gap-0 p-0 sm:max-w-sm">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Add credit or referral fee</DialogTitle>
            <DialogDescription>Enter a label and dollar amount to deduct from gross before split.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6 py-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Label</p>
              <Input value={agentPreSplitLabel} onChange={(e) => setAgentPreSplitLabel(e.target.value)} placeholder="e.g. Referral fee" className="h-9 border border-input bg-background" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Amount</p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input value={agentPreSplitAmount} onChange={(e) => setAgentPreSplitAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" inputMode="decimal" className="h-9 pl-7 border border-input bg-background" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowAgentPreSplitDialog(false)}>Cancel</Button>
            <Button
              disabled={!agentPreSplitLabel.trim() || !agentPreSplitAmount}
              className="bg-primary"
              onClick={() => {
                const agentId = sidesData.flatMap(s => s.agents).find(a => a.id === selectedAgentId)?.id ?? selectedAgentId ?? "";
                setPreSplitDeductions((prev) => ({
                  ...prev,
                  [agentId]: [...(prev[agentId] ?? []), { id: `pre-${Date.now()}`, name: agentPreSplitLabel.trim(), amount: Math.round(Number(agentPreSplitAmount)) }],
                }));
                toast.success(`"${agentPreSplitLabel}" added`);
                setShowAgentPreSplitDialog(false);
                setAgentPreSplitLabel("");
                setAgentPreSplitAmount("");
              }}
            >
              Add
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
        onOpenChange={(open) => { if (!open) setFeeDialogTiming(null); }}
        initialData={{ timing: feeDialogTiming ?? "pre-split" }}
        onSave={handleFeeAdded}
        hideTimingField={feeDialogTiming === "pre-split"}
        hidePostSplitBase={feeDialogTiming === "pre-split"}
      />

      <Dialog open={showSlidingScaleDialog} onOpenChange={setShowSlidingScaleDialog}>
        <DialogContent className="gap-0 p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Sliding scale</DialogTitle>
            <DialogDescription>Configure tiered fee values for this post-commission deduction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-4">
            <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
              <div className="space-y-0.5">
                <Label htmlFor="inline-sliding-scale" className="text-sm">Enable sliding scale</Label>
                <p className="text-xs text-muted-foreground">Use different fee amounts by range.</p>
              </div>
              <Checkbox
                id="inline-sliding-scale"
                checked={inlineSidePostSplitSlidingScale}
                onCheckedChange={(checked) => setInlineSidePostSplitSlidingScale(Boolean(checked))}
              />
            </div>
            {inlineSidePostSplitSlidingScale && (
              <div className="space-y-3 rounded-md border bg-muted/30 p-3">
                <SlidingScaleTierRows
                  tiers={inlineSidePostSplitTiers}
                  onChange={setInlineSidePostSplitTiers}
                />
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex flex-1 items-center gap-2">
                    <Checkbox
                      id="inline-not-less-than"
                      checked={inlineSidePostSplitNotLessThan.enabled}
                      onCheckedChange={(checked) => setInlineSidePostSplitNotLessThan((prev) => ({ ...prev, enabled: Boolean(checked) }))}
                    />
                    <Label htmlFor="inline-not-less-than" className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                      Not less than
                    </Label>
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input
                        className="h-9 pl-7 text-sm"
                        value={inlineSidePostSplitNotLessThan.amount}
                        inputMode="decimal"
                        disabled={!inlineSidePostSplitNotLessThan.enabled}
                        onChange={(e) => setInlineSidePostSplitNotLessThan((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <Checkbox
                      id="inline-not-to-exceed"
                      checked={inlineSidePostSplitNotToExceed.enabled}
                      onCheckedChange={(checked) => setInlineSidePostSplitNotToExceed((prev) => ({ ...prev, enabled: Boolean(checked) }))}
                    />
                    <Label htmlFor="inline-not-to-exceed" className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                      Not to exceed
                    </Label>
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input
                        className="h-9 pl-7 text-sm"
                        value={inlineSidePostSplitNotToExceed.amount}
                        inputMode="decimal"
                        disabled={!inlineSidePostSplitNotToExceed.enabled}
                        onChange={(e) => setInlineSidePostSplitNotToExceed((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowSlidingScaleDialog(false)}>Close</Button>
            <Button onClick={() => setShowSlidingScaleDialog(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Dollar Contribution dialog */}
      <Dialog open={showCDCDialog} onOpenChange={setShowCDCDialog}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Company dollar contribution</DialogTitle>
            <DialogDescription>Learn more about how this value is calculated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-6 py-4">
            <p className="text-sm text-muted-foreground">Company dollar contribution consists of the following things:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>— Company portion of the split</li>
              <li>— Total amount of all pre and post-split deductions paid back to the company</li>
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
            <DialogDescription>Set award percentage per side of the deal.</DialogDescription>
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
                      className="h-9 w-24 pr-8 text-right text-sm"
                      inputMode="decimal"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">of price sold</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowAwardDialog(false)}>Cancel</Button>
            <Button onClick={() => { logActivity("Updated award allocation."); toast.success("Award distribution saved"); setShowAwardDialog(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Agent dialog */}
      <Dialog open={showAddAgentDialog} onOpenChange={(open) => { setShowAddAgentDialog(open); if (!open) { setAgentSearch(""); setPendingAgent(null); setAgentAllocations({}); } }}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Add agent</DialogTitle>
            {pendingAgent
              ? <DialogDescription>Allocation of the {addAgentSideId} side gross commission between multiple agents.</DialogDescription>
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
                        <p className="text-xs text-muted-foreground">of shared gross income</p>
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
              setSidesData((prev) => prev.map((side) => side.id !== addAgentSideId ? side : {
                ...side,
                agents: [...side.agents, { id: pendingAgent.id, name: pendingAgent.name, role: pendingAgent.external ? "External agent" : "Agent", payout: 0, email: pendingAgent.email, phone: pendingAgent.phone, brokerageName: pendingAgent.brokerageName, brokerageLicenseNumber: pendingAgent.brokerageLicenseNumber, brokerageStreetAddress: pendingAgent.brokerageStreetAddress, brokerageUnit: pendingAgent.brokerageUnit, brokerageCity: pendingAgent.brokerageCity, brokerageState: pendingAgent.brokerageState, brokerageZip: pendingAgent.brokerageZip, representing: pendingAgent.representing, external: pendingAgent.external }],
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
              <div className="space-y-1.5">
                <Label htmlFor="external-representing">Representing</Label>
                <Select value={externalAgentForm.representing} onValueChange={(value) => setExternalAgentForm((prev) => ({ ...prev, representing: value }))}>
                  <SelectTrigger id="external-representing" className="h-10">
                    <SelectValue placeholder="Select side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buyer">Buyer</SelectItem>
                    <SelectItem value="Seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
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
                  representing: externalAgentForm.representing,
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
                const current = COMMISSION_PLANS.find((p) => p.id === appliedPlans[pendingPlanChange.agentId]);
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
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader className="border-b px-5 py-4">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <SheetTitle className="text-base">CDA Comments & Activity</SheetTitle>
                <SheetDescription>All notes and breakdown changes for this CDA.</SheetDescription>
              </div>
              <div className="w-32 shrink-0">
                <Select value={activityView} onValueChange={(value) => setActivityView(value as ActivityView)}>
                  <SelectTrigger className="h-8 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comments">Comments</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {activityView === "comments" && (
              <div className="space-y-3 pt-1">
                {commentFeed.length > 0 ? renderCommentItems(commentFeed) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2.5 text-[11px] text-muted-foreground">
                    No comments yet.
                  </div>
                )}
              </div>
            )}
            {activityView === "activity" && (
              <div className="space-y-2 pt-1">
                {collapsedActivityFeed.length > 0 ? renderCollapsedActivityItems(collapsedActivityFeed) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2.5 text-[11px] text-muted-foreground">
                    No activity yet.
                  </div>
                )}
              </div>
            )}
            {activityView === "all" && (
              <div className="space-y-2 pt-1">
                {collapsedAllFeed.length > 0 ? collapsedAllFeed.map((entry) => (
                  entry.kind === "comment"
                    ? renderCommentItems([entry])
                    : renderCollapsedActivityItems([entry])
                )) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2.5 text-[11px] text-muted-foreground">
                    No history yet.
                  </div>
                )}
              </div>
            )}
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
