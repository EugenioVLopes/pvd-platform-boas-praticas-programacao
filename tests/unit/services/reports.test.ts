import {
  calculateSalesMetrics,
  calculateSalesReport,
  filterOrdersByPeriod,
  getDateRangeForReportType,
  getTopSellingProducts,
  groupSalesByCategory,
  groupSalesByHour,
  groupSalesByPaymentMethod,
} from "@/features/reports/lib/reports";
import type { Order } from "@/features/sales";
import { createMockSaleItem } from "@/tests/fixtures/products";
import { createMockOrder } from "@/tests/fixtures/sales";

describe("filterOrdersByPeriod", () => {
  test("should filter orders within date range", () => {
    // ARRANGE
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-15T23:59:59");
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-16T10:00:00"), // Fora do range
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T14:00:00"),
      }),
    ];

    // ACT
    const result = filterOrdersByPeriod(orders, startDate, endDate);

    // ASSERT
    expect(result.length).toBe(2);
    expect(result[0].finalizadaEm).toEqual(new Date("2024-01-15T10:00:00"));
    expect(result[1].finalizadaEm).toEqual(new Date("2024-01-15T14:00:00"));
  });

  test("should use createdAt when finalizadaEm is not available", () => {
    // ARRANGE
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-15T23:59:59");
    const orders = [
      createMockOrder({
        finalizadaEm: undefined,
        createdAt: new Date("2024-01-15T10:00:00"),
      }),
    ];

    // ACT
    const result = filterOrdersByPeriod(orders, startDate, endDate);

    // ASSERT
    expect(result.length).toBe(1);
  });

  test("should return empty array when no orders match", () => {
    // ARRANGE
    const startDate = new Date("2024-01-20T00:00:00");
    const endDate = new Date("2024-01-20T23:59:59");
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
    ];

    // ACT
    const result = filterOrdersByPeriod(orders, startDate, endDate);

    // ASSERT
    expect(result.length).toBe(0);
  });
});

describe("calculateSalesMetrics", () => {
  test("should calculate metrics correctly", () => {
    // ARRANGE
    const orders = [
      createMockOrder({ total: 10.0 }),
      createMockOrder({ total: 20.0 }),
      createMockOrder({ total: 30.0 }),
    ];

    // ACT
    const result = calculateSalesMetrics(orders);

    // ASSERT
    expect(result.totalSales).toBe(3);
    expect(result.totalRevenue).toBe(60.0);
    expect(result.averageTicket).toBe(20.0);
    expect(result.totalItems).toBeGreaterThan(0);
  });

  test("should return zero metrics for empty orders", () => {
    // ARRANGE
    const orders: Order[] = [];

    // ACT
    const result = calculateSalesMetrics(orders);

    // ASSERT
    expect(result.totalSales).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averageTicket).toBe(0);
    expect(result.totalItems).toBe(0);
  });

  test("should calculate total items correctly", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({ quantity: 2 }),
          createMockSaleItem({ quantity: 3 }),
        ],
      }),
    ];

    // ACT
    const result = calculateSalesMetrics(orders);

    // ASSERT
    expect(result.totalItems).toBe(5);
  });
});

describe("groupSalesByPaymentMethod", () => {
  test("should group sales by payment method", () => {
    // ARRANGE
    const orders = [
      createMockOrder({ paymentMethod: "CASH", total: 10.0 }),
      createMockOrder({ paymentMethod: "PIX", total: 20.0 }),
      createMockOrder({ paymentMethod: "CASH", total: 15.0 }),
    ];

    // ACT
    const result = groupSalesByPaymentMethod(orders);

    // ASSERT
    expect(result.CASH).toBe(25.0);
    expect(result.PIX).toBe(20.0);
  });

  test("should handle orders without payment method", () => {
    // ARRANGE
    const orders = [createMockOrder({ paymentMethod: undefined, total: 10.0 })];

    // ACT
    const result = groupSalesByPaymentMethod(orders);

    // ASSERT
    expect(result.outros).toBe(10.0);
  });
});

describe("groupSalesByCategory", () => {
  test("should group sales by product category", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: 1,
              name: "Produto 1",
              price: 10,
              category: "Sorvetes",
              type: "unit",
            },
            quantity: 2,
          }),
          createMockSaleItem({
            product: {
              id: 2,
              name: "Produto 2",
              price: 15,
              category: "Açaí",
              type: "unit",
            },
            quantity: 1,
          }),
        ],
      }),
    ];

    // ACT
    const result = groupSalesByCategory(orders);

    // ASSERT
    expect(result.Sorvetes).toBe(2);
    expect(result.Açaí).toBe(1);
  });
});

