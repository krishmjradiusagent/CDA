import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  Copy,
  DollarSign,
  Edit3,
  FileText,
  Gift,
  HelpCircle,
  Megaphone,
  MoreVertical,
  Plus,
  ReceiptText,
  Rss,
  Search,
  Settings,
  Trash2,
  X,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { cn } from "../components/ui/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Toaster } from "../components/ui/sonner";
import { 
  FeeBadge, 
  TierBuilderRow, 
  FeeBuilderModal, 
  AgentAvatarStack 
} from "../components/finance";
import { CDAFlowSwitcher } from "../components/finance/cda-flow-switcher";

type PlanType = "standard" | "tiered";
type FeeType = "flat" | "percentage";
type ResetPeriod = "yearly" | "quarterly" | "monthly";
type BasedOn = "units" | "gci" | "sales-volume";
type DefaultMode = "all" | "specific";
type DialogMode = "add" | "edit";
type DialogName = "add-plan" | "add-fee" | "assign-defaults" | null;

type AssignDefaultsForm = {
  planId: string;
  feeIds: string[];
  assignMode: "all" | "specific";
  selectedAgentIds: string[];
  applyToActiveDeals: boolean;
};

type AssignDefaultsErrors = Partial<Record<"planId" | "selectedAgentIds", string>>;

type AssignDefaultsSource =
  | { from: "plan"; planId: string }
  | { from: "fee"; feeId: string }
  | { from: "agent"; agentId: string }
  | { from: "bulk" };

type AgentAssignment = {
  id: string;
  agentId: string;
  planId: string | null;
  feeIds: string[];
  applyToActiveDeals: boolean;
};

type ArchiveTarget = { type: "plan" | "fee"; id: string; name: string };
type UnassignDefaultsTarget = { type: "plan" | "fee"; id: string; name: string };

type DuplicateTarget = { type: "plan"; plan: CommissionPlan } | { type: "fee"; fee: FeeRecord };

type Agent = {
  id: string;
  name: string;
  email: string;
  role: "Team Lead" | "Agent";
  hasDefault: boolean;
  avatarUrl?: string;
};

type TierRow = {
  id: string;
  from: string;
  to: string;
  agentSplit: string;
  teamSplit: string;
};

type CommissionPlan = {
  id: string;
  name: string;
  type: PlanType;
  agentSplit: number;
  teamSplit: number;
  feeType: FeeType;
  feeAmount: number;
  capAmount: number;
  assignedAgentsCount: number;
  resetPeriod: ResetPeriod;
  basedOn: BasedOn;
  tiers: TierRow[];
};

type FeeRecord = FeeTypeDraft & { id: string };

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
  defaultMode: DefaultMode;
  selectedAgentIds: string[];
  tiers: TierRow[];
};

type PlanErrors = Partial<
  Record<"planName" | "splitTotal" | "selectedAgentIds", string>
> & {
  tiers?: Record<string, string>;
};

const agents: Agent[] = [
  { id: "a1", name: "Ila Corcoran", role: "Primary Agent", email: "ila@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", hasDefault: true },
  { id: "a2", name: "Michael Tran", role: "Co-Agent", email: "michael@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", hasDefault: false },
  { id: "a3", name: "Sarah Jenkins", role: "Team Lead", email: "sarah@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop", hasDefault: false },
  { id: "a4", name: "David Chen", role: "Broker", email: "david@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", hasDefault: false },
  { id: "a5", name: "Emma Wilson", role: "Associate", email: "emma@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", hasDefault: false },
  { id: "a6", name: "James Miller", role: "Agent", email: "james@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop", hasDefault: false },
  { id: "a7", name: "Olivia Taylor", role: "Agent", email: "olivia@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=150&auto=format&fit=crop", hasDefault: false },
  { id: "a8", name: "Noah Garcia", role: "Agent", email: "noah@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", hasDefault: false },
  { id: "a9", name: "Sophia Brown", role: "Agent", email: "sophia@radiusagent.com", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop", hasDefault: false },
];

const defaultTiers: TierRow[] = [
  { id: "tier-1", from: "1", to: "5", agentSplit: "80", teamSplit: "20" },
  { id: "tier-2", from: "6", to: "10", agentSplit: "85", teamSplit: "15" },
  { id: "tier-3", from: "11", to: "25", agentSplit: "90", teamSplit: "10" },
  { id: "tier-4", from: "26", to: "", agentSplit: "95", teamSplit: "5" },
];

const seedPlans: CommissionPlan[] = [
  { id: "p1", name: "80/20 Standard", type: "standard", agentSplit: 80, teamSplit: 20, feeType: "flat", feeAmount: 495, capAmount: 18000, assignedAgentsCount: 12, resetPeriod: "yearly", basedOn: "units", tiers: [] },
  { id: "p2", name: "70/30 Standard", type: "standard", agentSplit: 70, teamSplit: 30, feeType: "flat", feeAmount: 495, capAmount: 15000, assignedAgentsCount: 4, resetPeriod: "yearly", basedOn: "units", tiers: [] },
  { id: "p3", name: "Keystone Tiered", type: "tiered", agentSplit: 80, teamSplit: 20, feeType: "flat", feeAmount: 0, capAmount: 0, assignedAgentsCount: 2, resetPeriod: "yearly", basedOn: "units", tiers: defaultTiers.map((t) => ({ ...t })) },
  { id: "p4", name: "Lease Referral Plan", type: "standard", agentSplit: 60, teamSplit: 40, feeType: "flat", feeAmount: 0, capAmount: 0, assignedAgentsCount: 0, resetPeriod: "yearly", basedOn: "units", tiers: [] },
];

const seedFees: FeeRecord[] = [
  { id: "f1", name: "TC Fee", type: "flat", amount: "500", timing: "pre-split", appliesToMode: "team", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: true },
  { id: "f2", name: "RM Fee", type: "flat", amount: "300", timing: "post-split", appliesToMode: "agent", agentIds: ["a1", "a3", "a5"], slidingScale: false, contributesToCap: true, tiers: [], percentageBase: "pre-split", visibleOnCda: true },
  { id: "f3", name: "E&O Fee", type: "flat", amount: "125", timing: "post-split", appliesToMode: "agent", agentIds: ["a1", "a2", "a3"], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: true },
  { id: "f4", name: "Compliance Review", type: "flat", amount: "250", timing: "pre-split", appliesToMode: "both", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: false },
];

export const seedAssignments: AgentAssignment[] = [
  { id: "as1", agentId: "a1", planId: "p1", feeIds: ["f1", "f2"], applyToActiveDeals: true },
  { id: "as2", agentId: "a2", planId: "p2", feeIds: ["f3"], applyToActiveDeals: false },
  { id: "as3", agentId: "a3", planId: "p1", feeIds: ["f1", "f2", "f3"], applyToActiveDeals: true },
  { id: "as4", agentId: "a4", planId: "p3", feeIds: ["f4"], applyToActiveDeals: true },
  { id: "as5", agentId: "a5", planId: "p2", feeIds: ["f2"], applyToActiveDeals: false },
  { id: "as6", agentId: "a6", planId: "p1", feeIds: ["f1"], applyToActiveDeals: true },
  { id: "as7", agentId: "a7", planId: "p1", feeIds: ["f1", "f3"], applyToActiveDeals: true },
  { id: "as8", agentId: "a8", planId: "p2", feeIds: ["f2", "f4"], applyToActiveDeals: false },
  { id: "as9", agentId: "a9", planId: "p3", feeIds: ["f3"], applyToActiveDeals: true },
];

function getFreshAssignDefaultsForm(): AssignDefaultsForm {
  return { planId: "", feeIds: [], assignMode: "specific", selectedAgentIds: [], applyToActiveDeals: false };
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
    applyAsDefault: false,
    defaultMode: "all",
    selectedAgentIds: [],
    tiers: defaultTiers.map((tier) => ({ ...tier })),
  };
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function formatFee(plan: CommissionPlan) {
  if (plan.feeType === "percentage") return `${plan.feeAmount}%`;
  return `${formatMoney(plan.feeAmount)} flat`;
}

function formatBasedOn(value: BasedOn) {
  if (value === "gci") return "GCI";
  if (value === "sales-volume") return "Sales Volume";
  return "Units";
}

function numericValue(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function RadiusLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative size-8 rounded-full border border-foreground/70">
        <div className="absolute inset-1 rounded-full border border-foreground/50" />
        <div className="absolute inset-2 rounded-full border border-foreground/40" />
        <div className="absolute inset-[11px] rounded-full bg-foreground/70" />
      </div>
      <div className="text-[25px] font-normal tracking-[0.28em] text-foreground/80">RADIUS</div>
    </div>
  );
}

