import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

export type FeeTier = {
  id: string;
  from: string;
  to: string;
  fee: string;
};

export type PercentageBase = "property-value" | "pre-split" | "post-split";
export type DealType = "buyer" | "seller" | "referral" | "lease" | "lease-listing";

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
  dealTypes?: DealType[];
  agentIds: string[];
  timing: "pre-split" | "post-split";
  slidingScale: boolean;
  tiers: FeeTier[];
  contributesToCap: boolean;
  coAgentDistribution: "split-equally" | "each-pays";
  payableTo: "radius" | "team" | "external";
  payableToExternalId?: string;
  notLessThan: { enabled: boolean; amount: string };
  notToExceed: { enabled: boolean; amount: string };
}

export type ExistingFeeOption = FeeTypeDraft & {
  id: string;
};

export interface FeeBuilderModalProps {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FeeTypeDraft>;
  onSave: (data: FeeTypeDraft) => void;
  /** Hide the "When Applied" dropdown (timing already known from context) */
  hideTimingField?: boolean;
  /** Hide "Post-Split Amount" from "Percentage Based On" options */
  hidePostSplitBase?: boolean;
  /** Hide sliding scale controls for contexts that do not support tiered fees */
  hideSlidingScale?: boolean;
  /** Existing fee definitions that can be selected instead of manually creating a new one */
  existingFeeOptions?: ExistingFeeOption[];
}

function shouldForceFeeVisibility(
  timing: FeeTypeDraft["timing"],
  appliesToMode: FeeTypeDraft["appliesToMode"]
) {
  return timing === "pre-split" || appliesToMode !== "team";
}

function createDraft(
  initialData?: Partial<FeeTypeDraft>,
  options?: { hideSlidingScale?: boolean }
): FeeTypeDraft {
  const hideSlidingScale = options?.hideSlidingScale ?? false;
  const timing = initialData?.timing ?? "pre-split";
  const appliesToMode = initialData?.appliesToMode ?? "team";
  return {
    id: initialData?.id ?? null,
    name: initialData?.name ?? "",
    type: initialData?.type ?? "flat",
    amount: initialData?.amount ?? "",
    percentageBase: initialData?.percentageBase ?? "pre-split",
    appliesToMode,
    coAgentSplitMode: initialData?.coAgentSplitMode ?? "split-equally",
    payableToType: initialData?.payableToType ?? "radius",
    payableToName: initialData?.payableToName ?? "Radius",
    dealTypes: initialData?.dealTypes ?? ["buyer", "seller"],
    agentIds: initialData?.agentIds ?? [],
    timing,
    slidingScale: hideSlidingScale ? false : initialData?.slidingScale ?? false,
    tiers: hideSlidingScale ? [] : initialData?.tiers ?? [],
    contributesToCap: initialData?.contributesToCap ?? false,
    coAgentDistribution: initialData?.coAgentDistribution ?? "split-equally",
    payableTo: initialData?.payableTo ?? "radius",
    payableToExternalId: initialData?.payableToExternalId,
    notLessThan: hideSlidingScale
      ? { enabled: false, amount: initialData?.notLessThan?.amount ?? "0.00" }
      : initialData?.notLessThan ?? { enabled: false, amount: "0.00" },
    notToExceed: hideSlidingScale
      ? { enabled: false, amount: initialData?.notToExceed?.amount ?? "0.00" }
      : initialData?.notToExceed ?? { enabled: false, amount: "0.00" },
  };
}

