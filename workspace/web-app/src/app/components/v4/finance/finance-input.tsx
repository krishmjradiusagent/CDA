import { forwardRef } from "react";
import { Input } from "../ui/input";
import { cn } from "../../../../lib/utils";
import { DollarSign, Percent, Calculator } from "lucide-react";

export interface FinanceInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: "currency" | "percentage" | "number";
  calculated?: boolean;
  error?: boolean;
}

export const FinanceInput = forwardRef<HTMLInputElement, FinanceInputProps>(
  ({ variant = "number", calculated = false, error = false, className, ...props }, ref) => {
    const isReadOnly = props.readOnly || props.disabled || calculated;

    const getIcon = () => {
      if (calculated) return <Calculator className="size-4 text-muted-foreground" />;
      if (variant === "currency") return <DollarSign className="size-4 text-muted-foreground" />;
      if (variant === "percentage") return <Percent className="size-4 text-muted-foreground" />;
      return null;
    };

    const icon = getIcon();

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn(
            "tabular-nums",
            icon && "pl-9",
            variant === "percentage" && "pr-8",
            calculated && "bg-muted/50 cursor-default",
            error && "border-destructive focus-visible:ring-destructive",
            isReadOnly && "cursor-default",
            className
          )}
          {...props}
        />
        {variant === "percentage" && !icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            %
          </div>
        )}
      </div>
    );
  }
);

FinanceInput.displayName = "FinanceInput";
