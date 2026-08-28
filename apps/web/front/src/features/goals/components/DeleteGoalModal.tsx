import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GoalItem } from "../api/goals.api";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface DeleteGoalModalProps {
  isOpen: boolean;
  goal: GoalItem | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (goalId: string, refundAccountId?: string) => void;
  isPending?: boolean;
}

export function DeleteGoalModal({
  isOpen,
  goal,
  accounts,
  onClose,
  onSubmit,
  isPending = false,
}: DeleteGoalModalProps) {
  const { t } = useTranslation();
  const [refundAccountId, setRefundAccountId] = useState<string>("");

  if (!isOpen || !goal) return null;

  const requiresRefund = goal.currentAmount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresRefund && !refundAccountId) return;
    onSubmit(goal.id, requiresRefund ? refundAccountId : undefined);
    setRefundAccountId("");
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
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content-title">
                {t("goals.delete_modal_title")}
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
            {t("goals.delete_modal_desc")}
          </p>

          {requiresRefund && (
            <div className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-red-500/80 uppercase tracking-wider mb-1">
                    Atenção: Saldo Pendente
                  </span>
                  <p className="text-xs text-content-muted">
                    {t("goals.delete_modal_refund_desc")} O valor de{" "}
                    <strong className="text-content-body font-mono">
                      {formatCurrency(goal.currentAmount)}
                    </strong>{" "}
                    será estornado.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                  Conta para Estorno
                </label>
                <select
                  required
                  value={refundAccountId}
                  onChange={(e) => setRefundAccountId(e.target.value)}
                  className="w-full bg-surface-panel border border-stroke rounded-xl px-4 py-3 text-sm text-content-body focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Selecione a conta para receber
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(Number(acc.balance))})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
              disabled={isPending || (requiresRefund && !refundAccountId)}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{t("goals.btn_confirm_delete")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
