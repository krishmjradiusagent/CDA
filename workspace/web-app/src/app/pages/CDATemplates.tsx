import { useState } from "react";
import { Link } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  FileText,
  Building2,
  User,
  Users,
  Shield,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import { CDAFlowSwitcher } from "../components/v4/finance/cda-flow-switcher";
import { BrokerSignature } from "../components/BrokerSignature";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/ui/breadcrumb";

export function CDATemplates() {
  const [copied, setCopied] = useState(false);
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialTab = params.get("tab") || "tab1";
  const embed = params.get("embed") === "1";
  const [demoState, setDemoState] = useState(params.get("demo_state") || "CA");
  const [demoTeam, setDemoTeam] = useState(params.get("demo_team") || "");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("CDA templates link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={embed ? "bg-muted/20" : "min-h-screen bg-muted/40"}>
      <div className={embed ? "flex flex-col" : "max-w-[1440px] mx-auto flex flex-col"}>
        {!embed && (
          <>
            {/* Breadcrumb + Switcher Bar */}
            <div className="flex items-center justify-between border-b bg-background px-6 py-2.5">
              <div className="flex items-center gap-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs">CDA Document Templates</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <Separator orientation="vertical" className="!h-4" />
                <CDAFlowSwitcher />
              </div>
            </div>

            {/* Page Title Bar */}
            <div className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Button variant="ghost" size="icon" asChild className="size-8 text-muted-foreground hover:text-foreground">
                  <Link to="/">
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <h1 className="min-w-0 truncate text-sm font-semibold">CDA Document Templates</h1>
                <Separator orientation="vertical" className="h-4 shrink-0" />
                <Badge variant="secondary" className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium border bg-muted/30">
                  <FileText className="size-3 text-muted-foreground" />
                  <span>5 Layout Options</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2 py-1 text-[11px]">
                  <span className="text-muted-foreground">Broker demo:</span>
                  <select
                    value={demoState}
                    onChange={(e) => {
                      setDemoState(e.target.value);
                      if (e.target.value !== "GA") setDemoTeam("");
                    }}
                    className="bg-transparent font-medium text-foreground outline-none cursor-pointer"
                  >
                    <option value="CA">CA → Roger</option>
                    <option value="TX">TX → Kathy</option>
                    <option value="FL">FL → Kathy</option>
                    <option value="WA">WA → Kathy</option>
                    <option value="CO">CO → Kathy</option>
                    <option value="AZ">AZ → Kathy</option>
                    <option value="GA">GA → …</option>
                    <option value="NY">NY → Kevin</option>
                  </select>
                  {demoState === "GA" && (
                    <select
                      value={demoTeam}
                      onChange={(e) => setDemoTeam(e.target.value)}
                      className="bg-transparent font-medium text-foreground outline-none cursor-pointer border-l pl-1.5"
                    >
                      <option value="">Standard → Kathy</option>
                      <option value="indigo-road">Indigo Road → Rhonda</option>
                    </select>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1.5 rounded-lg px-3 text-xs">
                  <Printer className="size-3.5" />
                  Print / Save PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-8 gap-1.5 rounded-lg px-3 text-xs">
                  <Copy className="size-3.5" />
                  {copied ? "Copied" : "Copy Link"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className={embed ? "p-6 max-w-[1024px] mx-auto w-full" : "flex-1 p-6 max-w-[1024px] mx-auto w-full"}>
          <Tabs defaultValue={initialTab} className="w-full space-y-6">
            <div className={embed ? "hidden" : "flex justify-center border-b pb-4"}>
              <TabsList className="bg-background border p-1 rounded-lg flex flex-wrap gap-1 w-full justify-between">
                <TabsTrigger value="tab1" className="text-xs flex-1 py-2">Full Transparency</TabsTrigger>
                <TabsTrigger value="tab2" className="text-xs flex-1 py-2">Radius Split Hidden (Partner)</TabsTrigger>
                <TabsTrigger value="tab3" className="text-xs flex-1 py-2">Radius Split Hidden (Associate)</TabsTrigger>
                <TabsTrigger value="tab4" className="text-xs flex-1 py-2">Team Split Hidden (Partner)</TabsTrigger>
                <TabsTrigger value="tab5" className="text-xs flex-1 py-2">Gross CDA</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Full Transparency */}
            <TabsContent value="tab1" className="space-y-6 animate-in fade-in-50 duration-200">
              <Card className="shadow-lg border-border relative overflow-hidden bg-white dark:bg-card p-12 max-w-[768px] mx-auto">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-teal-400" />
                <div className="flex justify-between items-start mb-8">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground border">RA</div>
                  <div className="text-right">
                    <h2 className="text-lg font-semibold tracking-tight">Disbursement Authorization</h2>
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground mb-6">Please disburse funds as follows:</p>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-5 rounded-lg border text-sm mb-8">
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Property Address</div>
                    <div className="font-medium text-foreground">1801 E Katella, Apt 2133, Anaheim, California, 92805</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Representation</div>
                    <div className="font-medium text-foreground">Seller</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Agent</div>
                    <div className="font-medium text-foreground">Nauz Magdaleno</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Company</div>
                    <div className="font-medium text-foreground">Nextdoor Escrow - Alicia Smith</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Agent Email</div>
                    <div className="font-medium text-foreground">alicia@nextdoorescrow.com</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Sale Price</div>
                    <div className="font-medium text-foreground">$660,000</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gross Commission</div>
                    <div className="font-bold text-teal-600 text-base">$9,900</div>
                  </div>
                </div>

                {/* Ledger */}
                <div className="space-y-4 mb-8">
                  <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Radius Agent</span>
                      <span className="font-semibold text-sm text-teal-600">$349.00</span>
                    </div>
                    <div className="bg-background border rounded p-3 text-xs space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span className="font-semibold text-foreground">Wire To:</span><span>Agentdesks Incorporated</span></div>
                      <div className="flex justify-between"><span>Bank:</span><span>Chase Bank</span></div>
                      <div className="flex justify-between"><span>Account Number:</span><span>932588178</span></div>
                      <div className="flex justify-between"><span>Routing Number:</span><span>021000021</span></div>
                      <div className="text-[10px] italic pt-1 border-t mt-1">PLEASE INCLUDE THE PROPERTY ADDRESS IN THE MEMO. We do not accept paper checks. To confirm wiring instructions, please call 415-649-0122</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Move Sales Inc (Upnest)</span>
                      <span className="font-semibold text-sm text-teal-600">$2,970.00</span>
                    </div>
                    <div className="bg-background border rounded p-3 text-xs space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span className="font-semibold text-foreground">Wire To:</span><span>Bank of America Merrill Lynch</span></div>
                      <div className="flex justify-between"><span>Account:</span><span>1291968437</span></div>
                      <div className="flex justify-between"><span>Routing:</span><span>026009593</span></div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-sm block">Listwizer Inc.</span>
                        <span className="text-xs text-muted-foreground">(on behalf of Nauz Magdaleno)</span>
                      </div>
                      <span className="font-semibold text-sm text-teal-600">$6,581.00</span>
                    </div>
                    <div className="bg-background border rounded p-3 text-xs space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span className="font-semibold text-foreground">Wire To:</span><span>Listwizer Inc., Morgan Chase</span></div>
                      <div className="flex justify-between"><span>Account:</span><span>669958137</span></div>
                      <div className="flex justify-between"><span>Routing:</span><span>021000021</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t max-w-[320px] ml-auto">
                  <BrokerSignature state={demoState} team={demoTeam} />
                </div>

                <Separator className="my-8" />
                <div className="text-[10px] text-center text-muted-foreground">
                  1160 Battery St East Suite 100, Spaces Levis Plaza, San Francisco CA 94111 · broker@radiusagent.com
                </div>
              </Card>
            </TabsContent>

            {/* Tab 2: Radius Split Hidden (Partner) */}
            <TabsContent value="tab2" className="space-y-6 animate-in fade-in-50 duration-200">
              <Card className="shadow-lg border-border relative overflow-hidden bg-white dark:bg-card p-12 max-w-[768px] mx-auto">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-teal-400" />
                <div className="flex justify-between items-start mb-8">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground border">RA</div>
                  <div className="text-right">
                    <h2 className="text-lg font-semibold tracking-tight">Disbursement Authorization</h2>
                    <Badge variant="outline" className="mt-1 border-teal-500/30 text-teal-600 bg-teal-500/5">Partner</Badge>
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground mb-6">Radius will disburse as follows:</p>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-5 rounded-lg border text-sm mb-8">
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Property Address</div>
                    <div className="font-medium text-foreground">1657 Hibiscus Court, Beaumont, California, 92223</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Representation</div>
                    <div className="font-medium text-foreground">Buyer</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Agent</div>
                    <div className="font-medium text-foreground">Alex Gallardo</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Company</div>
                    <div className="font-medium text-foreground">Stewart Title of California, Inc.</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Agent Email</div>
                    <div className="font-medium text-foreground">mgrub@stewart.com</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Sale Price</div>
                    <div className="font-medium text-foreground">$375,000.00</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gross Commission</div>
                    <div className="font-bold text-teal-600 text-base">$7,500.00</div>
                  </div>
                </div>

                {/* Ledger */}
                <div className="border rounded-lg overflow-hidden mb-8 text-sm">
                  <div className="grid grid-cols-[1fr_auto] border-b p-4 bg-muted/10">
                    <div>
                      <div className="font-semibold">Vida Real Estate</div>
                      <div className="text-xs text-muted-foreground">7% Split · + $226 Transaction Fee</div>
                      <div className="text-[11px] italic text-muted-foreground/80 mt-1">Please note the amount received will be less any wire fees from escrow.</div>
                    </div>
                    <div className="font-semibold text-teal-600 text-right">$751.00</div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] border-b p-4">
                    <div>
                      <div className="font-semibold">Alex Gallardo</div>
                      <div className="text-xs text-muted-foreground">90% Split · - $226 Transaction Fee · - $124 RERM</div>
                      <div className="text-[11px] italic text-muted-foreground/80 mt-0.5">Paid directly by escrow</div>
                    </div>
                    <div className="font-semibold text-teal-600 text-right">$6,400.00</div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] border-b p-4 bg-muted/5">
                    <div>
                      <div className="font-semibold">RERM</div>
                      <div className="text-xs text-muted-foreground">Paid directly by escrow</div>
                    </div>
                    <div className="font-semibold text-teal-600 text-right">$124.00</div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] p-4">
                    <div>
                      <div className="font-semibold">Radius Agent</div>
                      <div className="text-xs text-muted-foreground">3% Split</div>
                    </div>
                    <div className="font-semibold text-teal-600 text-right">$225.00</div>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t max-w-[320px] ml-auto">
                  <BrokerSignature state={demoState} team={demoTeam} />
                </div>

                <Separator className="my-8" />
                <div className="text-[10px] text-center text-muted-foreground">
                  1160 Battery St East Suite 100, Spaces Levis Plaza, San Francisco CA 94111 · broker@radiusagent.com
                </div>
              </Card>
            </TabsContent>

            {/* Tab 3: Radius Split Hidden (Associate) */}
            <TabsContent value="tab3" className="space-y-6 animate-in fade-in-50 duration-200">
              <Card className="shadow-lg border-border relative overflow-hidden bg-white dark:bg-card p-12 max-w-[768px] mx-auto">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-teal-400" />
                <div className="flex justify-between items-start mb-8">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground border">RA</div>
                  <div className="text-right">
                    <h2 className="text-lg font-semibold tracking-tight">Disbursement Authorization</h2>
                    <Badge variant="outline" className="mt-1 border-slate-400/30 text-slate-600 bg-slate-500/5">Associate</Badge>
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground mb-6">Escrow to disburse funds as follows:</p>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-5 rounded-lg border text-sm mb-8">
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Property Address</div>
                    <div className="font-medium text-foreground">1657 Hibiscus Court, Beaumont, California, 92223</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Representation</div>
                    <div className="font-medium text-foreground">Buyer</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Agent</div>
                    <div className="font-medium text-foreground">Alex Gallardo</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Company</div>
                    <div className="font-medium text-foreground">Stewart Title of California, Inc.</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Agent Email</div>
                    <div className="font-medium text-foreground">mgrub@stewart.com</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Sale Price</div>
                    <div className="font-medium text-foreground">$375,000.00</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gross Commission</div>
                    <div className="font-bold text-teal-600 text-base">$7,500.00</div>
                  </div>
                </div>

                {/* Ledger */}
                <div className="space-y-4 mb-8">
                  <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Vida Real Estate</span>
                      <span className="font-semibold text-sm text-teal-600">$976.00</span>
                    </div>
                    <div className="bg-background border rounded p-3 text-xs space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span className="font-semibold text-foreground">Wire To:</span><span>Vida Real Estate</span></div>
                      <div className="flex justify-between"><span>Bank:</span><span>Chase Bank</span></div>
                      <div className="flex justify-between"><span>Account Number:</span><span>932588178</span></div>
                      <div className="flex justify-between"><span>Routing Number:</span><span>021000021</span></div>
                      <div className="text-[10px] italic pt-1 border-t mt-1">PLEASE INCLUDE THE PROPERTY ADDRESS IN THE MEMO. We do not accept paper checks. To confirm wiring instructions, please call 415-649-0122. Wiring Fee Approved.</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">RERM</span>
                      <span className="font-semibold text-sm text-teal-600">$124.00</span>
                    </div>
                    <div className="bg-background border rounded p-3 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span className="font-semibold text-foreground">Mail Check To:</span><span>PO Box 1137, Rancho Murrieta, CA 95683-1137</span></div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Alex Gallardo</span>
                      <span className="font-semibold text-sm text-teal-600">$6,400.00</span>
                    </div>
                    <div className="bg-background border rounded p-3 text-xs text-muted-foreground italic">
                      Agent to provide payment instructions to escrow to be paid directly at closing.
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t max-w-[320px] ml-auto">
                  <BrokerSignature state={demoState} team={demoTeam} />
                </div>

                <Separator className="my-8" />
                <div className="text-[10px] text-center text-muted-foreground">
                  1160 Battery St East Suite 100, Spaces Levis Plaza, San Francisco CA 94111 · broker@radiusagent.com
                </div>
              </Card>
            </TabsContent>

            {/* Tab 4: Team Split Hidden (Partner) */}
            <TabsContent value="tab4" className="space-y-6 animate-in fade-in-50 duration-200">
              <Card className="shadow-lg border-border relative overflow-hidden bg-white dark:bg-card p-12 max-w-[768px] mx-auto">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 to-teal-400" />
                <div className="flex justify-between items-start mb-8">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground border">RA</div>
                  <div className="text-right">
                    <h2 className="text-lg font-semibold tracking-tight">Disbursement Authorization</h2>
                    <Badge variant="outline" className="mt-1 border-teal-500/30 text-teal-600 bg-teal-500/5">Partner</Badge>
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground mb-6">Radius will disburse as follows:</p>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-5 rounded-lg border text-sm mb-8">
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Property Address</div>
                    <div className="font-medium text-foreground">3860 N Riley Ln, Los Angeles, California, 90065</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Representation</div>
                    <div className="font-medium text-foreground">Buyer</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Agent</div>
                    <div className="font-medium text-foreground">Gabriel Mejorado</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Company</div>
                    <div className="font-medium text-foreground">Chicago Title - Erika Marano</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Agent Email</div>
                    <div className="font-medium text-foreground">EMarano@fnf.com</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Sale Price</div>
                    <div className="font-medium text-foreground">$1,199,000</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gross Commission</div>
                    <div className="font-bold text-teal-600 text-base">$23,609.80</div>
                  </div>
                </div>

                {/* Ledger */}
                <div className="border rounded-lg overflow-hidden mb-8 text-sm">
                  <div className="grid grid-cols-[1fr_auto] border-b p-4 bg-muted/10">
                    <div className="font-semibold">Circle Real Estate</div>
                    <div className="font-semibold text-teal-600">$3,208.91</div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] border-b p-4 bg-teal-500/5">
                    <div className="font-semibold text-teal-800 dark:text-teal-400">Gabriel Mejorado</div>
                    <div className="font-semibold text-teal-600">$8,219.42</div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] border-b p-4">
                    <div className="font-semibold">Mark Perez</div>
                    <div className="font-semibold text-teal-600">$11,730.40</div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] border-b p-4 bg-muted/5">
                    <div className="font-semibold">Shenequa Harris (TC)</div>
                    <div className="font-semibold text-teal-600">$150.00</div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] border-b p-4">
                    <div className="font-semibold">RERM</div>
                    <div className="font-semibold text-teal-600">$124.00</div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] p-4 bg-muted/10">
                    <div className="font-semibold">Radius</div>
                    <div className="font-semibold text-teal-600">$177.07</div>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t max-w-[320px] ml-auto">
                  <BrokerSignature state={demoState} team={demoTeam} />
                </div>

                <Separator className="my-8" />
                <div className="text-[10px] text-center text-muted-foreground">
                  1160 Battery St East Suite 100, Spaces Levis Plaza, San Francisco CA 94111 · broker@radiusagent.com
                </div>
              </Card>
            </TabsContent>

            {/* Tab 5: Gross CDA */}
            <TabsContent value="tab5" className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="space-y-8 max-w-[768px] mx-auto">
                <Card className="shadow-lg border-border relative overflow-hidden bg-white dark:bg-card p-12">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-400" />
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground border">RA</div>
                    <div className="text-right">
                      <h2 className="text-lg font-semibold tracking-tight">Commission Demand Authorization</h2>
                      <Badge variant="outline" className="mt-1 border-amber-500/30 text-amber-600 bg-amber-500/5">Gross</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-5 rounded-lg border text-sm mb-8">
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Property Address</div>
                      <div className="font-medium text-foreground">3860 N Riley Ln, Los Angeles, California, 90065</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Representation</div>
                      <div className="font-medium text-foreground">Buyer</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Agent</div>
                      <div className="font-medium text-foreground">Gabriel Mejorado</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Company</div>
                      <div className="font-medium text-foreground">Chicago Title - Erika Marano</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Escrow Agent Email</div>
                      <div className="font-medium text-foreground">EMarano@fnf.com</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Sale Price</div>
                      <div className="font-medium text-foreground">$1,199,000.00</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gross Commission</div>
                      <div className="font-bold text-amber-600 text-base">$23,980.00</div>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-foreground mb-4">Please send bulk commission payment to Radius Agent.</p>

                  <div className="bg-teal-500/5 border border-teal-500/10 rounded-lg p-5 mb-6 text-sm space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Gross Commission Amount</span>
                      <span className="font-medium text-foreground">$23,980.00</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Referrals/Credits</span>
                      <span className="font-medium text-foreground">$0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span className="text-foreground">Amount to be sent to Radius</span>
                      <span className="text-teal-600 text-lg">$23,980.00</span>
                    </div>
                  </div>

                  <div className="bg-muted/30 border rounded-lg p-4 text-xs space-y-1.5 text-muted-foreground">
                    <div className="flex justify-between"><span className="font-bold text-foreground">Wire To:</span><span>Agentdesks Incorporated</span></div>
                    <div className="flex justify-between"><span>Bank:</span><span>Chase Bank</span></div>
                    <div className="flex justify-between"><span>Account Number:</span><span>932588178</span></div>
                    <div className="flex justify-between"><span>Routing Number:</span><span>021000021</span></div>
                    <div className="text-[10px] pt-1.5 border-t mt-1.5">To Confirm Wire Info: 415-649-0122 / 415-617-9496</div>
                  </div>

                  <p className="text-xs text-muted-foreground italic mt-6 leading-relaxed">
                    If wire is not available, please send a check made payable to Radius, to 1160 Battery St #100, San Francisco, CA 94111. Please email a copy of the check and tracking information to lindsey.shaw@radiusagent.com.
                  </p>

                  <div className="grid grid-cols-1 gap-8 mt-12 pt-6 border-t">
                    <BrokerSignature state={demoState} team={demoTeam} />

                  </div>

                  <Separator className="my-8" />
                  <div className="text-[10px] text-center text-muted-foreground">
                    1160 Battery St East Suite 100, c/o Spaces Levis Plaza, San Francisco, CA 94111 · broker@radiusagent.com · V2024
                  </div>
                </Card>

                {/* Page 2: Wiring options */}
                <Card className="shadow-lg border-border relative overflow-hidden bg-white dark:bg-card p-12 space-y-6">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-400" />
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground border">RA</div>
                    <div className="text-right">
                      <h2 className="text-lg font-semibold tracking-tight">Radius Payment Instructions</h2>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Radius/Agentdesks is the broker of record for all contracts. Any entity listed on a contract is a DBA of Radius/Agentdesks and can be verified on the applicable state licensing website. Radius does not accept paper checks as a standard form of payment.
                  </p>

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WIRE TRANSFER (PREFERRED)</div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span>Name:</span><strong className="text-foreground">Agentdesks Incorporated</strong></div>
                      <div className="flex justify-between"><span>Bank:</span><span>Chase Bank</span></div>
                      <div className="flex justify-between"><span>Account Number:</span><span>932588178</span></div>
                      <div className="flex justify-between"><span>Routing Number:</span><span>021000021</span></div>
                      <div className="text-[10px] pt-1 border-t mt-1">Please include the property address in the memo field. To confirm wiring instructions, call 415-649-0122.</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ACH TRANSFER</div>
                    <div className="text-xs flex justify-between text-muted-foreground">
                      <span>Routing Number:</span>
                      <span className="font-semibold text-foreground">322271627</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CHECK (ONLY IF ELECTRONIC TRANSFER IS NOT POSSIBLE)</div>
                    <p className="text-xs text-muted-foreground">If you are absolutely unable to remit funds electronically, a check may be mailed.</p>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span>Make payable to:</span><strong className="text-foreground">Radius</strong></div>
                      <div className="flex justify-between"><span>Mail to:</span><span>1160 Battery St #100, San Francisco, CA 94111</span></div>
                      <div className="text-[10px] pt-1.5 border-t mt-1 text-right">Provide check copy & tracking details to lindsey.shaw@radiusagent.com</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-justify pt-4">
                    Radius/Agentdesks will not be responsible for delays caused by incomplete or incorrect payment details. Payments submitted without the required memo information may result in processing delays.
                  </p>

                  <Separator className="my-6" />
                  <div className="text-[10px] text-center text-muted-foreground">
                    1160 Battery St East Suite 100, c/o Spaces Levis Plaza, San Francisco, CA 94111 · broker@radiusagent.com · V2024
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