function SidebarIcon({ icon: Icon, active = false, label }: { icon: LucideIcon; active?: boolean; label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      className="size-9 rounded-[4px] text-[#1f2937] hover:bg-muted"
    >
      <Icon className={active ? "size-5 text-primary" : "size-5"} />
    </Button>
  );
}

function EmptySection({
  title,
  description,
  emptyDescription,
  icon: Icon,
  action,
  onAction,
}: {
  title: string;
  description: string;
  emptyDescription: string;
  icon: LucideIcon;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-medium leading-6 text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Card className="h-[254px] rounded-[14px] border-border shadow-none">
        <CardContent className="flex size-full flex-col items-center justify-center p-0 text-center">
          <div className="mb-5 flex size-12 items-center justify-center rounded-[15px] bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <h3 className="text-sm font-medium leading-5 text-foreground">
            {title === "Commission Plans"
              ? "No commission plans yet"
              : title === "Fee Types"
                ? "No fee types yet"
                : "No defaults assigned yet"}
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{emptyDescription}</p>
          <Button variant="outline" size="sm" className="mt-4 border-primary text-primary hover:text-primary" onClick={onAction}>
            <Plus className="size-4" />
            {action}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function PlanTypeBadge({ type }: { type: PlanType }) {
  return (
    <Badge
      variant={type === "tiered" ? "outline" : "secondary"}
      className={type === "tiered" ? "border-[#fee685] bg-[#fffbeb] text-[#bb4d00]" : "text-muted-foreground"}
    >
      {type === "tiered" ? "Tiered" : "Standard"}
    </Badge>
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
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {adornment}
        </span>
      )}
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        inputMode="decimal"
        aria-invalid={invalid}
        className={adornmentSide === "start" ? "h-10 w-full box-border pl-7" : "h-10 w-full box-border pr-8"}
        onChange={(event) => onChange(event.target.value)}
      />
      {adornmentSide === "end" && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {adornment}
        </span>
      )}
    </div>
  );
}

