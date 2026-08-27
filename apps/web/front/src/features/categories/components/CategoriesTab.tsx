import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import CategoryCard from "./CategoryCard";
import CategoryFormModal from "./CategoryFormModal";
import BudgetLimitModal from "./BudgetLimitModal";
import { useCategoriesData } from "../hooks/useCategoriesData";
import type { Category, CategoryType } from "../hooks/useCategoriesData";

export default function CategoriesTab() {
  const {
    categories,
    loading,
    error,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleUpdateBudgetLimit,
    handleCreateSubcategory,
  } = useCategoriesData();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterSource, setFilterSource] = useState<string>("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

  const [adjustLimitId, setAdjustLimitId] = useState("");
  const [addingSubToId, setAddingSubToId] = useState("");

  const handleOpenCreateModal = () => {
    setSelectedCat(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setSelectedCat(cat);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSaveCategory = async (data: {
    name: string;
    type: CategoryType;
    color: string;
    iconName: string;
    budgetLimit: number | null;
  }) => {
    if (isEditing && selectedCat) {
      await handleUpdateCategory(selectedCat.id, data);
    } else {
      await handleCreateCategory(data);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Deseja realmente remover esta categoria personalizada?")
    ) {
      await handleDeleteCategory(id);
    }
  };

  const handleAddSub = async (catId: string, subName: string) => {
    await handleCreateSubcategory(catId, subName);
  };

  const handleRemoveSub = async (_catId: string, _subId: string) => {
    // We don't have a specific backend endpoint for removing a subcategory implemented yet,
    // but the backend requires it. Let's add an alert for now if missing.
    alert("Delete subcategory is not implemented in the backend yet.");
  };

  const handleSaveBudgetLimit = async (limit: number) => {
    await handleUpdateBudgetLimit(adjustLimitId, limit);
    setAdjustLimitId("");
  };

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subcategories.some((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );

    const matchesType = filterType === "ALL" || c.type === filterType;
    const matchesSource =
      filterSource === "ALL" ||
      (filterSource === "SYSTEM" && c.source === "SYSTEM") ||
      (filterSource === "CUSTOM" && c.source === "CUSTOM");

    return matchesSearch && matchesType && matchesSource;
  });

  const getAdjustLimitInitial = () => {
    const matched = categories.find((c) => c.id === adjustLimitId);
    return matched ? matched.budgetLimit || 0 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stroke pb-5 select-none">
        <div>
          <h1 className="text-2xl font-bold text-content-title tracking-tight font-sans uppercase">
            Gestão de Categorias e Orçamentos
          </h1>
          <p className="text-xs text-content-muted mt-1 font-mono">
            Gerencie tetos mensais, taxonomias de custos e subcategorias do
            sistema.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/10 cursor-pointer focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Control Bar & Quick Filters */}
      <Card className="p-4 select-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: "Todas", value: "ALL" },
              { label: "Despesas", value: "EXPENSE" },
              { label: "Receitas", value: "INCOME" },
              { label: "Investimentos", value: "INVESTMENT" },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setFilterType(p.value)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  filterType === p.value
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-surface-base border-stroke text-content-body hover:bg-surface-hover"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-surface-base border border-stroke rounded-xl px-3 py-2 text-xs text-content-title font-sans focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer w-full md:w-44"
            >
              <option value="ALL">Todas as Origens</option>
              <option value="SYSTEM">Padrão do Sistema</option>
              <option value="CUSTOM">Minhas Categorias</option>
            </select>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-content-muted" />
              <input
                type="text"
                placeholder="Pesquisar categoria ou sub..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-base border border-stroke rounded-xl pl-9 pr-4 py-2 text-xs text-content-title font-sans focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Grid Layout Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <Card className="col-span-full p-10 text-center text-content-muted select-none text-xs">
            Carregando categorias...
          </Card>
        ) : error ? (
          <Card className="col-span-full p-10 text-center text-rose-500 select-none text-xs">
            {error}
          </Card>
        ) : filteredCategories.length === 0 ? (
          <Card className="col-span-full p-10 text-center text-content-muted select-none text-xs">
            Nenhuma categoria financeira coincide com a busca ou filtros
            selecionados.
          </Card>
        ) : (
          filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onDelete={handleDelete}
              onEdit={handleOpenEditModal}
              onAdjustLimit={setAdjustLimitId}
              onAddSub={handleAddSub}
              onRemoveSub={handleRemoveSub}
              addingSubToId={addingSubToId}
              setAddingSubToId={setAddingSubToId}
            />
          ))
        )}
      </div>

      {/* Budget Limit Modals */}
      <BudgetLimitModal
        isOpen={!!adjustLimitId}
        onClose={() => setAdjustLimitId("")}
        onSubmit={handleSaveBudgetLimit}
        initialLimit={getAdjustLimitInitial()}
      />

      {/* Category Creation / Editing Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveCategory}
        initialData={selectedCat}
      />
    </div>
  );
}
