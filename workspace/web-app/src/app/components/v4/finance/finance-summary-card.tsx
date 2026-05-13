import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { MoneyRow } from "./money-row";
import { cn } from "../../../../lib/utils";

export interface FinanceSummaryData {
  grossCommission: number;
  preSplitDeductions: Array<{ label: string; value: number }>;
  agentSplit: number;
  postSplitDeductions: Array<{ label: string; value: number }>;
  netCommission: number;
}

export interface FinanceSummaryCardProps {
  data: FinanceSummaryData;
  className?: string;
}

export function FinanceSummaryCard({
  data,
  className,
}: FinanceSummaryCardProps) {
  const totalPreSplit = data.preSplitDeductions.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const totalPostSplit = data.postSplitDeductions.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Commission Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <MoneyRow
          label="Gross Commission"
          value={data.grossCommission}
          size="md"
          variant="neutral"
        />

        {data.preSplitDeductions.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="pl-3 space-y-1">
              {data.preSplitDeductions.map((deduction, i) => (
                <MoneyRow
                  key={i}
                  label={deduction.label}
                  value={-deduction.value}
                  variant="deduction"
                  size="sm"
                />
              ))}
            </div>
          </>
        )}

        <Separator className="my-2" />
        <MoneyRow
          label="Agent Split"
          value={data.agentSplit}
          variant="positive"
          size="md"
        />

        {data.postSplitDeductions.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="pl-3 space-y-1">
              {data.postSplitDeductions.map((deduction, i) => (
                <MoneyRow
                  key={i}
                  label={deduction.label}
                  value={-deduction.value}
                  variant="deduction"
                  size="sm"
                />
              ))}
            </div>
          </>
        )}

        <Separator className="my-3" />
        <div className="pt-1">
          <MoneyRow
            label="Net Commission"
            value={data.netCommission}
            variant="positive"
            size="lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}
