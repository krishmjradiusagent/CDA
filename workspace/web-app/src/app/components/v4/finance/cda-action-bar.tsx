import { cn } from "../../../../lib/utils";
import { Button } from "../ui/button";
import { Save, Send, FileCheck, Download, Circle } from "lucide-react";
import { ApprovalStatus } from "./approval-status";

export interface CDAActionBarProps {
  status: "draft" | "awaiting-tl" | "awaiting-agent" | "auditor-review" | "finalized";
  isDirty?: boolean;
  onSaveDraft?: () => void;
  onRequestApproval?: () => void;
  onFinalize?: () => void;
  onExportPDF?: () => void;
  className?: string;
}

export function CDAActionBar({
  status,
  isDirty = false,
  onSaveDraft,
  onRequestApproval,
  onFinalize,
  onExportPDF,
  className,
}: CDAActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-3">
          <ApprovalStatus status={status} />
          {isDirty && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Circle className="size-2 fill-amber-500 text-amber-500" />
              Unsaved changes
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status === "draft" && (
            <>
              <Button variant="outline" size="sm" onClick={onSaveDraft}>
                <Save className="size-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm" onClick={onRequestApproval}>
                <Send className="size-4 mr-2" />
                Request Approval
              </Button>
            </>
          )}

          {status === "awaiting-tl" && (
            <>
              <Button variant="outline" size="sm" onClick={onSaveDraft}>
                <Save className="size-4 mr-2" />
                Save Changes
              </Button>
              <Button size="sm" onClick={onRequestApproval} disabled>
                <Send className="size-4 mr-2" />
                Pending TL Review
              </Button>
            </>
          )}

          {status === "awaiting-agent" && (
            <>
              <Button variant="outline" size="sm" onClick={onSaveDraft}>
                <Save className="size-4 mr-2" />
                Save Changes
              </Button>
              <Button size="sm" onClick={onRequestApproval} disabled>
                <Send className="size-4 mr-2" />
                Pending Agent Review
              </Button>
            </>
          )}

          {status === "auditor-review" && (
            <>
              <Button variant="outline" size="sm" onClick={onExportPDF}>
                <Download className="size-4 mr-2" />
                Export PDF
              </Button>
              <Button size="sm" onClick={onFinalize}>
                <FileCheck className="size-4 mr-2" />
                Finalize CDA
              </Button>
            </>
          )}

          {status === "finalized" && (
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <Download className="size-4 mr-2" />
              Export PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
