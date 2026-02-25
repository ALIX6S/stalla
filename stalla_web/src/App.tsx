import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./features/auth/guards/RequireAuth";
import { RequireAdmin } from "./features/auth/guards/RequireAdmin";
import { AdminLayout } from "./shared/layouts/AdminLayout";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { StallsPage } from "./features/stalls/pages/StallsPage";
import { VendorsPage } from "./features/vendors/pages/VendorsPage";
import { AllocationsPage } from "./features/allocations/pages/AllocationsPage";
import { PaymentsPage } from "./features/payments/pages/PaymentsPage";
import { DebtorsPage } from "./features/debtors/pages/DebtorsPage";
import { ApplicationsPage } from "./features/applications/pages/ApplicationsPage";
import { SupportSettingsPage } from "./features/support/pages/SupportSettingsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="stalls" element={<StallsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="allocations" element={<AllocationsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="debtors" element={<DebtorsPage />} />
            <Route path="support" element={<SupportSettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
