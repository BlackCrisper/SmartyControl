import StockInputForm from "@/components/stock-input-form";
import RecentInputs from "@/components/recent-inputs";

export default function EntradaPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Registro de Entrada</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockInputForm />
        <RecentInputs />
      </div>
    </div>
  );
}
