import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../../lib/utils";
import { Circle, CheckCircle2, Clock, Eye, FileCheck } from "lucide-react";

const statusVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full",
  {
    variants: {
      status: {
        draft: "bg-gray-100 text-gray-700",
        "awaiting-tl": "bg-amber-100 text-amber-700",
        "awaiting-agent": "bg-blue-100 text-blue-700",
        "auditor-review": "bg-purple-100 text-purple-700",
        finalized: "bg-emerald-100 text-emerald-700",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
);

const statusConfig = {
  draft: { label: "Draft", icon: Circle },
  "awaiting-tl": { label: "Awaiting TL", icon: Clock },
  "awaiting-agent": { label: "Awaiting Agent", icon: Clock },
  "auditor-review": { label: "Auditor Review", icon: Eye },
  finalized: { label: "Finalized", icon: CheckCircle2 },
};

export interface ApprovalStatusProps
  extends VariantProps<typeof statusVariants> {
  status: keyof typeof statusConfig;
  className?: string;
}

export function ApprovalStatus({ status, className }: ApprovalStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(statusVariants({ status }), className)}>
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
