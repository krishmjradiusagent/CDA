import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type FeeTier = { id: string; from: string; to: string; fee: string };
export type PercentageBase = "property-value" | "pre-split" | "post-split";
export type DealType = "buyer" | "seller" | "referral" | "lease" | "lease-listing";
export type FeeScopeMode = "all_members" | "all_groups" | "specific_members" | "specific_groups";

export interface FeeTypeDraft {
  id: string | null;
  name: string;
  type: "flat" | "percentage";
  amount: string;
  percentageBase: PercentageBase;
  appliesToMode: "team" | "agent" | "both";
  coAgentSplitMode?: "split-equally" | "each-agent-pays";
  payableToType?: "radius" | "team" | "external";
  payableToName?: string;
  payableToExternalId?: string;
  dealTypes?: DealType[];
  agentIds: string[];
  timing: "pre-split" | "post-split";
  slidingScale: boolean;
  tiers: FeeTier[];
  contributesToCap: boolean;
  notLessThan: { enabled: boolean; amount: string };
  notToExceed: { enabled: boolean; amount: string };
  visibleOnCda?: boolean;
  scopeMode?: FeeScopeMode;
  scopeMemberIds?: string[];
  scopeGroupIds?: string[];
}

export type ExistingFeeOption = FeeTypeDraft & { id: string };

export interface FeeBuilderModalProps {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FeeTypeDraft>;
  onSave: (data: FeeTypeDraft) => void;
  hideTimingField?: boolean;
  hidePostSplitBase?: boolean;
  hideSlidingScale?: boolean;
  existingFeeOptions?: ExistingFeeOption[];
  teamName?: string;
}

const DEFAULT_TEAM_NAME = "Keystone Team";
const FEE_MODAL_FIELD =
  "h-10 min-h-10 max-h-10 w-full px-3 py-2 text-sm leading-none";
const FEE_MODAL_SELECT_TRIGGER =
  `${FEE_MODAL_FIELD} data-[size=default]:h-10`;
const FORM_FIELD_SHELL =
  `flex items-center rounded-md border border-input bg-input-background ${FEE_MODAL_FIELD}`;

function resolvePayableToName(
  type: FeeTypeDraft["payableToType"],
  teamName: string,
  existing?: string,
): string {
  if (type === "radius") return "Radius";
  if (type === "team") return teamName;
  return existing ?? "";
}

function makeDraft(initial: Partial<FeeTypeDraft> | undefined, teamName: string): FeeTypeDraft {
  const payableToType = initial?.payableToType ?? "radius";
  return {
    id: initial?.id ?? null,
    name: initial?.name ?? "",
    type: initial?.type ?? "flat",
    amount: initial?.amount ?? "",
    percentageBase: initial?.percentageBase ?? "pre-split",
    appliesToMode: initial?.appliesToMode ?? "team",
    coAgentSplitMode: initial?.coAgentSplitMode ?? "split-equally",
    payableToType,
    payableToName: resolvePayableToName(payableToType, teamName, initial?.payableToName),
    payableToExternalId: initial?.payableToExternalId,
    dealTypes: initial?.dealTypes ?? ["buyer", "seller"],
    agentIds: initial?.agentIds ?? [],
    timing: initial?.timing ?? "pre-split",
    slidingScale: initial?.slidingScale ?? false,
    tiers: initial?.tiers ?? [],
    contributesToCap: initial?.contributesToCap ?? false,
    notLessThan: initial?.notLessThan ?? { enabled: false, amount: "" },
    notToExceed: initial?.notToExceed ?? { enabled: false, amount: "" },
    scopeMode: initial?.scopeMode ?? "all_members",
    scopeMemberIds: initial?.scopeMemberIds ?? [],
    scopeGroupIds: initial?.scopeGroupIds ?? [],
    visibleOnCda: initial?.visibleOnCda ?? false,
  };
}


