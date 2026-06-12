import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Archive,
  AlertCircle,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  FileSpreadsheet,
  FileText,
  Gift,
  HelpCircle,
  Info,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  ReceiptText,
  Rss,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";

// ─── CDASettings-style components ──────────────────────────────────────────

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

// ─── Data ──────────────────────────────────────────────────────────────────

const transaction = {
  name: "1123 Folsom St",
  buyerName: "Michael Thompson",
  status: "Pending",
  agent: "Sarah Mitchell",
  coAgent: "John Peterson",
  buyer: "Michael Thompson",
  seller: "David Wilson",
  acceptedDate: "01/15/2025",
  closedDate: "02/28/2025",
  grossCommission: "$26,250",
  representation: "Buyer",
  checklistType: "Residential Purchase",
};

const checklistItems = [
  {
    id: 1,
    name: "Purchase Agreement",
    documents: 1,
    status: "approved",
    lastUpdated: "03/13/2024",
    comment: "All signatures verified and document is complete.",
  },
  {
    id: 2,
    name: "Comprehensive Seller Property Disclosure Statement and Environmental Hazards Report",
    documents: 0,
    status: "in_progress",
    lastUpdated: "03/13/2024",
    comment: "Waiting for seller to provide required disclosure forms.",
  },
  {
    id: 3,
    name: "Purchase Agreement",
    documents: 1,
    status: "changes_requested",
    lastUpdated: "03/13/2024",
    comment: "All signatures verified and document is complete.",
  },
  {
    id: 4,
    name: "Preliminary Title Report with Chain of Title and Property Liens Documentation",
    documents: 1,
    status: "approved",
    lastUpdated: "03/12/2024",
    comment: "Document looks good and has been approved.",
  },
  {
    id: 5,
    name: "Homeowners Association CC&Rs, Bylaws, Rules and Regulations Complete Package",
    documents: 10,
    status: "in_progress",
    lastUpdated: "03/12/2024",
    comment: "Document looks good and has been approved.",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium text-green-700 bg-green-50 border border-green-200">
        <CheckCircle2 className="size-3" /> Approved
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium text-blue-700 bg-blue-50 border border-blue-200">
        <Clock className="size-3" /> In Progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium text-orange-700 bg-orange-50 border border-orange-200">
      <AlertCircle className="size-3" /> Changes requested
    </span>
  );
}

// ─── Purchase Details Panel ────────────────────────────────────────────────

