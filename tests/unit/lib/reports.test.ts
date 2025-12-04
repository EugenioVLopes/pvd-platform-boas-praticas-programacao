import {
  filterOrdersByPeriod,
  calculateSalesMetrics,
  groupSalesByPaymentMethod,
  groupSalesByCategory,
  groupSalesByHour,
  getTopSellingProducts,
  calculateSalesReport,
  getDateRangeForReportType,
} from "@/features/reports/lib/reports";
import { createMockOrder, mockOrders } from "@/tests/fixtures/sales";
import { createMockSaleItem, createMockWeightSaleItem } from "@/tests/fixtures/products";

describe("filterOrdersByPeriod", () => {
  test("should filter orders within date range", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-16T10:00:00"),
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-17T10:00:00"),
      }),
    ];
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-16T23:59:59");

    // ACT
    const result = filterOrdersByPeriod(orders, startDate, endDate);

    // ASSERT
    expect(result).toHaveLength(2);
    expect(result[0].finalizadaEm).toEqual(new Date("2024-01-15T10:00:00"));
    expect(result[1].finalizadaEm).toEqual(new Date("2024-01-16T10:00:00"));
  });

  test("should use createdAt when finalizadaEm is not available", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        createdAt: new Date("2024-01-15T10:00:00"),
        finalizadaEm: undefined,
      }),
    ];
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-15T23:59:59");

    // ACT
    const result = filterOrdersByPeriod(orders, startDate, endDate);

    // ASSERT
    expect(result).toHaveLength(1);
  });

  test("should return empty array when no orders match date range", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
    ];
    const startDate = new Date("2024-02-01T00:00:00");
    const endDate = new Date("2024-02-28T23:59:59");

    // ACT
    const result = filterOrdersByPeriod(orders, startDate, endDate);

    // ASSERT
    expect(result).toHaveLength(0);
  });

  test("should include orders on boundary dates", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T00:00:00"),
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T23:59:59"),
      }),
    ];
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-15T23:59:59");

    // ACT
    const result = filterOrdersByPeriod(orders, startDate, endDate);

    // ASSERT
    expect(result).toHaveLength(2);
  });
});

describe("calculateSalesMetrics", () => {
  test("should calculate metrics correctly for multiple orders", () => {
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
      createMockOrder({
        items: [createMockSaleItem({ quantity: 1 })],
      }),
    ];

    // ACT
    const result = calculateSalesMetrics(orders);

    // ASSERT
    expect(result.totalItems).toBe(6);
  });

  test("should handle orders with undefined quantity (defaults to 1)", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({ quantity: undefined }),
          createMockSaleItem({ quantity: 2 }),
        ],
      }),
    ];

    // ACT
    const result = calculateSalesMetrics(orders);

    // ASSERT
    expect(result.totalItems).toBe(3); // 1 (default) + 2
  });

  test("should return zero average ticket for empty orders", () => {
    // ARRANGE
    const orders: typeof mockOrders = [];

    // ACT
    const result = calculateSalesMetrics(orders);

    // ASSERT
    expect(result.totalSales).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averageTicket).toBe(0);
    expect(result.totalItems).toBe(0);
  });

  test("should handle orders with undefined total", () => {
    // ARRANGE
    const orders = [
      createMockOrder({ total: undefined }),
      createMockOrder({ total: 10.0 }),
    ];

    // ACT
    const result = calculateSalesMetrics(orders);

    // ASSERT
    expect(result.totalRevenue).toBe(10.0);
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

  test("should use 'outros' for undefined payment method", () => {
    // ARRANGE
    const orders = [
      createMockOrder({ paymentMethod: undefined, total: 10.0 }),
    ];

    // ACT
    const result = groupSalesByPaymentMethod(orders);

    // ASSERT
    expect(result.outros).toBe(10.0);
  });

  test("should handle orders with undefined total", () => {
    // ARRANGE
    const orders = [
      createMockOrder({ paymentMethod: "CASH", total: undefined }),
      createMockOrder({ paymentMethod: "CASH", total: 10.0 }),
    ];

    // ACT
    const result = groupSalesByPaymentMethod(orders);

    // ASSERT
    expect(result.CASH).toBe(10.0);
  });
});

