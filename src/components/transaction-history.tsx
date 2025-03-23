"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, RefreshCcw, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";

// Mock transaction data
const transactions = [
  {
    id: 1,
    date: "21/03/2023",
    type: "entrada",
    category: "produto 1",
    product: "produto 1 twatw",
    quantity: 1,
    unitPrice: "R$ 500,00",
    total: "R$ 500,00"
  },
  {
    id: 2,
    date: "21/03/2023",
    type: "saida",
    category: "produto 1",
    product: "produto 1 twatw",
    quantity: 1,
    unitPrice: "R$ 1.000,00",
    total: "R$ 1.000,00"
  }
];

export default function TransactionHistory() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Filtros</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="startDate">Data Início</label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="text"
                  placeholder="dd/mm/aaaa"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-3 pr-10"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="endDate">Data Fim</label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="text"
                  placeholder="dd/mm/aaaa"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-3 pr-10"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <div className="relative">
                <select className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md">
                  <option value="">Todas as categorias</option>
                  <option value="produto 1">produto 1</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Produto</label>
              <div className="relative">
                <select className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md">
                  <option value="">Todos os produtos</option>
                  <option value="produto 1 twatw">produto 1 twatw</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
            <div className="space-y-2 md:col-span-4">
              <label className="text-sm font-medium">Tipo</label>
              <div className="relative">
                <select className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md">
                  <option value="">Todos os tipos</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-end space-x-2">
              <button className="flex-1 bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium">
                Filtrar
              </button>
              <button className="border border-gray-300 rounded-md px-4 py-2 text-sm">
                Limpar Filtros
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-medium mb-4">Movimentações (2)</h2>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      {transaction.type === "entrada" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ArrowDownRight size={14} className="mr-1" /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ArrowUpRight size={14} className="mr-1" /> Saída
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.product}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>{transaction.unitPrice}</TableCell>
                    <TableCell>{transaction.total}</TableCell>
                    <TableCell className="text-right">
                      <button className="text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
