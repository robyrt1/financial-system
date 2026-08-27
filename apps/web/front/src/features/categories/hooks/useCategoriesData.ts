import { useState, useEffect } from "react";
import { api } from "../../../app/api";

export type CategoryType = "EXPENSE" | "INCOME" | "INVESTMENT";
export type CategorySource = "SYSTEM" | "CUSTOM";

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  source: CategorySource;
  color: string;
  iconName: string;
  budgetLimit: number | null;
  spent: number;
  percentage: number;
  status: "SAFE" | "WARNING" | "DANGER";
  subcategories: Subcategory[];
}

interface CategoryResponseDto {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  isSystem: boolean;
  budgetLimit: number | null;
  spentAmount: number;
  percentage: number;
  status: "SAFE" | "WARNING" | "DANGER";
  subcategories: { id: string; name: string }[];
}

export function useCategoriesData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CategoryResponseDto[]>("/categories");

      const mappedCategories: Category[] = response.data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type as CategoryType,
        source: cat.isSystem ? "SYSTEM" : "CUSTOM",
        color: cat.color,
        iconName: cat.icon,
        budgetLimit: cat.budgetLimit,
        spent: cat.spentAmount,
        percentage: cat.percentage,
        status: cat.status,
        subcategories: cat.subcategories,
      }));

      setCategories(mappedCategories);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Falha ao carregar informações das categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (newCategory: {
    name: string;
    type: CategoryType;
    iconName: string;
    color: string;
    budgetLimit: number | null;
  }) => {
    await api.post("/categories", {
      name: newCategory.name,
      type: newCategory.type,
      icon: newCategory.iconName,
      color: newCategory.color,
      budgetLimit: newCategory.budgetLimit,
    });
    await fetchCategories();
  };

  const handleUpdateCategory = async (
    categoryId: string,
    updateData: { name: string; iconName: string; color: string },
  ) => {
    await api.patch(`/categories/${categoryId}`, {
      name: updateData.name,
      icon: updateData.iconName,
      color: updateData.color,
    });
    await fetchCategories();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await api.delete(`/categories/${categoryId}`);
    await fetchCategories();
  };

  const handleUpdateBudgetLimit = async (
    categoryId: string,
    budgetLimit: number | null,
  ) => {
    await api.patch(`/categories/${categoryId}/budget`, {
      budgetLimit,
    });
    await fetchCategories();
  };

  const handleCreateSubcategory = async (categoryId: string, name: string) => {
    await api.post(`/categories/${categoryId}/subcategories`, {
      name,
    });
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleUpdateBudgetLimit,
    handleCreateSubcategory,
  };
}
