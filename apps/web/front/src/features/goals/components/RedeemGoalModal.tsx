import { useState } from "react";
import { X, Award, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GoalItem } from "../api/goals.api";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface RedeemGoalModalProps {
  isOpen: boolean;
  goal: GoalItem | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (goalId: string, accountId: string) => void;
  isPending?: boolean;
}

export function RedeemGoalModal({
  isOpen,
  goal,
  accounts,
  onClose,
  onSubmit,
  isPending = false,
}: RedeemGoalModalProps) {
  const { t } = useTranslation();
  const [accountId, setAccountId] = useState<string>("");

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;
    onSubmit(goal.id, accountId);
    setAccountId("");
  };

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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content-title">
                {t("goals.redeem_modal_title")}
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
          <p className="text-sm text-content-body leading-relaxed">
            {t("goals.redeem_modal_desc")}
          </p>

          <div className="bg-surface-panel border border-stroke rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                Valor do Resgate
              </span>
              <span className="font-mono font-bold text-emerald-500 text-lg">
                {formatCurrency(goal.currentAmount)}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-content-muted" />
            <div className="text-right">
              <span className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                Status Futuro
              </span>
              <span className="font-mono font-bold text-content-title text-lg uppercase">
                REDEEMED
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
              {t("goals.redeem_modal_account")}
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-surface-panel border border-stroke rounded-xl px-4 py-3 text-sm text-content-body focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>
                {t("goals.redeem_modal_account_ph")}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(Number(acc.balance))})
                </option>
              ))}
            </select>
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
              disabled={isPending || !accountId}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-navy-950 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-navy-950/20 border-t-navy-950 rounded-full animate-spin" />
              ) : (
                <span>{t("goals.btn_confirm_redeem")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
