import { createBrowserRouter, Outlet } from "react-router";
import { BreakdownPage } from "./pages/BreakdownPage";
import { TeamLeadReview } from "./pages/TeamLeadReview";
import { AuditorVerification } from "./pages/AuditorVerification";
import { CDASettings } from "./pages/CDASettings";
import { AgentConfirmation } from "./pages/AgentConfirmation";
import { CommissionPlanBuilder } from "./pages/CommissionPlanBuilder";
import { FeeTypeBuilder } from "./pages/FeeTypeBuilder";
import { AssignDefaults } from "./pages/AssignDefaults";
import { FinalizedPDFPage } from "./pages/FinalizedPDFPage";
import { EdgeCasesPage } from "./pages/EdgeCasesPage";
import { CDAInsertionMap } from "./pages/CDAInsertionMap";
import { CDACalculatorBreakdown } from "./pages/CDACalculatorBreakdown";
import { CommissionBreakdown } from "./pages/CommissionBreakdown";
import { TransactionDetail } from "./pages/TransactionDetail";
import { RootErrorBoundary } from "./components/RootErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        Component: CDASettings,
      },
      {
        path: "breakdown",
        Component: BreakdownPage,
      },
      {
        path: "team-lead-review",
        Component: TeamLeadReview,
      },
      {
        path: "auditor-verification",
        Component: AuditorVerification,
      },
      {
        path: "cda-settings",
        Component: CDASettings,
      },
      {
        path: "cda/commission-settings",
        Component: CDASettings,
      },
      {
        path: "agent-confirmation",
        Component: AgentConfirmation,
      },
      {
        path: "commission-plan-builder",
        Component: CommissionPlanBuilder,
      },
      {
        path: "fee-type-builder",
        Component: FeeTypeBuilder,
      },
      {
        path: "assign-defaults",
        Component: AssignDefaults,
      },
      {
        path: "finalized-pdf",
        Component: FinalizedPDFPage,
      },
      {
        path: "edge-cases",
        Component: EdgeCasesPage,
      },
      {
        path: "insertion-map",
        Component: CDAInsertionMap,
      },
      {
        path: "calculator-breakdown",
        Component: CDACalculatorBreakdown,
      },
      {
        path: "cda/commission-breakdown",
        Component: CommissionBreakdown,
      },
      {
        path: "transaction-detail",
        Component: TransactionDetail,
      },
    ],
  },
]);
