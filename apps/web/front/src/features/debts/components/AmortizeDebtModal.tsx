import { useState } from "react";
import { X, TrendingDown, DollarSign, Wallet } from "lucide-react";
import type { Debt } from "./DebtCard";

interface AmortizeDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    debtId: string,
    amount: number,
    sourceAccountId: string,
    reductionType: "TIME" | "PAYMENT",
  ) => void;
  debt: Debt | null;
  accounts: { id: string; name: string }[];
}

export function AmortizeDebtModal({
  isOpen,
  onClose,
  onSubmit,
  debt,
  accounts,
}: AmortizeDebtModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [sourceAccount, setSourceAccount] = useState("");
  const [reductionType, setReductionType] = useState<"TIME" | "PAYMENT">(
    "TIME",
  );

  if (!isOpen || !debt) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      const accountToUse =
        sourceAccount || (accounts.length > 0 ? accounts[0].id : "");
      if (!accountToUse) {
        alert("Selecione uma conta de origem.");
        return;
      }
      onSubmit(debt.id, amount, accountToUse, reductionType);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface-card border border-stroke w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-stroke bg-surface-panel">
          <h2 className="text-sm font-bold text-content-title uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-cyan-400" />
            Amortizar Dívida
          </h2>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-body transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-stroke/50">
            <div>
              <p className="text-sm font-bold text-content-title">
                {debt.creditorName}
              </p>
              <p className="text-xs text-content-muted mt-0.5">
                Saldo Devedor Atual
              </p>
            </div>
            <p className="font-mono text-xl font-bold text-rose-400">
              {formatCurrency(debt.remainingBalance)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                Valor da Amortização (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-content-muted" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={debt.remainingBalance}
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-3.5 py-2.5 text-lg font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    value={
                      sourceAccount ||
                      (accounts.length > 0 ? accounts[0].id : "")
                    }
                    onChange={(e) => setSourceAccount(e.target.value)}
                    className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                    {accounts.length === 0 && (
                      <option value="">Sem contas cadastradas</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                  Estratégia
                </label>
                <select
                  required
                  value={reductionType}
                  onChange={(e) =>
                    setReductionType(e.target.value as "TIME" | "PAYMENT")
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-sm text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="TIME">Reduzir Prazo (Recomendado)</option>
                  <option value="PAYMENT">Reduzir Valor da Parcela</option>
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
              disabled={
                !amount || amount <= 0 || amount > debt.remainingBalance
              }
              className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Confirmar Amortização</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
