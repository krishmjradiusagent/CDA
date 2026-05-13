import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { MoneyRow } from "./money-row";
import { FeeBadge } from "./fee-badge";
import { ApprovalStatus } from "./approval-status";
import { formatPercentage, formatCurrency } from "./utils";
import { Separator } from "../ui/separator";

export interface AgentDeduction {
  id: string;
  label: string;
  value: number;
  badges?: Array<{ label: string; variant: any }>;
  editable?: boolean;
}

export interface AgentBreakdownData {
  agentId: string;
  agentName: string;
  agentInitials: string;
  agentAvatar?: string;
  splitPercentage: number;
  grossAmount: number;
  deductions: AgentDeduction[];
  netAmount: number;
  approvalStatus: "draft" | "awaiting-tl" | "awaiting-agent" | "auditor-review" | "finalized";
}

export interface AgentBreakdownCardProps {
  data: AgentBreakdownData;
  onDeductionChange?: (deductionId: string, value: number) => void;
  className?: string;
}

export function AgentBreakdownCard({
  data,
  onDeductionChange,
  className,
}: AgentBreakdownCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalDeductions = data.deductions.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
            <Avatar className="size-10">
              <AvatarImage src={data.agentAvatar} alt={data.agentName} />
              <AvatarFallback className="text-sm">{data.agentInitials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{data.agentName}</span>
                <ApprovalStatus status={data.approvalStatus} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatPercentage(data.splitPercentage)} split</span>
                <span>•</span>
                <span>{formatCurrency(data.grossAmount)} gross</span>
                {totalDeductions > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatCurrency(totalDeductions)} deductions</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium tabular-nums">
                  {formatCurrency(data.netAmount)}
                </div>
                <div className="text-xs text-muted-foreground">net</div>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-4 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-3">
                Deductions
              </div>
              {data.deductions.length === 0 ? (
                <div className="text-sm text-muted-foreground px-3 py-4 text-center">
                  No deductions
                </div>
              ) : (
                data.deductions.map((deduction) => (
                  <MoneyRow
                    key={deduction.id}
                    label={deduction.label}
                    value={deduction.value}
                    badges={deduction.badges}
                    variant={deduction.editable ? "editable" : "deduction"}
                    size="sm"
                    editable={deduction.editable}
                    onChange={(value) =>
                      onDeductionChange?.(deduction.id, value)
                    }
                  />
                ))
              )}
              <Separator className="my-3" />
              <MoneyRow
                label="Net to Agent"
                value={data.netAmount}
                variant="positive"
                size="md"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
