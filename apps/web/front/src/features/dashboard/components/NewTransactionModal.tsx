import React, { useState } from "react";
import { ShieldCheck, Plus, X } from "lucide-react";

export interface NewTransactionData {
  name: string;
  category: string;
  value: string;
  type: "income" | "expense";
  account: string;
}

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTransactionData) => void;
}

export function NewTransactionModal({
  isOpen,
  onClose,
  onSubmit,
}: NewTransactionModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [value, setValue] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [account, setAccount] = useState("Carteira Digital");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    onSubmit({
      name,
      category,
      value: parseFloat(value).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      }),
      type,
      account,
    });

    // Reset Form
    setName("");
    setValue("");
    onClose();
  };

  const categories = [
    "Alimentação",
    "Moradia / Aluguel",
    "Cybersecurity / Softwares",
    "Investimentos",
    "Transporte",
    "Outros",
  ];

  const accounts = [
    "Carteira Digital",
    "Banco Principal",
    "Investimentos Crypto",
    "Reserva de Emergência",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Form Card */}
      <div className="relative w-full max-w-md bg-surface-card border border-stroke rounded-2xl shadow-glow overflow-hidden flex flex-col z-10 animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stroke flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="font-bold text-sm text-content-title uppercase tracking-wider">
              Nova Transação
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-content-muted hover:text-content-title hover:bg-surface-base rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector (Tabs) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-base border border-stroke rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-rose-500 text-white shadow"
                  : "text-content-body hover:bg-surface-hover"
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === "income"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-content-body hover:bg-surface-hover"
              }`}
            >
              Receita
            </button>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold uppercase tracking-wider text-content-muted">
              Descrição
            </label>
            <input
              type="text"
              required
              className="w-full py-2.5 px-3 bg-surface-base border border-stroke rounded-xl text-xs text-content-title focus:outline-none focus:border-cyan-400"
              placeholder="Ex: Assinatura Cloud RMTECH"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Value */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold uppercase tracking-wider text-content-muted">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full py-2.5 px-3 bg-surface-base border border-stroke rounded-xl text-xs font-mono text-content-title focus:outline-none focus:border-cyan-400"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          {/* Row: Category & Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-content-muted">
                Categoria
              </label>
              <select
                className="w-full py-2.5 px-3 bg-surface-base border border-stroke rounded-xl text-xs text-content-title focus:outline-none focus:border-cyan-400"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-content-muted">
                Conta
              </label>
              <select
                className="w-full py-2.5 px-3 bg-surface-base border border-stroke rounded-xl text-xs text-content-title focus:outline-none focus:border-cyan-400"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              >
                {accounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cybersecurity Audit notice */}
          <div className="p-3 bg-cyan-400/5 border border-cyan-400/20 rounded-xl text-[12px] text-cyan-400 flex items-start gap-2 select-none">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>
              <strong>Criptografia Ativa:</strong> Esta transação receberá uma
              assinatura hash digital de integridade e será auditada pelo
              gateway de segurança.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stroke text-content-body hover:bg-surface-hover text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-navy-950 text-xs font-bold rounded-xl shadow-glow transition-all cursor-pointer"
            >
              Confirmar Transação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
