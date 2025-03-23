import ProductsTab from "@/components/products-tab";
import CategoriesTab from "@/components/categories-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CadastrosPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Cadastros</h1>

      <Tabs defaultValue="products">
        <TabsList className="grid w-56 grid-cols-2 mb-6">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
