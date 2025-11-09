import type { Order, SalesReport } from "@/types/order";

export function filterOrdersByPeriod(
  orders: Order[],
  startDate: Date,
  endDate: Date
): Order[] {
  return orders.filter((order) => {
    const orderDate = new Date(order.finalizadaEm || order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
}

export function calculateSalesMetrics(orders: Order[]) {
  const totalSales = orders.length;
  const totalRevenue = orders.reduce(
    (acc, order) => acc + (order.total || 0),
    0
  );
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalItems = orders.reduce((acc, order) => {
    return (
      acc +
      order.items.reduce((itemAcc, item) => itemAcc + (item.quantity || 1), 0)
    );
  }, 0);

  return {
    totalSales,
    totalRevenue,
    averageTicket,
    totalItems,
  };
}

export function groupSalesByPaymentMethod(
  orders: Order[]
): Record<string, number> {
  return orders.reduce(
    (acc, order) => {
      const method = order.paymentMethod || "outros";
      acc[method] = (acc[method] || 0) + (order.total || 0);
      return acc;
    },
    {} as Record<string, number>
  );
}

export function groupSalesByCategory(orders: Order[]): Record<string, number> {
  return orders.reduce(
    (acc, order) => {
      for (const item of order.items) {
        const category = item.product.category;
        acc[category] = (acc[category] || 0) + (item.quantity || 1);
      }
      return acc;
    },
    {} as Record<string, number>
  );
}

export function groupSalesByHour(orders: Order[]): Record<string, number> {
  return orders.reduce(
    (acc, order) => {
      const hour = new Date(order.finalizadaEm || order.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + (order.total || 0);
      return acc;
    },
    {} as Record<string, number>
  );
}

export function getTopSellingProducts(
  orders: Order[],
  limit: number = 10
): Array<{ name: string; quantity: number; revenue: number }> {
  const productStats = orders.reduce(
    (acc, order) => {
      for (const item of order.items) {
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
    {} as Record<string, { name: string; quantity: number; revenue: number }>
  );

  return Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function calculateSalesReport(
  orders: Order[],
  startDate: Date,
  endDate: Date
): SalesReport {
  const filteredOrders = filterOrdersByPeriod(orders, startDate, endDate);

  if (filteredOrders.length === 0) {
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

  const metrics = calculateSalesMetrics(filteredOrders);
  const salesByPaymentMethod = groupSalesByPaymentMethod(filteredOrders);
  const salesByCategory = groupSalesByCategory(filteredOrders);
  const salesByHour = groupSalesByHour(filteredOrders);
  const topProducts = getTopSellingProducts(filteredOrders);

  return {
    totalSales: metrics.totalSales,
    totalRevenue: metrics.totalRevenue,
    averageTicket: metrics.averageTicket,
    salesByPaymentMethod,
    salesByCategory,
    salesByHour,
    topProducts,
  };
}

export function getDateRangeForReportType(
  type: "daily" | "weekly" | "monthly"
): {
  from: Date;
  to: Date;
} {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  let from: Date, to: Date;

  switch (type) {
    case "daily":
      from = startOfToday;
      to = endOfToday;
      break;
    case "weekly":
      from = getStartOfWeek(startOfToday);
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
}

function getStartOfWeek(date: Date): Date {
  const day = date.getDay();
  const startDay = 1;
  const daysBack = day >= startDay ? day - startDay : day + 7 - startDay;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - daysBack);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}
