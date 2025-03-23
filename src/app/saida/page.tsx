import StockOutputForm from "@/components/stock-output-form";
import RecentOutputs from "@/components/recent-outputs";

export default function SaidaPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Registro de Saída</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockOutputForm />
        <RecentOutputs />
      </div>
    </div>
  );
}
