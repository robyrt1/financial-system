import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SecurityHeader } from "./SecurityHeader";
import { LockoutOverlay } from "./LockoutOverlay";
import { LoginForm } from "./LoginForm";
import { OtpForm } from "./OtpForm";
import { ThemeToggle } from "../../../components/ui/ThemeToggle";

import { useNavigate } from "react-router-dom";
import { FeatureHero } from "../../../components/ui/feature-hero";

import { RegisterForm } from "./RegisterForm";

type AuthStep = "login" | "mfa" | "register";

export function AuthScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  // Brute-force lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (lockoutCountdown > 0) {
      const timer = setInterval(() => {
        setLockoutCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutCountdown]);

  const handleLoginSuccess = (userEmail: string, token?: string) => {
    setEmail(userEmail);
    if (token) {
      setMfaToken(token);
      setStep("mfa");
    } else {
      alert(t("auth.alert_success_auth"));
      navigate("/dashboard");
    }
  };

  const handleFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    if (nextAttempts >= 3) {
      setIsLocked(true);
      setLockoutCountdown(30);
    }
  };

  const handleOtpSuccess = () => {
    alert(t("auth.alert_success_auth"));
    navigate("/dashboard");
  };

  return (
    <div className="bg-surface-base text-content-body font-sans min-h-screen flex flex-col justify-between transition-all duration-300 overflow-x-hidden">
      <SecurityHeader />

      <div className="fixed top-14 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50 dark:from-navy-950 dark:via-navy-900 dark:to-slate-900 text-slate-800 dark:text-white p-12 flex-col justify-between relative overflow-hidden transition-all duration-300">
          <div className="absolute inset-0 cyber-grid opacity-10 dark:opacity-20 pointer-events-none" />

          <div className="z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-400/20">
                <span className="font-mono text-2xl font-bold text-navy-950 select-none">
                  {":}"}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-slate-800 dark:text-white">
                  RMTECH
                </h1>
                <p className="text-[12px] text-cyan-600 dark:text-cyan-400 tracking-widest uppercase font-mono">
                  {t("auth.quantum_crypto")}
                </p>
              </div>
            </div>
          </div>

          <FeatureHero.Root
            title={
              <>
                {t("auth.quantum_title")}
                <span className="text-cyan-600 dark:text-cyan-400 bg-clip-text">
                  {t("auth.quantum_title_highlight")}
                </span>
                .
              </>
            }
            description={t("auth.quantum_desc")}
          >
            <FeatureHero.Item
              title={t("auth.e2ee_title")}
              description={t("auth.e2ee_desc")}
            />
            <FeatureHero.Item
              title={t("auth.zero_trust_title")}
              description={t("auth.zero_trust_desc")}
            />
          </FeatureHero.Root>

          <div className="z-10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono border-t border-slate-300 dark:border-white/10 pt-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400 inline-block animate-pulse" />
              <span>{t("auth.sys_status_nominal")}</span>
            </div>
            <span>v4.8.2-Sec</span>
          </div>
        </div>

        {/* Right pane: Auth forms box wrapper */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:w-7/12 relative">
          <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-xl border border-stroke dark:border-navy-800 p-8 transition-all duration-300 relative overflow-hidden">
            {/* Brute force overlay protection */}
            {isLocked && <LockoutOverlay countdown={lockoutCountdown} />}

            {/* Dynamic Step switcher */}
            {step === "login" && (
              <LoginForm
                onSuccess={handleLoginSuccess}
                onFailedAttempt={handleFailedAttempt}
                onRegisterClick={() => setStep("register")}
              />
            )}
            {step === "mfa" && (
              <OtpForm
                email={email}
                mfaToken={mfaToken || ""}
                onBack={() => setStep("login")}
                onSuccess={handleOtpSuccess}
              />
            )}
            {step === "register" && (
              <RegisterForm
                onBackToLogin={() => setStep("login")}
                onRegisterSuccess={() => navigate("/dashboard")}
              />
            )}
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="bg-surface-base border-t border-stroke py-6 px-8 text-xs text-content-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <p>{t("auth.footer_copyright")}</p>
          </div>
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 text-cyan-400 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              {t("auth.footer_encrypted")}
            </span>
            <a href="#" className="hover:text-cyan-400 transition-all">
              {t("common.privacy_policy")}
            </a>
            <a href="#" className="hover:text-cyan-400 transition-all">
              {t("common.terms_of_use")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
