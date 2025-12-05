import { useSalesReport } from "@/features/reports/hooks/use-sales-report";
import { createMockSaleItem } from "@/tests/fixtures/products";
import { createMockOrder, mockOrders } from "@/tests/fixtures/sales";
import { renderHook } from "@testing-library/react";
import type { DateRange } from "react-day-picker";

describe("useSalesReport", () => {
  test("should return empty report when date range is not provided", () => {
    // ARRANGE
    const orders = mockOrders;
    const dateRange: DateRange = {
      from: undefined,
      to: undefined,
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.totalSales).toBe(0);
    expect(result.current.totalRevenue).toBe(0);
    expect(result.current.averageTicket).toBe(0);
    expect(result.current.salesByPaymentMethod).toEqual({});
    expect(result.current.salesByCategory).toEqual({});
    expect(result.current.salesByHour).toEqual({});
    expect(result.current.topProducts).toEqual([]);
    expect(result.current.filteredOrders).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  test("should calculate report for orders within date range", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
        total: 9,
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T11:00:00"),
        total: 47,
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-16T10:00:00"), // Fora do range
        total: 18,
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.totalSales).toBe(2);
    expect(result.current.totalRevenue).toBe(56); // 9 + 47
    expect(result.current.averageTicket).toBe(28); // 56 / 2
    expect(result.current.filteredOrders.length).toBe(2);
  });

  test("should filter orders by date range correctly", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-10T10:00:00"),
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-20T10:00:00"),
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.filteredOrders.length).toBe(1);
    expect(result.current.filteredOrders[0].finalizadaEm).toEqual(
      new Date("2024-01-15T10:00:00")
    );
  });

  test("should calculate sales by payment method", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        paymentMethod: "CASH",
        total: 10,
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
      createMockOrder({
        paymentMethod: "PIX",
        total: 20,
        finalizadaEm: new Date("2024-01-15T11:00:00"),
      }),
      createMockOrder({
        paymentMethod: "CASH",
        total: 15,
        finalizadaEm: new Date("2024-01-15T12:00:00"),
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.salesByPaymentMethod.CASH).toBe(25); // 10 + 15
    expect(result.current.salesByPaymentMethod.PIX).toBe(20);
  });

  test("should calculate sales by category", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: 1,
              name: "Sorvete",
              price: 4.5,
              category: "Sorvetes",
              type: "unit",
            },
            quantity: 2,
          }),
        ],
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: 2,
              name: "Açaí",
              price: 47,
              category: "Açaí",
              type: "weight",
            },
            quantity: 1,
          }),
        ],
        finalizadaEm: new Date("2024-01-15T11:00:00"),
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.salesByCategory["Sorvetes"]).toBe(2);
    expect(result.current.salesByCategory["Açaí"]).toBe(1);
  });

  test("should calculate top products", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        items: [
          createMockSaleItem({
            product: {
              id: 1,
              name: "Sorvete Chocolate",
              price: 4.5,
              category: "Sorvetes",
              type: "unit",
            },
            quantity: 5,
          }),
          createMockSaleItem({
            product: {
              id: 2,
              name: "Sorvete Morango",
              price: 4.5,
              category: "Sorvetes",
              type: "unit",
            },
            quantity: 3,
          }),
        ],
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.topProducts.length).toBeGreaterThan(0);
    expect(result.current.totalItems).toBeGreaterThan(0);
  });

  test("should calculate sales by hour", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        total: 10,
        finalizadaEm: new Date("2024-01-15T10:00:00"),
      }),
      createMockOrder({
        total: 20,
        finalizadaEm: new Date("2024-01-15T10:30:00"),
      }),
      createMockOrder({
        total: 15,
        finalizadaEm: new Date("2024-01-15T14:00:00"),
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.salesByHour[10]).toBe(30); // 10 + 20
    expect(result.current.salesByHour[14]).toBe(15);
  });

  test("should use createdAt when finalizadaEm is not available", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: undefined,
        createdAt: new Date("2024-01-15T10:00:00"),
        total: 10,
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result } = renderHook(() => useSalesReport({ orders, dateRange }));

    // ASSERT
    expect(result.current.filteredOrders.length).toBe(1);
    expect(result.current.totalSales).toBe(1);
  });

  test("should recalculate when orders change", () => {
    // ARRANGE
    const initialOrders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
        total: 10,
      }),
    ];

    const dateRange: DateRange = {
      from: new Date("2024-01-15T00:00:00"),
      to: new Date("2024-01-15T23:59:59"),
    };

    // ACT
    const { result, rerender } = renderHook(
      ({ orders }) => useSalesReport({ orders, dateRange }),
      {
        initialProps: { orders: initialOrders },
      }
    );

    expect(result.current.totalSales).toBe(1);

    // ACT - Adicionar mais uma venda
    const newOrders = [
      ...initialOrders,
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T11:00:00"),
        total: 20,
      }),
    ];

    rerender({ orders: newOrders });

    // ASSERT
    expect(result.current.totalSales).toBe(2);
    expect(result.current.totalRevenue).toBe(30);
  });

  test("should recalculate when date range changes", () => {
    // ARRANGE
    const orders = [
      createMockOrder({
        finalizadaEm: new Date("2024-01-15T10:00:00"),
        total: 10,
      }),
      createMockOrder({
        finalizadaEm: new Date("2024-01-16T10:00:00"),
        total: 20,
      }),
    ];

    // ACT
    const { result, rerender } = renderHook(
      ({ dateRange }) => useSalesReport({ orders, dateRange }),
      {
        initialProps: {
          dateRange: {
            from: new Date("2024-01-15T00:00:00"),
            to: new Date("2024-01-15T23:59:59"),
          },
        },
      }
    );

    expect(result.current.totalSales).toBe(1);

    // ACT - Mudar o range de data
    rerender({
      dateRange: {
        from: new Date("2024-01-16T00:00:00"),
        to: new Date("2024-01-16T23:59:59"),
      },
    });

    // ASSERT
    expect(result.current.totalSales).toBe(1);
    expect(result.current.totalRevenue).toBe(20);
  });
});
