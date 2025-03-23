"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ArrowUpRight } from "lucide-react";

export default function StockOutputForm() {
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [total, setTotal] = useState("0.00");
  const [notes, setNotes] = useState("");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-red-100 text-red-600 p-2 rounded-full">
            <ArrowUpRight size={18} />
          </div>
          <h2 className="text-lg font-medium">Nova Saída de Estoque</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="date">
              Data <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="date"
                type="text"
                placeholder="dd/mm/aaaa"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-3 pr-10"
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Categoria <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md">
                <option value="">Selecione uma categoria</option>
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
            <label className="block text-sm font-medium">
              Produto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md">
                <option value="">Selecione uma categoria primeiro</option>
                <option value="produto 1 twatw">produto 1 twatw</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="quantity">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="unitPrice">
                Preço Unitário <span className="text-red-500">*</span>
              </label>
              <Input
                id="unitPrice"
                type="text"
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Total</label>
              <div className="h-10 px-3 py-2 bg-gray-50 border border-input rounded-md text-gray-500">
                {total}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="notes">
              Observações
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Observações sobre a saída"
              className="w-full px-3 py-2 bg-white border border-input rounded-md resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <button className="w-full bg-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center">
            Registrar Saída
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
