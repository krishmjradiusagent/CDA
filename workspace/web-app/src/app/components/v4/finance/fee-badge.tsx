import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../../lib/utils";

const feeBadgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border whitespace-nowrap",
  {
    variants: {
      variant: {
        "pre-split": "bg-blue-50 text-blue-700 border-blue-200",
        "post-split": "bg-purple-50 text-purple-700 border-purple-200",
        flat: "bg-gray-50 text-gray-700 border-gray-200",
        percentage: "bg-amber-50 text-amber-700 border-amber-200",
        agent: "bg-emerald-50 text-emerald-700 border-emerald-200",
        team: "bg-cyan-50 text-cyan-700 border-cyan-200",
        cap: "bg-orange-50 text-orange-700 border-orange-200",
      },
    },
    defaultVariants: {
      variant: "flat",
    },
  }
);

export interface FeeBadgeProps extends VariantProps<typeof feeBadgeVariants> {
  label: string;
  className?: string;
}

export function FeeBadge({ label, variant, className }: FeeBadgeProps) {
  return (
    <span className={cn(feeBadgeVariants({ variant }), className)}>
      {label}
    </span>
  );
}
