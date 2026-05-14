import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
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

export type FeeTier = {
  id: string;
  from: string;
  to: string;
  fee: string;
};

export type PercentageBase = "property-value" | "pre-split" | "post-split";

export interface FeeTypeDraft {
  id: string | null;
  name: string;
  type: "flat" | "percentage";
  amount: string;
  percentageBase: PercentageBase;
  appliesToMode: "team" | "agent" | "both";
  agentIds: string[];
  timing: "pre-split" | "post-split";
  slidingScale: boolean;
  tiers: FeeTier[];
  contributesToCap: boolean;
  visibleOnCda: boolean;
  notLessThan: { enabled: boolean; amount: string };
  notToExceed: { enabled: boolean; amount: string };
}

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
}

function createDraft(initialData?: Partial<FeeTypeDraft>): FeeTypeDraft {
  return {
    id: initialData?.id ?? null,
    name: initialData?.name ?? "",
    type: initialData?.type ?? "flat",
    amount: initialData?.amount ?? "",
    percentageBase: initialData?.percentageBase ?? "pre-split",
    appliesToMode: initialData?.appliesToMode ?? "team",
    agentIds: initialData?.agentIds ?? [],
    timing: initialData?.timing ?? "pre-split",
    slidingScale: initialData?.slidingScale ?? false,
    tiers: initialData?.tiers ?? [],
    contributesToCap: initialData?.contributesToCap ?? false,
    visibleOnCda: initialData?.visibleOnCda ?? true,
    notLessThan: initialData?.notLessThan ?? { enabled: false, amount: "0.00" },
    notToExceed: initialData?.notToExceed ?? { enabled: false, amount: "0.00" },
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

export function FeeBuilderModal({
  open,
  title,
  onOpenChange,
  initialData,
  onSave,
  hideTimingField,
  hidePostSplitBase,
}: FeeBuilderModalProps) {
  const [draft, setDraft] = useState<FeeTypeDraft>(() => createDraft(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(createDraft(initialData));
    setErrors({});
    setSaving(false);
  }, [initialData, open]);

  function updateField<K extends keyof FeeTypeDraft>(field: K, value: FeeTypeDraft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "Fee name required";
    if (!draft.slidingScale && numericValue(draft.amount) <= 0) nextErrors.amount = "Amount required";
    if (draft.slidingScale && draft.tiers.length === 0) nextErrors.tiers = "Add at least one tier";
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

            {/* Fee Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fee-name">Fee Name</Label>
              <Input
                id="fee-name"
                className="h-10"
                placeholder="e.g., Transaction Coordinator Fee"
                value={draft.name}
                aria-invalid={Boolean(errors.name)}
                onChange={(event) => updateField("name", event.target.value)}
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>

            {/* Fee Type + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fee Type</Label>
                <Select value={draft.type} onValueChange={(value) => updateField("type", value as FeeTypeDraft["type"])}>
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
                  disabled={draft.slidingScale}
                  onChange={(value) => updateField("amount", value)}
                />
                {errors.amount ? <p className="text-xs text-destructive">{errors.amount}</p> : null}
              </div>
            </div>

            {/* Percentage Based On — only for % type */}
            {draft.type === "percentage" && (
              <div className="space-y-1.5">
                <Label>Percentage Based On</Label>
                <Select value={draft.percentageBase} onValueChange={(value) => updateField("percentageBase", value as PercentageBase)}>
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

            {/* When Applied — hidden when timing is pre-selected from context */}
            {!hideTimingField && (
            <div className="space-y-1.5">
              <Label>When Applied</Label>
              <Select value={draft.timing} onValueChange={(value) => updateField("timing", value as FeeTypeDraft["timing"])}>
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

            {/* Fee Payer */}
            <div className="space-y-1.5">
              <Label>Fee Payer</Label>
              <Select value={draft.appliesToMode} onValueChange={(value) => updateField("appliesToMode", value as FeeTypeDraft["appliesToMode"])}>
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

            {/* Sliding Scale — full row */}
            <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
              <div className="space-y-0.5">
                <Label htmlFor="sliding-scale" className="text-sm">Sliding Scale</Label>
                <p className="text-xs text-muted-foreground">Enable tiered fee values.</p>
              </div>
              <Switch
                id="sliding-scale"
                checked={draft.slidingScale}
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
                        disabled={!draft.notLessThan.enabled}
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
                        disabled={!draft.notToExceed.enabled}
                        onChange={(e) =>
                          updateField("notToExceed", { ...draft.notToExceed, amount: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contributes to Cap + Visible on CDA — same row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="contributes-cap" className="text-sm">Contributes to Cap</Label>
                  <p className="text-xs text-muted-foreground truncate">Count toward cap.</p>
                </div>
                <Switch
                  id="contributes-cap"
                  checked={draft.contributesToCap}
                  onCheckedChange={(checked) => updateField("contributesToCap", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="visible-cda" className="text-sm">Visible on CDA</Label>
                  <p className="text-xs text-muted-foreground truncate">Show on document.</p>
                </div>
                <Switch
                  id="visible-cda"
                  checked={draft.visibleOnCda}
                  onCheckedChange={(checked) => updateField("visibleOnCda", checked)}
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
            Save Fee Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
