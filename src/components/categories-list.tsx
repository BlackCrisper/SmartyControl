"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Category } from "@/lib/db/sqlserver-operations";

interface CategoriesListProps {
  onEditCategory: (category: Category) => void;
  refreshTrigger: number;
}

export default function CategoriesList({ onEditCategory, refreshTrigger }: CategoriesListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; categoryId: number | null }>({
    open: false,
    categoryId: null
  });

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  async function fetchCategories() {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Falha ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory() {
    if (!deleteDialog.categoryId) return;

    try {
      const response = await fetch(`/api/categories/${deleteDialog.categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      toast.success("Categoria excluída com sucesso");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao excluir categoria";
      toast.error(errorMessage);
    } finally {
      setDeleteDialog({ open: false, categoryId: null });
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando categorias...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      {category.description || <span className="text-muted-foreground italic">Sem descrição</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditCategory(category)}
                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, categoryId: category.id ?? null })}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir esta categoria?
            <br />
            <span className="text-sm text-muted-foreground">
              Essa ação não poderá ser desfeita. Produtos associados a esta categoria não serão excluídos.
            </span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, categoryId: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteCategory}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