function PurchaseDetailsPanel({ onClose }: { onClose: () => void }) {
  const [dealDetailsOpen, setDealDetailsOpen] = useState(true);

  const accordionSections = [
    { label: "Property Information", btnLabel: null },
    { label: "Buyer Agent Information", btnLabel: "Buyer Agent" },
    { label: "Buyer Information", btnLabel: "Buyer" },
    { label: "Seller Agent Information", btnLabel: "Listing Agent" },
    { label: "Seller Information", btnLabel: "Seller" },
    { label: "Additional Contacts", btnLabel: "Contact" },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-[520px] bg-white border-l-2 border-[#d0d0d0] shadow-2xl flex flex-col h-full">
        {/* Back / close button */}
        <button
          onClick={onClose}
          className="absolute -left-5 top-8 z-10 w-10 h-10 rounded-full bg-[#ec4899] border-2 border-[#831843] flex items-center justify-center shadow-md hover:bg-[#db2777] transition-colors"
        >
          <ChevronRight className="size-5 text-white" />
        </button>

        <ScrollArea className="flex-1">
          <div className="px-6 pt-8 pb-6">
            {/* Heading */}
            <h2 className="text-[24px] font-extrabold text-[#41446a] mb-6">
              Purchase Details
            </h2>

            {/* Basic Details card */}
            <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-4 mb-4 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#101828] mb-3">Basic Details</h3>
              {/* Purchase Type */}
              <div className="mb-3">
                <label className="text-[12px] font-medium text-[#6a7282] block mb-1">
                  Purchase Type
                </label>
                <Select defaultValue="residential">
                  <SelectTrigger className="rounded-[30px] border-[#d1d5db] text-[14px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Property card */}
              <div className="flex items-center gap-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-[12px] p-3">
                <div className="w-14 h-14 rounded-[8px] bg-[#e5e7eb] overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=200&auto=format&fit=crop"
                    alt="Property"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[#6a7282]">MLS# 90210-A</p>
                  <p className="text-[13px] font-semibold text-[#101828] leading-5 truncate">
                    1123 Folsom St, San Francisco CA 94103
                  </p>
                </div>
                <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f3e8ff] transition-colors shrink-0">
                  <Pencil className="size-3.5 text-[#9810fa]" />
                </button>
              </div>
            </div>

            {/* Accordion sections */}
            <div className="flex flex-col gap-3 mb-4">
              {accordionSections.map(({ label, btnLabel }) => (
                <div
                  key={label}
                  className="bg-[#f9fafb] border-2 border-[#d1d5db] rounded-[16px] px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-[15px] font-semibold text-[#3730a3]">{label}</span>
                  <div className="flex items-center gap-2">
                    {btnLabel && (
                      <button className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#5a5ff2] text-[12px] font-medium text-[#5a5ff2] bg-white hover:bg-[#eef2ff] transition-colors">
                        <Plus className="size-3" />
                        {btnLabel}
                      </button>
                    )}
                    <ChevronRight className="size-4 text-[#9ca3af]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Deal Details section */}
            <div className="bg-[#f9fafb] border-2 border-[#d1d5db] rounded-[16px] overflow-hidden">
              <button
                className="w-full px-4 py-3 flex items-center justify-between"
                onClick={() => setDealDetailsOpen((v) => !v)}
              >
                <span className="text-[15px] font-semibold text-[#3730a3]">Deal Details</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-[#9ca3af] transition-transform",
                    dealDetailsOpen ? "rotate-180" : ""
                  )}
                />
              </button>

              {dealDetailsOpen && (
                <div className="px-4 pb-4 border-t border-[#e5e7eb]">
                  {/* Selected Plan */}
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-[#6a7282] uppercase tracking-wider mb-0.5">
                        Selected Plan
                      </p>
                      <p className="text-[14px] font-semibold text-[#101828]">80/20 Standard</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-full border border-[#5a5ff2] text-[12px] font-medium text-[#5a5ff2] hover:bg-[#eef2ff] transition-colors">
                      Change Plan
                    </button>
                  </div>
                  <Separator className="my-2" />

                  {/* Default Fees */}
                  <div className="py-3">
                    <p className="text-[11px] font-medium text-[#6a7282] uppercase tracking-wider mb-2">
                      Default Fees Applied
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { label: "TC", amount: "$500" },
                        { label: "RM", amount: "$300" },
                        { label: "E&O", amount: "$125" },
                      ].map(({ label, amount }) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ede9fe] text-[#5a5ff2] text-[12px] font-medium"
                        >
                          {label} <span className="text-[#7c3aed]">{amount}</span>
                        </span>
                      ))}
                      <button className="px-3 py-1 rounded-full border border-[#5a5ff2] text-[12px] font-medium text-[#5a5ff2] hover:bg-[#eef2ff] transition-colors">
                        + Fees
                      </button>
                    </div>
                  </div>
                  <Separator className="my-2" />

                  {/* Form fields */}
                  <div className="py-3 flex flex-col gap-3">
                    {[
                      { label: "Acceptance Date", required: true, type: "date" },
                      { label: "Closing Date", required: true, type: "date" },
                      { label: "Purchase Price", required: true, type: "text", placeholder: "$0.00" },
                    ].map(({ label, required, type, placeholder }) => (
                      <div key={label}>
                        <label className="text-[12px] font-medium text-[#374151] block mb-1">
                          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                        <Input
                          type={type}
                          placeholder={placeholder}
                          className="rounded-[20px] border-[#d1d5db] text-[14px] h-10"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="text-[12px] font-medium text-[#374151] block mb-1">
                        Commission Type <span className="text-red-500">*</span>
                      </label>
                      <Select defaultValue="percentage">
                        <SelectTrigger className="rounded-[20px] border-[#d1d5db] text-[14px] h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="flat">Flat Fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[12px] font-medium text-[#374151] block mb-1">
                        Fixed Fee Amount
                      </label>
                      <Input
                        type="text"
                        placeholder="$0.00"
                        className="rounded-[20px] border-[#d1d5db] text-[14px] h-10"
                      />
                    </div>

                    {[
                      { label: "Outgoing Referral Fee", required: true },
                      { label: "Transaction Type", required: true },
                    ].map(({ label, required }) => (
                      <div key={label}>
                        <label className="text-[12px] font-medium text-[#374151] block mb-1">
                          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                        <Input
                          type="text"
                          className="rounded-[20px] border-[#d1d5db] text-[14px] h-10"
                        />
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />

                  {/* Co-agent splits */}
                  <div className="py-3">
                    <p className="text-[11px] font-medium text-[#6a7282] uppercase tracking-wider mb-3">
                      Agent Allocation
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { name: "Ila Corcoran", pct: 60 },
                        { name: "Michael Tran", pct: 40 },
                      ].map(({ name, pct }) => (
                        <div key={name} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#ede9fe] flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-[#5a5ff2]">
                              {name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] font-medium text-[#101828] truncate">{name}</span>
                              <span className="text-[13px] font-bold text-[#5a5ff2] ml-2">{pct}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#5a5ff2]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#f59e0b] font-medium mt-3 flex items-center gap-1">
                      <Info className="size-3" />
                      Agent allocation must total 100% before CDA review
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5e7eb] bg-white flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" className="rounded-full bg-[#5a5ff2] hover:bg-[#4a4fe0]">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function TransactionDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("auditing");
  const [selectedItems, setSelectedItems] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ]);
  const [purchaseDetailsOpen, setPurchaseDetailsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header (CDASettings-style) ── */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-[68px] items-center justify-between border-b bg-background shadow-sm">
        <div className="px-5">
          <RadiusLogo />
        </div>
        <div className="flex h-full items-center gap-4 border-l px-6">
          <div className="size-12 rounded-full bg-muted overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-base font-medium leading-5">Vanessa Brown</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-3 rounded-full bg-primary" />
              Radius Agent
            </div>
          </div>
        </div>
      </header>

      {/* ── Sidebar (CDASettings-style) ── */}
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
          <SidebarIcon icon={Building2} label="Office" active />
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

      {/* ── Main content ── */}
      <main className="pl-[72px] pt-[68px]">
        <div className="flex-1 px-6 py-5 w-full">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 gap-1.5 text-[14px] text-[#4a5565] hover:text-[#101828] border border-[#e5e7eb] bg-white rounded-full h-[34px] px-3"
          >
            <ChevronLeft className="size-4" />
            Back to transactions
          </Button>

          {/* ── Hero Card ── */}
          <div className="rounded-[10px] border-[1.8px] border-[#ad46ff] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-visible mb-4 relative">
            {/* Top section */}
            <div className="bg-[#faf5ff] border-b border-[#e9d4ff] px-6 pt-6 pb-4 rounded-t-[8px]">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#6a7282] leading-5">
                    Transaction name
                  </p>
                  <div className="flex items-center gap-3">
                    <h1 className="text-[24px] font-bold text-[#101828] leading-8 tracking-[0.07px]">
                      {transaction.name}
                    </h1>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3e8ff] transition-colors">
                      <Pencil className="size-4 text-[#9810fa]" />
                    </button>
                  </div>
                  <p className="text-[14px] text-[#4a5565] leading-5">Buyer name</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#8b5cf6] bg-white hover:bg-[#faf5ff] transition-colors">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
                    <span className="text-[14px] font-medium text-[#101828]">{transaction.status}</span>
                    <ChevronDown className="size-3 text-[#6a7282]" />
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#e5e7eb] bg-white">
                    <span className="text-[14px] font-medium text-[#101828] whitespace-nowrap">
                      Accepted Date Contr...
                    </span>
                    <div className="w-10 h-5 rounded-full bg-[#e5e7eb] relative flex items-center px-1">
                      <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                  {[
                    { label: "Commission deduction", value: "$250" },
                    { label: "Credit", value: "$200" },
                    { label: "Referral fee", value: "$50" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[12px] font-medium text-[#6a7282] leading-4">{item.label}</p>
                      <p className="mt-1 text-[14px] font-semibold text-[#101828] leading-5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="bg-white px-6 py-5 rounded-b-[8px]">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-6">
                  {[
                    { label: "Agent", value: transaction.agent },
                    { label: "Co-agent", value: transaction.coAgent },
                    { label: "Buyer", value: transaction.buyer },
                    { label: "Seller", value: transaction.seller },
                    { label: "Accepted Date", value: transaction.acceptedDate },
                    { label: "Closed Date", value: transaction.closedDate },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-1 min-w-[140px]">
                      <p className="text-[12px] font-medium text-[#6a7282] leading-4">{label}</p>
                      <p className="text-[14px] font-semibold text-[#101828] leading-5 tracking-[-0.15px]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-[12px] font-medium text-[#6a7282] leading-4">Gross Commission</p>
                      <p className="text-[14px] font-bold text-[#008236] leading-5 tracking-[-0.15px]">
                        {transaction.grossCommission}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[12px] font-medium text-[#6a7282] leading-4">Representation</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#dbeafe] text-[#1447e6] text-[12px] font-medium leading-4 w-fit">
                        {transaction.representation}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[12px] font-medium text-[#6a7282] leading-4">Checklist Type</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#f3f4f6] text-[#364153] text-[12px] font-medium leading-4 w-fit">
                        {transaction.checklistType}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2.5">
                    <Link to="/cda/commission-breakdown">
                      <button className="flex items-center gap-2 px-3 py-[7px] rounded-[24px] border border-[#e5e7eb] bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors">
                        <FileSpreadsheet className="size-4 text-[#5a5ff2]" />
                        <span className="text-[14px] font-medium text-[#5a5ff2] leading-5 tracking-[-0.15px] whitespace-nowrap">
                          Commission Breakdown
                        </span>
                      </button>
                    </Link>
                    <button className="flex items-center gap-2 px-3 py-[7px] rounded-[24px] border border-[#e5e7eb] bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors">
                      <MessageSquare className="size-5 text-[#9810fa]" />
                      <span className="text-[14px] font-medium text-[#9810fa] leading-5 tracking-[-0.15px]">
                        Comments
                      </span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-[10px] rounded-[18px] bg-[#9810fa] hover:bg-[#8a0de0] transition-colors shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)]">
                      <Pencil className="size-4 text-white" />
                      <span className="text-[14px] font-medium text-white leading-5 tracking-[-0.15px]">
                        Edit
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Details tab — right inner edge of hero card */}
            <button
              onClick={() => setPurchaseDetailsOpen(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pl-2 pr-3 py-2 bg-[#9810fa] rounded-l-[8px] shadow-md hover:bg-[#8a0de0] transition-colors whitespace-nowrap z-10"
            >
              <ChevronLeft className="size-3.5 text-white" />
              <span className="text-white text-[13px] font-semibold">Purchase Details</span>
            </button>
          </div>

          {/* Auditing Status Info */}
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-4 mb-4 flex items-start gap-3">
            <Info className="size-5 text-[#2563eb] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-[#2563eb] leading-5">
                Auditing Status Information
              </p>
              <p className="text-[14px] text-[#2563eb] leading-5 mt-0.5">
                Auditing will begin only after the transaction is in contract
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
            <div className="border-b border-[#e5e7eb] px-6 flex items-center gap-8">
              {["document_preparation", "sent_envelopes", "auditing"].map((tab) => {
                const labels: Record<string, string> = {
                  document_preparation: "Document preparation",
                  sent_envelopes: "Sent envelopes",
                  auditing: "Auditing Dashboard",
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "py-4 text-[14px] font-medium border-b-2 -mb-px transition-colors",
                      activeTab === tab
                        ? "border-[#5a5ff2] text-[#5a5ff2]"
                        : "border-transparent text-[#6a7282] hover:text-[#101828]"
                    )}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {activeTab === "auditing" && (
              <div className="p-6">
                <div className="flex items-end justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">
                      Active checklist
                    </p>
                    <div className="flex items-center gap-2 w-[523px] px-4 py-3 border border-[#e5e7eb] rounded-lg bg-white">
                      <span className="flex-1 text-[14px] text-[#101828] font-medium">
                        Sol-cal standard listing
                      </span>
                      <ChevronDown className="size-4 text-[#6a7282]" />
                    </div>
                    <p className="text-[12px] text-[#6a7282] mt-1">
                      This checklist defines required items and audit rules for this transaction.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e7eb] rounded-lg bg-white hover:bg-[#f9fafb] transition-colors text-[14px] font-medium text-[#101828]">
                      <FileText className="size-4 text-[#6a7282]" />
                      Documents (19)
                      <ChevronRight className="size-4 text-[#6a7282]" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#5a5ff2] hover:bg-[#4a4fe0] rounded-lg transition-colors text-[14px] font-semibold text-white">
                      <BarChart3 className="size-4" />
                      Split &amp; Attach
                    </button>
                  </div>
                </div>

                {/* Selected items bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#5a5ff2] rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                      <span className="w-6 h-6 rounded-full bg-white text-[#5a5ff2] text-[12px] font-bold flex items-center justify-center">
                        {selectedItems.length}
                      </span>
                      <span className="text-[14px] font-semibold text-white">
                        {selectedItems.length} items selected
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-[14px] font-medium">
                      <Plus className="size-4" />
                      Add to staging area
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="flex items-center gap-1.5 text-white/80 hover:text-white text-[14px] font-medium transition-colors"
                  >
                    <X className="size-4" />
                    Clear selection
                  </button>
                </div>

                {/* Checklists */}
                {[
                  { title: "Listing Checklist", items: checklistItems.slice(0, 5), approved: 2, total: 5 },
                  { title: "Buyer Checklist", items: checklistItems.slice(0, 4), approved: 2, total: 5 },
                  { title: "Financing Checklist", items: checklistItems.slice(0, 3), approved: 2, total: 5 },
                ].map((section) => (
                  <div key={section.title} className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ChevronDown className="size-4 text-[#6a7282]" />
                        <span className="text-[14px] font-semibold text-[#101828]">{section.title}</span>
                        <span className="text-[12px] text-[#6a7282]">({section.items.length} items)</span>
                      </div>
                      <span className="text-[12px] text-[#6a7282]">
                        {section.approved} of {section.total} approved
                      </span>
                    </div>
                    <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                            <th className="w-8 p-3">
                              <div className="w-4 h-4 rounded border border-[#e5e7eb] bg-white" />
                            </th>
                            {["Name", "Status", "Last Updated", "Comments", "Actions"].map((h) => (
                              <th key={h} className="text-left text-[12px] font-medium text-[#6a7282] px-3 py-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.items.map((item, i) => (
                            <tr
                              key={item.id + section.title + i}
                              className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#f9fafb] transition-colors"
                            >
                              <td className="p-3">
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center",
                                    selectedItems.length > 0 && i === 0
                                      ? "border-[#5a5ff2] bg-[#5a5ff2]"
                                      : "border-[#e5e7eb] bg-white"
                                  )}
                                >
                                  {selectedItems.length > 0 && i === 0 && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <p className="text-[14px] font-medium text-[#101828] leading-5">{item.name}</p>
                                <p className="text-[12px] text-[#6a7282] mt-0.5 flex items-center gap-1">
                                  <FileText className="size-3" />
                                  {item.documents} document{item.documents !== 1 ? "s" : ""}
                                  <ChevronRight className="size-3" />
                                </p>
                              </td>
                              <td className="px-3 py-3">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-3 py-3 text-[14px] text-[#101828]">{item.lastUpdated}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="size-4 text-[#f97316] shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[13px] text-[#101828] leading-5 max-w-[200px]">{item.comment}</p>
                                    <button className="text-[12px] text-[#5a5ff2] font-medium mt-0.5 flex items-center gap-0.5">
                                      Comments <ChevronRight className="size-3" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors">
                                  <MoreVertical className="size-4 text-[#6a7282]" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab !== "auditing" && (
              <div className="p-12 flex items-center justify-center text-[14px] text-[#6a7282]">
                Content coming soon
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Purchase Details slide-in panel */}
      {purchaseDetailsOpen && (
        <PurchaseDetailsPanel onClose={() => setPurchaseDetailsOpen(false)} />
      )}
    </div>
  );
}
