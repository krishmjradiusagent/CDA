import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../../lib/utils";
import { formatCurrency } from "./utils";
import { FeeBadge } from "./fee-badge";
import { Input } from "../ui/input";
import { useState } from "react";

const moneyRowVariants = cva(
  "flex items-center justify-between py-2.5 px-3 rounded-md transition-colors",
  {
    variants: {
      variant: {
        neutral: "hover:bg-muted/50",
        positive: "text-emerald-700 hover:bg-emerald-50/50",
        deduction: "text-gray-700 hover:bg-gray-50",
        warning: "text-amber-700 hover:bg-amber-50/50",
        editable: "hover:bg-blue-50/30",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg font-medium",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface MoneyRowProps extends VariantProps<typeof moneyRowVariants> {
  label: string;
  value: number;
  description?: string;
  badges?: Array<{ label: string; variant: any }>;
  editable?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function MoneyRow({
  label,
  value,
  description,
  badges,
  editable = false,
  onChange,
  variant,
  size,
  className,
}: MoneyRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleBlur = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && onChange) {
      onChange(numValue);
    }
    setIsEditing(false);
  };

  return (
    <div className={cn(moneyRowVariants({ variant, size }), className)}>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {badges && badges.length > 0 && (
            <div className="flex items-center gap-1">
              {badges.map((badge, i) => (
                <FeeBadge key={i} label={badge.label} variant={badge.variant} />
              ))}
            </div>
          )}
        </div>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {editable && isEditing ? (
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleBlur()}
            className="h-8 w-32 text-right"
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "font-medium tabular-nums",
              size === "lg" && "text-lg",
              editable && "cursor-pointer hover:text-primary"
            )}
            onClick={() => editable && setIsEditing(true)}
          >
            {formatCurrency(value)}
          </span>
        )}
      </div>
    </div>
  );
}
