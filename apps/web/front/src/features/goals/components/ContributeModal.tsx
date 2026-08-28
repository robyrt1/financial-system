import { useState } from "react";
import { X, ArrowRight, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GoalItem } from "../api/goals.api";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface ContributeModalProps {
  isOpen: boolean;
  goal: GoalItem | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (goalId: string, amount: number, accountId: string) => void;
  isPending?: boolean;
}

export function ContributeModal({
  isOpen,
  goal,
  accounts,
  onClose,
  onSubmit,
  isPending = false,
}: ContributeModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(0);
  const [accountId, setAccountId] = useState<string>("");

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !accountId) return;
    onSubmit(goal.id, amount, accountId);
    setAmount(0);
    setAccountId("");
  };

  const remaining = goal.targetAmount - goal.currentAmount;
  const suggested = Math.min(
    goal.suggestedMonthlyDeposit || remaining,
    remaining,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative w-full max-w-md bg-surface-card border border-stroke rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="px-6 py-5 border-b border-stroke flex justify-between items-center bg-surface-base">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content-title">
                {t("goals.contribute_modal_title")}
              </h3>
              <p className="text-xs text-content-muted">{goal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 text-content-muted hover:text-content-body hover:bg-surface-panel rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-surface-panel border border-stroke rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                Progresso Atual
              </span>
              <span className="font-mono font-bold text-content-title">
                {formatCurrency(goal.currentAmount)}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-content-muted" />
            <div className="text-right">
              <span className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                Após Aporte (Simulado)
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {formatCurrency(goal.currentAmount + (amount || 0))}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  {t("goals.contribute_modal_amount")}
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(suggested)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-500 uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Usar Sugerido ({formatCurrency(suggested)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted text-sm font-mono">
                  R$
                </span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  max={remaining}
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder={t("goals.contribute_modal_amount_ph")}
                  className="w-full bg-surface-panel border border-stroke rounded-xl pl-10 pr-4 py-3 text-sm text-content-body font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:font-sans placeholder:text-content-muted/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                {t("goals.contribute_modal_account")}
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-surface-panel border border-stroke rounded-xl px-4 py-3 text-sm text-content-body focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  {t("goals.contribute_modal_account_ph")}
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(Number(acc.balance))})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-3 bg-surface-panel hover:bg-surface-panel/80 border border-stroke text-content-title text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {t("goals.btn_cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending || amount <= 0 || !accountId}
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-navy-950 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-navy-950/20 border-t-navy-950 rounded-full animate-spin" />
              ) : (
                <span>{t("goals.btn_confirm_contribute")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
