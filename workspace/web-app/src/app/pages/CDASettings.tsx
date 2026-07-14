import { type FeeTypeDraft } from "../components/finance/fee-builder-modal";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Archive,
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  Copy,
  DollarSign,
  Eye,
  EyeOff,
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
  UserMinus,
  User, Users, Shield,
  Check,
  Filter,
  ChevronRight,
  Library,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
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
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
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
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from "../components/ui/command";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Toaster } from "../components/ui/sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  FeeBadge, 
  TierBuilderRow, 
  FeeBuilderModal, 
  AgentAvatarStack 
} from "../components/finance";
import { CDAFlowSwitcher } from "../components/v4/finance/cda-flow-switcher";
import {
  createDefaultWireInstructionsStore,
  createEmptyWireInstruction,
  isWireInstructionComplete,
  maskSensitiveValue,
  readWireInstructionsStore,
  validateWireInstruction,
  type CDAType,
  type WireInstructionRecord,
  type WireInstructionsStore,
  type WireValidationErrors,
  writeWireInstructionsStore,
} from "../lib/wire-instructions";
import { COMMISSION_BREAKDOWN_TYPE_OPTIONS, getCdaTypeLabel } from "../lib/cda-types";

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
  dealTypes: Record<string, boolean>;
  applyToActiveDeals: boolean;
  actionType: "assign" | "unassign";
};

const TEAM_WIRE_COMPLETION_OPTIONS = { requireCdaType: false } as const;

const TEAM_CDA_TYPE_OPTIONS: Array<{ value: CDAType; label: string }> = [
  { value: "full-transparency", label: "Full Transparency" },
  { value: "team-hidden", label: "Team Hidden" },
  { value: "radius-hidden", label: "Radius Hidden" },
  { value: "full-gross", label: "Full Gross" },
];

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
  dealTypes: Record<string, boolean>;
  applyToActiveDeals: boolean;
};

type ArchiveTarget = { type: "plan" | "fee"; id: string; name: string };
type UnassignDefaultsTarget = { type: "plan" | "fee"; id: string; name: string };

type DuplicateTarget = { type: "plan"; plan: CommissionPlan } | { type: "fee"; fee: FeeRecord };

type Agent = {
  id: string;
  name: string;
  email: string;
  role: string;
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

type Creator = {
  role: "team_lead" | "group_lead";
  id: string;
  name: string;
  groupName?: string;
};

type PlanScopeMode = "all_members" | "all_groups" | "specific_members" | "specific_groups";
type PlanScope = {
  mode: PlanScopeMode;
  memberIds: string[];
  groupIds: string[];
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
  createdBy?: Creator;
  scope?: PlanScope;
};


type FeeRecord = FeeTypeDraft & { id: string; createdBy?: Creator };

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
  scopeMode: PlanScopeMode;
  scopeMemberIds: string[];
  scopeGroupIds: string[];
};

type PlanErrors = Partial<
  Record<"planName" | "splitTotal" | "selectedAgentIds", string>
> & {
  tiers?: Record<string, string>;
};

type WireRoleView = "team_lead" | "agent";

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
  ...Array.from({ length: 50 }).map((_, i) => ({
    id: `m${i}`,
    name: `Test Agent ${i + 1}`,
    role: "Agent",
    email: `agent${i + 1}@radiusagent.com`,
    hasDefault: false,
  }))
];

const CURRENT_TEAM_LEAD_ID = "a3";
const CURRENT_AGENT_ID = "a1";
const CURRENT_GROUP_LEAD_ID = "a5";

const GROUPS: { id: string; leadId: string; name: string }[] = [
  { id: "gr-west", leadId: "a5", name: "West" },
  { id: "gr-east", leadId: "a6", name: "East" },
];

const CREATOR_TL: Creator = { role: "team_lead", id: "a3", name: "Sarah Jenkins" };
const CREATOR_GL_WEST: Creator = { role: "group_lead", id: "a5", name: "Emma Wilson", groupName: "West" };
const CREATOR_GL_EAST: Creator = { role: "group_lead", id: "a6", name: "James Miller", groupName: "East" };

const defaultTiers: TierRow[] = [
  { id: "tier-1", from: "1", to: "5", agentSplit: "80", teamSplit: "20" },
  { id: "tier-2", from: "6", to: "10", agentSplit: "85", teamSplit: "15" },
  { id: "tier-3", from: "11", to: "25", agentSplit: "90", teamSplit: "10" },
  { id: "tier-4", from: "26", to: "", agentSplit: "95", teamSplit: "5" },
];

const seedPlans: CommissionPlan[] = [
  { id: "p1", name: "80/20 Standard", type: "standard", agentSplit: 80, teamSplit: 20, feeType: "flat", feeAmount: 495, capAmount: 18000, assignedAgentsCount: 12, resetPeriod: "yearly", basedOn: "units", tiers: [], createdBy: CREATOR_TL },
  { id: "p2", name: "70/30 Standard", type: "standard", agentSplit: 70, teamSplit: 30, feeType: "flat", feeAmount: 495, capAmount: 15000, assignedAgentsCount: 4, resetPeriod: "yearly", basedOn: "units", tiers: [], createdBy: CREATOR_TL },
  { id: "p3", name: "Keystone Tiered", type: "tiered", agentSplit: 80, teamSplit: 20, feeType: "flat", feeAmount: 0, capAmount: 0, assignedAgentsCount: 2, resetPeriod: "yearly", basedOn: "units", tiers: defaultTiers.map((t) => ({ ...t })), createdBy: CREATOR_GL_WEST },
  { id: "p4", name: "Lease Referral Plan", type: "standard", agentSplit: 60, teamSplit: 40, feeType: "flat", feeAmount: 0, capAmount: 0, assignedAgentsCount: 0, resetPeriod: "yearly", basedOn: "units", tiers: [], createdBy: CREATOR_GL_EAST },
];

const seedFees: FeeRecord[] = [
  { id: "f1", name: "TC Fee", type: "flat", amount: "500", timing: "pre-split", appliesToMode: "team", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: true, createdBy: CREATOR_TL },
  { id: "f2", name: "RM Fee", type: "flat", amount: "300", timing: "post-split", appliesToMode: "agent", agentIds: ["a1", "a3", "a5"], slidingScale: false, contributesToCap: true, tiers: [], percentageBase: "pre-split", visibleOnCda: true, createdBy: CREATOR_TL },
  { id: "f3", name: "E&O Fee", type: "flat", amount: "125", timing: "post-split", appliesToMode: "agent", agentIds: ["a1", "a2", "a3"], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: true, createdBy: CREATOR_GL_WEST },
  { id: "f4", name: "Compliance Review", type: "flat", amount: "250", timing: "pre-split", appliesToMode: "both", agentIds: [], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: true, createdBy: CREATOR_TL },
  { id: "f5", name: "Marketing Fee", type: "percentage", amount: "1.5", timing: "post-split", appliesToMode: "agent", agentIds: ["a1", "a2"], slidingScale: false, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: true, createdBy: CREATOR_GL_EAST },
  { id: "f6", name: "Tiered Brokerage Fee", type: "percentage", amount: "0", timing: "pre-split", appliesToMode: "both", agentIds: [], slidingScale: true, contributesToCap: false, tiers: [], percentageBase: "pre-split", visibleOnCda: true, createdBy: CREATOR_GL_WEST },
];

