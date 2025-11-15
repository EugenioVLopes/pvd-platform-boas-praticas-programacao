"use client";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { AuthGuard } from "@/features/auth";
import {
  SalesReportHeader,
  SalesReportMetrics,
  SalesReportTabs,
  getDateRangeForReportType,
  useSalesReport,
} from "@/features/reports";
import { useSales } from "@/features/sales";

export default function DashboardPage() {
  const { completedSales } = useSales();

  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(today.setHours(0, 0, 0, 0)),
    to: new Date(today.setHours(23, 59, 59, 999)),
  });
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );

  const report = useSalesReport({
    orders: completedSales,
    dateRange,
  });

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
