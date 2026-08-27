import { useState } from "react";
import { X, TrendingUp, DollarSign, Wallet } from "lucide-react";
import type { Goal } from "./GoalCard";

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalId: string, amount: number, sourceAccount: string) => void;
  goal: Goal | null;
}

export function ContributeModal({
  isOpen,
  onClose,
  onSubmit,
  goal,
}: ContributeModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [sourceAccount, setSourceAccount] = useState("Banco Principal");

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      onSubmit(goal.id, amount, sourceAccount);
    }
    setAmount(0);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const maxContribution = goal.targetAmount - goal.currentAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface-card border border-stroke w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-stroke bg-surface-panel">
          <h2 className="text-sm font-bold text-content-title uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Aportar na Meta
          </h2>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-body transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center mb-2">
            <p className="text-sm text-content-muted">Meta Selecionada</p>
            <p className="font-bold text-content-title text-base mt-1">
              {goal.title}
            </p>
            <p className="text-xs text-content-muted font-mono mt-1">
              Faltam {formatCurrency(maxContribution)} para concluir
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                Valor do Aporte (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-content-muted" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={maxContribution}
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-3.5 py-2.5 text-lg font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={() => setAmount(goal.monthlySuggested || 100)}
                  className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase cursor-pointer"
                >
                  Usar Sugerido
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(maxContribution)}
                  className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase cursor-pointer"
                >
                  Quitar Saldo Restante
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                Conta de Débito
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wallet className="w-4 h-4 text-content-muted" />
                </div>
                <select
                  required
                  value={sourceAccount}
                  onChange={(e) => setSourceAccount(e.target.value)}
                  className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="Banco Principal">Banco Principal</option>
                  <option value="Carteira Digital">Carteira Digital</option>
                  <option value="Corretora XP">Corretora XP</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stroke mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-content-muted hover:text-content-body transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!amount || amount <= 0 || amount > maxContribution}
              className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Confirmar Aporte</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
