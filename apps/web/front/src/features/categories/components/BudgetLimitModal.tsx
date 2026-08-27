import { useState, useEffect } from "react";
import { X, DollarSign } from "lucide-react";

interface BudgetLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (limit: number) => void;
  initialLimit: number;
}

export default function BudgetLimitModal({
  isOpen,
  onClose,
  onSubmit,
  initialLimit,
}: BudgetLimitModalProps) {
  const [limit, setLimit] = useState(initialLimit.toString());

  useEffect(() => {
    setLimit(initialLimit.toString());
  }, [initialLimit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(limit) || 0);
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-panel border border-stroke rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke">
          <h3 className="font-bold text-content-title uppercase tracking-wider text-xs">
            Definir Teto de Gastos
          </h3>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-title cursor-pointer focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-content-muted uppercase">
              Teto de Gastos Mensal (BRL)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
              <input
                type="number"
                step="0.01"
                placeholder="2000.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-4 py-2.5 text-xs text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stroke text-content-body hover:text-content-title rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              Salvar Teto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
