import { useState } from "react";
import {
  Lock,
  Unlock,
  Shield,
  Home,
  TrendingUp,
  Plane,
  Heart,
  BookOpen,
  Briefcase,
  Coffee,
  HelpCircle,
  Edit2,
  Trash2,
  X,
  Sliders,
  Plus,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";

import type { Category } from "../hooks/useCategoriesData";

interface CategoryCardProps {
  category: Category;
  onDelete: (id: string) => void;
  onEdit: (cat: Category) => void;
  onAdjustLimit: (id: string) => void;
  onAddSub: (catId: string, name: string) => void;
  onRemoveSub: (catId: string, subId: string) => void;
  addingSubToId: string;
  setAddingSubToId: (id: string) => void;
}

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

export default function CategoryCard({
  category,
  onDelete,
  onEdit,
  onAdjustLimit,
  onAddSub,
  onRemoveSub,
  addingSubToId,
  setAddingSubToId,
}: CategoryCardProps) {
  const [newSubName, setNewSubName] = useState("");

  const handleAddSub = () => {
    if (!newSubName.trim()) return;
    onAddSub(category.id, newSubName.trim());
    setNewSubName("");
  };

  const renderCategoryIcon = (name: string, className = "w-5 h-5") => {
    const matched = ICON_OPTIONS.find((o) => o.name === name);
    const IconComponent = matched ? matched.icon : HelpCircle;
    return <IconComponent className={className} />;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const budgetLimit = category.budgetLimit || 0;
  const barColorClass =
    category.status === "SAFE"
      ? "bg-emerald-500 shadow-lg shadow-emerald-500/10"
      : category.status === "WARNING"
        ? "bg-amber-500 shadow-lg shadow-amber-500/10"
        : "bg-rose-500 shadow-lg shadow-rose-500/10";

  return (
    <Card
      className={`overflow-hidden transition-all flex flex-col justify-between ${category.color}`}
    >
      {/* Card Header */}
      <div className="p-5 border-b border-stroke/20">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-navy-950/40 border border-stroke/30 text-content-title">
              {renderCategoryIcon(category.iconName)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-content-title tracking-tight line-clamp-1">
                {category.name}
              </h3>
              {/* Origin Tag */}
              <div className="flex items-center gap-1.5 mt-1 select-none">
                {category.source === "SYSTEM" ? (
                  <span className="flex items-center gap-1 text-[12px] font-bold bg-navy-800 border border-stroke text-content-muted rounded px-1.5 py-0.5 leading-none">
                    <Lock className="w-2.5 h-2.5" />
                    <span>SISTEMA</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] font-bold bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 rounded px-1.5 py-0.5 leading-none">
                    <Unlock className="w-2.5 h-2.5" />
                    <span>PERSONALIZADA</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        {budgetLimit > 0 && (
          <div className="mt-4 space-y-1 select-none">
            <div className="flex justify-between text-[12px] text-content-muted font-mono">
              <span>Consumo: {category.percentage.toFixed(0)}%</span>
              <span>
                {formatCurrency(category.spent)} / {formatCurrency(budgetLimit)}
              </span>
            </div>
            <div className="w-full bg-navy-950/60 rounded-full h-2 border border-stroke/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                style={{ width: `${Math.min(100, category.percentage)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Subcategories Body */}
      <div className="p-5 flex-1 space-y-3">
        <span className="text-[12px] font-bold text-content-muted uppercase tracking-wider block select-none">
          Subcategorias ({category.subcategories.length})
        </span>
        <div className="flex flex-wrap gap-1.5">
          {category.subcategories.map((sub) => (
            <span
              key={sub.id}
              className="group flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 bg-navy-50 border border-stroke text-content-body hover:text-rose-400 hover:border-rose-500/30 rounded-lg font-mono transition-all select-none"
            >
              <span>{sub.name}</span>
              <button
                onClick={() => onRemoveSub(category.id, sub.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-400 cursor-pointer focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {addingSubToId === category.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="Sub..."
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSub();
                  if (e.key === "Escape") setAddingSubToId("");
                }}
                className="bg-navy-950/60 border border-stroke rounded-lg px-2 py-0.5 text-[12px] font-mono focus:outline-none focus:border-cyan-500 text-content-title w-24"
              />
              <button
                onClick={handleAddSub}
                className="p-0.5 hover:bg-cyan-500/20 text-cyan-400 rounded cursor-pointer"
              >
                ✔
              </button>
              <button
                onClick={() => setAddingSubToId("")}
                className="p-0.5 hover:bg-rose-500/20 text-rose-400 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubToId(category.id)}
              className="flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 border border-stroke/70 border-dashed hover:border-cyan-400 text-content-muted hover:text-cyan-400 rounded-lg font-mono transition-all cursor-pointer focus:outline-none"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Sub</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 border-t border-gray-500  flex justify-end gap-2.5">
        <button
          onClick={() => onAdjustLimit(category.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 hover:bg-navy-900 border border-stroke text-[12px] font-bold rounded-lg text-content-body hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer focus:outline-none dark:bg-gray-950 dark:border-gray-500"
        >
          <Sliders className="w-3 h-3" />
          <span>Orçamento</span>
        </button>

        {category.source === "CUSTOM" && (
          <>
            <button
              onClick={() => onEdit(category)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 hover:bg-navy-900 border border-stroke text-[12px] font-bold rounded-lg text-content-body hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer focus:outline-none dark:bg-gray-950 dark:border-gray-500"
            >
              <Edit2 className="w-3 h-3" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-transparent hover:border-rose-500/30 rounded-lg transition-all cursor-pointer focus:outline-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
