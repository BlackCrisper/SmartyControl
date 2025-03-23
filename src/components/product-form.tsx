"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Product, Category } from "@/lib/db/sqlserver-operations";

interface ProductFormProps {
  productToEdit?: Product | null;
  onProductSaved: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ productToEdit, onProductSaved, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    price: 0,
    cost_price: 0,
    stock_quantity: 0,
    min_stock_level: 0,
    category_id: 0,
    image_url: "",
  });

  // Calculated fields
  const margin = formData.price && formData.cost_price
    ? ((formData.price - formData.cost_price) / formData.price * 100).toFixed(2)
    : "0.00";

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);

          // Set default category if there are categories and no category is selected
          if (data.length > 0 && !formData.category_id) {
            setFormData(prev => ({ ...prev, category_id: data[0].id }));
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Erro ao carregar categorias");
      }
    };

    fetchCategories();
  }, []);

  // Set form data when editing a product
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        id: productToEdit.id,
        name: productToEdit.name || "",
        description: productToEdit.description || "",
        sku: productToEdit.sku || "",
        barcode: productToEdit.barcode || "",
        price: productToEdit.price || 0,
        cost_price: productToEdit.cost_price || 0,
        stock_quantity: productToEdit.stock_quantity || 0,
        min_stock_level: productToEdit.min_stock_level || 0,
        category_id: productToEdit.category_id || 0,
        image_url: productToEdit.image_url || "",
      });
    }
  }, [productToEdit]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle different input types
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.category_id) {
        toast.error("Nome e categoria são obrigatórios");
        setIsSubmitting(false);
        return;
      }

      // Determine if we're creating or updating a product
      const url = formData.id
        ? `/api/products/${formData.id}`
        : "/api/products";

      const method = formData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(formData.id ? "Produto atualizado com sucesso" : "Produto criado com sucesso");
        onProductSaved();

        // Reset form if not editing
        if (!formData.id) {
          setFormData({
            name: "",
            description: "",
            sku: "",
            barcode: "",
            price: 0,
            cost_price: 0,
            stock_quantity: 0,
            min_stock_level: 0,
            category_id: categories.length > 0 ? categories[0].id : 0,
            image_url: "",
          });
        }
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.message || "Ocorreu um erro ao salvar o produto"}`);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-6">
          {formData.id ? "Editar Produto" : "Novo Produto"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Nome do Produto <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Digite o nome do produto"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category_id">
                Categoria <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="category_id"
                  name="category_id"
                  className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="cost_price">
                Preço de Compra <span className="text-red-500">*</span>
              </label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost_price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="price">
                Preço de Venda <span className="text-red-500">*</span>
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="stock_quantity">
                Estoque Atual
              </label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                placeholder="Quantidade em estoque"
                value={formData.stock_quantity}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="min_stock_level">
                Estoque Mínimo
              </label>
              <Input
                id="min_stock_level"
                name="min_stock_level"
                type="number"
                min="0"
                placeholder="Quantidade mínima"
                value={formData.min_stock_level}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Margem de Lucro
              </label>
              <div className="h-10 px-3 py-2 bg-gray-100 border border-input rounded-md flex items-center">
                <span className="text-gray-700">{margin}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="sku">
                SKU
              </label>
              <Input
                id="sku"
                name="sku"
                placeholder="Código do produto"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="barcode">
                Código de Barras
              </label>
              <Input
                id="barcode"
                name="barcode"
                placeholder="Código de barras"
                value={formData.barcode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium" htmlFor="description">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Descrição do produto"
              className="w-full px-3 py-2 bg-white border border-input rounded-md resize-none"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium" htmlFor="image_url">
              URL da Imagem
            </label>
            <Input
              id="image_url"
              name="image_url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={formData.image_url}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Salvando..."
                : formData.id
                  ? "Salvar Alterações"
                  : "Adicionar Produto"
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