export const seedAssignments: AgentAssignment[] = [
  { id: "as1", agentId: "a1", planId: "p1", feeIds: ["f1", "f2"], dealTypes: { buyer: true, listing: true, referral: false, lease: false, "lease-listing": false }, applyToActiveDeals: true },
  { id: "as2", agentId: "a2", planId: "p2", feeIds: ["f3"], dealTypes: { buyer: true, listing: false, referral: true, lease: false, "lease-listing": false }, applyToActiveDeals: false },
  { id: "as3", agentId: "a3", planId: "p1", feeIds: ["f1", "f2", "f3"], dealTypes: { buyer: true, listing: true, referral: true, lease: true, "lease-listing": true }, applyToActiveDeals: true },
  { id: "as4", agentId: "a4", planId: "p3", feeIds: ["f4"], dealTypes: { buyer: true, listing: true, referral: false, lease: false, "lease-listing": false }, applyToActiveDeals: true },
  { id: "as5", agentId: "a5", planId: "p2", feeIds: ["f2"], dealTypes: { buyer: true, listing: false, referral: false, lease: true, "lease-listing": false }, applyToActiveDeals: false },
  { id: "as6", agentId: "a6", planId: "p1", feeIds: ["f1"], dealTypes: { buyer: true, listing: true, referral: false, lease: false, "lease-listing": false }, applyToActiveDeals: true },
  { id: "as7", agentId: "a7", planId: "p1", feeIds: ["f1", "f3"], dealTypes: { buyer: true, listing: true, referral: false, lease: false, "lease-listing": false }, applyToActiveDeals: true },
  { id: "as8", agentId: "a8", planId: "p2", feeIds: ["f2", "f4"], dealTypes: { buyer: true, listing: false, referral: false, lease: true, "lease-listing": false }, applyToActiveDeals: false },
  { id: "as9", agentId: "a9", planId: "p3", feeIds: ["f3"], dealTypes: { buyer: true, listing: true, referral: true, lease: false, "lease-listing": false }, applyToActiveDeals: true },
  ...Array.from({ length: 50 }).map((_, i) => ({
    id: `as_m${i}`,
    agentId: `m${i}`,
    planId: "p1", // Add them to the 80/20 Standard plan to show a large list
    feeIds: [],
    dealTypes: { buyer: true, listing: true, referral: false, lease: false, "lease-listing": false },
    applyToActiveDeals: false,
  }))
];

function getFreshAssignDefaultsForm(): AssignDefaultsForm {
  return {
    planId: "",
    feeIds: [],
    assignMode: "specific",
    selectedAgentIds: [],
    dealTypes: { buyer: true, listing: true, referral: false, lease: false, "lease-listing": false },
    applyToActiveDeals: false,
    actionType: "assign",
  };
}

const ASSIGNABLE_CDA_TYPES = ["buyer", "listing", "referral", "lease", "lease-listing"] as const;

function formatDealTypes(types: Record<string, boolean>) {
  const selected = Object.keys(types).filter((key) => types[key]).map((key) => getCdaTypeLabel(key));
  return selected.length ? selected.join(", ") : "No CDA types";
}

