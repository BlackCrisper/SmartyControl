"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Category } from "@/lib/db/sqlserver-operations";

interface CategoryFormProps {
  categoryToEdit?: Category | null;
  onCategorySaved: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({
  categoryToEdit,
  onCategorySaved,
  onCancel,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
  });

  // Set form data when editing a category
  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        id: categoryToEdit.id,
        name: categoryToEdit.name || "",
        description: categoryToEdit.description || "",
      });
    }
  }, [categoryToEdit]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name) {
        toast.error("Nome da categoria é obrigatório");
        setIsSubmitting(false);
        return;
      }

      // Determine if we're creating or updating a category
      const url = formData.id
        ? `/api/categories/${formData.id}`
        : "/api/categories";

      const method = formData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          formData.id
            ? "Categoria atualizada com sucesso"
            : "Categoria criada com sucesso"
        );
        onCategorySaved();

        // Reset form if not editing
        if (!formData.id) {
          setFormData({
            name: "",
            description: "",
          });
        }
      } else {
        const error = await response.json();
        toast.error(
          `Erro: ${error.message || "Ocorreu um erro ao salvar a categoria"}`
        );
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-6">
          {formData.id ? "Editar Categoria" : "Nova Categoria"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Nome da Categoria <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Digite o nome da categoria"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Descrição da categoria"
                className="w-full px-3 py-2 bg-white border border-input rounded-md resize-none"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : formData.id
                  ? "Salvar Alterações"
                  : "Adicionar Categoria"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
