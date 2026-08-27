import { useState, useRef } from "react";
import type { KeyboardEvent, ClipboardEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button/index";

import { api, setAccessToken } from "../../../app/api";

interface OtpFormProps {
  email: string;
  mfaToken: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function OtpForm({ email, mfaToken, onBack, onSuccess }: OtpFormProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    // Strip non-numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    if (!numericValue) return;

    const newCode = [...code];
    newCode[index] = numericValue.substring(numericValue.length - 1);
    setCode(newCode);

    // Auto focus next input
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newCode = [...code];

      // If current input is empty, focus previous and erase it
      if (!code[index] && index > 0) {
        newCode[index - 1] = "";
        setCode(newCode);
        inputsRef.current[index - 1]?.focus();
      } else {
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setCode(digits);
      inputsRef.current[5]?.focus();
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const combined = code.join("");
    if (combined.length < 6) {
      setError(t("auth.otp_form.error_fill_all_digits"));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/mfa/verify", {
        mfaToken,
        code: combined,
      });

      // Save tokens
      setAccessToken(response.data.accessToken);
      localStorage.setItem(
        "@financial:refresh_token",
        response.data.refreshToken,
      );

      setLoading(false);
      onSuccess();
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("auth.otp_form.error_incorrect_otp"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-content-muted hover:text-cyan-400 transition-all flex items-center space-x-1.5 mb-4 group cursor-pointer focus:outline-none"
        >
          <svg
            className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>{t("auth.otp_form.back_to_login")}</span>
        </button>
        <h2 className="text-2xl font-bold text-content-title">
          {t("auth.otp_form.security_verification")}
        </h2>
        <p className="text-sm text-content-muted mt-1">
          {t("auth.otp_form.otp_sent")}{" "}
          <strong className="text-content-title font-semibold">{email}</strong>.
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-lg bg-semantic-danger-bg border border-semantic-danger-border text-semantic-danger text-sm flex items-start space-x-2.5 animate-fadeIn"
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

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-content-muted block text-center lg:text-left">
            {t("auth.otp_form.otp_label")}
          </label>
          <div className="flex justify-between space-x-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                pattern="[0-9]*"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={handlePaste}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                className="w-12 h-14 bg-surface-base border-2 border-stroke rounded-xl text-center text-xl font-bold text-content-title focus:outline-none focus:border-cyan-400 font-mono transition-all"
                aria-label={t("auth.otp_form.otp_digit_aria", {
                  index: idx + 1,
                })}
                required
              />
            ))}
          </div>
        </div>

        <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-xs text-center text-cyan-400 font-mono">
          Abra o seu aplicativo de autenticação (Google Authenticator, Authy,
          etc.) para obter o código de segurança.
        </div>

        <Button.Root type="submit" disabled={code.some((d) => !d) || loading}>
          <span>
            {loading ? "Verificando..." : t("auth.otp_form.confirm_identity")}
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
              strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a5 5 0 00-10 0c0 1.02.2 2 .582 2.888m1.12 1.027A9.002 9.002 0 0022 12c0-4.97-4.03-9-9-9s-9 4.03-9 9c0 2.12.735 4.07 1.966 5.618m16.032-2.119L19.5 16.5m0 0a3 3 0 10-5.197-3.05"
            />
          </svg>
        </Button.Root>
      </form>
    </div>
  );
}