function FilterPopover({
  groupFilter,
  onGroupFilter,
  memberOptions,
}: {
  groupFilter: string;
  onGroupFilter: (v: string) => void;
  memberOptions: { id: string; name: string; avatarUrl?: string; groupName?: string }[];
}) {
  const activeGroup = GROUPS.find((g) => g.id === groupFilter);
  const activeMember = groupFilter.startsWith("member:")
    ? memberOptions.find((m) => `member:${m.id}` === groupFilter)
    : undefined;
  const label = activeGroup
    ? `Group: ${activeGroup.name}`
    : activeMember
      ? activeMember.name
      : "All groups & members";
  const hasFilter = groupFilter !== "all";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-normal">
          <Filter className={cn("size-3.5", hasFilter ? "text-primary" : "text-muted-foreground")} />
          <span className="text-foreground">{label}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search groups & team members" />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup heading="Filter by group">
              {[{ id: "all", label: "All groups & members" }, ...GROUPS.map((g) => ({ id: g.id, label: `Group: ${g.name}` }))].map((opt) => (
                <CommandItem key={opt.id} value={opt.label} onSelect={() => onGroupFilter(opt.id)}>
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="flex-1">{opt.label}</span>
                  {groupFilter === opt.id && <Check className="size-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
            {memberOptions.length > 0 && (
              <CommandGroup heading="Filter by team member">
                {memberOptions.map((m) => {
                  const v = `member:${m.id}`;
                  return (
                    <CommandItem key={m.id} value={`${m.name} ${m.groupName ?? ""}`} onSelect={() => onGroupFilter(v)}>
                      <Avatar className="size-5">
                        {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                        <AvatarFallback className="text-[9px]">{m.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">{m.name}</span>
                      {m.groupName && <span className="text-[10px] text-muted-foreground">{m.groupName}</span>}
                      {groupFilter === v && <Check className="size-3.5 text-primary" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CreatorChip({ creator, selfId }: { creator?: Creator; selfId: string | null }) {
  if (!creator) return <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-primary/20 text-primary bg-primary/5">Team</Badge>;
  const isSelf = selfId != null && creator.id === selfId;
  if (isSelf) return <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-emerald-200 text-emerald-700 bg-emerald-50">You</Badge>;
  if (creator.role === "team_lead") return <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-primary/20 text-primary bg-primary/5">Team</Badge>;
  return <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-violet-200 text-violet-700 bg-violet-50">Group: {creator.groupName ?? creator.name}</Badge>;
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
    scopeMode: "all_members",
    scopeMemberIds: [],
    scopeGroupIds: [],
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

function renderWireDetails(r: {
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  recipientStreet?: string;
  recipientCity?: string;
  recipientState?: string;
}) {
  const hasWire = !!(r.bankName || r.accountNumber || r.routingNumber);
  if (hasWire) {
    return (
      <div className="flex flex-col leading-tight">
        {r.bankName && <span className="font-medium">{r.bankName}</span>}
        <span className="text-muted-foreground text-xs">
          {r.accountNumber && <>Acct {maskSensitiveValue(r.accountNumber)}</>}
          {r.accountNumber && r.routingNumber && " · "}
          {r.routingNumber && <>Routing {maskSensitiveValue(r.routingNumber)}</>}
        </span>
      </div>
    );
  }
  const addr = [r.recipientStreet, r.recipientCity, r.recipientState].filter(Boolean).join(", ");
  return addr || "-";
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
  const dealTypeOptions = COMMISSION_BREAKDOWN_TYPE_OPTIONS;
  const selectedKeys = Object.keys(selectedTypes).filter(k => selectedTypes[k]);

  const allSelected = selectedKeys.length === dealTypeOptions.length;
  let triggerLabel = "Select deal types";
  if (allSelected) {
    triggerLabel = "Selected all deal types";
  } else if (selectedKeys.length === 1) {
    triggerLabel = dealTypeOptions.find((option) => option.key === selectedKeys[0])?.label ?? selectedKeys[0];
  } else if (selectedKeys.length > 1) {
    triggerLabel = `${dealTypeOptions.find((option) => option.key === selectedKeys[0])?.label ?? selectedKeys[0]} +${selectedKeys.length - 1} others`;
  }

  function toggle(key: string) {
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
            dealTypeOptions.forEach((option) => {
              next[option.key] = nextAllSelected;
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
            <Checkbox checked={Boolean(selectedTypes[type.key])} className="pointer-events-none" />
            <span className="flex-1 text-sm font-medium">{type.label}</span>
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

      <div className="w-full">
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
      </div>
    </>
  );
}

const DEAL_TYPE_OPTIONS = COMMISSION_BREAKDOWN_TYPE_OPTIONS;

function ViewAssociationsDialogInner({
  target,
  assignments,
  onClose,
  onSave,
}: {
  target: { type: "plan" | "fee"; id: string; name: string };
  assignments: AgentAssignment[];
  onClose: () => void;
  onSave: (assignments: AgentAssignment[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [localAssignments, setLocalAssignments] = useState<AgentAssignment[]>(assignments);

  const associations = target.type === "plan"
    ? localAssignments.filter(a => a.planId === target.id)
    : localAssignments.filter(a => a.feeIds.includes(target.id));

  const filtered = associations.filter((assignment) => {
    const agent = agents.find(a => a.id === assignment.agentId);
    if (!agent) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!agent.name.toLowerCase().includes(q)) return false;
    }

    return true;
  });

  const handleUnassign = (agentId: string, agentName: string) => {
    setLocalAssignments(current => {
      let next = [...current];
      if (target.type === "plan") {
        next = next.filter(a => !(a.agentId === agentId && a.planId === target.id));
      } else {
        next = next.map(a => {
          if (a.agentId === agentId) {
            return { ...a, feeIds: a.feeIds.filter(fid => fid !== target.id) };
          }
          return a;
        }).filter(a => a.feeIds.length > 0 || Object.values(a.dealTypes).some(v => v));
      }
      return next;
    });
  };

  const handleRemoveDealType = (agentId: string, agentName: string, dealType: string) => {
    setLocalAssignments(current => {
      let next = [...current];
      next = next.map(a => {
        if (a.agentId === agentId && ((target.type === "plan" && a.planId === target.id) || (target.type === "fee" && a.feeIds.includes(target.id)))) {
          const updatedDealTypes = { ...a.dealTypes };
          delete updatedDealTypes[dealType];
          return { ...a, dealTypes: updatedDealTypes };
        }
        return a;
      });
      if (target.type === "plan") {
        next = next.filter(a => !(a.agentId === agentId && a.planId === target.id && !Object.values(a.dealTypes).some(v => v)));
      } else {
        next = next.map(a => {
          if (a.agentId === agentId && a.feeIds.includes(target.id) && !Object.values(a.dealTypes).some(v => v)) {
             return { ...a, feeIds: a.feeIds.filter(fid => fid !== target.id) };
          }
          return a;
        }).filter(a => a.feeIds.length > 0 || Object.values(a.dealTypes).some(v => v));
      }
      return next;
    });
  };

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className={cn(
        "!flex !max-h-[85vh] !max-w-[calc(100vw-48px)] !flex-col !gap-0 !overflow-hidden !rounded-[12px] !p-0",
        "!h-[70vh] !w-[560px] sm:!max-w-[560px] [&>button[data-slot=dialog-close]]:hidden"
      )}>


        <DialogHeader className="border-b px-6 pt-6 pb-4 !text-left shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-base font-semibold leading-5 flex items-center gap-2">
                {target.name} <span className="text-muted-foreground font-normal">· {associations.length} agents</span>
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                {target.type === "plan" 
                  ? "Agents on this plan, and the deal types it applies to."
                  : "Agents this fee is charged to, and the deal types it applies on."}
              </DialogDescription>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="shrink-0 border-b px-6 py-3 sticky top-0 bg-background z-10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>

        {/* Scrollable agent list */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {associations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center flex-1">
              <p className="text-sm font-medium text-muted-foreground">No agents assigned</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Use the Assign action to add agents.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center flex-1">
              <p className="text-sm font-medium text-muted-foreground">No matching agents</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Try a different search or filter.</p>
            </div>
          ) : (
            filtered.map((assignment) => {
              const agent = agents.find(a => a.id === assignment.agentId);
              if (!agent) return null;
              return (
                <div key={assignment.id} className="flex items-center gap-3 border-b px-6 py-3 last:border-0 hover:bg-muted/30 transition-colors">
                  <Avatar className="size-8 shrink-0">
                    {agent.avatarUrl && <AvatarImage src={agent.avatarUrl} alt={agent.name} className="object-cover" />}
                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                      {agent.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-medium truncate leading-tight">{agent.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {Object.entries(assignment.dealTypes).filter(([, v]) => v).map(([k]) => {
                        const label = DEAL_TYPE_OPTIONS.find(o => o.key === k)?.label ?? k;
                        return (
                          <Badge key={k} variant="secondary" className="text-[10px] h-5 px-1.5 pr-0.5 font-medium flex items-center gap-1 bg-muted/60 text-muted-foreground hover:bg-muted transition-colors">
                            {label}
                            <button
                              onClick={() => handleRemoveDealType(assignment.agentId, agent.name, k)}
                              className="hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-full p-0.5 transition-colors"
                            >
                              <X className="size-2.5" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassign(assignment.agentId, agent.name)}
                    className="flex-shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                    title="Remove entirely"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="!flex !flex-row !items-center !justify-between !gap-3 shrink-0 border-t bg-background px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {search.trim()
              ? `${filtered.length} of ${associations.length} agents`
              : `${associations.length} agent${associations.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={() => onSave(localAssignments)}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const editMode = false; // Assign-only mode — no edit mode

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
              <Label className="text-sm font-medium">
                Assign To
              </Label>
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

          <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">
                Apply To Commission Breakdown Types <span className="text-destructive">*</span>
              </Label>
              <DealTypeMultiSelect
                selectedTypes={form.dealTypes}
                onChange={(dealTypes) => onFormChange({ dealTypes })}
              />
            </div>

        </div>

        <DialogFooter className="!flex !flex-row !items-center !justify-end !gap-3 shrink-0 border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>Cancel</Button>
          <Button onClick={onSave} disabled={!isValid || isAssigning} variant="default">
            {isAssigning 
              ? "Saving…" 
              : editMode 
                ? "Update Defaults" 
                : "Assign Defaults"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanScopePicker({
  form,
  onFormChange,
}: {
  form: PlanForm;
  onFormChange: (patch: Partial<PlanForm>) => void;
}) {
  const modes: { id: PlanScopeMode; label: string }[] = [
    { id: "all_members", label: "All members" },
    { id: "all_groups", label: "All groups" },
    { id: "specific_members", label: "Specific members" },
    { id: "specific_groups", label: "Specific groups" },
  ];
  const memberAgents = agents.filter((a) => ["a1","a2","a3","a4","a5","a6","a7","a8","a9"].includes(a.id));
  const [memberOpen, setMemberOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const selectedMembers = memberAgents.filter((a) => form.scopeMemberIds.includes(a.id));
  const selectedGroups = GROUPS.filter((g) => form.scopeGroupIds.includes(g.id));
  function toggleMember(id: string) {
    onFormChange({
      scopeMemberIds: form.scopeMemberIds.includes(id)
        ? form.scopeMemberIds.filter((x) => x !== id)
        : [...form.scopeMemberIds, id],
    });
  }
  function toggleGroup(id: string) {
    onFormChange({
      scopeGroupIds: form.scopeGroupIds.includes(id)
        ? form.scopeGroupIds.filter((x) => x !== id)
        : [...form.scopeGroupIds, id],
    });
  }
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">Scope</Label>
      <Select value={form.scopeMode} onValueChange={(v) => onFormChange({ scopeMode: v as PlanScopeMode })}>
        <SelectTrigger className="h-10 w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {modes.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {form.scopeMode === "specific_members" && (
        <Popover open={memberOpen} onOpenChange={setMemberOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 justify-between text-xs font-normal">
              <span className="truncate">
                {selectedMembers.length === 0
                  ? "Select team members…"
                  : selectedMembers.length <= 2
                    ? selectedMembers.map((m) => m.name).join(", ")
                    : `${selectedMembers.length} members selected`}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[320px] p-0">
            <Command>
              <CommandInput placeholder="Search members" />
              <CommandList>
                <CommandEmpty>No members.</CommandEmpty>
                <CommandGroup>
                  {memberAgents.map((a) => {
                    const checked = form.scopeMemberIds.includes(a.id);
                    return (
                      <CommandItem key={a.id} value={a.name} onSelect={() => toggleMember(a.id)}>
                        <Checkbox checked={checked} className="pointer-events-none" />
                        <Avatar className="size-5">
                          {a.avatarUrl && <AvatarImage src={a.avatarUrl} alt={a.name} />}
                          <AvatarFallback className="text-[9px]">{a.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 truncate">{a.name}</span>
                        <span className="text-[10px] text-muted-foreground">{a.role}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      {form.scopeMode === "specific_groups" && (
        <Popover open={groupOpen} onOpenChange={setGroupOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 justify-between text-xs font-normal">
              <span className="truncate">
                {selectedGroups.length === 0
                  ? "Select groups…"
                  : selectedGroups.map((g) => g.name).join(", ")}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[240px] p-0">
            <Command>
              <CommandInput placeholder="Search groups" />
              <CommandList>
                <CommandEmpty>No groups.</CommandEmpty>
                <CommandGroup>
                  {GROUPS.map((g) => {
                    const checked = form.scopeGroupIds.includes(g.id);
                    return (
                      <CommandItem key={g.id} value={g.name} onSelect={() => toggleGroup(g.id)}>
                        <Checkbox checked={checked} className="pointer-events-none" />
                        <Building2 className="size-3.5 text-muted-foreground" />
                        <span className="flex-1">{g.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
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
          <PlanScopePicker form={form} onFormChange={onFormChange} />
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

function buildWireFieldId(prefix: string, field: string) {
  return `${prefix}-${field}`;
}

function formatWireAccountType(accountType: WireInstructionRecord["accountType"]) {
  return accountType === "checking" ? "Checking" : "Savings";
}

function formatCdaType(cdaType: WireInstructionRecord["cdaType"]) {
  return TEAM_CDA_TYPE_OPTIONS.find((option) => option.value === cdaType)?.label ?? "Not provided";
}

function WireInstructionDialog({
  open,
  onOpenChange,
  title,
  description,
  record,
  errors,
  onChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  record: WireInstructionRecord;
  errors: WireValidationErrors;
  onChange: (patch: Partial<WireInstructionRecord>) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5 text-[12px] leading-snug text-blue-900">
            <p className="font-medium">How this affects the CDA</p>
            <p className="mt-0.5 text-blue-800">
              Enter <span className="font-semibold">wire instructions</span> to have the CDA direct your commission via <span className="font-semibold">wire transfer</span>, or enter a <span className="font-semibold">mailing address</span> to have it sent by <span className="font-semibold">check</span>. You only need to provide one — both are not required.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="wire-name">Account Holder / Recipient Name *</Label>
              <Input
                id="wire-name"
                placeholder="e.g., John Doe"
                value={record.accountHolderName}
                onChange={(e) => onChange({ accountHolderName: e.target.value })}
                className={cn(errors.accountHolderName && "border-destructive")}
              />
              {errors.accountHolderName && <p className="text-[11px] text-destructive">{errors.accountHolderName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="wire-email">Email</Label>
              <Input
                id="wire-email"
                type="email"
                placeholder="name@example.com"
                value={record.email || ""}
                onChange={(e) => onChange({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wire-phone">Phone</Label>
              <Input
                id="wire-phone"
                type="tel"
                placeholder="(555) 555-5555"
                value={record.phone || ""}
                onChange={(e) => onChange({ phone: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Mailing Address (for Check Delivery)</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Provide this if commission should be sent by check.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Input
                  placeholder="Street"
                  value={record.recipientStreet || ""}
                  onChange={(e) => onChange({ recipientStreet: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Input
                  placeholder="Address line 2 (optional)"
                  value={record.recipientStreet2 || ""}
                  onChange={(e) => onChange({ recipientStreet2: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 sm:col-span-2">
                <Input
                  placeholder="City"
                  className="col-span-1"
                  value={record.recipientCity || ""}
                  onChange={(e) => onChange({ recipientCity: e.target.value })}
                />
                <Input
                  placeholder="State"
                  className="col-span-1"
                  value={record.recipientState || ""}
                  onChange={(e) => onChange({ recipientState: e.target.value })}
                />
                <Input
                  placeholder="ZIP"
                  className="col-span-1"
                  value={record.recipientZip || ""}
                  onChange={(e) => onChange({ recipientZip: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Wire Instructions (for Wire Transfer)</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Provide this if commission should be sent by wire.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wire-bank-name">Bank Name</Label>
                <Input
                  id="wire-bank-name"
                  placeholder="e.g., Chase Bank"
                  value={record.bankName || ""}
                  onChange={(e) => onChange({ bankName: e.target.value })}
                  className={cn(errors.bankName && "border-destructive")}
                />
                {errors.bankName && <p className="text-[11px] text-destructive">{errors.bankName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wire-routing">Routing Number (ABA)</Label>
                <Input
                  id="wire-routing"
                  placeholder="9-digit ABA number"
                  value={record.routingNumber || ""}
                  onChange={(e) => onChange({ routingNumber: e.target.value })}
                  className={cn(errors.routingNumber && "border-destructive")}
                />
                {errors.routingNumber && <p className="text-[11px] text-destructive">{errors.routingNumber}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wire-account">Account Number</Label>
                <Input
                  id="wire-account"
                  placeholder="Account number"
                  value={record.accountNumber || ""}
                  onChange={(e) => onChange({ accountNumber: e.target.value })}
                  className={cn(errors.accountNumber && "border-destructive")}
                />
                {errors.accountNumber && <p className="text-[11px] text-destructive">{errors.accountNumber}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="wire-account-type">Account Type</Label>
                <Select value={record.accountType || "checking"} onValueChange={(v) => onChange({ accountType: v })}>
                  <SelectTrigger id="wire-account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave}>Save Instructions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function WireStatusBadge({ complete }: { complete: boolean }) {
  return complete ? (
    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Complete</Badge>
  ) : (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Incomplete</Badge>
  );
}

export function CDASettings() {
  const defaultWireStore = useMemo(
    () => createDefaultWireInstructionsStore(CURRENT_TEAM_LEAD_ID, agents.map((agent) => agent.id)),
    [],
  );
  const [userRole, setUserRole] = useState<"agent" | "team_lead" | "group_lead" | "radius_auditing" | "soul_auditor">("team_lead");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const currentCreatorId = userRole === "team_lead" ? CURRENT_TEAM_LEAD_ID : userRole === "group_lead" ? CURRENT_GROUP_LEAD_ID : null;
  const isTeamLead = userRole === "team_lead" || userRole === "soul_auditor" || userRole === "radius_auditing";
  const isGroupLead = userRole === "group_lead";
  function canViewOwned(item: { createdBy?: Creator }): boolean {
    if (isTeamLead) {
      if (groupFilter === "all") return true;
      if (groupFilter.startsWith("member:")) {
        const memberId = groupFilter.slice("member:".length);
        return item.createdBy?.id === memberId;
      }
      const g = GROUPS.find((x) => x.id === groupFilter);
      return !!g && item.createdBy?.role === "group_lead" && item.createdBy.id === g.leadId;
    }
    if (isGroupLead) {
      if (!item.createdBy) return true;
      if (item.createdBy.role === "team_lead") return true;
      return item.createdBy.id === CURRENT_GROUP_LEAD_ID;
    }
    return true;
  }
  function canEditOwned(item: { createdBy?: Creator }): boolean {
    if (isTeamLead) return true;
    if (isGroupLead) return !item.createdBy || item.createdBy.id === CURRENT_GROUP_LEAD_ID;
    return false;
  }
  const memberOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatarUrl?: string; groupName?: string }>();
    const add = (c?: Creator) => {
      if (!c || map.has(c.id)) return;
      const agent = agents.find((a) => a.id === c.id);
      map.set(c.id, { id: c.id, name: c.name, avatarUrl: agent?.avatarUrl, groupName: c.groupName });
    };
    // Always include Team Lead + Group Leads
    add(CREATOR_TL);
    add(CREATOR_GL_WEST);
    add(CREATOR_GL_EAST);
    // Include any additional creators from data
    // (referenced via state — safe: memoized against state.plans/fees)
    return Array.from(map.values());
  }, []);

  function creatorForNew(): Creator {
    if (isGroupLead) return { ...CREATOR_GL_WEST };
    return { ...CREATOR_TL };
  }
  const [state, setState] = useState<{
    plans: CommissionPlan[];
    activePlanId: string | null;
    activeDialog: DialogName | "wire-instruction";
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
    viewAssociationsTarget: { type: "plan" | "fee"; id: string; name: string } | null;
    clearAssignmentTarget: AgentAssignment | null;
    previewAssignment: AgentAssignment | null;
    dealsAssignment: AgentAssignment | null;
    isAssigning: boolean;
    overwriteAssignDefaults: boolean;
    pendingAssignmentSave: (() => void) | null;
    wireDraft: WireInstructionRecord | null;
    wireType: "team" | "shared" | "private" | "private_recipient" | null;
    wireErrors: WireValidationErrors;
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
    viewAssociationsTarget: null,
    clearAssignmentTarget: null,
    previewAssignment: null,
    dealsAssignment: null,
    isAssigning: false,
    overwriteAssignDefaults: false,
    pendingAssignmentSave: null,
    wireDraft: null,
    wireType: null,
    wireErrors: {},
  });
    const [wireStore, setWireStore] = useState<WireInstructionsStore>(() => readWireInstructionsStore(defaultWireStore));
  const [searchQuery, setSearchQuery] = useState("");
  const [privateRecipientSearch, setPrivateRecipientSearch] = useState("");
  const teamLeadAgent = agents.find((agent) => agent.id === CURRENT_TEAM_LEAD_ID) ?? agents[0];
  const currentAgent = agents.find((agent) => agent.id === CURRENT_AGENT_ID) ?? agents[0];
  const unreadWireNotifications = wireStore.notifications.filter((item) => !item.read);

  const selectedDefaultAgents = useMemo(() => {
    if (!state.form.applyAsDefault) return [];
    if (state.form.defaultMode === "all") return agents;
    return agents.filter((agent) => state.form.selectedAgentIds.includes(agent.id));
  }, [state.form.applyAsDefault, state.form.defaultMode, state.form.selectedAgentIds]);

  useEffect(() => {
    const nextStore = readWireInstructionsStore(defaultWireStore);
    setWireStore(nextStore);
  }, [defaultWireStore]);

  useEffect(() => {
    if (userRole !== "team_lead" || unreadWireNotifications.length === 0) return;
    unreadWireNotifications.forEach((notification) => {
      toast.success(`${notification.agentName} completed wire instructions`);
    });
    const nextStore = {
      ...wireStore,
      notifications: wireStore.notifications.map((notification) => ({ ...notification, read: true })),
    };
    setWireStore(nextStore);
    writeWireInstructionsStore(nextStore);
  }, [userRole, unreadWireNotifications, wireStore]);

  function saveWireDialog() {
    const isTeam = state.wireType === "team";
    const options = isTeam ? TEAM_WIRE_COMPLETION_OPTIONS : { requireBankDetails: false };
    const errors = validateWireInstruction(state.wireDraft!, options);
    
    if (Object.keys(errors).length > 0) {
      setState(current => ({ ...current, wireErrors: errors }));
      toast.error("Please fix wire instruction errors");
      return;
    }

    const nextRecord = {
      ...state.wireDraft!,
      updatedAt: new Date().toISOString(),
    };

    let nextStore = { ...wireStore };

    if (state.wireType === "team") {
      nextStore.teamWireInstructions = nextRecord;
    } else if (state.wireType === "shared") {
      const idx = nextStore.sharedRecipients.findIndex(r => r.id === nextRecord.id);
      if (idx >= 0) {
        nextStore.sharedRecipients[idx] = nextRecord;
      } else {
        const c = creatorForNew();
        nextStore.sharedRecipients.push({
          ...nextRecord,
          id: crypto.randomUUID(),
          createdByRole: c.role,
          createdById: c.id,
          createdByName: c.name,
          createdByGroupName: c.groupName,
        });
      }
    } else if (state.wireType === "private_recipient") {
      const privateRecips = nextStore.privateRecipients[CURRENT_AGENT_ID] || [];
      const draftRecord = nextRecord as any;
      if (draftRecord._oldId) {
        const oldIdx = privateRecips.findIndex((r) => r.id === draftRecord._oldId);
        if (oldIdx >= 0) {
          privateRecips.splice(oldIdx, 1);
        }
        delete draftRecord._oldId;
      }
      const existingIdx = privateRecips.findIndex((r) => r.id === nextRecord.id);
      if (existingIdx >= 0) {
        privateRecips[existingIdx] = nextRecord;
      } else {
        privateRecips.push(nextRecord);
      }
      nextStore.privateRecipients[CURRENT_AGENT_ID] = privateRecips;
    } else if (state.wireType === "private") {
      const previousRecord = nextStore.agentWireInstructions[CURRENT_AGENT_ID] ?? createEmptyWireInstruction();
      const wasComplete = isWireInstructionComplete(previousRecord, options);
      const isCompleteNow = isWireInstructionComplete(nextRecord, options);
      
      if (!wasComplete && isCompleteNow) {
        nextStore.notifications = [
          {
            id: crypto.randomUUID(),
            agentId: currentAgent.id,
            agentName: currentAgent.name,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...nextStore.notifications,
        ];
      }
      
      const targetAgentId = nextRecord.id && nextRecord.id !== CURRENT_AGENT_ID 
        ? nextRecord.id 
        : CURRENT_AGENT_ID;
        
      nextStore.agentWireInstructions = {
        ...nextStore.agentWireInstructions,
        [targetAgentId]: nextRecord,
      };
    }

    setWireStore(nextStore);
    writeWireInstructionsStore(nextStore);
    
    setState(current => ({ 
      ...current, 
      activeDialog: null,
      wireDraft: null,
      wireType: null,
      wireErrors: {}
    }));
    
    toast.success(`${state.wireType === "team" ? "Team" : state.wireType === "shared" ? "Shared" : "Private"} wire instructions saved`);
  }

  function openWireDialog(type: "team" | "shared" | "private" | "private_recipient", record?: WireInstructionRecord) {
    let draft = record;
    if (!draft) {
      if (type === "team") draft = wireStore.teamWireInstructions;
      else if (type === "private") draft = wireStore.agentWireInstructions[CURRENT_AGENT_ID] ?? createEmptyWireInstruction();
      else draft = createEmptyWireInstruction();
    }
    
    setState(current => ({
      ...current,
      activeDialog: "wire-instruction",
      wireType: type,
      wireDraft: { ...draft! },
      wireErrors: {}
    }));
  }

  function renderWireInstructions() {
    const teamComplete = isWireInstructionComplete(wireStore.teamWireInstructions, TEAM_WIRE_COMPLETION_OPTIONS);
    const sharedRecipients = wireStore.sharedRecipients || [];
    
    const myWire = wireStore.agentWireInstructions[CURRENT_AGENT_ID] ?? createEmptyWireInstruction(`agent-wire-${CURRENT_AGENT_ID}`);
    const myWireComplete = isWireInstructionComplete(myWire, {requireBankDetails: false});
    const privateRecipients = wireStore.privateRecipients[CURRENT_AGENT_ID] || [];
    const hasPrivateRecipients = privateRecipients.length > 0;

    const otherAgents = agents.filter(a => a.id !== CURRENT_AGENT_ID);

    const canManageTeamAndShared = userRole === "team_lead" || userRole === "soul_auditor" || userRole === "radius_auditing";
    const canManageTeamWire = userRole === "team_lead";

    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Wiring & Payment Instructions</h2>
            <p className="mt-1 text-xs text-muted-foreground">Manage payment details for team, external vendors, and yourself.</p>
          </div>
        </div>

        {!teamComplete && (
          <Alert className="border-amber-200 bg-amber-50">
            <Bell className="text-amber-700" />
            <AlertTitle className="text-amber-900">Team wire instructions incomplete</AlertTitle>
            <AlertDescription className="text-amber-800">
              Complete brokerage wire instructions. Commission breakdown generation should block until payout destination exists.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="private" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>

          <TabsContent value="shared" className="flex flex-col gap-6">
            {(() => {
              const tlRecipients = sharedRecipients.filter((r) => !r.createdByRole || r.createdByRole === "team_lead");
              const glRecipients = sharedRecipients.filter((r) => r.createdByRole === "group_lead");
              const isGLView = isGroupLead;
              const visibleGL = isGLView
                ? glRecipients.filter((r) => r.createdById === CURRENT_GROUP_LEAD_ID)
                : glRecipients;
              function renderRecipientsCard(rows: WireInstructionRecord[], allowEdit: boolean) {
                if (rows.length === 0) {
                  return (
                    <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center flex flex-col items-center gap-3">
                      <p>No recipients yet.</p>
                    </div>
                  );
                }
                return (
                  <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Name</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Details</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                          <TableHead className="w-[50px] pr-6"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow key={r.id} className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                            <TableCell className="pl-6 font-medium text-sm text-foreground">{r.accountHolderName || "Unnamed Agent"}</TableCell>
                            <TableCell className="text-sm max-w-[280px] truncate">{renderWireDetails(r)}</TableCell>
                            <TableCell><WireStatusBadge complete={isWireInstructionComplete(r, {requireBankDetails: false})} /></TableCell>
                            <TableCell className="pr-6 text-right">
                              {allowEdit && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-8">
                                      <MoreVertical className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                                    <DropdownMenuItem onClick={() => openWireDialog("shared", r)}>
                                      <Edit3 className="size-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                );
              }
              if (isGLView) {
                return (
                  <>
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-semibold">Shared by Team Lead</h3>
                      {renderRecipientsCard(tlRecipients, false)}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Shared by You</h3>
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary" onClick={() => openWireDialog("shared")}>
                          <Plus className="size-4 mr-1" /> Recipient
                        </Button>
                      </div>
                      {renderRecipientsCard(visibleGL, true)}
                    </div>
                  </>
                );
              }
              return (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Shared by Team Lead</h3>
                      {canManageTeamAndShared && (
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary" onClick={() => openWireDialog("shared")}>
                          <Plus className="size-4 mr-1" /> Recipient
                        </Button>
                      )}
                    </div>
                    {renderRecipientsCard(tlRecipients, canManageTeamAndShared)}
                  </div>
                  {glRecipients.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-semibold">Shared by Group Leads</h3>
                      {renderRecipientsCard(glRecipients, canManageTeamAndShared)}
                    </div>
                  )}
                </>
              );
            })()}
          </TabsContent>

          <TabsContent value="private" className="flex flex-col gap-6">
            {canManageTeamWire && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Team Wire</h3>
                  {!teamComplete && (
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary" onClick={() => openWireDialog("team", wireStore.teamWireInstructions)}>
                      <Plus className="size-4 mr-1" /> Team Wire
                    </Button>
                  )}
                </div>

                <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b">
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Account Name</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Details</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                        <TableHead className="w-[50px] pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                        <TableCell className="pl-6 font-medium text-sm text-foreground">{wireStore.teamWireInstructions.accountHolderName || "Not set"}</TableCell>
                        <TableCell className="text-sm max-w-[280px] truncate">{renderWireDetails(wireStore.teamWireInstructions)}</TableCell>
                        <TableCell><WireStatusBadge complete={teamComplete} /></TableCell>
                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                              <DropdownMenuItem onClick={() => openWireDialog("team", wireStore.teamWireInstructions)}>
                                <Edit3 className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">My Wire</h3>
                {!myWireComplete && (
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary" onClick={() => openWireDialog("private", myWire)}>
                    <Plus className="size-4 mr-1" /> My Wire
                  </Button>
                )}
              </div>
              <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Name</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Details</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                      <TableHead className="w-[50px] pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                      <TableCell className="pl-6 font-medium text-sm text-foreground">{myWire.accountHolderName || agents.find(a => a.id === CURRENT_AGENT_ID)?.name || "Not set"}</TableCell>
                      <TableCell className="text-sm max-w-[280px] truncate">{renderWireDetails(myWire)}</TableCell>
                      <TableCell><WireStatusBadge complete={myWireComplete} /></TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                            <DropdownMenuItem onClick={() => openWireDialog("private", myWire)}>
                              <Edit3 className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Private Recipients</h3>
                <div className="flex items-center gap-3">
                  {hasPrivateRecipients && (
                    <div className="relative w-[280px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search recipients..." 
                        className="pl-9 h-9"
                        value={privateRecipientSearch}
                        onChange={(e) => setPrivateRecipientSearch(e.target.value)}
                      />
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary h-9" onClick={() => openWireDialog("private_recipient")}>
                    <Plus className="size-4 mr-1" /> Instructions
                  </Button>
                </div>
              </div>
              {!hasPrivateRecipients ? (
                <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center flex flex-col items-center gap-3">
                  <p>No private recipients yet. Add vendors or escrow companies here.</p>
                </div>
              ) : (
                <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b">
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Name</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Details</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                        <TableHead className="w-[50px] pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {privateRecipients
                        .filter(r => (r.accountHolderName || r.payableName || "").toLowerCase().includes(privateRecipientSearch.toLowerCase()))
                        .map((r) => (
                        <TableRow key={r.id} className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                          <TableCell className="pl-6 font-medium text-sm text-foreground">{r.accountHolderName || r.payableName || "Unnamed Recipient"}</TableCell>
                          <TableCell className="text-sm max-w-[280px] truncate">{renderWireDetails(r)}</TableCell>
                          <TableCell><WireStatusBadge complete={isWireInstructionComplete(r, {requireBankDetails: false})} /></TableCell>
                          <TableCell className="pr-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                                <DropdownMenuItem onClick={() => openWireDialog("private_recipient", r)}>
                                  <Edit3 className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {privateRecipients.filter(r => (r.accountHolderName || r.payableName || "").toLowerCase().includes(privateRecipientSearch.toLowerCase())).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No private recipients found matching "{privateRecipientSearch}"
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    );
  }


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

  function openPlanDefaults(plan: CommissionPlan) {
    setState((current) => ({
      ...current,
      activeDialog: "assign-defaults",
      assignDefaultsSource: { from: "plan", planId: plan.id },
      assignDefaultsForm: {
        ...getFreshAssignDefaultsForm(),
        planId: plan.id,
        selectedAgentIds: [],
      },
      assignDefaultsErrors: {},
    }));
  }

  function openFeeDefaults(fee: FeeRecord) {
    setState((current) => ({
      ...current,
      activeDialog: "assign-defaults",
      assignDefaultsSource: { from: "fee", feeId: fee.id },
      assignDefaultsForm: {
        ...getFreshAssignDefaultsForm(),
        feeIds: [fee.id],
        selectedAgentIds: [],
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

    const commitAssignment = () => {
      setState((current) => {
        let nextAssignments = [...current.defaultAssignments];

        if (source.from === "plan" || effectivePlanId || source.from === "bulk" || source.from === "agent") {
          const selectedTypesKeys = Object.keys(form.dealTypes).filter(k => form.dealTypes[k]);
          
          targetAgentIds.forEach(agentId => {
            if (form.actionType === "unassign") {
              // Unassign logic
              nextAssignments = nextAssignments.map(assignment => {
                if (assignment.agentId === agentId && assignment.planId === effectivePlanId) {
                  const newDealTypes = { ...assignment.dealTypes };
                  selectedTypesKeys.forEach(k => { newDealTypes[k] = false; });
                  return { ...assignment, dealTypes: newDealTypes };
                }
                return assignment;
              }).filter(assignment => {
                const hasDealTypes = Object.values(assignment.dealTypes).some(v => v);
                return hasDealTypes || assignment.feeIds.length > 0;
              });
            } else {
              // Assign logic
              nextAssignments = nextAssignments.map(assignment => {
                // If the agent is assigned to a different plan, remove the overlapping deal types
                if (assignment.agentId === agentId && assignment.planId !== effectivePlanId) {
                  const newDealTypes = { ...assignment.dealTypes };
                  selectedTypesKeys.forEach(k => { newDealTypes[k] = false; });
                  return { ...assignment, dealTypes: newDealTypes };
                }
                return assignment;
              }).filter(assignment => {
                const hasDealTypes = Object.values(assignment.dealTypes).some(v => v);
                return hasDealTypes || assignment.feeIds.length > 0;
              });

              const existingSamePlan = nextAssignments.find(a => a.agentId === agentId && a.planId === effectivePlanId);
              if (existingSamePlan) {
                // Only merge the TRUE values so we don't accidentally wipe out unselected types
                const newDealTypes = { ...existingSamePlan.dealTypes };
                selectedTypesKeys.forEach(k => { newDealTypes[k] = true; });
                existingSamePlan.dealTypes = newDealTypes;
                existingSamePlan.feeIds = Array.from(new Set([...existingSamePlan.feeIds, ...effectiveFeeIds]));
                existingSamePlan.applyToActiveDeals = form.applyToActiveDeals;
              } else {
                // For new assignment, we only set the selected types to true
                const newDealTypes = { buyer: false, listing: false, referral: false, lease: false, "lease-listing": false };
                selectedTypesKeys.forEach(k => { (newDealTypes as any)[k] = true; });
                nextAssignments.push({
                  id: crypto.randomUUID(),
                  agentId,
                  planId: effectivePlanId,
                  feeIds: effectiveFeeIds,
                  dealTypes: newDealTypes,
                  applyToActiveDeals: form.applyToActiveDeals,
                });
              }
            }
          });
        } else if (source.from === "fee") {
          const targetSet = new Set(targetAgentIds);
          if (form.actionType === "unassign") {
            nextAssignments = nextAssignments.map((assignment) => {
              if (targetSet.has(assignment.agentId)) {
                return {
                  ...assignment,
                  feeIds: assignment.feeIds.filter(id => id !== source.feeId)
                };
              }
              return assignment;
            }).filter(assignment => {
              const hasDealTypes = Object.values(assignment.dealTypes).some(v => v);
              return hasDealTypes || assignment.feeIds.length > 0;
            });
          } else {
            nextAssignments = nextAssignments.map((assignment) => {
              if (targetSet.has(assignment.agentId)) {
                return {
                  ...assignment,
                  feeIds: Array.from(new Set([...assignment.feeIds, source.feeId])),
                  applyToActiveDeals: form.applyToActiveDeals
                };
              }
              return assignment;
            });
            // For agents that have NO assignments at all, create a blank one with just the fee
            targetAgentIds.forEach(agentId => {
              if (!nextAssignments.some(a => a.agentId === agentId)) {
                nextAssignments.push({
                  id: crypto.randomUUID(),
                  agentId,
                  planId: null,
                  feeIds: [source.feeId],
                  dealTypes: { buyer: false, listing: false, referral: false, lease: false, "lease-listing": false },
                  applyToActiveDeals: form.applyToActiveDeals,
                });
              }
            });
          }
        }

        return {
          ...current,
          defaultAssignments: nextAssignments,
          activeDialog: null,
          assignDefaultsForm: getFreshAssignDefaultsForm(),
          assignDefaultsErrors: {},
          assignDefaultsSource: { from: "bulk" },
          overwriteAssignDefaults: false,
          pendingAssignmentSave: null,
        };
      });

      toast.success("Defaults assigned successfully");
    };

    // Check for conflicts before committing
    if (source.from === "plan" || effectivePlanId) {
      const selectedTypesKeys = Object.keys(form.dealTypes).filter(k => form.dealTypes[k]);
      const hasConflict = state.defaultAssignments.some(assignment => {
        if (!targetAgentIds.includes(assignment.agentId)) return false;
        if (assignment.planId === effectivePlanId) return false;
        return selectedTypesKeys.some(k => assignment.dealTypes[k]);
      });

      if (hasConflict) {
        setState(current => ({
          ...current,
          overwriteAssignDefaults: true,
          pendingAssignmentSave: commitAssignment,
        }));
        return;
      }
    }

    commitAssignment();
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
    const existing = state.form.editingPlanId ? state.plans.find((p) => p.id === state.form.editingPlanId) : undefined;
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
      createdBy: existing?.createdBy ?? creatorForNew(),
      scope: {
        mode: state.form.scopeMode,
        memberIds: [...state.form.scopeMemberIds],
        groupIds: [...state.form.scopeGroupIds],
      },
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
        scopeMode: plan.scope?.mode ?? "all_members",
        scopeMemberIds: plan.scope?.memberIds ? [...plan.scope.memberIds] : [],
        scopeGroupIds: plan.scope?.groupIds ? [...plan.scope.groupIds] : [],
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
        dealTypes: assignment.dealTypes,
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

    const visiblePlans = state.plans.filter(canViewOwned);
    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Commission Plans</h2>
            <p className="mt-1 text-xs text-muted-foreground">Create default split structures for agents and teams.</p>
          </div>
          <div className="flex items-center gap-2">
            {isTeamLead && (
              <FilterPopover
                groupFilter={groupFilter}
                onGroupFilter={setGroupFilter}
                memberOptions={memberOptions}
              />
            )}
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
        </div>
        <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Commission Plan</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Type</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Created by</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Agents Associated</TableHead>
                <TableHead className="w-[50px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePlans.map((plan) => {
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
                      <CreatorChip creator={plan.createdBy} selfId={currentCreatorId} />
                    </TableCell>
                    <TableCell>
                      <AgentAvatarStack
                        agents={assignedAgents.map((a) => ({ id: a.id, name: a.name, avatarUrl: a.avatarUrl }))}
                        max={5}
                        size="sm"
                        emptyActionLabel="Assign"
                        onEmptyAction={() => openPlanDefaults(plan)}
                        onViewAssociations={() => setState((c) => ({ ...c, viewAssociationsTarget: { type: "plan", id: plan.id, name: plan.name } }))}
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
                            {canEditOwned(plan) && (
                              <DropdownMenuItem onClick={() => editPlan(plan)}>
                                <Edit3 className="size-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openPlanDefaults(plan)}>
                              <UserCheck className="size-4" />
                              Assign
                            </DropdownMenuItem>
                            {hasAssignedAgents && (
                              <DropdownMenuItem onClick={() => setState((c) => ({ ...c, viewAssociationsTarget: { type: "plan", id: plan.id, name: plan.name } }))}>
                                <Eye className="size-4" />
                                View Associations
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => duplicatePlan(plan)}>
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {canEditOwned(plan) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => archivePlan(plan)}>
                                  <Archive className="size-4" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            )}
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
    const existing = state.fees.find((item) => item.id === feeId);
    const fee: FeeRecord = { ...data, id: feeId, createdBy: existing?.createdBy ?? creatorForNew() };
    const exists = !!existing;
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
  /* ── Payment Routing ── */
  type RoutingMode = "all_to_radius" | "radius_and_team" | "direct_to_all";
  const [routingMode, setRoutingMode] = useState<RoutingMode>("radius_and_team");

  const routingOptions: { id: RoutingMode; title: string; description: string; breakdown: { recipient: string; items: string }[] }[] = [
    {
      id: "all_to_radius",
      title: "Pay All to Radius",
      description: "Title company transfers the entire check to Radius. Radius distributes to team and agents.",
      breakdown: [
        { recipient: "Radius", items: "Radius Fees + Team Share + Agent Commissions" },
      ],
    },
    {
      id: "radius_and_team",
      title: "Pay Radius & Team",
      description: "Title company sends Radius fees to Radius and the remainder to the team. Team distributes agent commissions.",
      breakdown: [
        { recipient: "Radius", items: "Radius Fees" },
        { recipient: "Team", items: "Team Share + Agent Commissions" },
      ],
    },
    {
      id: "direct_to_all",
      title: "Direct Payments to All",
      description: "Title company pays each party directly — Radius fees to Radius, team share to team, and agent commission to agent.",
      breakdown: [
        { recipient: "Radius", items: "Radius Fees" },
        { recipient: "Team", items: "Team Share" },
        { recipient: "Agent", items: "Agent Commission" },
      ],
    },
  ];

  function renderPaymentRouting() {
    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Payment Routing</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Define how the title company distributes funds. Each CDA line item will follow this routing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {routingOptions.map((opt) => {
            const isActive = routingMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setRoutingMode(opt.id)}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/[0.03] ring-1 ring-primary"
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                {/* Radio indicator */}
                <div className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isActive ? "border-primary" : "border-muted-foreground/40"
                )}>
                  {isActive && <div className="size-2 rounded-full bg-primary" />}
                </div>

                <div>
                  <p className={cn("text-sm font-medium", isActive ? "text-primary" : "text-foreground")}>{opt.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{opt.description}</p>
                </div>

                {/* Breakdown chips */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {opt.breakdown.map((b) => (
                    <span key={b.recipient} className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <span className={cn(
                        "size-1.5 rounded-full",
                        b.recipient === "Radius" ? "bg-purple-500" : b.recipient === "Team" ? "bg-amber-500" : "bg-blue-500"
                      )} />
                      {b.recipient}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview table */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Payment Distribution Preview</p>
            <Badge variant="secondary" className="text-[10px]">
              {routingOptions.find((o) => o.id === routingMode)?.title}
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-medium">Line Item</TableHead>
                <TableHead className="text-[11px] font-medium">Paid To</TableHead>
                <TableHead className="text-right text-[11px] font-medium">Example Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routingMode === "all_to_radius" && (
                <>
                  <TableRow>
                    <TableCell className="text-xs">Radius Fees (RERM, E&O, etc.)</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-purple-500" />Radius</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$1,250</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Team Share</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-purple-500" />Radius</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$3,500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Agent Commission</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-purple-500" />Radius</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$8,750</TableCell>
                  </TableRow>
                </>
              )}
              {routingMode === "radius_and_team" && (
                <>
                  <TableRow>
                    <TableCell className="text-xs">Radius Fees (RERM, E&O, etc.)</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-purple-500" />Radius</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$1,250</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Team Share + Agent Commissions</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-amber-500" />Team</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$12,250</TableCell>
                  </TableRow>
                </>
              )}
              {routingMode === "direct_to_all" && (
                <>
                  <TableRow>
                    <TableCell className="text-xs">Radius Fees (RERM, E&O, etc.)</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-purple-500" />Radius</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$1,250</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Team Share</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-amber-500" />Team</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$3,500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">Agent Commission</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1 text-xs"><span className="size-1.5 rounded-full bg-blue-500" />Agent</span></TableCell>
                    <TableCell className="text-right text-xs tabular-nums">$8,750</TableCell>
                  </TableRow>
                </>
              )}
              {/* Total row */}
              <TableRow className="border-t bg-muted/30 font-medium hover:bg-muted/30">
                <TableCell className="text-xs font-semibold">Total to Title Company</TableCell>
                <TableCell />
                <TableCell className="text-right text-xs font-semibold tabular-nums">$13,500</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    );
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

    const visibleFees = state.fees.filter(canViewOwned);
    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Fee Types</h2>
            <p className="mt-1 text-xs text-muted-foreground">Define reusable deductions for CDA calculations.</p>
          </div>
          <div className="flex items-center gap-2">
            {isTeamLead && (
              <FilterPopover
                groupFilter={groupFilter}
                onGroupFilter={setGroupFilter}
                memberOptions={memberOptions}
              />
            )}
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
        </div>
        <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Fee Name</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Type</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Amount</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Timing</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Fee Payer</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Created by</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Breakdown Visibility</TableHead>
                <TableHead className="w-[50px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleFees.map((fee) => {
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
                    <TableCell className="text-sm">
                      {fee.slidingScale ? (
                        <span className="text-xs italic text-muted-foreground">Sliding scale</span>
                      ) : fee.type === "percentage" ? (
                        <span className="font-medium text-foreground">{fee.amount || "0"}%</span>
                      ) : (
                        <span className="font-medium text-foreground">${fee.amount || "0"}</span>
                      )}
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
                          onEmptyAction={() => openFeeDefaults(fee)}
                          onViewAssociations={() => setState((c) => ({ ...c, viewAssociationsTarget: { type: "fee", id: fee.id, name: fee.name } }))}
                          onUnassignDefaults={() => requestUnassignFeeDefaults(fee)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <CreatorChip creator={fee.createdBy} selfId={currentCreatorId} />
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-semibold", fee.timing === "pre-split" || fee.appliesToMode !== "team" || fee.visibleOnCda ? "text-emerald-600" : "text-muted-foreground/40")}>
                        {fee.timing === "pre-split"
                          ? "Always visible"
                          : fee.appliesToMode !== "team"
                            ? "Always visible"
                            : fee.visibleOnCda
                              ? "Visible"
                              : "Hidden"}
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
                            {canEditOwned(fee) && (
                              <DropdownMenuItem onClick={() => editFee(fee)}>
                                <Edit3 className="size-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {fee.appliesToMode === "agent" && (
                              <DropdownMenuItem onClick={() => openFeeDefaults(fee)}>
                                <UserCheck className="size-4" />
                                Assign
                              </DropdownMenuItem>
                            )}
                            {(fee.appliesToMode !== "agent" || hasAssignedAgents) && (
                              <DropdownMenuItem onClick={() => setState((c) => ({ ...c, viewAssociationsTarget: { type: "fee", id: fee.id, name: fee.name } }))}>
                                <Eye className="size-4" />
                                View Associations
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => duplicateFee(fee)}>
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {canEditOwned(fee) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => setState((current) => ({ ...current, archiveTarget: { type: "fee", id: fee.id, name: fee.name } }))}>
                                  <Archive className="size-4" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            )}
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

      <main className="pl-[72px]">
        {/* Universal CDA Navigation Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-6 py-2.5">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex items-center gap-1.5 text-xs">
                      <Library className="size-3.5" />
                      Financials
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs">CDA Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-2">
              <CDAFlowSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2">
                    {userRole === "agent" ? <User className="size-3.5" /> : userRole === "team_lead" ? <Users className="size-3.5" /> : userRole === "group_lead" ? <Users className="size-3.5" /> : <Shield className="size-3.5" />}
                    {userRole === "agent" ? "Agent view" : userRole === "team_lead" ? "Team Lead view" : userRole === "group_lead" ? "Group Lead view" : userRole === "soul_auditor" ? "SOUL Auditor view" : "Auditor view"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Switch role</DropdownMenuLabel>
                  {(["agent", "team_lead", "group_lead", "radius_auditing", "soul_auditor"] as const).map((r) => (
                    <DropdownMenuItem key={r} onClick={() => setUserRole(r)} className={cn(userRole === r && "bg-accent")}>
                      {r === "agent" ? "Agent" : r === "team_lead" ? "Team Lead" : r === "group_lead" ? "Group Lead" : r === "soul_auditor" ? "SOUL Auditor" : "Auditor"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex h-[92px] items-center px-6">
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
          {renderWireInstructions()}
          {/* {renderPaymentRouting()} */}
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

      {state.wireDraft && state.wireType && (
        <WireInstructionDialog
          open={state.activeDialog === "wire-instruction"}
          onOpenChange={(open) => setState((current) => ({ ...current, activeDialog: open ? "wire-instruction" : null }))}
          title={`${state.wireType === "team" ? "Team" : state.wireType === "shared" ? "Shared" : "Private"} Wire Instruction`}
          record={state.wireDraft}
          errors={state.wireErrors}
          onChange={(patch) => setState((current) => ({ ...current, wireDraft: { ...current.wireDraft!, ...patch } }))}
          onSave={saveWireDialog}
        />
      )}

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
        teamName="Keystone Team"
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
        open={state.overwriteAssignDefaults}
        onOpenChange={(open) => setState((current) => ({ ...current, overwriteAssignDefaults: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override existing assignments?</AlertDialogTitle>
            <AlertDialogDescription>
              One or more selected agents already have a different commission plan assigned to the selected representation types. 
              Continuing will override their existing assignments for these representation types.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => state.pendingAssignmentSave && state.pendingAssignmentSave()}>
              Override Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* View Associations Dialog */}
      {state.viewAssociationsTarget && (
        <ViewAssociationsDialogInner
          target={state.viewAssociationsTarget}
          assignments={state.defaultAssignments}
          onClose={() => setState((c) => ({ ...c, viewAssociationsTarget: null }))}
          onSave={(newAssignments) => {
            setState((current) => ({
              ...current,
              defaultAssignments: newAssignments,
              viewAssociationsTarget: null
            }));
            toast("Associations saved.");
          }}
        />
      )}

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
      {/* Removed old floating switcher */}
    </div>
  );
}
