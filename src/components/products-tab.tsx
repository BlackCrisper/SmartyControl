"use client";

import { useState } from "react";
import ProductForm from "@/components/product-form";
import ProductsList from "@/components/products-list";
import { Product } from "@/lib/db/sqlserver-operations";

export default function ProductsTab() {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh the product list
  const handleProductSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setProductToEdit(null);
  };

  // Function to edit a product
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setProductToEdit(null);
  };

  return (
    <div className="space-y-8">
      <ProductForm
        productToEdit={productToEdit}
        onProductSaved={handleProductSaved}
        onCancel={productToEdit ? handleCancelEdit : undefined}
      />

      <ProductsList
        onEditProduct={handleEditProduct}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