function CommissionPlanCard({
  plan,
  onEdit,
  onAssign,
  onDuplicate,
  onArchive,
}: {
  plan: CommissionPlan;
  onEdit: (plan: CommissionPlan) => void;
  onAssign: (plan: CommissionPlan) => void;
  onDuplicate: (plan: CommissionPlan) => void;
  onArchive: (plan: CommissionPlan) => void;
}) {
  return (
    <div className="group flex min-h-[66px] items-center justify-between border-b px-6 py-3 last:border-b-0 hover:bg-muted/30 transition-colors duration-150 cursor-pointer">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-5 text-foreground">{plan.name}</p>
          <PlanTypeBadge type={plan.type} />
        </div>
        <div className="flex flex-nowrap items-center gap-4 text-xs text-muted-foreground overflow-hidden">
          {plan.type === "standard" ? (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Agent</span>
              <span className="font-semibold text-foreground">{plan.agentSplit}%</span>
              <span className="text-muted-foreground mx-0.5">·</span>
              <span className="text-muted-foreground">Team</span>
              <span className="font-semibold text-foreground">{plan.teamSplit}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Based on</span>
                <span className="font-medium text-foreground">{formatBasedOn(plan.basedOn)}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">{plan.tiers.length}</span>
                <span className="text-muted-foreground">tiers</span>
              </div>
            </div>
          )}
          <span className="text-muted-foreground/30 mx-1">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Fee</span>
            <span className="font-semibold text-foreground">{formatFee(plan)}</span>
          </div>
          <span className="text-muted-foreground/30 mx-1">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Cap</span>
            <span className="font-semibold text-foreground">{formatMoney(plan.capAmount)}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="flex -space-x-2">
              {(() => {
                const assignedAgentIds = seedAssignments.filter(a => a.planId === plan.id).map(a => a.agentId);
                const assignedAgents = agents.filter(a => assignedAgentIds.includes(a.id));
                return (
                  <AgentAvatarStack 
                    agents={assignedAgents.map(a => ({ name: a.name, avatarUrl: a.avatarUrl }))} 
                    max={3} 
                    size="sm"
                  />
                );
              })()}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground/60">agents</span>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${plan.name} menu`}
            className="size-8"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(plan)}>
              <Edit3 className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssign(plan)}>
              <UserCheck className="size-4" />
              Assign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(plan)}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onArchive(plan)}>
              <Archive className="size-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AgentMultiSelect({
  selectedAgentIds,
  lockedAgentId,
  onChange,
}: {
  selectedAgentIds: string[];
  lockedAgentId?: string;
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  function toggle(agentId: string) {
    if (agentId === lockedAgentId) return;
    onChange(
      selectedAgentIds.includes(agentId)
        ? selectedAgentIds.filter((id) => id !== agentId)
        : [...selectedAgentIds, agentId],
    );
  }

  const filtered = agents.filter((a) =>
    `${a.name} ${a.email} ${a.role}`.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = agents.filter((a) => selectedAgentIds.includes(a.id));

  const allSelected = selectedAgentIds.length === agents.length;
  let triggerLabel = "Select agents";
  if (allSelected) {
    triggerLabel = "Selected all agents";
  } else if (selected.length === 1) {
    triggerLabel = selected[0].name;
  } else if (selected.length > 1) {
    triggerLabel = `${selected[0].name} +${selected.length - 1} others`;
  }

  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 w-full justify-between font-normal px-3 overflow-hidden">
            <span className={cn("truncate text-sm", selected.length === 0 ? "text-muted-foreground" : "text-foreground font-medium")}>
              {triggerLabel}
            </span>
            <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-[var(--radix-dropdown-menu-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            window.requestAnimationFrame(() => searchRef.current?.focus());
          }}
        >
          <div className="p-2">
            <Input
              ref={searchRef}
              placeholder="Search agents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <DropdownMenuSeparator className="my-0" />
          {filtered.length > 0 && (
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => {
                const allSelected = filtered.every(a => selectedAgentIds.includes(a.id));
                if (allSelected) {
                  onChange(selectedAgentIds.filter(id => !filtered.find(a => a.id === id) || id === lockedAgentId));
                } else {
                  const newIds = new Set([...selectedAgentIds, ...filtered.map(a => a.id)]);
                  onChange(Array.from(newIds));
                }
              }}
              className="gap-3 cursor-pointer border-b rounded-none pb-2 mb-1"
            >
              <Checkbox checked={filtered.every(a => selectedAgentIds.includes(a.id))} className="pointer-events-none" />
              <span className="flex-1 text-sm font-medium">Select All</span>
            </DropdownMenuItem>
          )}
          {filtered.map((agent) => (
            <DropdownMenuItem
              key={agent.id}
              onSelect={(e) => e.preventDefault()}
              onClick={() => toggle(agent.id)}
              disabled={agent.id === lockedAgentId}
              className="gap-3 cursor-pointer"
            >
              <Checkbox checked={selectedAgentIds.includes(agent.id)} className="pointer-events-none" />
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-xs">
                  {agent.name.split(" ").map((p) => p[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium">{agent.name}</span>

            </DropdownMenuItem>
          ))}
          {filtered.length === 0 && (
            <p className="py-3 text-center text-sm text-muted-foreground">No agents found</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function FeeMultiSelect({
  fees,
  selectedFeeIds,
  lockedFeeId,
  onChange,
}: {
  fees: FeeRecord[];
  selectedFeeIds: string[];
  lockedFeeId?: string;
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  function toggle(feeId: string) {
    if (feeId === lockedFeeId) return;
    onChange(
      selectedFeeIds.includes(feeId)
        ? selectedFeeIds.filter((id) => id !== feeId)
        : [...selectedFeeIds, feeId],
    );
  }

  const filtered = fees.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const selected = fees.filter((f) => selectedFeeIds.includes(f.id));

  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 w-full justify-between font-normal">
            <span className="text-muted-foreground text-sm">Select fees</span>
            <div className="flex items-center gap-1.5">
              <Badge variant={selectedFeeIds.length > 0 ? "secondary" : "outline"} className="h-5 px-1.5 text-xs">
                {selectedFeeIds.length}
              </Badge>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-[var(--radix-dropdown-menu-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            window.requestAnimationFrame(() => searchRef.current?.focus());
          }}
        >
          <div className="p-2">
            <Input
              ref={searchRef}
              placeholder="Search fees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <DropdownMenuSeparator className="my-0" />
          {filtered.map((fee) => (
            <DropdownMenuItem
              key={fee.id}
              onSelect={(e) => e.preventDefault()}
              onClick={() => toggle(fee.id)}
              disabled={fee.id === lockedFeeId}
              className="gap-3 cursor-pointer"
            >
              <Checkbox checked={selectedFeeIds.includes(fee.id)} className="pointer-events-none" />
              <span className="flex-1 text-sm">{fee.name}</span>
              <span className="text-xs text-muted-foreground">
                {fee.type === "flat" ? `$${fee.amount}` : `${fee.amount}%`}
              </span>
            </DropdownMenuItem>
          ))}
          {filtered.length === 0 && (
            <p className="py-3 text-center text-sm text-muted-foreground">No fees found</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((fee) => (
            <Badge key={fee.id} variant="secondary" className="gap-1 pr-1.5">
              {fee.name}
              {fee.id !== lockedFeeId && (
                <button
                  type="button"
                  aria-label={`Remove ${fee.name}`}
                  className="ml-0.5 rounded-full opacity-60 hover:opacity-100"
                  onClick={() => toggle(fee.id)}
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function DealTypeMultiSelect({
  selectedTypes,
  onChange,
}: {
  selectedTypes: Record<string, boolean>;
  onChange: (types: Record<string, boolean>) => void;
}) {
  const [open, setOpen] = useState(false);
  const dealTypeOptions = ["Buyer", "Seller", "Lease", "Landlord"];
  const selectedKeys = Object.keys(selectedTypes).filter(k => selectedTypes[k]);

  const allSelected = selectedKeys.length === dealTypeOptions.length;
  let triggerLabel = "Select deal types";
  if (allSelected) {
    triggerLabel = "Selected all deal types";
  } else if (selectedKeys.length === 1) {
    triggerLabel = selectedKeys[0].charAt(0).toUpperCase() + selectedKeys[0].slice(1);
  } else if (selectedKeys.length > 1) {
    triggerLabel = `${selectedKeys[0].charAt(0).toUpperCase() + selectedKeys[0].slice(1)} +${selectedKeys.length - 1} others`;
  }

  function toggle(type: string) {
    const key = type.toLowerCase();
    onChange({
      ...selectedTypes,
      [key]: !selectedTypes[key],
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
            const next: Record<string, boolean> = {};
            dealTypeOptions.forEach(opt => {
              next[opt.toLowerCase()] = nextAllSelected;
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
            key={type}
            onSelect={(e) => e.preventDefault()}
            onClick={() => toggle(type)}
            className="gap-3 cursor-pointer"
          >
            <Checkbox checked={Boolean(selectedTypes[type.toLowerCase()])} className="pointer-events-none" />
            <span className="flex-1 text-sm font-medium">{type}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
  onUpdateTier: (tierId: string, patch: Partial<TierRow>) => void;
  onAddTier: () => void;
  onRemoveTier: (tierId: string) => void;
}) {
  const moneyMode = form.basedOn !== "units";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label>Tier Builder</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          {moneyMode ? "Currency range" : "Deal count range"}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {form.tiers.map((tier, index) => {
          const tierError = errors.tiers?.[tier.id];
          return (
            <Card key={tier.id} className="rounded-lg shadow-none">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Tier {index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={form.tiers.length === 1}
                    onClick={() => onRemoveTier(tier.id)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`${tier.id}-from`}>From</Label>
                    {moneyMode ? (
                      <AdornedInput
                        id={`${tier.id}-from`}
                        value={tier.from}
                        adornment="$"
                        invalid={Boolean(tierError)}
                        onChange={(value) => onUpdateTier(tier.id, { from: value })}
                      />
                    ) : (
                      <Input
                        id={`${tier.id}-from`}
                        value={tier.from}
                        inputMode="numeric"
                        aria-invalid={Boolean(tierError)}
                        className="h-10"
                        onChange={(event) => onUpdateTier(tier.id, { from: event.target.value })}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`${tier.id}-to`}>To</Label>
                    {moneyMode ? (
                      <AdornedInput
                        id={`${tier.id}-to`}
                        value={tier.to}
                        adornment="$"
                        invalid={Boolean(tierError)}
                        onChange={(value) => onUpdateTier(tier.id, { to: value })}
                      />
                    ) : (
                      <Input
                        id={`${tier.id}-to`}
                        value={tier.to}
                        inputMode="numeric"
                        aria-invalid={Boolean(tierError)}
                        className="h-10"
                        onChange={(event) => onUpdateTier(tier.id, { to: event.target.value })}
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`${tier.id}-agent`}>Agent Split %</Label>
                    <Input
                      id={`${tier.id}-agent`}
                      value={tier.agentSplit}
                      inputMode="numeric"
                      aria-invalid={Boolean(tierError)}
                      className="h-10"
                      onChange={(event) => {
                        const value = event.target.value;
                        onUpdateTier(tier.id, {
                          agentSplit: value,
                          teamSplit: String(Math.max(0, 100 - numericValue(value))),
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`${tier.id}-team`}>Team Split %</Label>
                    <Input
                      id={`${tier.id}-team`}
                      value={tier.teamSplit}
                      inputMode="numeric"
                      aria-invalid={Boolean(tierError)}
                      className="h-10"
                      onChange={(event) => {
                        const value = event.target.value;
                        onUpdateTier(tier.id, {
                          teamSplit: value,
                          agentSplit: String(Math.max(0, 100 - numericValue(value))),
                        });
                      }}
                    />
                  </div>
                </div>
                {tierError && <p className="text-xs text-destructive">{tierError}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Button variant="outline" size="sm" onClick={onAddTier}>
        <Plus className="size-4" />
        Add Tier
      </Button>
    </div>
  );
}

function PlanSetupSummaryCard({
  form,
  expanded,
  onExpandToggle,
  onEdit,
}: {
  form: PlanForm;
  expanded: boolean;
  onExpandToggle: () => void;
  onEdit: () => void;
}) {
  const splitSummary =
    form.planType === "standard"
      ? `Agent ${form.agentSplit}% / Team ${form.teamSplit}%`
      : `${form.tiers.length} tiers`;
  const feeSummary =
    form.feeType === "flat"
      ? `${formatMoney(numericValue(form.feeAmount || "495"))} flat`
      : `${form.feeAmount || "2.5"}%`;

  return (
    <Card className="rounded-lg border bg-muted/40 shadow-none">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-medium leading-5 text-foreground">Plan setup</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-foreground">{form.planName || "Unnamed plan"}</p>
              <span className="text-xs text-muted-foreground">·</span>
              <Badge variant="secondary">{form.planType === "standard" ? "Standard" : "Tiered"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {splitSummary} · {feeSummary} · Cap {formatMoney(numericValue(form.capAmount || "0"))}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={onExpandToggle}>
              {expanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
          aria-invalid={Boolean(errors.planName)}
          className="h-10 w-full box-border"
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
                aria-invalid={Boolean(errors.splitTotal)}
                className="h-10 w-full box-border"
                onChange={(event) => onAgentSplitChange(event.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="team-split" className="text-sm font-medium">Team Split %</Label>
              <Input
                id="team-split"
                value={form.teamSplit}
                inputMode="numeric"
                aria-invalid={Boolean(errors.splitTotal)}
                className="h-10 w-full box-border"
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
                <SelectGroup>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectGroup>
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
                <SelectGroup>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="gci">Gross Commission</SelectItem>
                  <SelectItem value="sales-volume">Sales Volume</SelectItem>
                </SelectGroup>
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
        <Label className="text-sm font-medium">Fee Type</Label>
        <Input className="h-10 w-full" value="Flat Fee" readOnly aria-readonly="true" />
      </div>

      <div className="grid w-full grid-cols-2 gap-4">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="fee-amount" className="text-sm font-medium">{feeLabel}</Label>
          <AdornedInput
            id="fee-amount"
            value={form.feeAmount}
            placeholder="495"
            adornment="$"
            adornmentSide="start"
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

function AssignDefaultsDialog({
  open,
  source,
  form,
  errors,
  plans,
  fees,
  isAssigning,
  onFormChange,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  source: AssignDefaultsSource;
  form: AssignDefaultsForm;
  errors: AssignDefaultsErrors;
  plans: CommissionPlan[];
  fees: FeeRecord[];
  isAssigning: boolean;
  onFormChange: (patch: Partial<AssignDefaultsForm>) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  const lockedPlan = source.from === "plan" ? plans.find((p) => p.id === source.planId) : null;
  const lockedFee = source.from === "fee" ? fees.find((f) => f.id === source.feeId) : null;
  const lockedAgentId = source.from === "agent" ? source.agentId : undefined;
  const lockedAgent = lockedAgentId ? agents.find((a) => a.id === lockedAgentId) : null;
  const editMode = (source.from === "plan" || source.from === "fee") && form.selectedAgentIds.length > 0;

  const showPlanSelect = source.from !== "plan" && source.from !== "fee";
  const showFeeSelect = source.from !== "fee" && source.from !== "plan";
  const showAssignTo = source.from !== "agent";

  const needsPlan = showPlanSelect;
  const isValid =
    (!needsPlan || Boolean(form.planId)) &&
    (!showAssignTo || form.selectedAgentIds.length > 0) &&
    (showAssignTo || (lockedAgentId !== undefined));

  function toggleFee(feeId: string) {
    if (source.from === "fee" && feeId === source.feeId) return;
    onFormChange({
      feeIds: form.feeIds.includes(feeId)
        ? form.feeIds.filter((id) => id !== feeId)
        : [...form.feeIds, feeId],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex !h-auto !max-h-[82vh] !w-[560px] !max-w-[calc(100vw-48px)] !flex-col !gap-0 !overflow-hidden !rounded-[12px] !p-0 sm:!max-w-[560px] [&>button[data-slot=dialog-close]]:hidden">
        <DialogHeader className="border-b px-6 pt-6 pb-4 !text-left">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-base font-semibold leading-5">
                {editMode ? "Edit Defaults" : "Assign Defaults"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                {editMode
                  ? "Update agent defaults for this commission plan or fee type."
                  : "Set default commission plans and fees for your agents."}
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

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">

          {/* Locked agent summary (Case 3) */}
          {lockedAgent && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {lockedAgent.name.split(" ").map((p) => p[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{lockedAgent.name}</p>

              </div>
              <Badge variant="secondary" className="text-xs shrink-0">Agent locked</Badge>
            </div>
          )}

          {/* Commission Plan select (Cases 2, 3, 4) */}
          {showPlanSelect && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">
                Commission Plan <span className="text-destructive">*</span>
              </Label>
              <Select value={form.planId} onValueChange={(value) => onFormChange({ planId: value })}>
                <SelectTrigger className="h-10 w-full" aria-invalid={Boolean(errors.planId)}>
                  <SelectValue placeholder="Select a commission plan…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <span className="font-medium">{plan.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {plan.type === "standard" ? `${plan.agentSplit}/${plan.teamSplit}` : "Tiered"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.planId && <p className="text-xs text-destructive">{errors.planId}</p>}
            </div>
          )}

          {/* Default Fees multi-select (Cases 1, 3, 4) */}
          {showFeeSelect && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Default Fees</Label>
              <FeeMultiSelect
                fees={fees}
                selectedFeeIds={form.feeIds}
                lockedFeeId={source.from === "fee" ? source.feeId : undefined}
                onChange={(feeIds) => onFormChange({ feeIds })}
              />
            </div>
          )}

          {/* Assignment controls (Cases 1, 2, 4) */}
          {showAssignTo && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">Assign To</Label>
              <AgentMultiSelect
                selectedAgentIds={form.selectedAgentIds}
                lockedAgentId={lockedAgentId}
                onChange={(selectedAgentIds) => onFormChange({ selectedAgentIds })}
              />
              {errors.selectedAgentIds && (
                <p className="text-xs text-destructive">{errors.selectedAgentIds}</p>
              )}
            </div>
          )}

          {/* Active Deals */}
          <div className="flex items-start justify-between gap-4 rounded-md border px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="active-deals" className="text-sm font-medium">Apply to under contract deals</Label>
              <p className="text-xs text-muted-foreground">
                Recalculates CDA forecasts for active transactions.
              </p>
            </div>
            <Switch
              id="active-deals"
              checked={form.applyToActiveDeals}
              onCheckedChange={(checked) => onFormChange({ applyToActiveDeals: checked })}
            />
          </div>
        </div>

        <DialogFooter className="!flex !flex-row !items-center !justify-end !gap-3 shrink-0 border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>Cancel</Button>
          <Button onClick={onSave} disabled={!isValid || isAssigning}>
            {isAssigning ? "Saving…" : editMode ? "Update Defaults" : "Assign Defaults"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        </div>
        <DialogFooter className="!flex !flex-row !items-center !justify-end !gap-3 shrink-0 border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave}>Save Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DefaultAssignmentsTable({
  assignments,
  plans,
  fees,
  onEdit,
  onPreview,
  onDeals,
  onClear,
  onAddDefaults,
}: {
  assignments: AgentAssignment[];
  plans: CommissionPlan[];
  fees: FeeRecord[];
  onEdit: (assignment: AgentAssignment) => void;
  onPreview: (assignment: AgentAssignment) => void;
  onDeals: (assignment: AgentAssignment) => void;
  onClear: (assignment: AgentAssignment) => void;
  onAddDefaults: () => void;
}) {
  const [search, setSearch] = useState("");

  const filteredAssignments = useMemo(() => {
    if (!search) return assignments;
    const lowerSearch = search.toLowerCase();
    return assignments.filter((assignment) => {
      const agent = agents.find((a) => a.id === assignment.agentId);
      if (!agent) return false;
      return (
        agent.name.toLowerCase().includes(lowerSearch) ||
        agent.email.toLowerCase().includes(lowerSearch) ||
        agent.role.toLowerCase().includes(lowerSearch)
      );
    });
  }, [assignments, search]);


  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium leading-6 text-foreground">Default Assignments</h2>
          <p className="text-xs text-muted-foreground max-w-md">
            Connect plans and fees to agents so new CDA estimates use the right calculation rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
            <Input 
              placeholder="Search agents…" 
              className="pl-9 h-9 text-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all bg-background/50 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border border-border/50 rounded-[14px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b bg-muted/20">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Agent</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Email</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Commission Plan</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Default Fees</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map((assignment) => {
              const agent = agents.find((a) => a.id === assignment.agentId);
              const plan = plans.find((p) => p.id === assignment.planId);
              const assignedFees = fees.filter((f) => assignment.feeIds.includes(f.id));
              if (!agent) return null;
              
              return (
                <TableRow 
                  key={assignment.id} 
                  className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0 border-2 border-background ring-1 ring-border/5 overflow-hidden">
                        <AvatarImage src={agent.avatarUrl} alt={agent.name} className="object-cover aspect-square" />
                        <AvatarFallback className="text-xs">{agent.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                        <p className="text-sm font-semibold text-foreground shrink-0">{agent.name}</p>

                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-[13px] text-muted-foreground font-medium truncate">{agent.email}</p>
                  </TableCell>
                    <TableCell>
                      {plan ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{plan.name}</span>
                          {plan.type === "standard" && (
                            <span className="text-[11px] text-muted-foreground/60 font-medium">({plan.agentSplit}/{plan.teamSplit})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic text-amber-600/60 font-medium">No plan assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignedFees.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {assignedFees.slice(0, 5).map((fee) => (
                            <Badge key={fee.id} variant="secondary" className="px-2 py-0 h-4.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border-transparent">
                              {fee.name}
                            </Badge>
                          ))}
                          {assignedFees.length > 5 && (
                            <span className="text-[10px] font-bold text-muted-foreground/40">+{assignedFees.length - 5} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 font-medium">None</span>
                      )}
                    </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function CDASettings() {
  const [state, setState] = useState<{
    plans: CommissionPlan[];
    activePlanId: string | null;
    activeDialog: DialogName;
    planDialogMode: DialogMode;
    form: PlanForm;
    errors: PlanErrors;
    pendingPlan: CommissionPlan | null;
    overwriteOpen: boolean;
    fees: FeeRecord[];
    feeDraft: Partial<FeeTypeDraft>;
    feeDialogMode: DialogMode;
    assignDefaultsForm: AssignDefaultsForm;
    assignDefaultsErrors: AssignDefaultsErrors;
    defaultAssignments: AgentAssignment[];
    assignDefaultsSource: AssignDefaultsSource;
    archiveTarget: ArchiveTarget | null;
    duplicateTarget: DuplicateTarget | null;
    unassignDefaultsTarget: UnassignDefaultsTarget | null;
    clearAssignmentTarget: AgentAssignment | null;
    previewAssignment: AgentAssignment | null;
    dealsAssignment: AgentAssignment | null;
    isAssigning: boolean;
  }>({
    plans: seedPlans,
    activePlanId: null,
    activeDialog: null,
    planDialogMode: "add",
    form: getFreshPlanForm(),
    errors: {},
    pendingPlan: null,
    overwriteOpen: false,
    fees: seedFees,
    feeDraft: {},
    feeDialogMode: "add",
    assignDefaultsForm: getFreshAssignDefaultsForm(),
    assignDefaultsErrors: {},
    defaultAssignments: seedAssignments,
    assignDefaultsSource: { from: "bulk" },
    archiveTarget: null,
    duplicateTarget: null,
    unassignDefaultsTarget: null,
    clearAssignmentTarget: null,
    previewAssignment: null,
    dealsAssignment: null,
    isAssigning: false,
  });

  const selectedDefaultAgents = useMemo(() => {
    if (!state.form.applyAsDefault) return [];
    if (state.form.defaultMode === "all") return agents;
    return agents.filter((agent) => state.form.selectedAgentIds.includes(agent.id));
  }, [state.form.applyAsDefault, state.form.defaultMode, state.form.selectedAgentIds]);

  function closeDialog() {
    setState((current) => ({ ...current, activeDialog: null }));
  }

  function updateAssignDefaultsForm(patch: Partial<AssignDefaultsForm>) {
    setState((current) => ({
      ...current,
      assignDefaultsForm: { ...current.assignDefaultsForm, ...patch },
    }));
  }

  function getPlanAssignedAgentIds(planId: string) {
    return state.defaultAssignments.filter((assignment) => assignment.planId === planId).map((assignment) => assignment.agentId);
  }

  function getFeeAssignedAgentIds(feeId: string) {
    return state.defaultAssignments.filter((assignment) => assignment.feeIds.includes(feeId)).map((assignment) => assignment.agentId);
  }

  function openPlanDefaults(plan: CommissionPlan, mode: "assign" | "edit") {
    const selectedAgentIds = mode === "edit" ? getPlanAssignedAgentIds(plan.id) : [];
    setState((current) => ({
      ...current,
      activeDialog: "assign-defaults",
      assignDefaultsSource: { from: "plan", planId: plan.id },
      assignDefaultsForm: {
        ...getFreshAssignDefaultsForm(),
        planId: plan.id,
        selectedAgentIds,
        applyToActiveDeals: selectedAgentIds.some((agentId) => {
          const assignment = current.defaultAssignments.find((item) => item.agentId === agentId);
          return assignment?.applyToActiveDeals ?? false;
        }),
      },
      assignDefaultsErrors: {},
    }));
  }

  function openFeeDefaults(fee: FeeRecord, mode: "assign" | "edit") {
    const selectedAgentIds = mode === "edit" ? getFeeAssignedAgentIds(fee.id) : [];
    setState((current) => ({
      ...current,
      activeDialog: "assign-defaults",
      assignDefaultsSource: { from: "fee", feeId: fee.id },
      assignDefaultsForm: {
        ...getFreshAssignDefaultsForm(),
        feeIds: [fee.id],
        selectedAgentIds,
        applyToActiveDeals: selectedAgentIds.some((agentId) => {
          const assignment = current.defaultAssignments.find((item) => item.agentId === agentId);
          return assignment?.applyToActiveDeals ?? false;
        }),
      },
      assignDefaultsErrors: {},
    }));
  }

  function handleSaveAssignDefaults() {
    const source = state.assignDefaultsSource;
    const form = state.assignDefaultsForm;
    const errs: AssignDefaultsErrors = {};

    if (source.from !== "plan" && !form.planId) errs.planId = "Commission plan required";
    if (source.from !== "agent" && form.selectedAgentIds.length === 0) {
      errs.selectedAgentIds = "Select at least one agent";
    }

    if (Object.keys(errs).length > 0) {
      setState((current) => ({ ...current, assignDefaultsErrors: errs }));
      return;
    }

    const effectivePlanId = source.from === "plan" ? source.planId : form.planId || null;
    const effectiveFeeIds =
      source.from === "fee"
        ? [source.feeId, ...form.feeIds.filter((id) => id !== source.feeId)]
        : form.feeIds;
    const targetAgentIds =
      source.from === "agent"
        ? [source.agentId]
        : form.selectedAgentIds;

    setState((current) => {
      let nextAssignments = current.defaultAssignments;

      if (source.from === "plan") {
        const targetSet = new Set(targetAgentIds);
        nextAssignments = [
          ...current.defaultAssignments.filter((assignment) => assignment.planId !== source.planId && !targetSet.has(assignment.agentId)),
          ...targetAgentIds.map((agentId) => {
            const existing = current.defaultAssignments.find((assignment) => assignment.agentId === agentId);
            return {
              id: existing?.id ?? crypto.randomUUID(),
              agentId,
              planId: source.planId,
              feeIds: existing?.feeIds ?? [],
              applyToActiveDeals: form.applyToActiveDeals,
            };
          }),
        ];
      } else if (source.from === "fee") {
        const targetSet = new Set(targetAgentIds);
        const updated = current.defaultAssignments
          .map((assignment) => {
            const selected = targetSet.has(assignment.agentId);
            const nextFeeIds = selected
              ? Array.from(new Set([...assignment.feeIds, source.feeId]))
              : assignment.feeIds.filter((id) => id !== source.feeId);
            return {
              ...assignment,
              feeIds: nextFeeIds,
              applyToActiveDeals: selected ? form.applyToActiveDeals : assignment.applyToActiveDeals,
            };
          })
          .filter((assignment) => assignment.planId !== null || assignment.feeIds.length > 0);

        const existingAgentIds = new Set(updated.map((assignment) => assignment.agentId));
        const additions = targetAgentIds
          .filter((agentId) => !existingAgentIds.has(agentId))
          .map((agentId) => ({
            id: crypto.randomUUID(),
            agentId,
            planId: null,
            feeIds: [source.feeId],
            applyToActiveDeals: form.applyToActiveDeals,
          }));

        nextAssignments = [...updated, ...additions];
      } else {
        const newAssignments: AgentAssignment[] = targetAgentIds.map((agentId) => ({
          id: crypto.randomUUID(),
          agentId,
          planId: effectivePlanId,
          feeIds: effectiveFeeIds,
          applyToActiveDeals: form.applyToActiveDeals,
        }));

        nextAssignments = [
          ...current.defaultAssignments.filter((a) => !targetAgentIds.includes(a.agentId)),
          ...newAssignments,
        ];
      }

      return {
        ...current,
        defaultAssignments: nextAssignments,
        activeDialog: null,
        assignDefaultsForm: getFreshAssignDefaultsForm(),
        assignDefaultsErrors: {},
        assignDefaultsSource: { from: "bulk" },
      };
    });
    toast("Defaults assigned");
  }

  function updateForm(patch: Partial<PlanForm>) {
    setState((current) => ({ ...current, form: { ...current.form, ...patch } }));
  }

  function handleAgentSplitChange(value: string) {
    updateForm({ agentSplit: value, teamSplit: String(Math.max(0, 100 - numericValue(value))) });
  }

  function handleTeamSplitChange(value: string) {
    updateForm({ teamSplit: value, agentSplit: String(Math.max(0, 100 - numericValue(value))) });
  }

  function updateTier(tierId: string, patch: Partial<TierRow>) {
    setState((current) => ({
      ...current,
      form: {
        ...current.form,
        tiers: current.form.tiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)),
      },
    }));
  }

  function addTier() {
    setState((current) => ({
      ...current,
      form: {
        ...current.form,
        tiers: [
          ...current.form.tiers,
          {
            id: crypto.randomUUID(),
            from: "",
            to: "",
            agentSplit: "80",
            teamSplit: "20",
          },
        ],
      },
    }));
  }

  function removeTier(tierId: string) {
    setState((current) => ({
      ...current,
      form: {
        ...current.form,
        tiers: current.form.tiers.filter((tier) => tier.id !== tierId),
      },
    }));
  }

  function validatePlanForm() {
    const nextErrors: PlanErrors = {};

    if (!state.form.planName.trim()) nextErrors.planName = "Plan Name required";

    if (state.form.planType === "standard") {
      const splitTotal = numericValue(state.form.agentSplit) + numericValue(state.form.teamSplit);
      if (splitTotal !== 100) nextErrors.splitTotal = `Split total must equal 100%. Current: ${splitTotal}%`;
    }

    if (state.form.planType === "tiered") {
      const tierErrors: Record<string, string> = {};
      state.form.tiers.forEach((tier, index) => {
        const splitTotal = numericValue(tier.agentSplit) + numericValue(tier.teamSplit);
        const finalRow = index === state.form.tiers.length - 1;
        if (!tier.from) tierErrors[tier.id] = "From required";
        else if (!finalRow && !tier.to) tierErrors[tier.id] = "To required except final row";
        else if (splitTotal !== 100) tierErrors[tier.id] = `Split total must equal 100%. Current: ${splitTotal}%`;
      });
      if (Object.keys(tierErrors).length > 0) nextErrors.tiers = tierErrors;
    }

    if (state.form.applyAsDefault && state.form.defaultMode === "specific" && state.form.selectedAgentIds.length === 0) {
      nextErrors.selectedAgentIds = "Select at least one agent";
    }

    setState((current) => ({ ...current, errors: nextErrors }));
    return Object.keys(nextErrors).length === 0;
  }

  function createPlanFromForm(): CommissionPlan {
    return {
      id: state.form.editingPlanId ?? crypto.randomUUID(),
      name: state.form.planName.trim(),
      type: state.form.planType,
      agentSplit: numericValue(state.form.agentSplit),
      teamSplit: numericValue(state.form.teamSplit),
      feeType: "flat",
      feeAmount: numericValue(state.form.feeAmount || "495"),
      capAmount: numericValue(state.form.capAmount),
      assignedAgentsCount: state.form.applyAsDefault ? selectedDefaultAgents.length : 0,
      resetPeriod: state.form.resetPeriod,
      basedOn: state.form.basedOn,
      tiers: state.form.tiers.map((tier) => ({ ...tier })),
    };
  }

  function needsOverwriteConfirmation() {
    return state.form.applyAsDefault && selectedDefaultAgents.some((agent) => agent.hasDefault);
  }

  function commitPlan(plan: CommissionPlan, overwriteConfirmed = false) {
    setState((current) => {
      const existingIndex = current.plans.findIndex((item) => item.id === plan.id);
      const plans =
        existingIndex >= 0
          ? current.plans.map((item) => (item.id === plan.id ? plan : item))
          : [...current.plans, plan];

      return {
        ...current,
        plans,
        activePlanId: plan.id,
        activeDialog: null,
        planDialogMode: "add",
        form: getFreshPlanForm(),
        errors: {},
        pendingPlan: null,
        overwriteOpen: false,
      };
    });

    toast(
      plan.assignedAgentsCount > 0
        ? "Commission plan added and defaults assigned"
        : overwriteConfirmed
          ? "Commission plan added and defaults assigned"
          : "Commission plan added",
    );
  }

  function handleSavePlan() {
    if (!validatePlanForm()) return;
    const nextPlan = createPlanFromForm();
    if (needsOverwriteConfirmation()) {
      setState((current) => ({ ...current, pendingPlan: nextPlan, overwriteOpen: true }));
      return;
    }
    commitPlan(nextPlan);
  }

  function editPlan(plan: CommissionPlan) {
    setState((current) => ({
      ...current,
      activeDialog: "add-plan",
      planDialogMode: "edit",
      errors: {},
      form: {
        ...getFreshPlanForm(),
        editingPlanId: plan.id,
        planName: plan.name,
        planType: plan.type,
        agentSplit: String(plan.agentSplit),
        teamSplit: String(plan.teamSplit),
        feeType: "flat",
        feeAmount: String(plan.feeAmount),
        capAmount: String(plan.capAmount),
        resetPeriod: plan.resetPeriod,
        basedOn: plan.basedOn,
        tiers: plan.tiers.map((tier) => ({ ...tier })),
      },
    }));
  }

  function duplicatePlan(plan: CommissionPlan) {
    setState((current) => ({ ...current, duplicateTarget: { type: "plan", plan } }));
  }

  function confirmDuplicatePlan() {
    const target = state.duplicateTarget;
    if (target?.type !== "plan") return;
    const plan = target.plan;
    setState((current) => ({
      ...current,
      duplicateTarget: null,
      activeDialog: "add-plan",
      planDialogMode: "edit",
      errors: {},
      form: {
        ...getFreshPlanForm(),
        editingPlanId: null,
        planName: `${plan.name} Copy`,
        planType: plan.type,
        agentSplit: String(plan.agentSplit),
        teamSplit: String(plan.teamSplit),
        feeType: "flat",
        feeAmount: String(plan.feeAmount),
        capAmount: String(plan.capAmount),
        resetPeriod: plan.resetPeriod,
        basedOn: plan.basedOn,
        tiers: plan.tiers.map((tier) => ({ ...tier })),
      },
    }));
  }

  function archivePlan(plan: CommissionPlan) {
    setState((current) => ({
      ...current,
      archiveTarget: { type: "plan", id: plan.id, name: plan.name },
    }));
  }

  function confirmArchive() {
    if (!state.archiveTarget) return;
    const { type, id } = state.archiveTarget;
    if (type === "plan") {
      setState((current) => ({
        ...current,
        plans: current.plans.filter((p) => p.id !== id),
        archiveTarget: null,
      }));
      toast("Commission plan archived");
    } else {
      setState((current) => ({
        ...current,
        fees: current.fees.filter((f) => f.id !== id),
        archiveTarget: null,
      }));
      toast("Fee type archived");
    }
  }

  function confirmClearAssignment() {
    if (!state.clearAssignmentTarget) return;
    const { agentId } = state.clearAssignmentTarget;
    setState((current) => ({
      ...current,
      defaultAssignments: current.defaultAssignments.filter((a) => a.agentId !== agentId),
      clearAssignmentTarget: null,
    }));
    toast("Default assignment cleared");
  }

  function requestUnassignPlanDefaults(plan: CommissionPlan) {
    setState((current) => ({
      ...current,
      unassignDefaultsTarget: { type: "plan", id: plan.id, name: plan.name },
    }));
  }

  function requestUnassignFeeDefaults(fee: FeeRecord) {
    setState((current) => ({
      ...current,
      unassignDefaultsTarget: { type: "fee", id: fee.id, name: fee.name },
    }));
  }

  function confirmUnassignDefaults() {
    if (!state.unassignDefaultsTarget) return;

    const target = state.unassignDefaultsTarget;
    setState((current) => {
      const nextAssignments =
        target.type === "plan"
          ? current.defaultAssignments
              .map((assignment) =>
                assignment.planId === target.id
                  ? { ...assignment, planId: null }
                  : assignment,
              )
              .filter((assignment) => assignment.planId !== null || assignment.feeIds.length > 0)
          : current.defaultAssignments
              .map((assignment) =>
                assignment.feeIds.includes(target.id)
                  ? {
                      ...assignment,
                      feeIds: assignment.feeIds.filter((feeId) => feeId !== target.id),
                    }
                  : assignment,
              )
              .filter((assignment) => assignment.planId !== null || assignment.feeIds.length > 0);

      return {
        ...current,
        defaultAssignments: nextAssignments,
        unassignDefaultsTarget: null,
      };
    });

    toast(target.type === "plan" ? "Plan defaults unassigned" : "Fee defaults unassigned");
  }

  function editAssignment(assignment: AgentAssignment) {
    const agent = agents.find((a) => a.id === assignment.agentId);
    setState((current) => ({
      ...current,
      activeDialog: "assign-defaults",
      assignDefaultsSource: { from: "agent", agentId: assignment.agentId },
      assignDefaultsForm: {
        planId: assignment.planId ?? "",
        feeIds: assignment.feeIds,
        assignMode: "specific",
        selectedAgentIds: [assignment.agentId],
        applyToActiveDeals: assignment.applyToActiveDeals,
      },
      assignDefaultsErrors: {},
    }));
    void agent;
  }

  function renderCommissionPlans() {
    if (state.plans.length === 0) {
      return (
        <EmptySection
          title="Commission Plans"
          description="Create default split structures for agents and teams."
          emptyDescription="Create plans like 80/20 Standard or tiered plans for agents."
          icon={FileText}
          action="Add Plan"
          onAction={() =>
            setState((current) => ({
              ...current,
              activeDialog: "add-plan",
              planDialogMode: "add",
              form: getFreshPlanForm(),
              errors: {},
            }))
          }
        />
      );
    }

    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Commission Plans</h2>
            <p className="mt-1 text-xs text-muted-foreground">Create default split structures for agents and teams.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:text-primary"
            onClick={() =>
              setState((current) => ({
                ...current,
                activeDialog: "add-plan",
                planDialogMode: "add",
                form: getFreshPlanForm(),
                errors: {},
              }))
            }
          >
            <Plus className="size-4" />
            Add Plan
          </Button>
        </div>
        <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Commission Plan</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Type</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Agents Associated</TableHead>
                <TableHead className="w-[50px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.plans.map((plan) => {
                const assignedAgentIds = getPlanAssignedAgentIds(plan.id);
                const assignedAgents = agents.filter(a => assignedAgentIds.includes(a.id));
                const hasAssignedAgents = assignedAgents.length > 0;

                return (
                  <TableRow key={plan.id} className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                    <TableCell className="pl-6 font-medium text-sm text-foreground">
                      {plan.name}
                    </TableCell>
                    <TableCell>
                      <PlanTypeBadge type={plan.type} />
                    </TableCell>
                    <TableCell>
                      <AgentAvatarStack
                        agents={assignedAgents.map((a) => ({ id: a.id, name: a.name, avatarUrl: a.avatarUrl }))}
                        max={5}
                        size="sm"
                        emptyActionLabel="Assign"
                        onEmptyAction={() => openPlanDefaults(plan, "assign")}
                        onEditDefaults={() => openPlanDefaults(plan, "edit")}
                        onUnassignDefaults={() => requestUnassignPlanDefaults(plan)}
                      />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`${plan.name} menu`} className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => editPlan(plan)}>
                              <Edit3 className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPlanDefaults(plan, hasAssignedAgents ? "edit" : "assign")}>
                              <UserCheck className="size-4" />
                              {hasAssignedAgents ? "Edit Defaults" : "Assign"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicatePlan(plan)}>
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => archivePlan(plan)}>
                              <Archive className="size-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </section>
    );
  }

  function saveFeeType(data: FeeTypeDraft) {
    const feeId = data.id ?? crypto.randomUUID();
    const fee: FeeRecord = { ...data, id: feeId };
    const exists = state.fees.some((item) => item.id === feeId);
    setState((current) => ({
      ...current,
      fees: exists
        ? current.fees.map((item) => (item.id === feeId ? fee : item))
        : [...current.fees, fee],
      feeDraft: {},
      feeDialogMode: "add",
    }));

    toast(data.id ? "Fee type updated" : "Fee type added");
  }

  function duplicateFee(fee: FeeRecord) {
    setState((current) => ({ ...current, duplicateTarget: { type: "fee", fee } }));
  }

  function confirmDuplicateFee() {
    const target = state.duplicateTarget;
    if (target?.type !== "fee") return;
    const fee = target.fee;
    setState((current) => ({
      ...current,
      duplicateTarget: null,
      activeDialog: "add-fee",
      feeDialogMode: "edit",
      feeDraft: { ...fee, id: null, name: `${fee.name} Copy` },
    }));
  }

  function editFee(fee: FeeRecord) {
    setState((current) => ({
      ...current,
      activeDialog: "add-fee",
      feeDialogMode: "edit",
      feeDraft: { ...fee },
    }));
  }

  function renderFeeTypes() {
    if (state.fees.length === 0) {
      return (
        <EmptySection
          title="Fee Types"
          description="Define reusable deductions for CDA calculations."
          emptyDescription="Create reusable deductions such as TC Fee, RM Fee, E&O Fee, or Compliance Review."
          icon={DollarSign}
          action="Add Fee"
          onAction={() =>
            setState((current) => ({
              ...current,
              activeDialog: "add-fee",
              feeDialogMode: "add",
              feeDraft: {},
            }))
          }
        />
      );
    }

    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Fee Types</h2>
            <p className="mt-1 text-xs text-muted-foreground">Define reusable deductions for CDA calculations.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:text-primary"
            onClick={() =>
              setState((current) => ({
                ...current,
                activeDialog: "add-fee",
                feeDialogMode: "add",
                feeDraft: {},
              }))
            }
          >
            <Plus className="size-4" />
            Add Fee
          </Button>
        </div>
        <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Fee Name</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Type</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Timing</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Fee Payer</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Visible on CDA</TableHead>
                <TableHead className="w-[50px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.fees.map((fee) => {
                const assignedAgentIds = getFeeAssignedAgentIds(fee.id);
                const assignedAgents = agents.filter((agent) => assignedAgentIds.includes(agent.id));
                const hasAssignedAgents = assignedAgents.length > 0;

                return (
                  <TableRow key={fee.id} className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                    <TableCell className="pl-6 font-medium text-sm text-foreground">
                      {fee.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "px-2 py-0 h-4.5 text-[10px] font-semibold border-transparent",
                          fee.type === "flat" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {fee.type === "flat" ? "Flat" : "Percentage"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          fee.timing === "pre-split" ? "text-blue-600" : "text-amber-600",
                        )}
                      >
                        {fee.timing === "pre-split" ? "Pre-Split" : "Post-Split"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {fee.appliesToMode === "team" ? (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-primary/20 text-primary bg-primary/5">
                          Team
                        </Badge>
                      ) : fee.appliesToMode === "both" ? (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-violet-200 text-violet-700 bg-violet-50">
                          Both
                        </Badge>
                      ) : (
                        <AgentAvatarStack
                          agents={assignedAgents.map((agent) => ({ id: agent.id, name: agent.name, avatarUrl: agent.avatarUrl }))}
                          max={5}
                          size="sm"
                          emptyActionLabel="Assign"
                          onEmptyAction={() => openFeeDefaults(fee, "assign")}
                          onEditDefaults={() => openFeeDefaults(fee, "edit")}
                          onUnassignDefaults={() => requestUnassignFeeDefaults(fee)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-semibold", fee.visibleOnCda ? "text-emerald-600" : "text-muted-foreground/40")}>
                        {fee.visibleOnCda ? "Yes" : "Hidden"}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => editFee(fee)}>
                              <Edit3 className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            {fee.appliesToMode === "agent" && (
                              <DropdownMenuItem onClick={() => openFeeDefaults(fee, hasAssignedAgents ? "edit" : "assign")}>
                                <UserCheck className="size-4" />
                                {hasAssignedAgents ? "Edit Defaults" : "Assign"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => duplicateFee(fee)}>
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setState((current) => ({ ...current, archiveTarget: { type: "fee", id: fee.id, name: fee.name } }))}>
                              <Archive className="size-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </section>
    );
  }

  const tabs = [
    "Accounts",
    "Billing",
    "Finances",
    "CDA Settings",
    "Team settings",
    "Agents",
    "Transaction settings",
    "Pods",
    "Automations",
    "Integrations",
    "Phone Numbers",
    "Notification settings",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed left-0 right-0 top-0 z-30 flex h-[68px] items-center justify-between border-b bg-background shadow-sm">
        <div className="px-5">
          <RadiusLogo />
        </div>
        <div className="flex h-full items-center gap-4 border-l px-6">
          <div className="size-12 rounded-full bg-muted" />
          <div>
            <div className="text-base font-medium leading-5">Vanessa Brown</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-3 rounded-full bg-primary" />
              Radius Agent
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-[68px] z-20 flex w-[72px] flex-col items-center border-r bg-background py-8">
        <div className="mb-14 size-9 rounded-full border-[5px] border-[#0f1f2e]">
          <div className="mt-5 h-3 w-7 rotate-[-35deg] rounded-full bg-primary" />
        </div>
        <nav className="flex flex-col gap-3">
          <SidebarIcon icon={Users} label="Users" />
          <SidebarIcon icon={FileText} label="Documents" />
          <SidebarIcon icon={ReceiptText} label="Reports" />
        </nav>
        <nav className="mt-16 flex flex-col gap-3">
          <SidebarIcon icon={Building2} label="Office" />
          <SidebarIcon icon={Briefcase} label="Briefcase" />
          <SidebarIcon icon={Gift} label="Gifts" />
        </nav>
        <nav className="mt-auto flex flex-col gap-3">
          <SidebarIcon icon={Rss} label="Feed" />
          <SidebarIcon icon={Briefcase} label="Work" />
          <SidebarIcon icon={Users} label="Team" />
          <SidebarIcon icon={Megaphone} label="Marketing" />
          <SidebarIcon icon={Bell} label="Notifications" />
          <SidebarIcon icon={HelpCircle} label="Help" />
          <SidebarIcon icon={Settings} label="Settings" />
        </nav>
      </aside>

      <main className="pl-[72px] pt-[68px]">
        <div className="flex h-[92px] items-center px-8">
          <h1 className="text-2xl font-semibold leading-tight text-[#373758]">Settings</h1>
        </div>
        <div className="flex h-10 items-center overflow-hidden border-y px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`flex h-10 shrink-0 items-center px-4 text-sm font-semibold text-[#373758] ${
                tab === "CDA Settings" ? "border-b-2 border-primary text-primary" : ""
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-8 px-4 py-9">
          {renderCommissionPlans()}
          {renderFeeTypes()}
          {/* 
          {state.defaultAssignments.length === 0 ? (
            <EmptySection
              title="Default Assignments"
              description="Connect plans and fees to agents so new CDA estimates use the right calculation rules."
              emptyDescription="Assign commission plans and fee types to agents so CDA estimates are created automatically."
              icon={UserCheck}
              action="Add Defaults"
              onAction={() => setState((current) => ({ ...current, activeDialog: "assign-defaults", assignDefaultsSource: { from: "bulk" }, assignDefaultsForm: getFreshAssignDefaultsForm(), assignDefaultsErrors: {} }))}
            />
          ) : (
            <DefaultAssignmentsTable
              assignments={state.defaultAssignments}
              plans={state.plans}
              fees={state.fees}
              onEdit={editAssignment}
              onPreview={(assignment) => setState((current) => ({ ...current, previewAssignment: assignment }))}
              onDeals={(assignment) => setState((current) => ({ ...current, dealsAssignment: assignment }))}
              onClear={(assignment) => setState((current) => ({ ...current, clearAssignmentTarget: assignment }))}
              onAddDefaults={() => setState((current) => ({ ...current, activeDialog: "assign-defaults", assignDefaultsSource: { from: "bulk" }, assignDefaultsForm: getFreshAssignDefaultsForm(), assignDefaultsErrors: {} }))}
            />
          )} 
          */}
        </div>
      </main>

      <AddPlanDialog
        open={state.activeDialog === "add-plan"}
        title={state.planDialogMode === "edit" ? "Edit Commission Plan" : "Add Commission Plan"}
        form={state.form}
        errors={state.errors}
        onFormChange={updateForm}
        onAgentSplitChange={handleAgentSplitChange}
        onTeamSplitChange={handleTeamSplitChange}
        onUpdateTier={updateTier}
        onAddTier={addTier}
        onRemoveTier={removeTier}
        onOpenChange={(open) => setState((current) => ({ ...current, activeDialog: open ? "add-plan" : null }))}
        onSave={handleSavePlan}
      />

      <FeeBuilderModal
        open={state.activeDialog === "add-fee"}
        title={state.feeDialogMode === "edit" ? "Edit Fee Type" : "Add Fee Type"}
        initialData={state.feeDraft}
        onOpenChange={(open) => setState((current) => ({ ...current, activeDialog: open ? "add-fee" : null }))}
        onSave={saveFeeType}
      />

      <AssignDefaultsDialog
        open={state.activeDialog === "assign-defaults"}
        source={state.assignDefaultsSource}
        form={state.assignDefaultsForm}
        errors={state.assignDefaultsErrors}
        plans={state.plans}
        fees={state.fees}
        isAssigning={state.isAssigning}
        onFormChange={updateAssignDefaultsForm}
        onOpenChange={(open) => setState((current) => ({ ...current, activeDialog: open ? "assign-defaults" : null }))}
        onSave={handleSaveAssignDefaults}
      />

      <AlertDialog
        open={state.overwriteOpen}
        onOpenChange={(open) => setState((current) => ({ ...current, overwriteOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing default plan?</AlertDialogTitle>
            <AlertDialogDescription>
              One or more selected agents already have another default plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => state.pendingPlan && commitPlan(state.pendingPlan, true)}>
              Replace defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(state.archiveTarget)}
        onOpenChange={(open) => { if (!open) setState((current) => ({ ...current, archiveTarget: null })); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive {state.archiveTarget?.type === "plan" ? "commission plan" : "fee type"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{state.archiveTarget?.name}</span> will be archived and removed from active use.
              Existing CDAs are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(state.unassignDefaultsTarget)}
        onOpenChange={(open) => { if (!open) setState((current) => ({ ...current, unassignDefaultsTarget: null })); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign all defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              {state.unassignDefaultsTarget?.type === "plan"
                ? `Remove ${state.unassignDefaultsTarget.name} from all assigned agents.`
                : `Remove ${state.unassignDefaultsTarget?.name} from all assigned agents.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnassignDefaults} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Unassign all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(state.clearAssignmentTarget)}
        onOpenChange={(open) => { if (!open) setState((current) => ({ ...current, clearAssignmentTarget: null })); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear default assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const agent = agents.find((a) => a.id === state.clearAssignmentTarget?.agentId);
                return agent
                  ? `Remove the default commission plan and fees for ${agent.name}. New CDAs for this agent will require manual setup.`
                  : "This agent's default assignment will be cleared.";
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearAssignment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Commission Plan confirmation */}
      <AlertDialog
        open={state.duplicateTarget?.type === "plan"}
        onOpenChange={(open) => { if (!open) setState((current) => ({ ...current, duplicateTarget: null })); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Commission Plan</AlertDialogTitle>
            <AlertDialogDescription>
              A copy of <span className="font-medium">{state.duplicateTarget?.type === "plan" ? state.duplicateTarget.plan.name : ""}</span> will be created. You can edit the details before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDuplicatePlan}>Duplicate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Fee Type confirmation */}
      <AlertDialog
        open={state.duplicateTarget?.type === "fee"}
        onOpenChange={(open) => { if (!open) setState((current) => ({ ...current, duplicateTarget: null })); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Fee Type</AlertDialogTitle>
            <AlertDialogDescription>
              A copy of <span className="font-medium">{state.duplicateTarget?.type === "fee" ? state.duplicateTarget.fee.name : ""}</span> will be created. You can edit the details before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDuplicateFee}>Duplicate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CDA Impact Preview Dialog */}
      {state.previewAssignment && (() => {
        const assignment = state.previewAssignment;
        const agent = agents.find((a) => a.id === assignment.agentId);
        const plan = state.plans.find((p) => p.id === assignment.planId);
        const assignedFees = state.fees.filter((f) => assignment.feeIds.includes(f.id));
        return (
          <Dialog open onOpenChange={(open) => { if (!open) setState((current) => ({ ...current, previewAssignment: null })); }}>
            <DialogContent className="!flex !h-auto !max-h-[82vh] !w-[560px] !max-w-[calc(100vw-48px)] !flex-col !gap-0 !overflow-hidden !rounded-[12px] !p-0 sm:!max-w-[560px] [&>button[data-slot=dialog-close]]:hidden">
              <DialogHeader className="!flex !flex-row !items-start !justify-between !gap-4 border-b px-6 pt-6 pb-4 !text-left">
                <div>
                  <DialogTitle className="text-base font-semibold leading-5">CDA Impact Preview</DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Estimated CDA breakdown for {agent?.name ?? "agent"}.
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => setState((current) => ({ ...current, previewAssignment: null }))}
                >
                  <X className="size-4" />
                </button>
              </DialogHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {agent?.name.split(" ").map((p) => p[0]).join("") ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{agent?.name}</p>
                    <p className="text-xs text-muted-foreground">{agent?.role}</p>
                  </div>
                </div>
                <div className="rounded-lg border">
                  <div className="border-b px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Commission Plan</p>
                    <p className="mt-1 text-sm font-medium">{plan?.name ?? <span className="italic text-muted-foreground">No plan assigned</span>}</p>
                    {plan && (
                      <p className="text-xs text-muted-foreground">
                        {plan.type === "standard"
                          ? `Agent ${plan.agentSplit}% / Team ${plan.teamSplit}% · Cap ${formatMoney(plan.capAmount)}`
                          : `Tiered · ${plan.tiers.length} tiers`}
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fees Applied</p>
                    {assignedFees.length > 0 ? (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {assignedFees.map((fee) => (
                          <div key={fee.id} className="flex items-center justify-between">
                            <span className="text-sm">{fee.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {fee.type === "flat" ? `$${fee.amount}` : `${fee.amount}%`} · {fee.timing === "pre-split" ? "Pre-split" : "Post-split"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm italic text-muted-foreground">No fees assigned</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Preview is based on current default assignments. Actual CDA values depend on transaction details.</p>
              </div>
              <DialogFooter className="!flex !flex-row !items-center !justify-end !gap-3 shrink-0 border-t bg-background px-6 py-4">
                <Button variant="outline" onClick={() => setState((current) => ({ ...current, previewAssignment: null }))}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Affected Deals Dialog */}
      {state.dealsAssignment && (() => {
        const assignment = state.dealsAssignment;
        const agent = agents.find((a) => a.id === assignment.agentId);
        const plan = state.plans.find((p) => p.id === assignment.planId);
        return (
          <Dialog open onOpenChange={(open) => { if (!open) setState((current) => ({ ...current, dealsAssignment: null })); }}>
            <DialogContent className="!flex !h-auto !max-h-[82vh] !w-[560px] !max-w-[calc(100vw-48px)] !flex-col !gap-0 !overflow-hidden !rounded-[12px] !p-0 sm:!max-w-[560px] [&>button[data-slot=dialog-close]]:hidden">
              <DialogHeader className="!flex !flex-row !items-start !justify-between !gap-4 border-b px-6 pt-6 pb-4 !text-left">
                <div>
                  <DialogTitle className="text-base font-semibold leading-5">Affected Deals</DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Active transactions that would be recalculated for {agent?.name ?? "agent"}.
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => setState((current) => ({ ...current, dealsAssignment: null }))}
                >
                  <X className="size-4" />
                </button>
              </DialogHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {agent?.name.split(" ").map((p) => p[0]).join("") ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{agent?.name}</p>
                    <p className="text-xs text-muted-foreground">{plan?.name ?? "No plan"}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border py-10 text-center">
                  <Briefcase className="mb-3 size-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">No active deals</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    There are no under-contract deals for {agent?.name ?? "this agent"} that would be affected.
                  </p>
                </div>
              </div>
              <DialogFooter className="!flex !flex-row !items-center !justify-end !gap-3 shrink-0 border-t bg-background px-6 py-4">
                <Button variant="outline" onClick={() => setState((current) => ({ ...current, dealsAssignment: null }))}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      <Toaster />
      <CDAFlowSwitcher />
    </div>
  );
}
