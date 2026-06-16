import { useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../v4/ui/tooltip";
import { cn } from "../../../lib/utils";

export type CalculationLine = {
  label: string;
  amount: number;
  kind: "start" | "subtract" | "add" | "final";
};

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

type TooltipTone = "default" | "payout";

function operatorForKind(kind: CalculationLine["kind"], tone: TooltipTone) {
  if (kind === "subtract") return { symbol: "−", className: "text-red-400" };
  if (kind === "add") return { symbol: "+", className: "text-emerald-400" };
  if (kind === "final") {
    return {
      symbol: "=",
      className: tone === "payout" ? "text-emerald-400/80" : "text-white/45",
    };
  }
  return null;
}

function OperatorMarker({ kind, tone }: { kind: CalculationLine["kind"]; tone: TooltipTone }) {
  const operator = operatorForKind(kind, tone);

  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center self-center">
      {kind === "start" ? (
        <span className="flex w-2.5 flex-col items-stretch justify-center gap-[2px]" aria-hidden>
          <span className={cn("h-[1.5px] rounded-full", tone === "payout" ? "bg-amber-300/90" : "bg-white/45")} />
          <span className={cn("h-[1.5px] rounded-full", tone === "payout" ? "bg-amber-300/90" : "bg-white/45")} />
        </span>
      ) : operator ? (
        <span className={cn("text-[12px] font-bold leading-none tabular-nums", operator.className)}>
          {operator.symbol}
        </span>
      ) : null}
    </span>
  );
}

export function CalculationBreakdownTooltip({
  title,
  lines,
  className,
  tone = "default",
}: {
  title: string;
  lines: CalculationLine[];
  className?: string;
  tone?: TooltipTone;
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
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
          <Info className="size-3" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="end"
        alignOffset={-8}
        sideOffset={6}
        collisionPadding={16}
        className="max-w-[340px] overflow-hidden rounded-lg border border-neutral-800 !bg-neutral-950 p-0 text-xs !text-white shadow-xl [&>svg]:hidden"
      >
        <div className="px-4 py-3.5">
          <p className="mb-3 text-[13px] font-semibold leading-snug text-white">
            {title}
          </p>
          <div className="space-y-2">
            {lines.map((line, index) => {
              const isFinal = line.kind === "final";
              const isStart = line.kind === "start";
              const isFeesSectionStart = index === firstSubtractIndex && firstSubtractIndex > 0;
              return (
                <div
                  key={`${line.label}-${index}`}
                  className={cn(
                    "grid grid-cols-[16px_1fr_auto] items-center gap-x-2.5",
                    isFeesSectionStart && "mt-2 border-t border-white/15 pt-2.5",
                    isFinal && "mt-2 border-t border-white/15 pt-2.5 font-semibold",
                    tone === "payout" && isStart && "rounded-md bg-amber-400/10 px-1 py-1 -mx-1",
                    tone === "payout" && isFinal && "rounded-b-md bg-emerald-500/15 px-1.5 pb-1 -mx-1",
                  )}
                >
                  <OperatorMarker kind={line.kind} tone={tone} />
                  <span
                    className={cn(
                      "min-w-0 text-[12px] leading-4",
                      isStart && tone === "payout" && "font-medium text-amber-200",
                      isStart && tone !== "payout" && "text-white",
                      isFinal && tone === "payout" && "font-semibold text-emerald-200",
                      isFinal && tone !== "payout" && "text-white",
                      !isStart && !isFinal && "text-white/75",
                    )}
                  >
                    {line.label}
                  </span>
                  <span
                    className={cn(
                      "text-right text-[12px] leading-4 tabular-nums",
                      isStart && tone === "payout" && "font-semibold text-amber-300",
                      isStart && tone !== "payout" && "text-white",
                      isFinal && tone === "payout" && "text-[13px] font-bold text-emerald-400",
                      isFinal && tone !== "payout" && "text-[13px] text-white",
                      !isStart && !isFinal && "text-white",
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