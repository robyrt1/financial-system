import { Routes, Route } from "react-router-dom";
import { AuthScreen } from "../features/auth/components/AuthScreen";
import { DashboardScreen } from "../features/dashboard/components/DashboardScreen";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AuthScreen />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
    </Routes>
  );
}