function TierRows({ draft, onDraftChange }: { draft: FeeTypeDraft; onDraftChange: (next: FeeTypeDraft) => void; }) {
  const [flashTierId, setFlashTierId] = useState<string | null>(null);
  function updateTier(tierId: string, patch: Partial<FeeTier>) {
    onDraftChange({ ...draft, tiers: draft.tiers.map((t) => (t.id === tierId ? { ...t, ...patch } : t)) });
  }
  function addTier() {
    const newTier: FeeTier = { id: crypto.randomUUID(), from: "", to: "", fee: "" };
    onDraftChange({ ...draft, tiers: [...draft.tiers, newTier] });
    setFlashTierId(newTier.id);
    window.setTimeout(() => setFlashTierId(null), 600);
  }
  function removeTier(tierId: string) {
    onDraftChange({ ...draft, tiers: draft.tiers.filter((t) => t.id !== tierId) });
  }
  return (
    <div className="space-y-2">
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-2">
          {draft.tiers.map((tier) => (
            <div key={tier.id} className={`grid grid-cols-[1fr_1fr_1fr_auto] gap-2 rounded-md border p-2 transition-all duration-300 ${flashTierId === tier.id ? "bg-primary/10" : "bg-background"}`}>
              <div className="relative"><Input className="h-9 text-xs" placeholder="Over" value={tier.from} onChange={(e) => updateTier(tier.id, { from: e.target.value })} /></div>
              <div className="relative"><Input className="h-9 text-xs" placeholder="Up to" value={tier.to} onChange={(e) => updateTier(tier.id, { to: e.target.value })} /></div>
              <div className="relative">
                {draft.type === "flat" && <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>}
                <Input className={`h-9 text-xs ${draft.type === "flat" ? "pl-6" : "pr-6"}`} placeholder={draft.type === "flat" ? "0.00" : "0"} inputMode="decimal" value={tier.fee} onChange={(e) => updateTier(tier.id, { fee: e.target.value })} />
                {draft.type === "percentage" && <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>}
              </div>
              <Button variant="ghost" size="icon" className="size-9 text-muted-foreground transition-opacity hover:text-foreground" onClick={() => removeTier(tier.id)}><X className="size-4" /></Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button variant="outline" size="sm" onClick={addTier} className="w-full"><Plus className="size-4" /> Add Tier</Button>
    </div>
  );
}

export function FeeBuilderModal({
  open,
  title,
  onOpenChange,
  initialData,
  onSave,
  hideTimingField,
  hidePostSplitBase,
  existingFeeOptions = [],
  teamName = DEFAULT_TEAM_NAME,
}: FeeBuilderModalProps) {
  const [draft, setDraft] = useState<FeeTypeDraft>(() => makeDraft(initialData, teamName));

  useEffect(() => {
    if (open) setDraft(makeDraft(initialData, teamName));
  }, [open, initialData, teamName]);

  function update<K extends keyof FeeTypeDraft>(key: K, value: FeeTypeDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handlePayableToType(value: FeeTypeDraft["payableToType"]) {
    setDraft((prev) => ({
      ...prev,
      payableToType: value,
      payableToName: resolvePayableToName(
        value,
        teamName,
        value === "external" ? prev.payableToName : undefined,
      ),
      payableToExternalId: value === "external" ? prev.payableToExternalId : undefined,
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[920px] max-w-[calc(100vw-32px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[920px]">
        <DialogHeader className="border-b px-8 pb-4 pt-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Configure fee type details.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 px-10 py-8">
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select
                value={draft.scopeMode ?? "all_members"}
                onValueChange={(v) => update("scopeMode", v as FeeScopeMode)}
              >
                <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_members">All members</SelectItem>
                  <SelectItem value="all_groups">All groups</SelectItem>
                  <SelectItem value="specific_members">Specific members</SelectItem>
                  <SelectItem value="specific_groups">Specific groups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {existingFeeOptions.length > 0 && (
              <div className="space-y-1.5">
                <Label>Select Fee Type</Label>
                <Select
                  value={draft.id ?? "__new__"}
                  onValueChange={(value) => {
                    if (value === "__new__") {
                      setDraft(makeDraft(initialData, teamName));
                    } else {
                      const fee = existingFeeOptions.find((f) => f.id === value);
                      if (fee) setDraft(makeDraft(fee, teamName));
                    }
                  }}
                >
                  <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {existingFeeOptions.map((fee) => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Create a fee type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fee-name">Fee Name</Label>
              <Input
                id="fee-name"
                className={FEE_MODAL_FIELD}
                placeholder="e.g., Transaction Coordinator Fee"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fee Type</Label>
                <Select
                  value={draft.type}
                  onValueChange={(v) => update("type", v as FeeTypeDraft["type"])}
                >
                  <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Fee</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{draft.type === "flat" ? "Flat Fee" : "Fee Percentage"}</Label>
                <div className="relative">
                  {draft.type === "flat" && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                  )}
                  <Input
                    className={`${FEE_MODAL_FIELD} ${draft.type === "flat" ? "pl-7" : "pr-8"}`}
                    inputMode="decimal"
                    placeholder={draft.type === "flat" ? "495" : "2.5"}
                    value={draft.amount}
                    onChange={(e) => update("amount", e.target.value)}
                  />
                  {draft.type === "percentage" && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>

            {draft.type === "percentage" && (
              <div className="space-y-1.5">
                <Label>Percentage Based On</Label>
                <Select
                  value={draft.percentageBase}
                  onValueChange={(v) => update("percentageBase", v as PercentageBase)}
                >
                  <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property-value">Property Value</SelectItem>
                    <SelectItem value="pre-split">Pre-Split Amount (Gross Commission)</SelectItem>
                    {!hidePostSplitBase && (
                      <SelectItem value="post-split">Post-Split Amount</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className={`grid gap-4 ${hideTimingField ? "grid-cols-2" : "grid-cols-3"}`}>
              {!hideTimingField && (
                <div className="space-y-1.5">
                  <Label>When Applied</Label>
                  <Select
                    value={draft.timing}
                    onValueChange={(v) => update("timing", v as FeeTypeDraft["timing"])}
                  >
                    <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-split">Pre-Split</SelectItem>
                      <SelectItem value="post-split">Post-Split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Fee Payer</Label>
                <Select
                  value={draft.appliesToMode}
                  onValueChange={(v) => update("appliesToMode", v as FeeTypeDraft["appliesToMode"])}
                >
                  <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Co-Agent Splits</Label>
                <Select
                  value={draft.coAgentSplitMode ?? "split-equally"}
                  onValueChange={(v) => update("coAgentSplitMode", v as FeeTypeDraft["coAgentSplitMode"])}
                >
                  <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split-equally">Split equally</SelectItem>
                    <SelectItem value="each-agent-pays">Each agent pays</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Payable To</Label>
                <Select
                  value={draft.payableToType ?? "radius"}
                  onValueChange={(v) => handlePayableToType(v as FeeTypeDraft["payableToType"])}
                >
                  <SelectTrigger className={FEE_MODAL_SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radius">Radius</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payable-to-name">Payable Name</Label>
                {draft.payableToType === "external" ? (
                  <Input
                    id="payable-to-name"
                    className={FEE_MODAL_FIELD}
                    value={draft.payableToName ?? ""}
                    placeholder="Enter payable name"
                    onChange={(e) => update("payableToName", e.target.value)}
                  />
                ) : (
                  <div
                    id="payable-to-name"
                    aria-readonly="true"
                    className={`${FORM_FIELD_SHELL} text-foreground opacity-50`}
                  >
                    {draft.payableToName}
                  </div>
                )}
              </div>
            </div>

            {/* Sliding Scale — full row */}
            <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
              <div className="space-y-0.5">
                <Label htmlFor="sliding-scale" className="text-sm">Sliding Scale</Label>
                <p className="text-xs text-muted-foreground">Enable tiered fee values.</p>
              </div>
              <Switch id="sliding-scale" checked={draft.slidingScale} onCheckedChange={(checked) => update("slidingScale", checked)} />
            </div>

            {/* Sliding Scale inline section */}
            {draft.slidingScale && (
              <div className="space-y-3 rounded-md border bg-muted/30 p-3">
                <TierRows draft={draft} onDraftChange={setDraft} />
                
                {/* Cap constraints */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex flex-1 items-center gap-2">
                    <Checkbox id="not-less-than" checked={draft.notLessThan.enabled} onCheckedChange={(c) => update("notLessThan", { ...draft.notLessThan, enabled: Boolean(c) })} />
                    <Label htmlFor="not-less-than" className="text-sm font-normal text-muted-foreground whitespace-nowrap">Not less than</Label>
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input className="h-9 pl-7 text-sm" value={draft.notLessThan.amount} inputMode="decimal" disabled={!draft.notLessThan.enabled} onChange={(e) => update("notLessThan", { ...draft.notLessThan, amount: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <Checkbox id="not-to-exceed" checked={draft.notToExceed.enabled} onCheckedChange={(c) => update("notToExceed", { ...draft.notToExceed, enabled: Boolean(c) })} />
                    <Label htmlFor="not-to-exceed" className="text-sm font-normal text-muted-foreground whitespace-nowrap">Not to exceed</Label>
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input className="h-9 pl-7 text-sm" value={draft.notToExceed.amount} inputMode="decimal" disabled={!draft.notToExceed.enabled} onChange={(e) => update("notToExceed", { ...draft.notToExceed, amount: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contributes to Cap */}
            <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
              <div className="space-y-0.5">
                <Label htmlFor="contributes-cap" className="text-sm">Contributes to Cap</Label>
                <p className="text-xs text-muted-foreground truncate">Count toward cap.</p>
              </div>
              <Switch id="contributes-cap" checked={draft.contributesToCap} onCheckedChange={(checked) => update("contributesToCap", checked)} />
            </div>

          </div>
        </div>

        <DialogFooter className="shrink-0 border-t bg-background px-8 py-[14px]">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save Fee Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
