import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button/index";
import { ValidationRules } from "../../../components/ui/ValidationRules";
import { api, setAccessToken } from "../../../app/api";

interface RegisterFormProps {
  onBackToLogin: () => void;
  onRegisterSuccess: () => void;
}

export function RegisterForm({
  onBackToLogin,
  onRegisterSuccess,
}: RegisterFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const isFormValid =
    name &&
    email &&
    rules.length &&
    rules.upper &&
    rules.number &&
    rules.symbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
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
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      // Save tokens
      setAccessToken(response.data.accessToken);
      localStorage.setItem(
        "@financial:refresh_token",
        response.data.refreshToken,
      );

      setLoading(false);
      onRegisterSuccess();
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Erro ao registrar usuário. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-content-title">Criar Conta</h2>
        <p className="text-sm text-content-muted mt-1">
          Crie sua credencial no terminal seguro da RMTECH.
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-lg bg-semantic-danger-bg border border-semantic-danger-border text-semantic-danger text-sm flex items-start space-x-2.5"
          role="alert"
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
        {/* Name */}
        <Input
          id="name"
          name="name"
          type="text"
          label="Nome Completo"
          placeholder="Ex: John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Email */}
        <Input
          id="email"
          name="email"
          type="email"
          label={t("auth.login_form.email_label")}
          placeholder={t("auth.login_form.email_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <div className="space-y-1.5">
          <Input
            id="password"
            name="password"
            type="password"
            label={t("auth.login_form.password_label")}
            placeholder={t("auth.login_form.password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            required
            isMono
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
            />
          )}
        </div>

        {/* Submit */}
        <Button.Root type="submit" disabled={!isFormValid || loading}>
          <span>{loading ? "Processando..." : "Registrar Credencial"}</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button.Root>

        {/* Switch to login */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-cyan-400 hover:underline focus:outline-none cursor-pointer"
          >
            Já tem uma conta? Acesse o terminal
          </button>
        </div>
      </form>
    </div>
  );
}
