import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  CircleDollarSign,
  Building2,
  ChevronRight,
  Download,
  HelpCircle,
  Info,
  Moon,
  Pencil,
  Printer,
  Plus,
  RefreshCw,
  Sliders,
  Sun,
  Trash2,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { cn } from "../components/ui/utils";
import { CDAFlowSwitcher } from "../components/finance/cda-flow-switcher";
import { FeeBuilderModal } from "../components/finance/fee-builder-modal";
import type { FeeTypeDraft } from "../components/finance/fee-builder-modal";

type SideId = "listing" | "buyer";
type Role = "agent" | "team_lead" | "radius_auditing";
type Agent = { id: string; name: string; role: string; payout: number };
type Side = {
  id: SideId;
  title: string;
  subline: string;
  award: number;
  gross: number;
  agents: Agent[];
  active: boolean;
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
  { id: "p1", name: "80/20 Standard", detail: "80% agent · 20% office" },
  { id: "p2", name: "70/30 Standard", detail: "70% agent · 30% office" },
  { id: "p3", name: "Keystone Tiered", detail: "Tiered split plan" },
  { id: "p4", name: "Lease Referral Plan", detail: "60% agent · 40% office" },
];

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
      className="text-sm font-semibold underline underline-offset-2"
      style={{ color: "#5A5FF2" }}
    >
      {currency(value)}
    </button>
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
    <div className="group flex items-center gap-1">
      <button
        onClick={() => setEditing(true)}
        className="text-sm font-semibold underline underline-offset-2"
        style={{ color: "#5A5FF2" }}
      >
        {currency(value)}
      </button>
      <button
        onClick={() => onChange(0)}
        className="invisible size-4 text-muted-foreground/40 hover:text-destructive group-hover:visible"
        tabIndex={-1}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export function CommissionBreakdown() {
  const [detailPanelTheme, setDetailPanelTheme] = useState<"light" | "dark">("light");
  const [role, setRole] = useState<Role>("radius_auditing");
  const [selectedSide, setSelectedSide] = useState<SideId>("listing");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showGrossInfo, setShowGrossInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feeDialogTiming, setFeeDialogTiming] = useState<"pre-split" | "post-split" | null>(null);
  const [showCDCDialog, setShowCDCDialog] = useState(false);
  const [showNetCommissionDialog, setShowNetCommissionDialog] = useState(false);
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [statementNotes, setStatementNotes] = useState("");
  const [includeProgressInfo, setIncludeProgressInfo] = useState(false);
  const [appliedPlans, setAppliedPlans] = useState<Record<string, string | null>>({});
  // txStatus drives approval flow: agent submits → TL approves/rejects
  const [txStatus, setTxStatus] = useState<"draft" | "submitted" | "approved" | "rejected">("draft");
  const [rejectionNote, setRejectionNote] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [rejectInput, setRejectInput] = useState("");
  // Simple pre-split deduction for agent role (Credits / Referral Fees)
  const [showAgentPreSplitDialog, setShowAgentPreSplitDialog] = useState(false);
  const [agentPreSplitLabel, setAgentPreSplitLabel] = useState("");
  const [agentPreSplitAmount, setAgentPreSplitAmount] = useState("");
  const [showRadiusFeeDialog, setShowRadiusFeeDialog] = useState(false);
  const [radiusFeeLabel, setRadiusFeeLabel] = useState("");
  const [radiusFeeAmount, setRadiusFeeAmount] = useState("");

  const [preSplitDeductions, setPreSplitDeductions] = useState<Record<string, Array<{ id: string; name: string; amount: number }>>>({
    a1: [
      { id: "pre1", name: "Credits", amount: 200 },
      { id: "pre2", name: "Referrals", amount: 50 },
    ],
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
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [addAgentSideId, setAddAgentSideId] = useState<SideId | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [pendingAgent, setPendingAgent] = useState<{ id: string; name: string } | null>(null);
  const [agentAllocations, setAgentAllocations] = useState<Record<string, number>>({});

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
        const netCommission = commissionBasis - split;
        const companyDollar = Math.max(side.gross - commissionBasis, 0);
        return { agent, side, commissionBasis, split, netCommission, companyDollar };
      }
    }
    return null;
  }, [selectedAgentId, sides, fieldOverrides]);

  function setAgentField(field: "commissionBasis" | "split", value: number) {
    if (!selectedAgentId) return;
    setFieldOverrides((prev) => ({
      ...prev,
      [selectedAgentId]: { ...(prev[selectedAgentId] ?? {}), [field]: value },
    }));
  }

  function handleDeleteAgent() {
    if (!selectedAgentId || !selectedAgent) return;
    const agentName = selectedAgent.agent.name;
    setSidesData((prev) =>
      prev.map((side) => ({ ...side, agents: side.agents.filter((a) => a.id !== selectedAgentId) }))
    );
    setSelectedAgentId(null);
    setShowDeleteConfirm(false);
    toast.success(`${agentName} removed`);
  }

  function handleFeeAdded(fee: FeeTypeDraft) {
    if (selectedAgentId && fee.timing === "post-split") {
      setPostSplitDeductions((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { id: `ps-${Date.now()}`, name: fee.name, amount: fee.amount ?? 0 }],
      }));
    }
    toast.success(`"${fee.name}" deduction added`);
    setFeeDialogTiming(null);
  }

  const grossIncome = activeSide.gross;
  const totalAgentPayout = activeSide.agents.reduce((s, a) => s + a.payout, 0);
  const officeNet = grossIncome - totalAgentPayout;
  const activeSideOfficeShare = Math.max(grossIncome - totalAgentPayout, 0);

  // Permission helpers
  const isAgent = role === "agent";
  const isTL = role === "team_lead";
  const canEditAll = role === "radius_auditing";
  const isLocked = txStatus === "submitted" || txStatus === "approved";
  const STATUS_LABELS: Record<typeof txStatus, string> = {
    draft: "Draft",
    submitted: "Pending approval",
    approved: "Approved",
    rejected: "Returned for edits",
  };
  const STATUS_COLORS: Record<typeof txStatus, string> = {
    draft: "text-muted-foreground border-muted-foreground/30",
    submitted: "text-amber-600 border-amber-300 bg-amber-50",
    approved: "text-emerald-700 border-emerald-300 bg-emerald-50",
    rejected: "text-destructive border-destructive/30 bg-destructive/5",
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <CDAFlowSwitcher />
      <main className="flex flex-1 flex-col">

        {/* ── Breadcrumb + role bar ── */}
        <div className="flex items-center justify-between border-b bg-background px-6 py-2.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/deal-terms" className="text-xs">Transaction</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">Commission Breakdown</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-1 rounded-full border bg-muted/40 p-0.5">
            {(["agent", "team_lead", "radius_auditing"] as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all",
                  role === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "agent" ? "Agent" : r === "team_lead" ? "TL" : "Radius"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Page title bar ── */}
        <div className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="size-8 text-muted-foreground hover:text-foreground">
              <Link to="/deal-terms"><ChevronRight className="size-4 rotate-180" /></Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <h1 className="min-w-0 truncate text-sm font-semibold">Commission Breakdown — 1284 Willow Creek Dr</h1>
            <Separator orientation="vertical" className="h-4 shrink-0" />
            <span className="shrink-0 text-xs text-muted-foreground">May 13, 2026</span>
          </div>
          <div className="flex items-center gap-2">
            {txStatus !== "draft" && (
              <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", STATUS_COLORS[txStatus])}>
                {STATUS_LABELS[txStatus]}
              </span>
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
            {/* Agent: submit when draft */}
            {isAgent && txStatus === "draft" && (
              <Button size="sm" className="h-8 shrink-0 rounded-lg px-4 text-xs" onClick={() => setShowSubmitDialog(true)}>
                Submit for approval
              </Button>
            )}
            {/* Download CDA — visible to all when approved */}
            {txStatus === "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 rounded-lg px-4 text-xs"
                style={{ color: "#5A5FF2", borderColor: "#5A5FF2" }}
                onClick={() => setShowPdfPreview(true)}
              >
                <Download className="size-3.5" />
                Download CDA
              </Button>
            )}
            {/* TL/Radius: approve or reject when submitted */}
            {!isAgent && txStatus === "submitted" && (
              <>
                <Button size="sm" variant="outline" className="h-8 rounded-lg px-4 text-xs text-destructive border-destructive/40 hover:bg-destructive/5" onClick={() => setShowRejectDialog(true)}>
                  Return
                </Button>
                <Button size="sm" className="h-8 rounded-lg px-4 text-xs" style={{ backgroundColor: "#5A5FF2" }} onClick={() => setShowApproveDialog(true)}>
                  Approve
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
        <div className="grid min-h-0 flex-1 items-stretch lg:grid-cols-[3fr_2fr]">

          {/* LEFT — side cards */}
          <section className="h-full space-y-3 border-r bg-muted/30 p-4">
            {sides.map((side) => (
              <Card key={side.id} className={cn(
                "gap-0 rounded-xl shadow-none transition-all duration-150",
                side.active ? "border-primary/30 ring-1 ring-primary/15 shadow-sm" : "hover:border-border/80 hover:shadow-sm"
              )}>
                <div
                  role="button" tabIndex={0}
                  onClick={() => { setSelectedSide(side.id); setSelectedAgentId(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedSide(side.id); setSelectedAgentId(null); } }}
                  className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 outline-none"
                >
                  <div className="min-w-0">
                    <span className="text-base font-semibold">{side.title}</span>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{side.subline}</span>
                      <span className="text-xs text-muted-foreground/40">|</span>
                      {!isAgent && !isLocked ? (
                        <Badge
                          variant="outline"
                          className="cursor-pointer rounded-full px-2 py-0 text-[11px] font-medium hover:opacity-80"
                          style={{ color: "#5A5FF2", borderColor: "#5A5FF2" }}
                          onClick={(e) => { e.stopPropagation(); setShowAwardDialog(true); }}
                        >
                          Award {side.award}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full px-2 py-0 text-[11px] font-medium text-muted-foreground">
                          Award {side.award}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-muted-foreground">Side total</p>
                    <p className="text-xl font-bold tracking-tight">{currency(side.agents.reduce((s, a) => s + a.payout, 0))}</p>
                  </div>
                </div>

                <Separator />

                <div className="px-5 py-3 space-y-2">
                  {side.agents.map((agent) => (
                    <div
                      key={agent.id}
                      role="button" tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setSelectedSide(side.id); setSelectedAgentId(agent.id); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setSelectedSide(side.id); setSelectedAgentId(agent.id); } }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-4 rounded-lg px-4 py-2.5 outline-none transition-colors",
                        selectedAgentId === agent.id ? "bg-primary/8 ring-1 ring-primary/20" : "bg-muted/50 hover:bg-muted/80"
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
                          <p className="text-base font-bold tracking-tight">{currency(agent.payout)}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground/50" />
                      </div>
                    </div>
                  ))}
                  {!isAgent && !isLocked && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddAgentSideId(side.id); setAgentSearch(""); setPendingAgent(null); setAgentAllocations({}); setShowAddAgentDialog(true); }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[#5A5FF2]/5"
                      style={{ borderColor: "#5A5FF2", color: "#5A5FF2" }}
                    >
                      <Plus className="size-3.5" />Add agent
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </section>

          {/* RIGHT — agent detail OR side breakdown */}
          <aside
            className={cn("flex h-full min-h-0 flex-col border-l bg-background", detailPanelTheme === "dark" && "dark")}
            style={detailPanelTheme === "dark"
              ? { background: "radial-gradient(125% 125% at 50% 10%, #000000 55%, #160616 100%)" }
              : undefined}
          >
            {selectedAgent ? (
              <>
                {/* Agent header */}
                <div className="border-b px-5 py-4">
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
                    <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-2 py-1">
                      <Sun className="size-3.5 text-muted-foreground" />
                      <Switch
                        checked={detailPanelTheme === "dark"}
                        onCheckedChange={(checked) => setDetailPanelTheme(checked ? "dark" : "light")}
                        aria-label="Toggle detail panel theme"
                      />
                      <Moon className="size-3.5 text-muted-foreground" />
                    </div>
                    {/* Apply plan — dropdown (team_lead + radius only) */}
                    {role !== "agent" ? (
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
                    <Button variant="outline" size="sm" className="h-7 rounded-lg px-3 text-xs" onClick={() => setShowStatementDialog(true)}>Statement</Button>
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

                {/* Agent ledger */}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commission Basis</p>
                    <EditableValue value={selectedAgent.commissionBasis} onChange={(v) => setAgentField("commissionBasis", v)} readOnly={isAgent || isLocked} />
                  </div>
                  {/* Pre-split deductions (Credits, Referrals) — agents can edit amounts, TL/Radius can also add/delete */}
                  {(preSplitDeductions[selectedAgent.agent.id] ?? []).map((ded) => (
                    <div key={ded.id} className="group flex items-center justify-between py-1.5">
                      <p className="text-xs text-muted-foreground">{ded.name}</p>
                      <div className="flex items-center gap-2">
                        <DeductionValue
                          value={ded.amount}
                          readOnly={isLocked}
                          onChange={(v) => setPreSplitDeductions((prev) => ({
                            ...prev,
                            [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).map((d) => d.id === ded.id ? { ...d, amount: v } : d),
                          }))}
                        />
                        {!isAgent && !isLocked && (
                          <button
                            onClick={() => setPreSplitDeductions((prev) => ({
                              ...prev,
                              [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).filter((d) => d.id !== ded.id),
                            }))}
                            className="invisible size-4 shrink-0 text-muted-foreground/40 hover:text-destructive group-hover:visible"
                            tabIndex={-1}
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* TL/Radius can add more pre-split deductions */}
                  {!isAgent && !isLocked && (
                    <button
                      onClick={() => setFeeDialogTiming("pre-split")}
                      className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-[#5A5FF2]/15"
                      style={{ color: "#5A5FF2", backgroundColor: "rgb(90 95 242 / 0.08)" }}
                    >
                      <Plus className="size-3.5" />
                      Pre-split deduction
                    </button>
                  )}

                  <Separator className="my-3" />

                  <div className="flex items-start justify-between py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Split</p>
                      <p className="text-xs text-muted-foreground">0% of remaining balance</p>
                    </div>
                    <EditableValue value={selectedAgent.split} onChange={(v) => setAgentField("split", v)} readOnly={isAgent || isLocked} />
                  </div>
                  <Separator className="my-3" />

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
                          {ded.isRadiusFee && <span className="rounded px-1 py-0 text-[10px] font-medium bg-muted text-muted-foreground">Radius</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <DeductionValue
                            value={ded.amount}
                            readOnly={dedReadOnly}
                            onChange={(v) => setPostSplitDeductions((prev) => ({
                              ...prev,
                              [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).map((d) => d.id === ded.id ? { ...d, amount: v } : d),
                            }))}
                          />
                          {canDelete && (
                            <button
                              onClick={() => setPostSplitDeductions((prev) => ({
                                ...prev,
                                [selectedAgent.agent.id]: (prev[selectedAgent.agent.id] ?? []).filter((d) => d.id !== ded.id),
                              }))}
                              className="invisible size-4 shrink-0 text-muted-foreground/40 hover:text-destructive group-hover:visible"
                              tabIndex={-1}
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Agents and TL/Radius can add post-split deductions */}
                  {!isLocked && (
                    <button
                      onClick={() => setFeeDialogTiming("post-split")}
                      className="mt-1 flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-[#5A5FF2]/15"
                      style={{ color: "#5A5FF2", backgroundColor: "rgb(90 95 242 / 0.08)" }}
                    >
                      <Plus className="size-3.5" />
                      Post-split deduction
                    </button>
                  )}
                  {/* Radius only: add a flagged Radius fee */}
                  {canEditAll && txStatus !== "approved" && (
                    <button
                      onClick={() => setShowRadiusFeeDialog(true)}
                      className="mt-1 flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/80"
                      style={{ color: "var(--muted-foreground)", backgroundColor: "var(--muted)" }}
                    >
                      <Plus className="size-3.5" />
                      Add Radius fee
                    </button>
                  )}

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Commission</p>
                    <button
                      onClick={() => setShowNetCommissionDialog(true)}
                      className="text-sm font-semibold underline underline-offset-2"
                      style={{ color: "#5A5FF2" }}
                    >
                      {currency(selectedAgent.netCommission)}
                    </button>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Dollar Contribution</p>
                    <button
                      onClick={() => setShowCDCDialog(true)}
                      className="text-sm font-semibold underline underline-offset-2"
                      style={{ color: "#5A5FF2" }}
                    >
                      {currency(selectedAgent.companyDollar)}
                    </button>
                  </div>
                </div>

                <div className="border-t px-5 py-3">
                  <Button variant="ghost" size="sm" className="h-8 gap-2 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground">
                    <HelpCircle className="size-4" />Need help?
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="border-b px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">{activeSide.title}</h2>
                      <p className="text-xs text-muted-foreground">{activeSide.subline}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-2 py-1">
                        <Sun className="size-3.5 text-muted-foreground" />
                        <Switch
                          checked={detailPanelTheme === "dark"}
                          onCheckedChange={(checked) => setDetailPanelTheme(checked ? "dark" : "light")}
                          aria-label="Toggle detail panel theme"
                        />
                        <Moon className="size-3.5 text-muted-foreground" />
                      </div>
                      {!isAgent && !isLocked && (
                        <>
                          <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-lg px-3 text-xs" style={{ color: "#5A5FF2", borderColor: "#5A5FF2" }}>
                            <Pencil className="size-3" />Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-lg px-3 text-xs" style={{ color: "#5A5FF2", borderColor: "#5A5FF2" }} onClick={() => setShowAwardDialog(true)}>
                            <Sliders className="size-3" />Award allocation
                          </Button>
                        </>
                      )}
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

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gross Income</p>
                    <p className="text-base font-bold text-foreground">{currency(grossIncome)}</p>
                  </div>
                  {/* Agents: simplified Credits/Referral Fee dialog; TL/Radius: full fee builder */}
                  {!isLocked && (
                    <button
                      onClick={() => isAgent ? setShowAgentPreSplitDialog(true) : setFeeDialogTiming("pre-split")}
                      className="mt-2 flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-[#5A5FF2]/15"
                      style={{ color: "#5A5FF2", backgroundColor: "rgb(90 95 242 / 0.08)" }}
                    >
                      <Plus className="size-3.5" />
                      {isAgent ? "Add credit or referral fee" : "Pre-commission deduction"}
                    </button>
                  )}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent Commissions</p>
                    <p className="text-base font-bold text-foreground">{currency(totalAgentPayout)}</p>
                  </div>
                  {!isAgent && !isLocked && (
                    <div className="mt-2">
                      <button onClick={() => setFeeDialogTiming("post-split")} className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-[#5A5FF2]/15" style={{ color: "#5A5FF2", backgroundColor: "rgb(90 95 242 / 0.08)" }}>
                        <Plus className="size-3.5" />Post-commission deduction
                      </button>
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
                      <div className="text-center">
                        <p className="text-2xl font-bold tracking-tight text-foreground">{currency(officeNet)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{Math.round((officeNet / (grossIncome || 1)) * 100)}% of gross</p>
                      </div>
                    </div>
                  </div>

                  <button className="mt-2 flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-[#5A5FF2]/15" style={{ color: "#5A5FF2", backgroundColor: "rgb(90 95 242 / 0.08)" }}>
                    <Plus className="size-3.5" />Office income
                  </button>
                </div>

                <div className="border-t px-5 py-3">
                  <Button variant="ghost" size="sm" className="h-8 gap-2 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground">
                    <HelpCircle className="size-4" />Need help?
                  </Button>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      {/* Submit for approval */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for approval?</AlertDialogTitle>
            <AlertDialogDescription>
              Your team lead will review this commission breakdown. You won't be able to edit it while it's pending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction style={{ backgroundColor: "#5A5FF2" }} onClick={() => { setTxStatus("submitted"); setRejectionNote(""); setShowSubmitDialog(false); toast.success("Submitted for approval"); }}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve commission breakdown?</AlertDialogTitle>
            <AlertDialogDescription>
              This will finalize the breakdown. The agent will be notified and no further edits will be allowed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction style={{ backgroundColor: "#5A5FF2" }} onClick={() => { setTxStatus("approved"); setShowApproveDialog(false); toast.success("Breakdown approved"); }}>
              Approve
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
                <Card className="rounded-[14px] border border-black/10 shadow-none">
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

                <Card className="rounded-[14px] border border-black/10 shadow-none">
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
              onClick={() => { setTxStatus("draft"); setRejectionNote(rejectInput.trim()); setRejectInput(""); setShowRejectDialog(false); toast.warning("Returned to agent for edits"); }}
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
              <Input value={agentPreSplitLabel} onChange={(e) => setAgentPreSplitLabel(e.target.value)} placeholder="e.g. Referral fee" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Amount</p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input value={agentPreSplitAmount} onChange={(e) => setAgentPreSplitAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" inputMode="decimal" className="h-9 pl-7" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowAgentPreSplitDialog(false)}>Cancel</Button>
            <Button
              disabled={!agentPreSplitLabel.trim() || !agentPreSplitAmount}
              style={{ backgroundColor: "#5A5FF2" }}
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

      {/* Radius fee dialog */}
      <Dialog open={showRadiusFeeDialog} onOpenChange={(open) => { setShowRadiusFeeDialog(open); if (!open) { setRadiusFeeLabel(""); setRadiusFeeAmount(""); } }}>
        <DialogContent className="gap-0 p-0 sm:max-w-sm">
          <DialogHeader className="border-b px-6 pb-4 pt-5">
            <DialogTitle>Add Radius fee</DialogTitle>
            <DialogDescription>Fee will be flagged as a Radius fee — agents and team leads cannot edit or remove it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6 py-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Fee name</p>
              <Input value={radiusFeeLabel} onChange={(e) => setRadiusFeeLabel(e.target.value)} placeholder="e.g. Compliance fee" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Amount</p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input value={radiusFeeAmount} onChange={(e) => setRadiusFeeAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" inputMode="decimal" className="h-9 pl-7" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setShowRadiusFeeDialog(false)}>Cancel</Button>
            <Button
              disabled={!radiusFeeLabel.trim() || !radiusFeeAmount}
              style={{ backgroundColor: "#5A5FF2" }}
              onClick={() => {
                if (!selectedAgentId) return;
                setPostSplitDeductions((prev) => ({
                  ...prev,
                  [selectedAgentId]: [...(prev[selectedAgentId] ?? []), { id: `rf-${Date.now()}`, name: radiusFeeLabel.trim(), amount: Math.round(Number(radiusFeeAmount)), isRadiusFee: true }],
                }));
                toast.success(`Radius fee "${radiusFeeLabel}" added`);
                setShowRadiusFeeDialog(false);
                setRadiusFeeLabel("");
                setRadiusFeeAmount("");
              }}
            >
              Add fee
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

      {/* Fee type dialog — pre or post split */}
      <FeeBuilderModal
        open={feeDialogTiming !== null}
        title={feeDialogTiming === "pre-split" ? "Add pre-split deduction" : "Add post-split deduction"}
        onOpenChange={(open) => { if (!open) setFeeDialogTiming(null); }}
        initialData={{ timing: feeDialogTiming ?? "pre-split" }}
        onSave={handleFeeAdded}
      />

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
            <Button onClick={() => { toast.success("Award distribution saved"); setShowAwardDialog(false); }}>Save</Button>
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
                    onClick={() => {
                      const sideAgents = sidesData.find((s) => s.id === addAgentSideId)?.agents ?? [];
                      const equal = Math.floor(100 / (sideAgents.length + 1));
                      const allocs: Record<string, number> = {};
                      sideAgents.forEach((a) => { allocs[a.id] = equal; });
                      allocs[contact.id] = 100 - equal * sideAgents.length;
                      setAgentAllocations(allocs);
                      setPendingAgent(contact);
                    }}
                    className={cn("flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-muted/60", i < arr.length - 1 && "border-b")}
                  >
                    <span>{contact.name}</span>
                    <span className="text-xs text-muted-foreground">contact</span>
                  </button>
                ))}
                <button className="flex w-full items-center px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/60">
                  Create new…
                </button>
              </div>
            </div>
          ) : (
            /* Step 2 — allocation */
            <div className="px-6 py-4">
              <div className="mb-3 flex items-center justify-end">
                <span className="text-xs text-muted-foreground">Sales volume: <span className="font-medium" style={{ color: "#5A5FF2" }}>Auto-calculated</span></span>
              </div>
              <div className="space-y-3">
                {[...(sidesData.find((s) => s.id === addAgentSideId)?.agents ?? []), { id: pendingAgent.id, name: pendingAgent.name, role: "Agent", payout: 0 }].map((agent) => {
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
                agents: [...side.agents, { id: pendingAgent.id, name: pendingAgent.name, role: "Agent", payout: 0 }],
              }));
              toast.success(`${pendingAgent.name} added`);
              setShowAddAgentDialog(false);
            }}>
              Save
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
              toast.success(`"${pendingPlanChange.plan.name}" applied`);
              setPendingPlanChange(null);
            }}>
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
  );
}
