import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowLeft, Mail, Maximize2, CheckCircle2, Send } from "lucide-react";
import { CDAFlowSwitcher } from "../components/v4/finance/cda-flow-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

type Template = {
  id: string;
  name: string;
  trigger: string;
  from: string;
  subject: string;
  src: string;
  accent: "indigo" | "green";
  icon: typeof Send;
};

const TEMPLATES: Template[] = [
  {
    id: "sent",
    name: "CDA sent to Managing Broker for signature",
    trigger: "Sent automatically when a CDA is generated & routed to the MB",
    from: "Radius Agent <notifications@radiusagent.com>",
    subject: "Signature requested: CDA for {{deal_address}}",
    src: "/email-templates/cda-sent-to-mb.html",
    accent: "indigo",
    icon: Send,
  },
  {
    id: "signed",
    name: "CDA signed by Managing Broker — notification",
    trigger: "Sent automatically when the MB signs the CDA",
    from: "Radius Agent <notifications@radiusagent.com>",
    subject: "CDA signed by {{mb_name}} for {{deal_address}}",
    src: "/email-templates/cda-signed-by-mb.html",
    accent: "green",
    icon: CheckCircle2,
  },
];

const MERGE_TAGS = [
  "{{mb_name}}",
  "{{agent_name}}",
  "{{team_lead_name}}",
  "{{deal_address}}",
  "{{commission_amount}}",
  "{{coe_date}}",
  "{{cda_link}}",
  "{{auditor_email}}",
  "{{signed_timestamp}}",
  "{{recipient_name}}",
];

export function EmailTemplateBrokerSignature() {
  const [expanded, setExpanded] = useState<Template | null>(null);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/cda-settings">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs text-muted-foreground">
                    CDA · Email Template for Broker Signature
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <CDAFlowSwitcher />
        </div>

        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Mail className="size-6 text-primary" />
              Email Template for Broker Signature
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              These two transactional emails are sent automatically by the CDA workflow. Click any preview to expand it. Merge tags fill with live transaction data at send time.
            </p>
          </div>
          <Card className="w-[320px] shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Available merge tags
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {MERGE_TAGS.map((t) => (
                  <code
                    key={t}
                    className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground/80"
                  >
                    {t}
                  </code>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <Card key={tpl.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex size-8 items-center justify-center rounded-md ${
                          tpl.accent === "green"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base leading-tight">
                          {tpl.name}
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {tpl.trigger}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        tpl.accent === "green"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
                      }
                    >
                      Auto-sent
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-md border bg-background">
                    <div className="border-b bg-muted/40 px-3 py-2 text-xs space-y-1">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-14 shrink-0">From:</span>
                        <span className="font-medium text-foreground/90 truncate">
                          {tpl.from}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-14 shrink-0">Subject:</span>
                        <span className="font-medium text-foreground/90 truncate">
                          {tpl.subject}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpanded(tpl)}
                      className="group relative block w-full text-left"
                      aria-label={`Expand ${tpl.name}`}
                    >
                      <iframe
                        title={tpl.name}
                        src={tpl.src}
                        className="h-[520px] w-full bg-white pointer-events-none"
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
                        <span className="flex items-center gap-1 rounded-md bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="size-3" /> Click to expand
                        </span>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!expanded} onOpenChange={(o) => !o && setExpanded(null)}>
        <DialogContent className="max-w-[760px] p-0 overflow-hidden">
          {expanded && (
            <>
              <DialogHeader className="px-5 py-3 border-b bg-muted/30">
                <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  {expanded.name}
                </DialogTitle>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-14 shrink-0">From:</span>
                    <span className="font-medium">{expanded.from}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-14 shrink-0">Subject:</span>
                    <span className="font-medium">{expanded.subject}</span>
                  </div>
                </div>
              </DialogHeader>
              <iframe
                title={expanded.name}
                src={expanded.src}
                className="h-[70vh] w-full bg-white"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
