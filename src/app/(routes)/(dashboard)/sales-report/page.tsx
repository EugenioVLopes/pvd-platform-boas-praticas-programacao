"use client";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { useSalesReport } from "@/hooks/use-sales-report";
import { useVendas } from "@/hooks/use-vendas";
import { getDateRangeForReportType } from "@/lib/utils/sales-report";

import { AuthGuard } from "../../../../components/auth/auth-guard";
import { SalesReportHeader } from "./_components/dashboard-header";
import { SalesReportMetrics } from "./_components/dashboard-metrics";
import { SalesReportTabs } from "./_components/dashboard-tabs";

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

  const report = useSalesReport({
    orders: vendas,
    dateRange,
  });

  // ✅ BENEFÍCIO: Lógica de mudança de período simplificada
  const handleReportTypeChange = (value: "daily" | "weekly" | "monthly") => {
    setReportType(value);
    setDateRange(getDateRangeForReportType(value));
  };

  return (
    <AuthGuard
      title="Acesso aos Relatórios"
      persistAuth={false}
      showLoading={false}
      minHeight="500px"
    >
      <div className="container mx-auto space-y-4 bg-background">
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
          totalItems={report.topProducts.reduce(
            (acc, p) => acc + p.quantity,
            0
          )}
        />
        <SalesReportTabs report={report} />
      </div>
    </AuthGuard>
  );
}
