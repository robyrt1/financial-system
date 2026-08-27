import { useState, useEffect } from "react";
import { X, Target, Calendar, DollarSign, Wallet } from "lucide-react";

export interface NewGoalData {
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewGoalData) => void;
  initialData?: NewGoalData | null;
}

export function NewGoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: NewGoalModalProps) {
  const [formData, setFormData] = useState<NewGoalData>({
    title: "",
    category: "Investimentos",
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 12))
      .toISOString()
      .split("T")[0],
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          title: "",
          category: "Investimentos",
          targetAmount: 0,
          currentAmount: 0,
          deadline: new Date(new Date().setMonth(new Date().getMonth() + 12))
            .toISOString()
            .split("T")[0],
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-surface-card border border-stroke w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-stroke bg-surface-panel">
          <h2 className="text-sm font-bold text-content-title uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            {initialData ? "Editar Meta" : "Registrar Nova Meta"}
          </h2>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-body transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                Nome da Meta
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Reserva de Emergência, Viagem Europa"
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-sm text-content-title placeholder:text-content-muted/50 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                  Valor Alvo (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-content-muted" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.targetAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAmount: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono text-content-title focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                  Valor Inicial Guardado (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wallet className="w-4 h-4 text-content-muted" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.currentAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAmount: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono text-content-title focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                  Data Limite (Deadline)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-content-muted" />
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono text-content-title focus:outline-none focus:border-cyan-500 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-sm text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="Investimentos">Investimentos</option>
                  <option value="Reserva">Reserva de Emergência</option>
                  <option value="Viagem">Viagem</option>
                  <option value="Aquisição">Aquisição de Bens</option>
                  <option value="Educação">Educação</option>
                  <option value="Outros">Outros</option>
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
              className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-navy-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>{initialData ? "Atualizar Meta" : "Salvar Meta"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
