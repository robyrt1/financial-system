import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthScreen } from "../features/auth/components/AuthScreen";
import { DashboardScreen } from "../features/dashboard/components/DashboardScreen";
import { api, setAccessToken, getAccessToken } from "./api";

export function AppRouter() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const performSilentRefresh = async () => {
      const token = getAccessToken();
      if (token && location.pathname === "/") {
        navigate("/dashboard");
        setCheckingAuth(false);
        return;
      }

      if (token && location.pathname === "/dashboard") {
        setCheckingAuth(false);
        return;
      }

      const refreshToken = localStorage.getItem("@financial:refresh_token");
      if (!refreshToken) {
        setCheckingAuth(false);
        if (location.pathname !== "/") {
          navigate("/");
        }
        return;
      }

      try {
        const response = await api.post("/auth/refresh", { refreshToken });
        setAccessToken(response.data.accessToken);
        localStorage.setItem(
          "@financial:refresh_token",
          response.data.refreshToken,
        );
        setCheckingAuth(false);
        if (location.pathname === "/") {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Silent refresh failed:", err);
        localStorage.removeItem("@financial:refresh_token");
        setAccessToken(null);
        setCheckingAuth(false);
        navigate("/");
      }
    };

    performSilentRefresh();
  }, [navigate, location.pathname]);

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-navy-950 text-cyan-400 font-mono text-xs">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <span>RMTECH Software // Verificando Sessão...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AuthScreen />} />
      <Route
        path="/dashboard"
        element={<DashboardScreen initialTab="dashboard" />}
      />
      <Route
        path="/accounts"
        element={<DashboardScreen initialTab="accounts" />}
      />
      <Route
        path="/transactions"
        element={<DashboardScreen initialTab="transactions" />}
      />
      <Route
        path="/categories"
        element={<DashboardScreen initialTab="categories" />}
      />
      <Route path="/debts" element={<DashboardScreen initialTab="debts" />} />
      <Route path="/goals" element={<DashboardScreen initialTab="goals" />} />
    </Routes>
  );
}
