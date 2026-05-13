import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { cn } from "../../../../lib/utils";
import { formatCurrency } from "./utils";
import { ApprovalStatus } from "./approval-status";
import { Download, Send } from "lucide-react";

export interface FinanceSideSummaryData {
  grossCommission: number;
  totalDeductions: number;
  companyDollar: number;
  netCommission: number;
  status: "draft" | "awaiting-tl" | "awaiting-agent" | "auditor-review" | "finalized";
}

export interface FinanceSideSummaryProps {
  data: FinanceSideSummaryData;
  onExport?: () => void;
  onRequestApproval?: () => void;
  sticky?: boolean;
  className?: string;
}

export function FinanceSideSummary({
  data,
  onExport,
  onRequestApproval,
  sticky = true,
  className,
}: FinanceSideSummaryProps) {
  return (
    <div
      className={cn(
        "w-80",
        sticky && "sticky top-4 self-start",
        className
      )}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gross Commission</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(data.grossCommission)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="font-medium tabular-nums text-destructive">
                -{formatCurrency(data.totalDeductions)}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Company Dollar</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(data.companyDollar)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Net Commission</span>
              <span className="text-lg font-medium tabular-nums text-emerald-700">
                {formatCurrency(data.netCommission)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <ApprovalStatus status={data.status} />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {data.status === "draft" && onRequestApproval && (
              <Button className="w-full" size="sm" onClick={onRequestApproval}>
                <Send className="size-4 mr-2" />
                Request Approval
              </Button>
            )}

            {onExport && (
              <Button variant="outline" className="w-full" size="sm" onClick={onExport}>
                <Download className="size-4 mr-2" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
