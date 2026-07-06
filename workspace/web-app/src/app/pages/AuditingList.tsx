import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Separator } from "../components/ui/separator";
import { CDAFlowSwitcher } from "../components/v4/finance/cda-flow-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/ui/breadcrumb";

export function AuditingList() {
  const navigate = useNavigate();

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "auditing-row-click" && typeof e.data.dest === "string") {
        navigate(e.data.dest);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-[1440px] mx-auto flex flex-col">
        <div className="flex items-center justify-between border-b bg-background px-6 py-2.5">
          <div className="flex items-center gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs">Auditing Queue</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator orientation="vertical" className="!h-4" />
            <CDAFlowSwitcher />
          </div>
        </div>
        <iframe
          src="/auditing-queue.html"
          title="Auditing Queue"
          className="h-[calc(100vh-49px)] w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
