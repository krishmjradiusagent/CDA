import { Link, useLocation } from "react-router";
import {
  Calculator,
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
    <div className="fixed top-20 right-4 z-50">
      <Card className="shadow-xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-2 flex items-center gap-1">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/cda/commission-breakdown">
                  <Button 
                    variant={isActive("/cda/commission-breakdown") ? "secondary" : "ghost"} 
                    size="icon" 
                    className="size-9 rounded-md"
                  >
                    <Calculator className={isActive("/cda/commission-breakdown") ? "size-4.5 text-primary" : "size-4.5 text-muted-foreground"} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">Commission Breakdown</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-4 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <Button 
                    variant={isActive("/") ? "secondary" : "ghost"} 
                    size="icon" 
                    className="size-9 rounded-md"
                  >
                    <Settings className={isActive("/") ? "size-4.5 text-primary" : "size-4.5 text-muted-foreground"} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">CDA Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