describe("groupSalesByCategory", () => {
  test("should group sales by product category", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: { id: 1, name: "Produto 1", price: 10, category: "Sorvetes", type: "unit" },
            quantity: 2,
          }),
          createMockSaleItem({
            product: { id: 2, name: "Produto 2", price: 5, category: "Açaí", type: "unit" },
            quantity: 3,
          }),
        ],
      }),
    ];

    // ACT
    const result = groupSalesByCategory(orders);

    // ASSERT
    expect(result.Sorvetes).toBe(2);
    expect(result.Açaí).toBe(3);
  });

  test("should handle items with undefined quantity (defaults to 1)", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: { id: 1, name: "Produto 1", price: 10, category: "Sorvetes", type: "unit" },
            quantity: undefined,
          }),
        ],
      }),
    ];

    // ACT
    const result = groupSalesByCategory(orders);

    // ASSERT
    expect(result.Sorvetes).toBe(1);
  });
});

describe("groupSalesByHour", () => {
  test("should group sales by hour of day", () => {
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
        createdAt: new Date("2024-01-15T15:00:00"),
        finalizadaEm: undefined,
        total: 10.0,
      }),
    ];

    // ACT
    const result = groupSalesByHour(orders);

    // ASSERT
    expect(result[15]).toBe(10.0);
  });

  test("should handle orders with undefined total", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
        total: undefined,
      }),
    ];

    // ACT
    const result = groupSalesByHour(orders);

    // ASSERT
    expect(result[10]).toBe(0);
  });
});

describe("getTopSellingProducts", () => {
  test("should return top selling products sorted by revenue", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: { id: 1, name: "Produto A", price: 10, category: "Teste", type: "unit" },
            quantity: 2,
          }),
          createMockSaleItem({
            product: { id: 2, name: "Produto B", price: 5, category: "Teste", type: "unit" },
            quantity: 5,
          }),
        ],
      }),
      createMockOrder({
        items: [
          createMockSaleItem({
            product: { id: 1, name: "Produto A", price: 10, category: "Teste", type: "unit" },
            quantity: 3,
          }),
        ],
      }),
    ];

    // ACT
    const result = getTopSellingProducts(orders);

    // ASSERT
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Produto A");
    expect(result[0].quantity).toBe(5); // 2 + 3
    expect(result[0].revenue).toBe(50.0); // (10 * 2) + (10 * 3)
    expect(result[1].name).toBe("Produto B");
    expect(result[1].quantity).toBe(5);
    expect(result[1].revenue).toBe(25.0); // 5 * 5
  });

  test("should respect limit parameter", () => {
    // ARRANGE
    const orders = Array.from({ length: 20 }, (_, i) =>
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: i + 1,
              name: `Produto ${i + 1}`,
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
    expect(result).toHaveLength(5);
  });

  test("should use default limit of 10", () => {
    // ARRANGE
    const orders = Array.from({ length: 15 }, (_, i) =>
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: i + 1,
              name: `Produto ${i + 1}`,
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
    const result = getTopSellingProducts(orders);

    // ASSERT
    expect(result).toHaveLength(10);
  });

  test("should handle items with undefined quantity (defaults to 1)", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: { id: 1, name: "Produto A", price: 10, category: "Teste", type: "unit" },
            quantity: undefined,
          }),
        ],
      }),
    ];

    // ACT
    const result = getTopSellingProducts(orders);

    // ASSERT
    expect(result[0].quantity).toBe(1);
    expect(result[0].revenue).toBe(10.0);
  });

  test("should return empty array for empty orders", () => {
    // ARRANGE
    const orders: typeof mockOrders = [];

    // ACT
    const result = getTopSellingProducts(orders);

    // ASSERT
    expect(result).toHaveLength(0);
  });
});

