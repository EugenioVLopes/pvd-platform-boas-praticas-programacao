"use client";

import { IceCream } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/features/sales";
import { formatCurrency, formatDate } from "@/lib";

interface RecentSalesProps {
  limit?: number;
}

export function RecentSales({ limit = 5 }: RecentSalesProps) {
  const { completedSales } = useSales();

  const [showAllDailySales, setShowAllDailySales] = useState(false);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const dailySales = useMemo(() => {
    return completedSales.filter((venda) => {
      const vendaDate = new Date(venda.finalizadaEm || venda.createdAt);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return vendaDate >= today && vendaDate <= endOfDay;
    });
  }, [completedSales, today]);

  const recentSales = useMemo(() => {
    return completedSales
      .sort(
        (a, b) =>
          new Date(b.finalizadaEm || b.createdAt).getTime() -
          new Date(a.finalizadaEm || a.createdAt).getTime()
      )
      .slice(0, limit);
  }, [completedSales, limit]);

  const salesToDisplay = showAllDailySales ? dailySales : recentSales;

  if (salesToDisplay.length === 0) {
    return (
      <Card className="mx-auto w-full rounded-md border-pink-200 bg-white shadow-md">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-pink-50 to-white p-6">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-pink-800">
            <IceCream className="h-6 w-6 text-pink-500" /> Últimas Vendas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-pink-600">
            Nenhuma venda recente registrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full rounded-md bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-pink-50 to-white p-6">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <IceCream className="h-6 w-6 text-pink-500" /> Últimas Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          {salesToDisplay.map((venda) => (
            <div
              key={venda.id}
              className="cursor-pointer rounded-lg border border-pink-100 bg-pink-50 p-4 transition-colors duration-200 hover:bg-pink-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {venda.customerName || "Venda Direta"}
                  </p>
                  <p className="text-xs">
                    {formatDate(venda.finalizadaEm || venda.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(venda.total || 0)}
                  </p>
                  <p className="text-xs capitalize">
                    {venda.paymentMethod || "Não especificado"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {salesToDisplay.length >=
          (showAllDailySales ? dailySales.length : limit) && (
          <p className="text-center text-sm text-pink-600">
            {showAllDailySales
              ? `Mostrando todas as ${dailySales.length} vendas do dia.`
              : `Mostrando as ${limit} vendas mais recentes.`}
          </p>
        )}
        {!showAllDailySales && (
          <Button
            onClick={() => setShowAllDailySales(true)}
            className="w-full bg-pink-500 text-white transition-colors hover:bg-pink-600"
          >
            Ver Todas as Vendas do Dia
          </Button>
        )}
        {showAllDailySales && dailySales.length > limit && (
          <Button
            onClick={() => setShowAllDailySales(false)}
            className="w-full bg-pink-500 text-white transition-colors hover:bg-pink-600"
          >
            Voltar para as {limit} Mais Recentes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