describe("groupSalesByHour", () => {
  test("should group sales by hour", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:30:00"),
        total: 10.0,
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:45:00"),
        total: 20.0,
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T14:00:00"),
        total: 15.0,
      }),
    ];

    // ACT
    const result = groupSalesByHour(orders);

    // ASSERT
    expect(result[10]).toBe(30.0);
    expect(result[14]).toBe(15.0);
  });

  test("should use createdAt when finalizadaEm is not available", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: undefined,
        createdAt: new Date("2024-01-15T16:00:00"),
        total: 10.0,
      }),
    ];

    // ACT
    const result = groupSalesByHour(orders);

    // ASSERT
    expect(result[16]).toBe(10.0);
  });
});

describe("getTopSellingProducts", () => {
  test("should return top selling products sorted by revenue", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: 1,
              name: "Produto A",
              price: 10,
              category: "Teste",
              type: "unit",
            },
            quantity: 5,
          }),
          createMockSaleItem({
            product: {
              id: 2,
              name: "Produto B",
              price: 20,
              category: "Teste",
              type: "unit",
            },
            quantity: 2,
          }),
        ],
      }),
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: 1,
              name: "Produto A",
              price: 10,
              category: "Teste",
              type: "unit",
            },
            quantity: 3,
          }),
        ],
      }),
    ];

    // ACT
    const result = getTopSellingProducts(orders, 10);

    // ASSERT
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Produto A");
    expect(result[0].quantity).toBe(8); // 5 + 3
    expect(result[0].revenue).toBe(80); // 10 * 8
    expect(result[1].name).toBe("Produto B");
    expect(result[1].quantity).toBe(2);
    expect(result[1].revenue).toBe(40); // 20 * 2
  });

  test("should respect limit parameter", () => {
    // ARRANGE
    const orders = Array.from({ length: 20 }, (_, i) =>
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: i,
              name: `Produto ${i}`,
              price: 10,
              category: "Teste",
              type: "unit",
            },
            quantity: 1,
          }),
        ],
      })
    );

    // ACT
    const result = getTopSellingProducts(orders, 5);

    // ASSERT
    expect(result.length).toBe(5);
  });
});

describe("calculateSalesReport", () => {
  test("should calculate complete sales report", () => {
    // ARRANGE
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-15T23:59:59");
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
        total: 10.0,
        paymentMethod: "CASH",
        items: [
          createMockSaleItem({
            product: {
              id: 1,
              name: "Produto",
              price: 10,
              category: "Teste",
              type: "unit",
            },
            quantity: 1,
          }),
        ],
      }),
    ];

    // ACT
    const result = calculateSalesReport(orders, startDate, endDate);

    // ASSERT
    expect(result.totalSales).toBe(1);
    expect(result.totalRevenue).toBe(10.0);
    expect(result.averageTicket).toBe(10.0);
    expect(result.salesByPaymentMethod.CASH).toBe(10.0);
    expect(result.topProducts.length).toBeGreaterThan(0);
  });

  test("should return empty report when no orders match period", () => {
    // ARRANGE
    const startDate = new Date("2024-01-20T00:00:00");
    const endDate = new Date("2024-01-20T23:59:59");
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
    ];

    // ACT
    const result = calculateSalesReport(orders, startDate, endDate);

    // ASSERT
    expect(result.totalSales).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averageTicket).toBe(0);
    expect(result.salesByPaymentMethod).toEqual({});
    expect(result.salesByCategory).toEqual({});
    expect(result.salesByHour).toEqual({});
    expect(result.topProducts).toEqual([]);
  });
});

describe("getDateRangeForReportType", () => {
  test("should return daily date range", () => {
    // ARRANGE & ACT
    const result = getDateRangeForReportType("daily");

    // ASSERT
    expect(result.from).toBeInstanceOf(Date);
    expect(result.to).toBeInstanceOf(Date);
    expect(result.from.getHours()).toBe(0);
    expect(result.from.getMinutes()).toBe(0);
    expect(result.to.getHours()).toBe(23);
    expect(result.to.getMinutes()).toBe(59);
  });

  test("should return weekly date range", () => {
    // ARRANGE & ACT
    const result = getDateRangeForReportType("weekly");

    // ASSERT
    expect(result.from).toBeInstanceOf(Date);
    expect(result.to).toBeInstanceOf(Date);
    expect(result.from.getDay()).toBe(1); // Segunda-feira
  });

  test("should return monthly date range", () => {
    // ARRANGE & ACT
    const result = getDateRangeForReportType("monthly");

    // ASSERT
    expect(result.from).toBeInstanceOf(Date);
    expect(result.to).toBeInstanceOf(Date);
    expect(result.from.getDate()).toBe(1); // Primeiro dia do mês
  });
});
