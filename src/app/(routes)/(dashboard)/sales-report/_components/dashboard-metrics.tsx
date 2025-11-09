"use client";

import { IceCream } from "lucide-react";

import { formatCurrency } from "@/lib";
import { MetricCard } from "./metric-card";

interface DashboardMetricsProps {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  totalItems: number;
}

export function SalesReportMetrics({
  totalSales,
  totalRevenue,
  averageTicket,
  totalItems,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Vendas Totais"
        value={totalSales}
        description="Número de pedidos"
        icon={<IceCream className="h-4 w-4 text-pink-500" />}
      />
      <MetricCard
        title="Receita Total"
        value={formatCurrency(totalRevenue)}
        description="Faturamento bruto"
        icon={<IceCream className="h-4 w-4 text-pink-500" />}
      />
      <MetricCard
        title="Ticket Médio"
        value={formatCurrency(averageTicket)}
        description="Média por venda"
        icon={<IceCream className="h-4 w-4 text-pink-500" />}
      />
      <MetricCard
        title="Itens Vendidos"
        value={totalItems}
        description="Quantidade total"
        icon={<IceCream className="h-4 w-4 text-pink-500" />}
      />
    </div>
  );
}
