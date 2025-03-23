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
import { Product } from "@/lib/db/sqlserver-operations";

interface ProductsListProps {
  onEditProduct: (product: Product) => void;
  refreshTrigger: number;
}

export default function ProductsList({ onEditProduct, refreshTrigger }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: number | null }>({
    open: false,
    productId: null
  });
  const [categories, setCategories] = useState<Record<number, string>>({});

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate profit margin
  const calculateMargin = (price: number, costPrice: number) => {
    if (price <= 0 || costPrice <= 0) return "0.00%";
    return ((price - costPrice) / price * 100).toFixed(2) + "%";
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          const categoryMap: Record<number, string> = {};
          data.forEach((category: { id: number; name: string }) => {
            categoryMap[category.id] = category.name;
          });
          setCategories(categoryMap);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error("Failed to fetch products");
          toast.error("Erro ao carregar produtos");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (categories[product.category_id] && categories[product.category_id].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!deleteDialog.productId) return;

    try {
      const response = await fetch(`/api/products/${deleteDialog.productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the product from the local state
        setProducts(products.filter(p => p.id !== deleteDialog.productId));
        toast.success("Produto excluído com sucesso");
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.message || "Não foi possível excluir o produto"}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    } finally {
      setDeleteDialog({ open: false, productId: null });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Lista de Produtos</h2>

        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm
                  ? `Não foram encontrados produtos que correspondam a "${searchTerm}"`
                  : "Não há produtos cadastrados. Adicione seu primeiro produto!"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço Compra</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <span>{product.name}</span>
                        {product.sku && (
                          <span className="block text-xs text-gray-500">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{categories[product.category_id] || "—"}</TableCell>
                    <TableCell>
                      <span className={`${
                        product.stock_quantity <= product.min_stock_level
                          ? "text-red-600 font-medium"
                          : ""
                      }`}>
                        {product.stock_quantity}
                        {product.stock_quantity <= product.min_stock_level && (
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Baixo
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(product.cost_price)}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {calculateMargin(product.price, product.cost_price)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditProduct(product)}
                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, productId: product.id ?? null })}
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
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, productId: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
