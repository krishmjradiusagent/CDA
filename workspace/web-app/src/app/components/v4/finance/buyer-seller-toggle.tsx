import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "../../../../lib/utils";

export type TransactionSide = "buyer" | "seller";

export interface BuyerSellerToggleProps {
  value: TransactionSide;
  onChange: (value: TransactionSide) => void;
  className?: string;
}

export function BuyerSellerToggle({
  value,
  onChange,
  className,
}: BuyerSellerToggleProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as TransactionSide)}
      className={cn(
        "inline-flex items-center bg-muted rounded-lg p-1 gap-1",
        className
      )}
    >
      <ToggleGroup.Item
        value="buyer"
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
          "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
          "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
        )}
      >
        Buyer
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="seller"
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
          "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
          "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
        )}
      >
        Seller
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