function numericValue(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function FeeAmountInput({
  value,
  type,
  invalid,
  disabled,
  onChange,
}: {
  value: string;
  type: FeeTypeDraft["type"];
  invalid: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const prefix = type === "flat" ? "$" : undefined;
  const suffix = type === "percentage" ? "%" : undefined;
  const placeholder = type === "flat" ? "495" : "2.5";

  return (
    <div className="relative">
      {prefix ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      ) : null}
      <Input
        value={value}
        inputMode="decimal"
        placeholder={placeholder}
        aria-invalid={invalid}
        disabled={disabled}
        className={`h-10 ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}`}
        onChange={(event) => onChange(event.target.value)}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

function TierRows({
  draft,
  onDraftChange,
}: {
  draft: FeeTypeDraft;
  onDraftChange: (next: FeeTypeDraft) => void;
}) {
  const [flashTierId, setFlashTierId] = useState<string | null>(null);

  function updateTier(tierId: string, patch: Partial<FeeTier>) {
    onDraftChange({
      ...draft,
      tiers: draft.tiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)),
    });
  }

  function addTier() {
    const newTier: FeeTier = { id: crypto.randomUUID(), from: "", to: "", fee: "" };
    onDraftChange({ ...draft, tiers: [...draft.tiers, newTier] });
    setFlashTierId(newTier.id);
    window.setTimeout(() => setFlashTierId(null), 600);
  }

  function removeTier(tierId: string) {
    onDraftChange({ ...draft, tiers: draft.tiers.filter((tier) => tier.id !== tierId) });
  }

  return (
    <div className="space-y-2">
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-2">
          {draft.tiers.map((tier) => (
            <div
              key={tier.id}
              className={`grid grid-cols-[1fr_1fr_1fr_auto] gap-2 rounded-md border p-2 transition-all duration-300 ${
                flashTierId === tier.id ? "bg-primary/10" : "bg-background"
              }`}
            >
              <div className="relative">
                <Input
                  className="h-9 text-xs"
                  placeholder="Over"
                  value={tier.from}
                  onChange={(event) => updateTier(tier.id, { from: event.target.value })}
                />
              </div>
              <div className="relative">
                <Input
                  className="h-9 text-xs"
                  placeholder="Up to"
                  value={tier.to}
                  onChange={(event) => updateTier(tier.id, { to: event.target.value })}
                />
              </div>
              <div className="relative">
                {draft.type === "flat" && (
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                )}
                <Input
                  className={`h-9 text-xs ${draft.type === "flat" ? "pl-6" : "pr-6"}`}
                  placeholder={draft.type === "flat" ? "0.00" : "0"}
                  inputMode="decimal"
                  value={tier.fee}
                  onChange={(event) => updateTier(tier.id, { fee: event.target.value })}
                />
                {draft.type === "percentage" && (
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground transition-opacity hover:text-foreground"
                onClick={() => removeTier(tier.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button variant="outline" size="sm" onClick={addTier} className="w-full">
        <Plus className="size-4" />
        Add Tier
      </Button>
    </div>
  );
}

const CDA_TYPE_OPTIONS: { value: DealType; label: string }[] = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "referral", label: "Referral" },
  { value: "lease", label: "Lease" },
  { value: "lease-listing", label: "Lease listing" },
];

function CDATypeMultiSelect({
  selected,
  disabled,
  onChange,
}: {
  selected: DealType[];
  disabled?: boolean;
  onChange: (next: DealType[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === CDA_TYPE_OPTIONS.length;

  function toggleType(value: DealType) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  }

  function toggleAll() {
    onChange(allSelected ? [] : CDA_TYPE_OPTIONS.map((o) => o.value));
  }

  const summaryLabel =
    selected.length === 0
      ? "Select CDA types"
      : allSelected
        ? "All CDA types"
        : selected.length <= 2
          ? selected.map((v) => CDA_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v).join(", ")
          : `${CDA_TYPE_OPTIONS.find((o) => o.value === selected[0])?.label ?? selected[0]} +${selected.length - 1} more`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-10 w-full justify-between font-normal text-sm"
        >
          <span className={selected.length === 0 ? "text-muted-foreground" : ""}>
            {summaryLabel}
          </span>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
        <button
          type="button"
          onClick={toggleAll}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
        >
          <Checkbox checked={allSelected} />
          <span className="font-medium">Select all</span>
        </button>
        <div className="my-1 h-px bg-border" />
        {CDA_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleType(option.value)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <Checkbox checked={selected.includes(option.value)} />
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
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
  hideSlidingScale,
  existingFeeOptions = [],
}: FeeBuilderModalProps) {
  const [draft, setDraft] = useState<FeeTypeDraft>(() =>
    createDraft(initialData, { hideSlidingScale })
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedExistingFeeId, setSelectedExistingFeeId] = useState<string>("__new__");
  const isExistingFeeSelected = selectedExistingFeeId !== "__new__";
  const visibilityLocked = shouldForceFeeVisibility(draft.timing, draft.appliesToMode);

  function buildDraftFromExistingFee(existingFeeId: string) {
    const existingFee = existingFeeOptions.find((option) => option.id === existingFeeId);
    if (!existingFee) {
      return createDraft(initialData, { hideSlidingScale });
    }

    return createDraft(
      {
        ...existingFee,
        timing: hideTimingField ? initialData?.timing ?? existingFee.timing : existingFee.timing,
      },
      { hideSlidingScale }
    );
  }

  useEffect(() => {
    if (!open) return;
    const matchedExistingFee = initialData?.id
      ? existingFeeOptions.find((option) => option.id === initialData.id)
      : undefined;
    const nextSelectedExistingFeeId = matchedExistingFee?.id ?? "__new__";
    setSelectedExistingFeeId(nextSelectedExistingFeeId);
    setDraft(
      nextSelectedExistingFeeId === "__new__"
        ? createDraft(initialData, { hideSlidingScale })
        : buildDraftFromExistingFee(nextSelectedExistingFeeId)
    );
    setErrors({});
    setSaving(false);
  }, [existingFeeOptions, hideSlidingScale, initialData, open]);

  function updateField<K extends keyof FeeTypeDraft>(field: K, value: FeeTypeDraft[K]) {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (
        (field === "timing" || field === "appliesToMode") &&
        shouldForceFeeVisibility(next.timing, next.appliesToMode)
      ) {
        // next.visibleOnCda = true;
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "Fee name required";
    if (!draft.slidingScale && numericValue(draft.amount) <= 0) nextErrors.amount = "Amount required";
    if (draft.slidingScale && draft.tiers.length === 0) nextErrors.tiers = "Add at least one tier";
    if (!draft.payableToName?.trim()) nextErrors.payableToName = "Payable name required";
    if (!draft.dealTypes?.length) nextErrors.dealTypes = "Select at least one CDA type";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    window.setTimeout(() => {
      onSave(draft);
      setSaving(false);
      onOpenChange(false);
    }, 400);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[600px] max-w-[calc(100vw-48px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[600px]">
        <DialogHeader className="border-b px-6 pb-4 pt-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Configure fee type details.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 px-6 py-4">
            {existingFeeOptions.length > 0 && (
              <div className="space-y-1.5">
                <Label>Select Fee Type</Label>
                <Select
                  value={selectedExistingFeeId}
                  onValueChange={(value) => {
                    setSelectedExistingFeeId(value);
                    setErrors({});
                    setDraft(
                      value === "__new__"
                        ? createDraft(initialData, { hideSlidingScale })
                        : buildDraftFromExistingFee(value)
                    );
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {existingFeeOptions.map((feeOption) => (
                      <SelectItem key={feeOption.id} value={feeOption.id}>
                        {feeOption.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Create a fee type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Fee Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fee-name">Fee Name</Label>
              <Input
                id="fee-name"
                className="h-10"
                placeholder="e.g., Transaction Coordinator Fee"
                value={draft.name}
                aria-invalid={Boolean(errors.name)}
                disabled={isExistingFeeSelected}
                onChange={(event) => updateField("name", event.target.value)}
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>

            {/* Fee Type + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fee Type</Label>
                <Select
                  value={draft.type}
                  disabled={isExistingFeeSelected}
                  onValueChange={(value) => updateField("type", value as FeeTypeDraft["type"])}
                >
                  <SelectTrigger className="h-10">
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
                <FeeAmountInput
                  value={draft.amount}
                  type={draft.type}
                  invalid={Boolean(errors.amount)}
                  disabled={draft.slidingScale || isExistingFeeSelected}
                  onChange={(value) => updateField("amount", value)}
                />
                {errors.amount ? <p className="text-xs text-destructive">{errors.amount}</p> : null}
              </div>
            </div>

            {/* Percentage Based On — only for % type */}
            {draft.type === "percentage" && (
              <div className="space-y-1.5">
                <Label>Percentage Based On</Label>
                <Select
                  value={draft.percentageBase}
                  disabled={isExistingFeeSelected}
                  onValueChange={(value) => updateField("percentageBase", value as PercentageBase)}
                >
                  <SelectTrigger className="h-10">
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

            {/* When Applied + Fee Payer */}
            <div className="grid grid-cols-2 gap-4">
            {!hideTimingField && (
            <div className="space-y-1.5">
              <Label>When Applied</Label>
              <Select
                value={draft.timing}
                disabled={isExistingFeeSelected}
                onValueChange={(value) => updateField("timing", value as FeeTypeDraft["timing"])}
              >
                <SelectTrigger className="h-10">
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
                  disabled={isExistingFeeSelected}
                  onValueChange={(value) => updateField("appliesToMode", value as FeeTypeDraft["appliesToMode"])}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="both">Both (split equally)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Co-Agent Splits</Label>
                <Select
                  value={draft.coAgentSplitMode ?? "split-equally"}
                  disabled={isExistingFeeSelected}
                  onValueChange={(value) => updateField("coAgentSplitMode", value as FeeTypeDraft["coAgentSplitMode"])}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split-equally">Split equally</SelectItem>
                    <SelectItem value="each-agent-pays">Each agent pays</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Per agent in one side.</p>
              </div>

              <div className="space-y-1.5">
                <Label>Payable To</Label>
                <Select
                  value={draft.payableToType ?? "radius"}
                  disabled={isExistingFeeSelected}
                  onValueChange={(value) => {
                    const payableToType = value as FeeTypeDraft["payableToType"];
                    updateField("payableToType", payableToType);
                    if (payableToType === "radius") updateField("payableToName", "Radius");
                    if (payableToType === "team") updateField("payableToName", "Keystone Team");
                    if (payableToType === "external") updateField("payableToName", "");
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radius">Radius</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="payable-name">Payable name <span className="text-destructive">*</span></Label>
                <Input
                  id="payable-name"
                  className="h-10"
                  placeholder="Name"
                  value={draft.payableToName ?? ""}
                  aria-invalid={Boolean(errors.payableToName)}
                  disabled={isExistingFeeSelected}
                  onChange={(event) => updateField("payableToName", event.target.value)}
                />
                {errors.payableToName ? <p className="text-xs text-destructive">{errors.payableToName}</p> : null}
              </div>

              <div className="space-y-1.5">
                <Label>Assign to CDA types</Label>
                <CDATypeMultiSelect
                  selected={draft.dealTypes ?? []}
                  disabled={isExistingFeeSelected}
                  onChange={(next) => updateField("dealTypes", next)}
                />
                {errors.dealTypes ? <p className="text-xs text-destructive">{errors.dealTypes}</p> : null}
              </div>
            </div>

            {!hideSlidingScale && (
              <>
                {/* Sliding Scale — full row */}
                <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                  <div className="space-y-0.5">
                    <Label htmlFor="sliding-scale" className="text-sm">Sliding Scale</Label>
                    <p className="text-xs text-muted-foreground">Enable tiered fee values.</p>
                  </div>
                  <Switch
                    id="sliding-scale"
                    checked={draft.slidingScale}
                    disabled={isExistingFeeSelected}
                    onCheckedChange={(checked) => updateField("slidingScale", checked)}
                  />
                </div>

                {/* Sliding Scale inline section */}
                {draft.slidingScale && (
                  <div className="space-y-3 rounded-md border bg-muted/30 p-3">
                    <TierRows draft={draft} onDraftChange={setDraft} />
                    {errors.tiers ? <p className="text-xs text-destructive">{errors.tiers}</p> : null}

                    {/* Cap constraints */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex flex-1 items-center gap-2">
                        <Checkbox
                          id="not-less-than"
                          checked={draft.notLessThan.enabled}
                          disabled={isExistingFeeSelected}
                          onCheckedChange={(checked) =>
                            updateField("notLessThan", { ...draft.notLessThan, enabled: Boolean(checked) })
                          }
                        />
                        <Label htmlFor="not-less-than" className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                          Not less than
                        </Label>
                        <div className="relative flex-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <Input
                            className="h-9 pl-7 text-sm"
                            value={draft.notLessThan.amount}
                            inputMode="decimal"
                            disabled={!draft.notLessThan.enabled || isExistingFeeSelected}
                            onChange={(e) =>
                              updateField("notLessThan", { ...draft.notLessThan, amount: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <Checkbox
                          id="not-to-exceed"
                          checked={draft.notToExceed.enabled}
                          disabled={isExistingFeeSelected}
                          onCheckedChange={(checked) =>
                            updateField("notToExceed", { ...draft.notToExceed, enabled: Boolean(checked) })
                          }
                        />
                        <Label htmlFor="not-to-exceed" className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                          Not to exceed
                        </Label>
                        <div className="relative flex-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <Input
                            className="h-9 pl-7 text-sm"
                            value={draft.notToExceed.amount}
                            inputMode="decimal"
                            disabled={!draft.notToExceed.enabled || isExistingFeeSelected}
                            onChange={(e) =>
                              updateField("notToExceed", { ...draft.notToExceed, amount: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Contributes to Cap */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="contributes-cap" className="text-sm">Contributes to Cap</Label>
                  <p className="text-xs text-muted-foreground truncate">Count toward cap.</p>
                </div>
                <Switch
                  id="contributes-cap"
                  checked={draft.contributesToCap}
                  disabled={isExistingFeeSelected}
                  onCheckedChange={(checked) => updateField("contributesToCap", checked)}
                />
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="shrink-0 border-t bg-background px-6 py-[14px]">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {isExistingFeeSelected ? "Add Fee" : "Save Fee Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