describe("calculateSalesReport", () => {
  test("should calculate complete sales report", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
        paymentMethod: "CASH",
        total: 10.0,
        items: [
          createMockSaleItem({
            product: { id: 1, name: "Produto A", price: 10, category: "Sorvetes", type: "unit" },
            quantity: 1,
          }),
        ],
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T11:00:00"),
        paymentMethod: "PIX",
        total: 20.0,
        items: [
          createMockSaleItem({
            product: { id: 2, name: "Produto B", price: 20, category: "Açaí", type: "unit" },
            quantity: 1,
          }),
        ],
      }),
    ];
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-15T23:59:59");

    // ACT
    const result = calculateSalesReport(orders, startDate, endDate);

    // ASSERT
    expect(result.totalSales).toBe(2);
    expect(result.totalRevenue).toBe(30.0);
    expect(result.averageTicket).toBe(15.0);
    expect(result.salesByPaymentMethod.CASH).toBe(10.0);
    expect(result.salesByPaymentMethod.PIX).toBe(20.0);
    expect(result.salesByCategory.Sorvetes).toBe(1);
    expect(result.salesByCategory.Açaí).toBe(1);
    expect(result.topProducts.length).toBeGreaterThan(0);
  });

  test("should return empty report for orders outside date range", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
        total: 10.0,
      }),
    ];
    const startDate = new Date("2024-02-01T00:00:00");
    const endDate = new Date("2024-02-28T23:59:59");

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

  test("should handle empty orders array", () => {
    // ARRANGE
    const orders: typeof mockOrders = [];
    const startDate = new Date("2024-01-15T00:00:00");
    const endDate = new Date("2024-01-15T23:59:59");

    // ACT
    const result = calculateSalesReport(orders, startDate, endDate);

    // ASSERT
    expect(result.totalSales).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averageTicket).toBe(0);
  });
});

describe("getDateRangeForReportType", () => {
  test("should return daily range (today)", () => {
    // ARRANGE
    const now = new Date("2024-01-15T14:30:00");
    jest.useFakeTimers();
    jest.setSystemTime(now);

    // ACT
    const result = getDateRangeForReportType("daily");

    // ASSERT
    expect(result.from.getDate()).toBe(15);
    expect(result.from.getMonth()).toBe(0); // Janeiro
    expect(result.from.getHours()).toBe(0);
    expect(result.from.getMinutes()).toBe(0);
    expect(result.to.getDate()).toBe(15);
    expect(result.to.getHours()).toBe(23);
    expect(result.to.getMinutes()).toBe(59);

    jest.useRealTimers();
  });

  test("should return weekly range (start of week to today)", () => {
    // ARRANGE
    // Segunda-feira, 15 de Janeiro de 2024
    const monday = new Date("2024-01-15T14:30:00");
    jest.useFakeTimers();
    jest.setSystemTime(monday);

    // ACT
    const result = getDateRangeForReportType("weekly");

    // ASSERT
    // Deve começar na segunda-feira (dia 15)
    expect(result.from.getDate()).toBe(15);
    expect(result.from.getDay()).toBe(1); // Segunda-feira
    expect(result.to.getDate()).toBe(15);

    jest.useRealTimers();
  });

  test("should return monthly range (start of month to today)", () => {
    // ARRANGE
    const now = new Date("2024-01-15T14:30:00");
    jest.useFakeTimers();
    jest.setSystemTime(now);

    // ACT
    const result = getDateRangeForReportType("monthly");

    // ASSERT
    expect(result.from.getDate()).toBe(1);
    expect(result.from.getMonth()).toBe(0); // Janeiro
    expect(result.from.getHours()).toBe(0);
    expect(result.to.getDate()).toBe(15);

    jest.useRealTimers();
  });

  test("should handle default case", () => {
    // ARRANGE
    const now = new Date("2024-01-15T14:30:00");
    jest.useFakeTimers();
    jest.setSystemTime(now);

    // ACT
    const result = getDateRangeForReportType("invalid" as any);

    // ASSERT
    expect(result.from.getDate()).toBe(15);
    expect(result.to.getDate()).toBe(15);

    jest.useRealTimers();
  });
});

