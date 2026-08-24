import { useState } from "react";
import type { SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../../components/ui/Input";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Button } from "../../../components/ui/Button/index";
import { ValidationRules } from "../../../components/ui/ValidationRules";

const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

import { api } from "../../../app/api";

interface LoginFormProps {
  onSuccess: (email: string, mfaToken?: string) => void;
  onFailedAttempt: () => void;
  onRegisterClick: () => void;
}

export function LoginForm({
  onSuccess,
  onFailedAttempt,
  onRegisterClick,
}: LoginFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const getScore = () => {
    let score = 0;
    if (rules.length) score++;
    if (rules.upper) score++;
    if (rules.number) score++;
    if (rules.symbol) score++;
    return score;
  };

  const score = getScore();

  const getStrengthUI = () => {
    if (password.length === 0)
      return {
        percentage: 0,
        text: t("auth.login_form.pwd_strength"),
        colorClass: "text-slate-400",
        barClass: "bg-slate-200",
      };
    if (score <= 1)
      return {
        percentage: 25,
        text: t("auth.login_form.pwd_weak"),
        colorClass: "text-rose-500 font-bold",
        barClass: "bg-rose-500",
      };
    if (score === 2)
      return {
        percentage: 50,
        text: t("auth.login_form.pwd_fair"),
        colorClass: "text-amber-500 font-bold",
        barClass: "bg-amber-500",
      };
    if (score === 3)
      return {
        percentage: 75,
        text: t("auth.login_form.pwd_strong"),
        colorClass: "text-blue-500 font-bold",
        barClass: "bg-blue-500",
      };
    return {
      percentage: 100,
      text: t("auth.login_form.pwd_very_strong"),
      colorClass: "text-emerald-500 font-bold",
      barClass: "bg-emerald-500",
    };
  };

  const strength = getStrengthUI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t("auth.login_form.error_all_credentials"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("auth.login_form.error_invalid_email"));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      setLoading(false);

      if (response.data.requiresMfa) {
        onSuccess(email, response.data.mfaToken);
      } else {
        localStorage.setItem(
          "@financial:access_token",
          response.data.accessToken,
        );
        localStorage.setItem(
          "@financial:refresh_token",
          response.data.refreshToken,
        );
        onSuccess(email);
      }
    } catch (err) {
      setLoading(false);
      onFailedAttempt();
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("auth.login_form.error_invalid_credentials"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <div className="flex lg:hidden items-center justify-center space-x-2 mb-6">
          <span className="font-mono text-3xl font-bold text-cyan-400 select-none">
            {":}"}
          </span>
          <span className="font-bold text-xl tracking-wider text-content-title">
            RMTECH
          </span>
        </div>
        <h2 className="text-2xl font-bold text-content-title">
          {t("auth.login_form.access_terminal")}
        </h2>
        <p className="text-sm text-content-muted mt-1">
          {t("auth.login_form.identify_validation")}
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-lg bg-semantic-danger-bg border border-semantic-danger-border text-semantic-danger text-sm flex items-start space-x-2.5"
          role="alert"
          aria-live="assertive"
        >
          <svg
            className="w-5 h-5 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          id="email"
          name="email"
          type="email"
          label={t("auth.login_form.email_label")}
          placeholder={t("auth.login_form.email_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          aria-label={t("auth.login_form.email_label")}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />

        <div className="space-y-1.5">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label={t("auth.login_form.password_label")}
            placeholder={t("auth.login_form.password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            autoComplete="current-password"
            required
            isMono
            aria-label={t("auth.login_form.password_label")}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            endAction={
              <Input.Icon
                position="right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? t("auth.login_form.hide_password")
                    : t("auth.login_form.show_password")
                }
                icon={showPassword ? EyeOffIcon : EyeIcon}
              />
            }
          />

          {isPasswordFocused && (
            <ValidationRules
              rules={[
                {
                  id: "length",
                  label: t("auth.login_form.rule_min_chars"),
                  isValid: rules.length,
                },
                {
                  id: "upper",
                  label: t("auth.login_form.rule_uppercase"),
                  isValid: rules.upper,
                },
                {
                  id: "number",
                  label: t("auth.login_form.rule_number"),
                  isValid: rules.number,
                },
                {
                  id: "symbol",
                  label: t("auth.login_form.rule_symbol"),
                  isValid: rules.symbol,
                },
              ]}
              strength={{
                percentage: strength.percentage,
                label: strength.text,
                colorClass: strength.colorClass,
                barClass: strength.barClass,
                subtitle: t("auth.login_form.pwd_complexity"),
              }}
            />
          )}
        </div>

        <div className="space-y-3">
          <Checkbox
            id="rememberDevice"
            name="rememberDevice"
            label={t("auth.login_form.trust_device")}
            description={t("auth.login_form.trust_device_desc")}
          />

          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 flex items-start space-x-2">
            <svg
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p>
              <strong>{t("auth.login_form.privacy_warning_title")}</strong>{" "}
              {t("auth.login_form.privacy_warning_desc")}
            </p>
          </div>
        </div>

        <Button.Root type="submit" disabled={!email || !password || loading}>
          <span>
            {loading ? "Processando..." : t("auth.login_form.continue_mfa")}
          </span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Button.Root>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-xs text-cyan-400 hover:underline focus:outline-none cursor-pointer"
          >
            Não tem uma conta? Crie uma credencial
          </button>
        </div>
      </form>
    </div>
  );
}
