import { calculateSalesReport } from "@/features/reports";
import type { Order, SalesReport } from "@/features/sales";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";

interface UseSalesReportProps {
  orders: Order[];
  dateRange: DateRange;
}

interface UseSalesReportReturn extends SalesReport {
  totalItems: number;
  filteredOrders: Order[];
}

export function useSalesReport({
  orders,
  dateRange,
}: UseSalesReportProps): UseSalesReportReturn {
  const report = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageTicket: 0,
        salesByPaymentMethod: {},
        salesByCategory: {},
        salesByHour: {},
        topProducts: [],
      };
    }

    return calculateSalesReport(orders, dateRange.from, dateRange.to);
  }, [orders, dateRange.from, dateRange.to]);

  const filteredOrders = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];
    return orders.filter((order) => {
      const orderDate = new Date(order.finalizadaEm || order.createdAt);
      return orderDate >= dateRange.from! && orderDate <= dateRange.to!;
    });
  }, [orders, dateRange.from, dateRange.to]);

  const totalItems = useMemo(() => {
    return report.topProducts.reduce(
      (acc, product) => acc + product.quantity,
      0
    );
  }, [report.topProducts]);

  return {
    ...report,
    totalItems,
    filteredOrders,
  };
}
