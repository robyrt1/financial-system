import { useState } from "react";
import { X, Wallet, CheckCircle2 } from "lucide-react";
import type { Debt } from "./DebtCard";

interface PayInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (debtId: string, sourceAccountId: string) => void;
  debt: Debt | null;
  accounts: { id: string; name: string }[];
}

export function PayInstallmentModal({
  isOpen,
  onClose,
  onSubmit,
  debt,
  accounts,
}: PayInstallmentModalProps) {
  const [sourceAccount, setSourceAccount] = useState("");

  if (!isOpen || !debt) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accountToUse =
      sourceAccount || (accounts.length > 0 ? accounts[0].id : "");
    if (!accountToUse) {
      alert("Selecione uma conta de origem.");
      return;
    }
    onSubmit(debt.id, accountToUse);
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

      <div className="relative bg-surface-card border border-stroke w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-stroke bg-surface-panel">
          <h2 className="text-sm font-bold text-content-title uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Confirmar Pagamento
          </h2>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-body transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center mb-4">
            <p className="text-sm text-content-muted">Parcela Mensal</p>
            <p className="font-mono text-2xl font-bold text-content-title mt-1">
              {formatCurrency(debt.monthlyPayment)}
            </p>
            <p className="text-xs text-content-muted mt-1">
              {debt.creditorName}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                Conta de Débito (Origem)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wallet className="w-4 h-4 text-content-muted" />
                </div>
                <select
                  required
                  value={
                    sourceAccount || (accounts.length > 0 ? accounts[0].id : "")
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

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
              <p className="text-[10px] text-cyan-400 font-medium text-center">
                Uma nova transação de despesa será gerada automaticamente nesta
                conta após a confirmação.
              </p>
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
              className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-navy-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pagar Parcela</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
