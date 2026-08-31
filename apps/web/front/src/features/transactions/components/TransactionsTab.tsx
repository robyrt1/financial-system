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
import { NewTransactionModal } from "./NewTransactionModal";

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
  subcategoryId?: string | null;
  destinationAccountId: string | null;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  status: "SETTLED" | "PENDING" | "SCHEDULED";
  date: string;
  tags: string[];
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
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
  const [filterCategoryId, setFilterCategoryId] = useState<string>("ALL");
  const [filterSubcategoryId, setFilterSubcategoryId] = useState<string>("ALL");
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

  // Fetch Accounts list
  const fetchAccounts = async () => {
    try {
      const response = await api.get<BankAccount[]>("/accounts");
      setAccounts(response.data);
    } catch (err) {
      console.error("Erro ao buscar contas:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<any[]>("/categories");
      setCategories(response.data);
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
      if (filterCategoryId !== "ALL") queryParams.categoryId = filterCategoryId;
      if (filterSubcategoryId !== "ALL")
        queryParams.subcategoryId = filterSubcategoryId;
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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    page,
    type,
    status,
    accountId,
    filterCategoryId,
    filterSubcategoryId,
    startDate,
    endDate,
  ]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchTransactions();
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
      if (filterCategoryId !== "ALL") queryParams.categoryId = filterCategoryId;
      if (filterSubcategoryId !== "ALL")
        queryParams.subcategoryId = filterSubcategoryId;
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full select-none">
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
        <div className="flex flex-col md:flex-row flex-wrap gap-3 items-stretch md:items-center w-full">
          {/* Search Box */}
          <div className="flex-1 md:flex-[2] min-w-0 relative">
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
          <div className="flex-1 relative min-w-[120px]">
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
          <div className="flex-1 relative min-w-[120px]">
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
          <div className="flex-1 relative min-w-[120px]">
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

          {/* Category Filter */}
          <div className="flex-1 relative min-w-[120px]">
            <select
              value={filterCategoryId}
              onChange={(e) => {
                setFilterCategoryId(e.target.value);
                setFilterSubcategoryId("ALL");
                setPage(1);
              }}
              className="w-full bg-surface-base border border-stroke rounded-xl px-3 py-2 text-md text-content-title font-sans focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Categoria (Todas)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div className="flex-1 relative min-w-[120px]">
            <select
              disabled={
                filterCategoryId === "ALL" ||
                !(
                  categories.find((c) => c.id === filterCategoryId)
                    ?.subcategories?.length > 0
                )
              }
              value={filterSubcategoryId}
              onChange={(e) => {
                setFilterSubcategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-base border border-stroke rounded-xl px-3 py-2 text-md text-content-title font-sans focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="ALL">
                {filterCategoryId === "ALL"
                  ? "Subcategoria (Todas)"
                  : !(
                        categories.find((c) => c.id === filterCategoryId)
                          ?.subcategories?.length > 0
                      )
                    ? "Nenhuma subcategoria"
                    : "Subcategoria (Todas)"}
              </option>
              {filterCategoryId !== "ALL" &&
                (
                  categories.find((c) => c.id === filterCategoryId)
                    ?.subcategories || []
                ).map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Export Options */}
          <div className="flex gap-2 justify-end shrink-0 w-full md:w-auto">
            <button
              onClick={() => handleExport("csv")}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-navy-950/40 hover:bg-navy-900 border border-stroke hover:border-cyan-500/30 text-content-body hover:text-cyan-400 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport("ofx")}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-navy-950/40 hover:bg-navy-900 border border-stroke hover:border-cyan-500/30 text-content-body hover:text-cyan-400 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>OFX</span>
            </button>
          </div>
        </div>

        {/* Date Ranges Row */}
        <div className="mt-3 pt-3 border-t border-stroke/50 flex flex-col sm:flex-row sm:items-center gap-3 text-md text-content-muted select-none">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Período de:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-surface-base border border-stroke rounded-lg px-2.5 py-1 text-md text-content-title font-mono focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            />
            <span>Até:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-surface-base border border-stroke rounded-lg px-2.5 py-1 text-md text-content-title font-mono focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
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
        <div className="w-full overflow-x-auto rounded-xl border border-stroke">
          <table className="w-full text-left border-collapse font-sans text-md min-w-[750px]">
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
                <th className="p-4 font-bold uppercase tracking-wider">
                  Categoria
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
                    colSpan={9}
                    className="p-10 text-center text-cyan-400 font-mono text-md"
                  >
                    Carregando transações corporativas...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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

                      {/* Category Badge */}
                      <td className="p-4 text-content-body font-medium select-none">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[10px] uppercase tracking-wide bg-navy-50 dark:bg-navy-950 px-2 py-0.5 rounded border border-stroke text-content-title inline-block w-fit">
                            {t.category?.name || "Geral"}
                          </span>
                          {t.subcategory && (
                            <span className="text-[10px] text-cyan-400 font-semibold font-mono pl-1">
                              ↳ {t.subcategory.name}
                            </span>
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

      {isModalOpen && (
        <NewTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchTransactions();
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
}
