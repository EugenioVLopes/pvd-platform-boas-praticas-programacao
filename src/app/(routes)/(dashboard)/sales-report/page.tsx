"use client";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import { useVendas } from "@/hooks/use-vendas";
import type { SalesReport } from "@/types/order";

import { ReportAuthGuard } from "../../../../components/auth/report-auth-guard";
import { SalesReportHeader } from "./_components/dashboard-header";
import { SalesReportMetrics } from "./_components/dashboard-metrics";
import { SalesReportTabs } from "./_components/dashboard-tabs";

const defaultReport: SalesReport = {
  totalSales: 0,
  totalRevenue: 0,
  averageTicket: 0,
  salesByPaymentMethod: { credit: 0, debit: 0, cash: 0, pix: 0 },
  salesByCategory: {},
  salesByHour: {},
  topProducts: [],
};

export default function DashboardPage() {
  const { vendas } = useVendas();

  // Estado inicial: relatório do dia atual
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(today.setHours(0, 0, 0, 0)), // Início do dia atual
    to: new Date(today.setHours(23, 59, 59, 999)), // Fim do dia atual
  });
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  // Função para ajustar o dateRange baseado no reportType
  const getDateRangeForReportType = (type: "daily" | "weekly" | "monthly") => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    let from, to;

    switch (type) {
      case "daily":
        from = startOfToday;
        to = endOfToday;
        break;
      case "weekly":
        const startOfWeek = getStartOfWeek(startOfToday);
        from = startOfWeek;
        to = endOfToday;
        break;
      case "monthly":
        from = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
        from.setHours(0, 0, 0, 0);
        to = endOfToday;
        break;
      default:
        from = startOfToday;
        to = endOfToday;
        break;
    }

    return { from, to };
  };

  // Função auxiliar para obter o início da semana (segunda-feira)
  const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const startDay = 1; // Monday
    const daysBack = day >= startDay ? day - startDay : day + 7 - startDay;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - daysBack);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  // Atualiza o dateRange quando o reportType muda
  const handleReportTypeChange = (value: "daily" | "weekly" | "monthly") => {
    setReportType(value);
    setDateRange(getDateRangeForReportType(value));
  };

  const filteredVendas = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];
    return vendas.filter((venda) => {
      const vendaDate = new Date(venda.finalizadaEm || venda.createdAt);
      return vendaDate >= dateRange.from! && vendaDate <= dateRange.to!;
    });
  }, [vendas, dateRange]);

  const report = useMemo(() => {
    if (filteredVendas.length === 0) return defaultReport;

    const totalSales = filteredVendas.length;
    const totalRevenue = filteredVendas.reduce(
      (acc, venda) => acc + (venda.total || 0),
      0
    );
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const salesByPaymentMethod = filteredVendas.reduce(
      (acc, venda) => {
        const method = venda.paymentMethod || "outros";
        acc[method] = (acc[method] || 0) + (venda.total || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const salesByCategory = filteredVendas.reduce(
      (acc, venda) => {
        for (const item of venda.items) {
          const category = item.product.category;
          acc[category] = (acc[category] || 0) + (item.quantity || 1);
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const salesByHour = filteredVendas.reduce(
      (acc, venda) => {
        const hour = new Date(venda.finalizadaEm || venda.createdAt).getHours();
        acc[hour] = (acc[hour] || 0) + (venda.total || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    const topProducts = Object.values(
      filteredVendas.reduce(
        (acc, venda) => {
          for (const item of venda.items) {
            const id = item.product.id.toString();
            if (!acc[id]) {
              acc[id] = {
                name: item.product.name,
                quantity: 0,
                revenue: 0,
              };
            }
            const quantity = item.quantity || 1;
            acc[id].quantity += quantity;
            acc[id].revenue += item.product.price * quantity;
          }
          return acc;
        },
        {} as Record<
          string,
          { name: string; quantity: number; revenue: number }
        >
      )
    )
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalSales,
      totalRevenue,
      averageTicket,
      salesByPaymentMethod,
      salesByCategory,
      salesByHour,
      topProducts,
    };
  }, [filteredVendas]);

  const totalItems = report.topProducts.reduce((acc, p) => acc + p.quantity, 0);

  return (
    <ReportAuthGuard>
      <div className="bg-background container mx-auto space-y-4">
        <SalesReportHeader
          dateRange={dateRange}
          reportType={reportType}
          onDateRangeChange={setDateRange}
          onReportTypeChange={handleReportTypeChange}
        />
        <SalesReportMetrics
          totalSales={report.totalSales}
          totalRevenue={report.totalRevenue}
          averageTicket={report.averageTicket}
          totalItems={totalItems}
        />
        <SalesReportTabs report={report} />
      </div>
    </ReportAuthGuard>
  );
}
