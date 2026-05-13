import { Link, useLocation } from "react-router";
import {
  Calculator,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function CDAFlowSwitcher() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && (location.pathname === "/" || location.pathname === "/cda-settings")) return true;
    return location.pathname === path;
  };

  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-muted/50 p-0.5">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/deal-terms">
                  <Button 
                    variant={isActive("/deal-terms") ? "secondary" : "ghost"} 
                    size="icon" 
                    className="size-7 rounded-sm"
                  >
                    <FileText className={isActive("/deal-terms") ? "size-3.5 text-primary" : "size-3.5 text-muted-foreground"} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Deal Terms</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/cda/commission-breakdown">
                  <Button 
                    variant={isActive("/cda/commission-breakdown") ? "secondary" : "ghost"} 
                    size="icon" 
                    className="size-7 rounded-sm"
                  >
                    <Calculator className={isActive("/cda/commission-breakdown") ? "size-3.5 text-primary" : "size-3.5 text-muted-foreground"} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Commission Breakdown</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <Button 
                    variant={isActive("/") ? "secondary" : "ghost"} 
                    size="icon" 
                    className="size-7 rounded-sm"
                  >
                    <Settings className={isActive("/") ? "size-3.5 text-primary" : "size-3.5 text-muted-foreground"} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">CDA Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
    </div>
  );
}
