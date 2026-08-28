import { useState } from "react";
import { X, Target, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CreateGoalDto } from "../api/goals.api";

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalDto) => void;
  isPending?: boolean;
}

export function NewGoalModal({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: NewGoalModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateGoalDto>({
    name: "",
    targetAmount: 0,
    deadline: "",
    category: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.deadline) return;
    onSubmit(formData);
    setFormData({ name: "", targetAmount: 0, deadline: "", category: "" });
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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content-title">
                {t("goals.new_modal_title")}
              </h3>
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
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                {t("goals.new_modal_name")}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("goals.new_modal_name_ph")}
                className="w-full bg-surface-panel border border-stroke rounded-xl px-4 py-3 text-sm text-content-body focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-content-muted/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                  {t("goals.new_modal_target")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted text-sm font-mono">
                    R$
                  </span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.targetAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder={t("goals.new_modal_target_ph")}
                    className="w-full bg-surface-panel border border-stroke rounded-xl pl-10 pr-4 py-3 text-sm text-content-body font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:font-sans placeholder:text-content-muted/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                  {t("goals.new_modal_deadline")}
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full bg-surface-panel border border-stroke rounded-xl px-4 py-3 text-sm text-content-body font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                {t("goals.new_modal_category")}
              </label>
              <select
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-surface-panel border border-stroke rounded-xl px-4 py-3 text-sm text-content-body focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">Selecione...</option>
                <option value="Reserva">Reserva</option>
                <option value="Aquisição">Aquisição</option>
                <option value="Viagem">Viagem</option>
                <option value="Investimento">Investimento</option>
                <option value="Outros">Outros</option>
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
              disabled={isPending}
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-navy-950 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-navy-950/20 border-t-navy-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t("goals.btn_create")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
