"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/features/sales";
import { useSales } from "@/features/sales";
import { calculateOrderTotal, formatCurrency } from "@/lib";

function isVendaDeHoje(venda: Order, today: Date): boolean {
  const vendaDate = new Date(venda.finalizadaEm || venda.createdAt);
  return vendaDate >= today;
}

function calcularTotaisPorMetodo(vendasHoje: Order[]): Record<string, number> {
  return vendasHoje.reduce(
    (acc, venda) => {
      const method = venda.paymentMethod?.toLowerCase() || "outros";
      const total = calculateOrderTotal(venda);
      acc[method] = (acc[method] || 0) + total;
      return acc;
    },
    {} as Record<string, number>
  );
}

export function DailySummary() {
  const { completedSales } = useSales();

  const { totaisPorMetodo, totalDoDia } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vendasHoje = completedSales.filter((venda) =>
      isVendaDeHoje(venda, today)
    );

    const totaisPorMetodo = calcularTotaisPorMetodo(vendasHoje);

    const totalDoDia = Object.values(totaisPorMetodo).reduce(
      (a, b) => a + b,
      0
    );

    return { totaisPorMetodo, totalDoDia };
  }, [completedSales]);

  return (
    <Card className="mx-auto w-full rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-pink-50 to-white p-6">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          Resumo do Dia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Crédito", key: "credit" },
            { label: "Débito", key: "debit" },
            { label: "Dinheiro", key: "cash" },
            { label: "PIX", key: "pix" },
          ].map(({ label, key }) => (
            <div
              key={key}
              className="cursor-pointer rounded-lg border border-pink-100 bg-pink-50 p-4 transition-colors duration-200 hover:bg-pink-100"
            >
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(
                  totaisPorMetodo[key as keyof typeof totaisPorMetodo] || 0
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-pink-200 pt-4">
          <p className="text-sm font-medium">Total do Dia</p>
          <p className="mt-1 text-3xl font-bold">
            {formatCurrency(totalDoDia)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
