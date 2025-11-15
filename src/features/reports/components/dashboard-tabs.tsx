"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SalesReport } from "@/features/sales";

import { DailySummary } from "./daily-summary";
import { SalesReportHourlyChart } from "./hourly-sales-chart";
import { SalesReportPaymentChart } from "./payment-method-chart";
import { RecentSales } from "./recent-sales";
import { SalesReportProductsTable } from "./top-products-table";

interface DashboardTabsProps {
  report: SalesReport;
}

export function SalesReportTabs({ report }: DashboardTabsProps) {
  return (
    <Tabs
      defaultValue="overview"
      className="space-y-6 rounded-md bg-white p-4 shadow-md"
    >
      <TabsList className="grid w-full grid-cols-4 items-center justify-center rounded-md bg-background md:w-[800px]">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-pink-300 data-[state=active]:text-white"
        >
          Visão Geral
        </TabsTrigger>
        <TabsTrigger
          value="charts"
          className="data-[state=active]:bg-pink-300 data-[state=active]:text-white"
        >
          Gráficos
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className="data-[state=active]:bg-pink-300 data-[state=active]:text-white"
        >
          Produtos
        </TabsTrigger>
        <TabsTrigger
          value="sales"
          className="data-[state=active]:bg-pink-300 data-[state=active]:text-white"
        >
          Últimas Vendas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <DailySummary />
      </TabsContent>

      <TabsContent value="charts" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SalesReportPaymentChart data={report.salesByPaymentMethod} />
          <SalesReportHourlyChart data={report.salesByHour} />
        </div>
      </TabsContent>

      <TabsContent value="products">
        <SalesReportProductsTable products={report.topProducts} />
      </TabsContent>

      <TabsContent value="sales">
        <RecentSales limit={5} />
      </TabsContent>
    </Tabs>
  );
}
