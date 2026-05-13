import { cn } from "../../../../lib/utils";
import { ReactNode } from "react";

export interface CDASectionHeaderProps {
  title: string;
  action?: ReactNode;
  status?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function CDASectionHeader({
  title,
  action,
  status,
  sticky = false,
  className,
}: CDASectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 px-4 bg-background border-b",
        sticky && "sticky top-0 z-10",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {status && <div>{status}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
