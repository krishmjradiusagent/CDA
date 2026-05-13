import { cn } from "../../../../lib/utils";
import { formatPercentage } from "./utils";

export interface SplitAllocation {
  agentName: string;
  percentage: number;
  color?: string;
}

const defaultColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
];

export interface SplitAllocationBarProps {
  allocations: SplitAllocation[];
  className?: string;
}

export function SplitAllocationBar({
  allocations,
  className,
}: SplitAllocationBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted">
        {allocations.map((allocation, index) => (
          <div
            key={index}
            className={cn(
              allocation.color || defaultColors[index % defaultColors.length]
            )}
            style={{ width: `${allocation.percentage}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {allocations.map((allocation, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                "size-3 rounded-sm",
                allocation.color || defaultColors[index % defaultColors.length]
              )}
            />
            <span className="text-muted-foreground">{allocation.agentName}</span>
            <span className="font-medium tabular-nums">
              {formatPercentage(allocation.percentage)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
