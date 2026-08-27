import { useState, useEffect } from "react";
import {
  X,
  Shield,
  Home,
  TrendingUp,
  Plane,
  Heart,
  BookOpen,
  Briefcase,
  Coffee,
  HelpCircle,
  Check,
} from "lucide-react";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: "EXPENSE" | "INCOME" | "INVESTMENT";
    color: string;
    iconName: string;
    budgetLimit: number | null;
  }) => void;
  initialData?: {
    name: string;
    type: "EXPENSE" | "INCOME" | "INVESTMENT";
    color: string;
    iconName: string;
    budgetLimit: number | null;
  } | null;
}

const COLOR_OPTIONS = [
  {
    name: "Cyan",
    bgClass: "bg-cyan-400",
    value:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 border-t-4 border-t-cyan-400",
  },
  {
    name: "Emerald",
    bgClass: "bg-emerald-500",
    value:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 border-t-4 border-t-emerald-400",
  },
  {
    name: "Purple",
    bgClass: "bg-purple-500",
    value:
      "bg-purple-500/10 text-purple-400 border-purple-500/30 border-t-4 border-t-purple-400",
  },
  {
    name: "Orange",
    bgClass: "bg-orange-500",
    value:
      "bg-orange-500/10 text-orange-400 border-orange-500/30 border-t-4 border-t-orange-400",
  },
  {
    name: "Indigo",
    bgClass: "bg-indigo-500",
    value:
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 border-t-4 border-t-indigo-400",
  },
  {
    name: "Rose",
    bgClass: "bg-rose-500",
    value:
      "bg-rose-500/10 text-rose-400 border-rose-500/30 border-t-4 border-t-rose-400",
  },
  {
    name: "Teal",
    bgClass: "bg-teal-500",
    value:
      "bg-teal-500/10 text-teal-400 border-teal-500/30 border-t-4 border-t-teal-400",
  },
  {
    name: "Amber",
    bgClass: "bg-amber-500",
    value:
      "bg-amber-500/10 text-amber-400 border-amber-500/30 border-t-4 border-t-amber-400",
  },
];

const ICON_OPTIONS = [
  { name: "Shield", icon: Shield },
  { name: "Home", icon: Home },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Plane", icon: Plane },
  { name: "Heart", icon: Heart },
  { name: "BookOpen", icon: BookOpen },
  { name: "Briefcase", icon: Briefcase },
  { name: "Coffee", icon: Coffee },
  { name: "HelpCircle", icon: HelpCircle },
];

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "INVESTMENT">(
    "EXPENSE",
  );
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [iconName, setIconName] = useState("Shield");
  const [budgetLimit, setBudgetLimit] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setColor(initialData.color);
      setIconName(initialData.iconName);
      setBudgetLimit(
        initialData.budgetLimit ? initialData.budgetLimit.toString() : "",
      );
    } else {
      setName("");
      setType("EXPENSE");
      setColor(COLOR_OPTIONS[0].value);
      setIconName("Shield");
      setBudgetLimit("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      color,
      iconName,
      budgetLimit: parseFloat(budgetLimit) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-panel border border-stroke rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke">
          <h3 className="font-bold text-content-title uppercase tracking-wider text-sm">
            {initialData ? "Editar Categoria" : "Nova Categoria"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-content-muted hover:text-content-title cursor-pointer transition focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {(["EXPENSE", "INCOME", "INVESTMENT"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  type === t
                    ? t === "EXPENSE"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-sm"
                      : t === "INCOME"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm"
                    : "bg-surface-base border-stroke text-content-body hover:bg-surface-hover"
                }`}
              >
                {t === "EXPENSE"
                  ? "Despesa"
                  : t === "INCOME"
                    ? "Receita"
                    : "Investimento"}
              </button>
            ))}
          </div>

          {/* Name & Budget Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase tracking-wider">
                Nome da Categoria
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Refeições Corporativas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase tracking-wider">
                Teto Mensal (BRL)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Sem Limite"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* Palette Color Picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-content-muted uppercase tracking-wider block">
              Cores do Design System
            </label>
            <div className="flex items-center justify-between gap-1">
              {COLOR_OPTIONS.map((opt) => {
                const isSelected = color === opt.value;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${opt.bgClass} ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-offset-navy-900 ring-white scale-110 shadow-md"
                        : "opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    title={opt.name}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-navy-950 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-content-muted uppercase tracking-wider block">
              Selecionar Ícone
            </label>
            <div className="grid grid-cols-9 gap-1.5">
              {ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = iconName === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setIconName(opt.name)}
                    className={`p-2 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm"
                        : "bg-surface-base border-stroke text-content-body hover:bg-surface-hover hover:text-content-title"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stroke text-content-body hover:text-content-title hover:border-cyan-500/40 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-navy-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-cyan-400/20 active:scale-95 transition"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
