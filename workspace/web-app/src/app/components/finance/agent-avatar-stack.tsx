import { Edit3, MoreVertical, UserMinus, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../ui/utils";

export interface AgentAvatar {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface AgentAvatarStackProps {
  agents: AgentAvatar[];
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onEditDefaults?: () => void;
  onUnassignDefaults?: () => void;
  onViewAssociations?: () => void;
}

export function AgentAvatarStack({
  agents,
  max = 3,
  className,
  size = "sm",
  emptyActionLabel,
  onEmptyAction,
  onEditDefaults,
  onUnassignDefaults,
  onViewAssociations,
}: AgentAvatarStackProps) {
  const displayAgents = agents.slice(0, max);
  const remaining = Math.max(0, agents.length - displayAgents.length);
  const interactive = Boolean(onEditDefaults || onUnassignDefaults || onViewAssociations);

  const sizeClasses = {
    sm: "size-7 text-[10px]",
    md: "size-8 text-xs",
    lg: "size-10 text-sm"
  };

  if (agents.length === 0 && onEmptyAction) {
    return (
      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onEmptyAction}>
        {emptyActionLabel ?? "Assign"}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center -space-x-2.5", className)}>
      {displayAgents.map((agent, i) => (
        <div key={agent.id ?? i} className="relative">
          <Avatar
            className={cn(
              sizeClasses[size],
              "shrink-0 border-2 border-background ring-1 ring-black/5",
            )}
          >
            {agent.avatarUrl && <AvatarImage src={agent.avatarUrl} alt={agent.name} className="object-cover" />}
            <AvatarFallback className="font-semibold bg-muted text-muted-foreground">
              {agent.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      ))}
      {remaining > 0 && (
        <div 
          className={cn(
            sizeClasses[size],
            "flex items-center justify-center rounded-full bg-muted border-2 border-background ring-1 ring-black/5 text-muted-foreground font-bold shrink-0"
          )}
        >
          +{remaining}
        </div>
      )}
      {interactive && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                sizeClasses[size],
                "ml-1.5",
                "rounded-full bg-background/95 text-muted-foreground shadow-sm ring-1 ring-border",
              )}
              aria-label="Agent defaults menu"
            >
              <MoreVertical className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="w-44 p-1">
            {onViewAssociations && (
              <DropdownMenuItem
                className="flex items-center gap-2 rounded-md"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewAssociations();
                }}
                aria-label="View associations"
              >
                <Eye className="size-4" />
                <span>View Associations</span>
              </DropdownMenuItem>
            )}
            {onEditDefaults && (
              <DropdownMenuItem
                className="flex items-center gap-2 rounded-md"
                onClick={(event) => {
                  event.stopPropagation();
                  onEditDefaults();
                }}
                aria-label="Edit defaults"
              >
                <Edit3 className="size-4" />
                <span>Edit defaults</span>
              </DropdownMenuItem>
            )}
            {onUnassignDefaults && (
              <DropdownMenuItem
                className="flex items-center gap-2 rounded-md text-destructive focus:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onUnassignDefaults();
                }}
                aria-label="Unassign all"
              >
                <UserMinus className="size-4 text-destructive" />
                <span>Unassign all</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
