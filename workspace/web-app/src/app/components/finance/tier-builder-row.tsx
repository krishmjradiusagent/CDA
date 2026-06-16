import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { cn } from "../ui/utils";
import { FinanceInput } from "./finance-input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getCdaTypeLabel } from "../../lib/cda-types";

export interface TierData {
  id: string;
  rangeStart: number;
  rangeEnd: number | null;
  splitPercentage: number;
  resetPeriod: "annual" | "never" | "per-deal";
  dealType: "all" | "buyer" | "seller";
}

export interface TierBuilderRowProps {
  data: TierData;
  onChange?: (data: TierData) => void;
  onDelete?: () => void;
  isDragging?: boolean;
  className?: string;
}

export function TierBuilderRow({
  data,
  onChange,
  onDelete,
  isDragging = false,
  className,
}: TierBuilderRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateField = <K extends keyof TierData>(field: K, value: TierData[K]) => {
    onChange?.({ ...data, [field]: value });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "border rounded-lg bg-card transition-colors",
          isDragging && "opacity-50",
          className
        )}
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
            <GripVertical className="size-4 text-muted-foreground flex-shrink-0 cursor-grab" />

            <div className="flex-1 grid grid-cols-4 gap-4 text-left text-sm">
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Range</div>
                <div className="font-medium tabular-nums">
                  ${data.rangeStart.toLocaleString()} - {data.rangeEnd ? `$${data.rangeEnd.toLocaleString()}` : "∞"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Split</div>
                <div className="font-medium tabular-nums">{data.splitPercentage}%</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Reset</div>
                <div className="font-medium capitalize">{data.resetPeriod}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Deal Type</div>
                <div className="font-medium">{data.dealType === "all" ? "All" : getCdaTypeLabel(data.dealType)}</div>
              </div>
            </div>

            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform flex-shrink-0",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-4 space-y-4 bg-muted/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Range Start
                </label>
                <FinanceInput
                  variant="currency"
                  value={data.rangeStart}
                  onChange={(e) => updateField("rangeStart", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Range End
                </label>
                <FinanceInput
                  variant="currency"
                  value={data.rangeEnd ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField("rangeEnd", val === "" ? null : parseFloat(val) || null);
                  }}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Split Percentage
                </label>
                <FinanceInput
                  variant="percentage"
                  value={data.splitPercentage}
                  onChange={(e) => updateField("splitPercentage", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Reset Period
                </label>
                <Select
                  value={data.resetPeriod}
                  onValueChange={(v) => updateField("resetPeriod", v as TierData["resetPeriod"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="per-deal">Per Deal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Deal Type
                </label>
                <Select
                  value={data.dealType}
                  onValueChange={(v) => updateField("dealType", v as TierData["dealType"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="buyer">Purchase</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-2" />
                Remove Tier
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
