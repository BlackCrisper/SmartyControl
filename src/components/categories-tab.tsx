"use client";

import { useState } from "react";
import CategoryForm from "@/components/category-form";
import CategoriesList from "@/components/categories-list";
import { Toaster } from "sonner";
import { Category } from "@/lib/db/sqlserver-operations";

export default function CategoriesTab() {
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh the categories list
  const handleCategorySaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setCategoryToEdit(null);
  };

  // Function to edit a category
  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setCategoryToEdit(null);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />

      <CategoryForm
        categoryToEdit={categoryToEdit}
        onCategorySaved={handleCategorySaved}
        onCancel={categoryToEdit ? handleCancelEdit : undefined}
      />

      <CategoriesList
        onEditCategory={handleEditCategory}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
