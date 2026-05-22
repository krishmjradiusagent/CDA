import { Link, useLocation } from "react-router";
import {
  Calculator,
  Settings,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function CDAFlowSwitcher() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/cda-settings" && (location.pathname === "/" || location.pathname === "/cda-settings")) return true;
    return location.pathname === path;
  };

  const navs = [
    { path: "/cda/commission-breakdown", label: "Commission Breakdown", icon: Calculator },
    { path: "/cda-settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
      {navs.map((nav) => {
        const active = isActive(nav.path);
        const Icon = nav.icon;
        return (
          <Link key={nav.path} to={nav.path}>
            <Button 
              variant={active ? "secondary" : "ghost"} 
              size="sm" 
              className={cn(
                "h-7 gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all",
                active ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-3.5", active ? "text-primary" : "text-muted-foreground")} />
              <span>{nav.label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
