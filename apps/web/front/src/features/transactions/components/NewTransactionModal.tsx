import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../../../app/api";

export interface NewTransactionData {
  name: string;
  category: string;
  value: string;
  type: "income" | "expense";
  account: string;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: NewTransactionModalProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [newTx, setNewTx] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE" | "TRANSFER",
    status: "SETTLED" as "SETTLED" | "PENDING" | "SCHEDULED",
    accountId: "",
    destinationAccountId: "",
    paymentMethod: "ACCOUNT" as "ACCOUNT" | "CREDIT_CARD",
    creditCardId: "",
    installments: 1,
    categoryId: "",
    subcategoryId: "",
    date: new Date().toISOString().split("T")[0],
    tags: "",
  });

  const fetchAccounts = async () => {
    try {
      const response = await api.get<BankAccount[]>("/accounts");
      setAccounts(response.data);
      if (response.data.length > 0 && !newTx.accountId) {
        setNewTx((prev) => ({ ...prev, accountId: response.data[0].id }));
      }
    } catch (err) {
      console.error("Erro ao buscar contas:", err);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await api.get<any[]>("/credit-cards");
      setCards(response.data);
      if (response.data.length > 0 && !newTx.creditCardId) {
        setNewTx((prev) => ({ ...prev, creditCardId: response.data[0].id }));
      }
    } catch (err) {
      console.error("Erro ao buscar cartões:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<any[]>("/categories");
      setCategories(response.data);
      if (response.data.length > 0 && !newTx.categoryId) {
        setNewTx((prev) => ({ ...prev, categoryId: response.data[0].id }));
      }
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      fetchCards();
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const isCreditCard =
    newTx.type === "EXPENSE" && newTx.paymentMethod === "CREDIT_CARD";
  const selectedCard = isCreditCard
    ? cards.find((c) => c.id === newTx.creditCardId) || cards[0]
    : null;
  const limitExceeded =
    isCreditCard &&
    selectedCard &&
    newTx.amount &&
    parseFloat(newTx.amount) > parseFloat(selectedCard.availableLimit);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;

    if (newTx.paymentMethod === "ACCOUNT" && !newTx.accountId) return;
    if (newTx.paymentMethod === "CREDIT_CARD" && !newTx.creditCardId) return;

    try {
      const tagsArray = newTx.tags
        ? newTx.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      await api.post("/transactions", {
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        type: newTx.type,
        status: newTx.status,
        accountId:
          newTx.paymentMethod === "ACCOUNT" ? newTx.accountId : undefined,
        creditCardId:
          newTx.paymentMethod === "CREDIT_CARD"
            ? newTx.creditCardId
            : undefined,
        destinationAccountId:
          newTx.type === "TRANSFER" ? newTx.destinationAccountId : null,
        categoryId: newTx.type !== "TRANSFER" ? newTx.categoryId || null : null,
        subcategoryId:
          newTx.type !== "TRANSFER" ? newTx.subcategoryId || null : null,
        date: newTx.date,
        tags: tagsArray,
        paymentMethod: newTx.paymentMethod,
        installments:
          newTx.paymentMethod === "CREDIT_CARD" ? newTx.installments : 1,
      });

      // Reset state and call callbacks
      setNewTx({
        description: "",
        amount: "",
        type: "EXPENSE",
        status: "SETTLED",
        accountId: accounts[0]?.id || "",
        destinationAccountId: "",
        paymentMethod: "ACCOUNT",
        creditCardId: cards[0]?.id || "",
        categoryId: categories[0]?.id || "",
        subcategoryId: "",
        installments: 1,
        date: new Date().toISOString().split("T")[0],
        tags: "",
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao criar transação:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-panel border border-stroke rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke">
          <h3 className="font-bold text-content-title uppercase tracking-wider text-sm">
            Nova Transação Corporativa
          </h3>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-title cursor-pointer focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
          {/* Type Select */}
          <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
            {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setNewTx((prev) => ({
                    ...prev,
                    type: t,
                    paymentMethod:
                      t === "EXPENSE" ? prev.paymentMethod : "ACCOUNT",
                  }))
                }
                className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  newTx.type === t
                    ? t === "EXPENSE"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : t === "INCOME"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-surface-base border-stroke text-content-body hover:bg-surface-hover"
                }`}
              >
                {t === "EXPENSE"
                  ? "Despesa"
                  : t === "INCOME"
                    ? "Receita"
                    : "Transferência"}
              </button>
            ))}
          </div>

          {/* Payment Method Selector (Conditional on Expense) */}
          {newTx.type === "EXPENSE" && (
            <div className="flex gap-4 items-center justify-between p-3 bg-navy-50 border border-stroke rounded-xl select-none dark:bg-navy-950">
              <span className="text-[12px] font-bold text-content-muted uppercase">
                Forma de Liquidação
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNewTx((prev) => ({
                      ...prev,
                      paymentMethod: "ACCOUNT",
                    }))
                  }
                  className={`px-3 py-1 rounded-lg font-semibold text-[12px] border transition-all cursor-pointer ${
                    newTx.paymentMethod === "ACCOUNT"
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      : "bg-transparent border-transparent text-content-body hover:text-content-title"
                  }`}
                >
                  Conta / Débito
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewTx((prev) => ({
                      ...prev,
                      paymentMethod: "CREDIT_CARD",
                      status: "SETTLED",
                    }))
                  }
                  className={`px-3 py-1 rounded-lg font-semibold text-[11px] border transition-all cursor-pointer ${
                    newTx.paymentMethod === "CREDIT_CARD"
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      : "bg-transparent border-transparent text-content-body hover:text-content-title"
                  }`}
                >
                  Cartão de Crédito
                </button>
              </div>
            </div>
          )}

          {/* Description & Amount */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Descrição
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Assinatura Google Cloud"
                value={newTx.description}
                onChange={(e) =>
                  setNewTx((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Valor (BRL)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="1500.00"
                value={newTx.amount}
                onChange={(e) =>
                  setNewTx((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-md text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Category (Not for Transfer) */}
          {newTx.type !== "TRANSFER" && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-content-muted uppercase">
                  Categoria
                </label>
                <select
                  required
                  value={newTx.categoryId}
                  onChange={(e) =>
                    setNewTx((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                      subcategoryId: "",
                    }))
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories
                    .filter((c) => c.type === "ALL" || c.type === newTx.type)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-content-muted uppercase">
                  Subcategoria
                </label>
                <select
                  disabled={
                    !newTx.categoryId ||
                    !(
                      categories.find((c) => c.id === newTx.categoryId)
                        ?.subcategories?.length > 0
                    )
                  }
                  value={newTx.subcategoryId}
                  onChange={(e) =>
                    setNewTx((prev) => ({
                      ...prev,
                      subcategoryId: e.target.value,
                    }))
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!newTx.categoryId
                      ? "Selecione uma categoria primeiro..."
                      : !(
                            categories.find((c) => c.id === newTx.categoryId)
                              ?.subcategories?.length > 0
                          )
                        ? "Nenhuma subcategoria cadastrada"
                        : "Selecione uma subcategoria..."}
                  </option>
                  {(
                    categories.find((c) => c.id === newTx.categoryId)
                      ?.subcategories || []
                  ).map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Limit Exceeded Alert */}
          {limitExceeded && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold rounded-xl select-none animate-fadeIn">
              Aviso: O valor excede o limite disponível do cartão selecionado
              (Disponível: {formatCurrency(selectedCard?.availableLimit || 0)}).
            </div>
          )}

          {/* Source Account/Card & Destination Account (if Transfer) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                {newTx.paymentMethod === "CREDIT_CARD"
                  ? "Cartão de Crédito"
                  : "Conta Origem"}
              </label>
              {newTx.paymentMethod === "CREDIT_CARD" ? (
                <select
                  value={newTx.creditCardId}
                  onChange={(e) =>
                    setNewTx((prev) => ({
                      ...prev,
                      creditCardId: e.target.value,
                    }))
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.cardName} ({card.maskedDigits}) - Disp:{" "}
                      {formatCurrency(card.availableLimit)}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={newTx.accountId}
                  onChange={(e) =>
                    setNewTx((prev) => ({
                      ...prev,
                      accountId: e.target.value,
                    }))
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                {newTx.type === "TRANSFER"
                  ? "Conta Destino"
                  : newTx.paymentMethod === "CREDIT_CARD"
                    ? "Parcelas"
                    : "Status"}
              </label>
              {newTx.type === "TRANSFER" ? (
                <select
                  required
                  value={newTx.destinationAccountId}
                  onChange={(e) =>
                    setNewTx((prev) => ({
                      ...prev,
                      destinationAccountId: e.target.value,
                    }))
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {accounts
                    .filter((a) => a.id !== newTx.accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              ) : newTx.paymentMethod === "CREDIT_CARD" ? (
                <select
                  value={newTx.installments}
                  onChange={(e) =>
                    setNewTx((prev) => ({
                      ...prev,
                      installments: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer font-mono"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                    const installmentValue = newTx.amount
                      ? (parseFloat(newTx.amount) / n).toFixed(2)
                      : "0.00";
                    return (
                      <option key={n} value={n}>
                        {n}x de R$ {installmentValue}{" "}
                        {n === 1 ? "(à vista)" : ""}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <select
                  value={newTx.status}
                  onChange={(e) =>
                    setNewTx((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="SETTLED">Liquidado</option>
                  <option value="PENDING">Pendente</option>
                  <option value="SCHEDULED">Agendado</option>
                </select>
              )}
            </div>
          </div>

          {/* Date & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Data
              </label>
              <input
                type="date"
                required
                value={newTx.date}
                onChange={(e) =>
                  setNewTx((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="saas, cloud, marketing"
                value={newTx.tags}
                onChange={(e) =>
                  setNewTx((prev) => ({ ...prev, tags: e.target.value }))
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-[12px] text-content-title focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stroke text-content-body hover:text-content-title hover:border-cyan-500/40 rounded-xl text-[12px] font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!limitExceeded}
              className={`px-4 py-2 font-bold rounded-xl text-[12px] cursor-pointer shadow-lg transition-all ${
                limitExceeded
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none"
                  : "bg-cyan-500 hover:bg-cyan-600 text-navy-950 shadow-cyan-500/10"
              }`}
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
