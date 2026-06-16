import { useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../ui/utils";

export type CalculationLine = {
  label: string;
  amount: number;
  kind: "start" | "subtract" | "add" | "final";
};

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function operatorForKind(kind: CalculationLine["kind"]) {
  if (kind === "start") return { symbol: "▪", className: "text-[11px] text-white/45" };
  if (kind === "subtract") return { symbol: "−", className: "text-red-400" };
  if (kind === "add") return { symbol: "+", className: "text-emerald-400" };
  if (kind === "final") return { symbol: "=", className: "text-white/45" };
  return null;
}

export function CalculationBreakdownTooltip({
  title,
  lines,
  className,
}: {
  title: string;
  lines: CalculationLine[];
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  if (lines.length === 0) return null;

  const firstSubtractIndex = lines.findIndex((line) => line.kind === "subtract");

  return (
    <Tooltip open={hovered || pinned} onOpenChange={(next) => { if (!next) setPinned(false); }}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          aria-label={`${title} calculation breakdown`}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setPinned((prev) => !prev);
          }}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="max-w-[340px] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 p-0 text-xs text-white shadow-xl [&>svg]:fill-neutral-950"
      >
        <div className="px-4 py-3.5">
          <p className="mb-3 text-[13px] font-semibold leading-snug text-white">{title}</p>
          <div className="space-y-2">
            {lines.map((line, index) => {
              const operator = operatorForKind(line.kind);
              const isFinal = line.kind === "final";
              const isStart = line.kind === "start";
              const isFeesSectionStart = index === firstSubtractIndex && firstSubtractIndex > 0;
              return (
                <div
                  key={`${line.label}-${index}`}
                  className={cn(
                    "grid grid-cols-[1rem_1fr_auto] items-baseline gap-x-2.5 gap-y-0 leading-relaxed",
                    isFeesSectionStart && "mt-2 border-t border-white/15 pt-2.5",
                    isFinal && "mt-2 border-t border-white/15 pt-2.5 font-semibold",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center text-sm font-bold leading-none tabular-nums",
                      operator?.className,
                    )}
                    aria-hidden={!operator}
                  >
                    {operator?.symbol ?? ""}
                  </span>
                  <span className={cn("min-w-0 text-[12px] text-white/75", (isStart || isFinal) && "text-white")}>
                    {line.label}
                  </span>
                  <span
                    className={cn(
                      "text-right text-[12px] tabular-nums text-white",
                      isFinal && "text-[13px]",
                    )}
                  >
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}