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
}

const EXTERNAL_PAYEES = [
  { id: "escrow-1", name: "Escrow Partners LLC" },
  { id: "title-1", name: "Title First Inc." },
  { id: "attorney-1", name: "Smith & Associates Law" },
];

function makeDraft(initial?: Partial<FeeTypeDraft>): FeeTypeDraft {
  return {
    id: initial?.id ?? null,
    name: initial?.name ?? "",
    type: initial?.type ?? "flat",
    amount: initial?.amount ?? "",
    percentageBase: initial?.percentageBase ?? "pre-split",
    appliesToMode: initial?.appliesToMode ?? "team",
    coAgentSplitMode: initial?.coAgentSplitMode ?? "split-equally",
    payableToType: initial?.payableToType ?? "radius",
    payableToName: initial?.payableToName ?? "Radius",
    payableToExternalId: initial?.payableToExternalId,
    dealTypes: initial?.dealTypes ?? ["buyer", "seller"],
    agentIds: initial?.agentIds ?? [],
    timing: initial?.timing ?? "pre-split",
    slidingScale: initial?.slidingScale ?? false,
    tiers: initial?.tiers ?? [],
    contributesToCap: initial?.contributesToCap ?? false,
  };
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
}: FeeBuilderModalProps) {
  const [draft, setDraft] = useState<FeeTypeDraft>(() => makeDraft(initialData));

  useEffect(() => {
    if (open) setDraft(makeDraft(initialData));
  }, [open, initialData]);

  function update<K extends keyof FeeTypeDraft>(key: K, value: FeeTypeDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handlePayableToType(value: FeeTypeDraft["payableToType"]) {
    setDraft((prev) => ({
      ...prev,
      payableToType: value,
      payableToName:
        value === "radius" ? "Radius" : value === "team" ? "Keystone Team" : "",
      payableToExternalId: value === "external" ? prev.payableToExternalId : undefined,
    }));
  }

  function handleExternalPayee(id: string) {
    const payee = EXTERNAL_PAYEES.find((p) => p.id === id);
    setDraft((prev) => ({
      ...prev,
      payableToExternalId: id,
      payableToName: payee?.name ?? "",
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
            {existingFeeOptions.length > 0 && (
              <div className="space-y-1.5">
                <Label>Select Fee Type</Label>
                <Select
                  value={draft.id ?? "__new__"}
                  onValueChange={(value) => {
                    if (value === "__new__") {
                      setDraft(makeDraft(initialData));
                    } else {
                      const fee = existingFeeOptions.find((f) => f.id === value);
                      if (fee) setDraft(makeDraft(fee));
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
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
                className="h-10 w-full"
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
                  <SelectTrigger className="h-10 w-full">
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
                    className={`h-10 w-full ${draft.type === "flat" ? "pl-7" : "pr-8"}`}
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
                  <SelectTrigger className="h-10 w-full">
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
                    <SelectTrigger className="h-10 w-full">
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
                  <SelectTrigger className="h-10 w-full">
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
                  <SelectTrigger className="h-10 w-full">
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
                  <SelectTrigger className="h-10 w-full">
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
                <Label>
                  {draft.payableToType === "external" ? "External Payee" : "Payable Name"}
                </Label>
                {draft.payableToType === "external" ? (
                  <Select
                    value={draft.payableToExternalId ?? ""}
                    onValueChange={handleExternalPayee}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select external payee" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXTERNAL_PAYEES.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-10 w-full items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
                    {draft.payableToName ?? ""}
                  </div>
                )}
              </div>
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
