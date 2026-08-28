import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Check,
  Calendar,
  Wallet,
  X,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../app/api";

interface BankAccount {
  id: string;
  name: string;
  balance: number;
}

interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  destinationAccountId: string | null;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  status: "SETTLED" | "PENDING" | "SCHEDULED";
  date: string;
  tags: string[];
  createdAt: string;
}

interface SummaryMetrics {
  totalIncomes: number;
  totalExpenses: number;
  netBalance: number;
}

export default function TransactionsTab() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryMetrics>({
    totalIncomes: 0,
    totalExpenses: 0,
    netBalance: 0,
  });

  // Filters State
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [accountId, setAccountId] = useState<string>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
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
    date: new Date().toISOString().split("T")[0],
    tags: "",
  });

  // Fetch Accounts list
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

  // Fetch Credit Cards list
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

  // Fetch Categories list
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

  // Fetch Transactions list
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, any> = {
        page,
        limit,
      };
      if (search) queryParams.search = search;
      if (type !== "ALL") queryParams.type = type;
      if (status !== "ALL") queryParams.status = status;
      if (accountId !== "ALL") queryParams.accountId = accountId;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;

      const response = await api.get<{
        data: Transaction[];
        total: number;
        page: number;
        totalPages: number;
        summary: SummaryMetrics;
      }>("/transactions", { params: queryParams });

      setTransactions(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
      setSummary(response.data.summary);
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCards();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, type, status, accountId, startDate, endDate]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchTransactions();
    }
  };

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
        date: newTx.date,
        tags: tagsArray,
        paymentMethod: newTx.paymentMethod,
        installments:
          newTx.paymentMethod === "CREDIT_CARD" ? newTx.installments : 1,
      });

      // Reset state and reload
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
        installments: 1,
        date: new Date().toISOString().split("T")[0],
        tags: "",
      });
      setIsModalOpen(false);
      fetchTransactions();
      fetchAccounts(); // Balance might have changed
      fetchCards(); // Limit might have changed
    } catch (err) {
      console.error("Erro ao criar transação:", err);
    }
  };

  const handleToggleSettle = async (id: string, currentStatus: string) => {
    if (currentStatus === "SETTLED") return;
    try {
      await api.patch(`/transactions/${id}`, { status: "SETTLED" });
      fetchTransactions();
      fetchAccounts();
    } catch (err) {
      console.error("Erro ao liquidar transação:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta transação?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
      fetchAccounts();
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
    }
  };

  const handleBulkAction = async (action: "SETTLE" | "DELETE") => {
    if (selectedIds.length === 0) return;
    if (
      action === "DELETE" &&
      !window.confirm(
        `Deseja excluir ${selectedIds.length} transações selecionadas?`,
      )
    )
      return;

    try {
      await api.post("/transactions/bulk", {
        transactionIds: selectedIds,
        action,
      });
      setSelectedIds([]);
      fetchTransactions();
      fetchAccounts();
    } catch (err) {
      console.error("Erro ao executar ação em lote:", err);
    }
  };

  const handleExport = async (format: "csv" | "ofx") => {
    try {
      const queryParams: Record<string, any> = { format };
      if (search) queryParams.search = search;
      if (type !== "ALL") queryParams.type = type;
      if (status !== "ALL") queryParams.status = status;
      if (accountId !== "ALL") queryParams.accountId = accountId;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;

      const response = await api.get("/transactions/export", {
        params: queryParams,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: format === "csv" ? "text/csv" : "text/xml",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `extrato-${new Date().toISOString().substring(0, 10)}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Erro ao exportar extrato:", err);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(transactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const getSelectedTotalAmount = () => {
    return transactions
      .filter((t) => selectedIds.includes(t.id))
      .reduce((sum, t) => {
        if (t.type === "EXPENSE") return sum - t.amount;
        if (t.type === "INCOME") return sum + t.amount;
        return sum;
      }, 0);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
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

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stroke pb-5 select-none">
        <div>
          <h1 className="text-2xl font-bold text-content-title tracking-tight font-sans uppercase">
            Extrato & Gestão de Transações
          </h1>
          <p className="text-md text-content-muted mt-1 font-mono">
            Histórico consolidado, conciliação e exportação de fluxos.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl text-md transition-all shadow-lg shadow-cyan-500/10 cursor-pointer focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Transação</span>
        </button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
        <Card className="p-4 border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">
            Total de Entradas
          </p>
          <h3 className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {formatCurrency(summary.totalIncomes)}
          </h3>
        </Card>
        <Card className="p-4 border-l-4 border-rose-500">
          <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">
            Total de Saídas
          </p>
          <h3 className="text-xl font-bold text-rose-400 font-mono tabular-nums mt-1">
            {formatCurrency(summary.totalExpenses)}
          </h3>
        </Card>
        <Card className="p-4 border-l-4 border-cyan-400">
          <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">
            Saldo Líquido
          </p>
          <h3
            className={`text-xl font-bold font-mono tabular-nums mt-1 ${summary.netBalance >= 0 ? "text-cyan-400" : "text-rose-400"}`}
          >
            {formatCurrency(summary.netBalance)}
          </h3>
        </Card>
      </div>

      {/* 3. Control Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-4 py-2 text-md text-content-title font-sans focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Type Filter */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-base border border-stroke rounded-xl px-3 py-2 text-md text-content-title font-sans focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Tipos (Todos)</option>
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
              <option value="TRANSFER">Transferência</option>
            </select>
          </div>

          {/* Account Selector */}
          <div className="relative">
            <select
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-base border border-stroke rounded-xl px-3 py-2 text-md text-content-title font-sans focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Contas (Todas)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-base border border-stroke rounded-xl px-3 py-2 text-md text-content-title font-sans focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Status (Todos)</option>
              <option value="SETTLED">Liquidado</option>
              <option value="PENDING">Pendente</option>
              <option value="SCHEDULED">Agendado</option>
            </select>
          </div>

          {/* Export Options */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-navy-950/40 hover:bg-navy-900 border border-stroke hover:border-cyan-500/30 text-content-body hover:text-cyan-400 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport("ofx")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-navy-950/40 hover:bg-navy-900 border border-stroke hover:border-cyan-500/30 text-content-body hover:text-cyan-400 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>OFX</span>
            </button>
          </div>
        </div>

        {/* Date Ranges Row */}
        <div className="mt-3 pt-3 border-t border-stroke/50 flex flex-wrap items-center gap-4 text-md text-content-muted select-none">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Período de:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-surface-base border border-stroke rounded-lg px-2.5 py-1 text-md text-content-title font-mono focus:outline-none focus:border-cyan-500"
            />
            <span>Até:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-surface-base border border-stroke rounded-lg px-2.5 py-1 text-md text-content-title font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="text-rose-400 hover:text-rose-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Limpar datas
            </button>
          )}
        </div>
      </Card>

      {/* 4. Batch Operations Panel */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center justify-between animate-fadeIn text-md select-none">
          <div className="flex items-center gap-3 text-cyan-400">
            <span className="font-bold">{selectedIds.length} selecionados</span>
            <span className="text-[10px] opacity-75 font-mono">
              (Total da Seleção: {formatCurrency(getSelectedTotalAmount())})
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("SETTLE")}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-400 hover:text-navy-950 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
            >
              Liquidar em Lote
            </button>
            <button
              onClick={() => handleBulkAction("DELETE")}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 border border-rose-500/40 text-rose-400 hover:text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer"
            >
              Excluir em Lote
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-md">
            <thead>
              <tr className=" border-b border-stroke text-content-muted select-none">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      transactions.length > 0 &&
                      selectedIds.length === transactions.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-stroke text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-bold uppercase tracking-wider">Data</th>
                <th className="p-4 font-bold uppercase tracking-wider">
                  Descrição / Tags
                </th>
                <th className="p-4 font-bold uppercase tracking-wider">Tipo</th>
                <th className="p-4 font-bold uppercase tracking-wider">
                  Conta
                </th>
                <th className="p-4 font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">
                  Valor
                </th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-10 text-center text-cyan-400 font-mono text-md"
                  >
                    Carregando transações corporativas...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-10 text-center text-content-muted font-sans text-md"
                  >
                    Nenhuma transação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isExpense = t.type === "EXPENSE";
                  const isTransfer = t.type === "TRANSFER";
                  const valueClass = isExpense
                    ? "text-rose-400"
                    : isTransfer
                      ? "text-cyan-400"
                      : "text-emerald-400";
                  const valuePrefix = isExpense ? "-" : isTransfer ? "⇄" : "+";

                  // Type badges
                  const typeLabel = {
                    INCOME: "Receita",
                    EXPENSE: "Despesa",
                    TRANSFER: "Transferência",
                  }[t.type];

                  const typeColor = {
                    INCOME:
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    EXPENSE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    TRANSFER: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                  }[t.type];

                  // Status badges
                  const statusLabel = {
                    SETTLED: "Liquidado",
                    PENDING: "Pendente",
                    SCHEDULED: "Agendado",
                  }[t.status];

                  const statusColor = {
                    SETTLED: "bg-emerald-500/10 text-emerald-400",
                    PENDING: "bg-amber-500/10 text-amber-400 animate-pulse",
                    SCHEDULED: "bg-cyan-500/10 text-cyan-400",
                  }[t.status];

                  const currentAccount = accounts.find(
                    (a) => a.id === t.accountId,
                  );
                  const destAccount = accounts.find(
                    (a) => a.id === t.destinationAccountId,
                  );

                  return (
                    <tr
                      key={t.id}
                      className="border-b border-stroke/50 hover:bg-surface-hover/30 transition-all group"
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(t.id)}
                          onChange={(e) =>
                            handleSelectOne(t.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-stroke text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                        />
                      </td>

                      {/* Date */}
                      <td className="p-4 font-mono tabular-nums text-content-muted">
                        {formatDate(t.date)}
                      </td>

                      {/* Description / Tags */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-content-title group-hover:text-cyan-400 transition-colors">
                            {t.description}
                          </span>
                          {t.tags && t.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {t.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-bold px-1.5 py-0.5 bg-navy-50 border border-stroke/75 text-content-muted rounded font-mono leading-none"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-4 select-none">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${typeColor}`}
                        >
                          {typeLabel}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="p-4 flex items-center gap-2 select-none mt-2">
                        <Wallet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-medium text-content-body">
                          {currentAccount?.name || "Desconhecido"}
                          {isTransfer && destAccount && (
                            <span className="text-cyan-400 font-mono text-[10px] ml-1">
                              ➔ {destAccount.name}
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 select-none">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* Value */}
                      <td
                        className={`p-4 text-right font-mono tabular-nums font-bold ${valueClass}`}
                      >
                        {valuePrefix} {formatCurrency(t.amount)}
                      </td>

                      {/* Hover Actions */}
                      <td className="p-4 text-right w-16">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.status !== "SETTLED" && (
                            <button
                              onClick={() => handleToggleSettle(t.id, t.status)}
                              title="Liquidar Transação"
                              className="p-1 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded transition-all cursor-pointer focus:outline-none"
                            >
                              <Check className="w-4.5 h-4.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(t.id)}
                            title="Excluir Transação"
                            className="p-1 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition-all cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Footer & Pagination Panel */}
        <div className="p-4 bg-navy-50/20 border-t border-stroke flex items-center justify-between text-md text-content-muted select-none">
          <div>
            Mostrando{" "}
            <strong className="text-content-title font-mono">
              {transactions.length}
            </strong>{" "}
            de <strong className="text-content-title font-mono">{total}</strong>{" "}
            transações.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-stroke rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-30 disabled:hover:border-stroke disabled:hover:text-content-muted transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="font-mono text-content-title">
              Pág. {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 border border-stroke rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-30 disabled:hover:border-stroke disabled:hover:text-content-muted transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* 7. New Transaction Creator Modal (Coded Custom Inline for accuracy) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-panel border border-stroke rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stroke">
              <h3 className="font-bold text-content-title uppercase tracking-wider text-sm">
                Nova Transação Corporativa
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                <div className="flex gap-4 items-center justify-between p-3 bg-navy-50 border border-stroke rounded-xl select-none">
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
              )}

              {/* Limit Exceeded Alert */}
              {limitExceeded && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold rounded-xl select-none animate-fadeIn">
                  Aviso: O valor excede o limite disponível do cartão
                  selecionado (Disponível:{" "}
                  {formatCurrency(selectedCard?.availableLimit || 0)}).
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
                  onClick={() => setIsModalOpen(false)}
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
      )}
    </div>
  );
}
