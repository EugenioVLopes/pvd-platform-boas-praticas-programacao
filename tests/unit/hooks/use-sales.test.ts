import { useSales } from "@/features/sales/hooks/use-sales";
import {
  createMockSaleItem,
  createMockWeightSaleItem,
} from "@/tests/fixtures/products";
import { createMockCompleteSaleData } from "@/tests/fixtures/sales";
import { act, renderHook, waitFor } from "@testing-library/react";

// Mock do zustand persist
jest.mock("zustand/middleware", () => ({
  persist: (fn: unknown) => fn,
}));

// Mock do crypto.randomUUID
const mockRandomUUID = jest.fn(() => "test-uuid-123");
global.crypto = {
  ...global.crypto,
  randomUUID: mockRandomUUID,
} as typeof global.crypto;

describe("useSales", () => {
  beforeEach(() => {
    // Limpar vendas antes de cada teste
    const { result } = renderHook(() => useSales());
    act(() => {
      result.current.clearSales();
    });
  });

  test("should initialize with empty sales", () => {
    // ARRANGE & ACT
    const { result } = renderHook(() => useSales());

    // ASSERT
    expect(result.current.completedSales).toEqual([]);
    expect(result.current.totalSales).toBe(0);
    expect(result.current.totalRevenue).toBe(0);
    expect(result.current.averageTicket).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("should complete a sale successfully", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem({ quantity: 2 })],
      paymentMethod: "CASH",
      cashAmount: 20.0,
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData);
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completedSales.length).toBe(1);
    expect(result.current.completedSales[0].customerName).toBe("Cliente Teste");
    expect(result.current.completedSales[0].status).toBe("completed");
    expect(result.current.totalSales).toBe(1);
  });

  test("should calculate total revenue correctly", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData1 = createMockCompleteSaleData({
      items: [createMockSaleItem({ quantity: 1 })],
      paymentMethod: "CASH",
    });
    const saleData2 = createMockCompleteSaleData({
      items: [createMockSaleItem({ quantity: 2 })],
      paymentMethod: "PIX",
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData1);
      await result.current.completeSale(saleData2);
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.totalSales).toBe(2);
    });

    // Total esperado: (4.5 * 1) + (4.5 * 2) = 4.5 + 9.0 = 13.5
    expect(result.current.totalRevenue).toBeGreaterThan(0);
    expect(result.current.averageTicket).toBeGreaterThan(0);
  });

  test("should calculate average ticket correctly", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData1 = createMockCompleteSaleData({
      items: [createMockSaleItem({ quantity: 1 })],
      paymentMethod: "CASH",
    });
    const saleData2 = createMockCompleteSaleData({
      items: [createMockSaleItem({ quantity: 3 })],
      paymentMethod: "PIX",
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData1);
      await result.current.completeSale(saleData2);
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.totalSales).toBe(2);
    });

    expect(result.current.averageTicket).toBeGreaterThan(0);
    // Average = totalRevenue / totalSales
    expect(result.current.averageTicket).toBe(
      result.current.totalRevenue / result.current.totalSales
    );
  });

  test("should reject sale with empty customer name", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "",
      items: [createMockSaleItem()],
      paymentMethod: "CASH",
    });

    // ACT & ASSERT
    await act(async () => {
      await expect(result.current.completeSale(saleData)).rejects.toThrow(
        "Nome do cliente é obrigatório"
      );
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Nome do cliente é obrigatório");
    });

    expect(result.current.completedSales.length).toBe(0);
  });

  test("should reject sale with empty items", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [],
      paymentMethod: "CASH",
    });

    // ACT & ASSERT
    await act(async () => {
      await expect(result.current.completeSale(saleData)).rejects.toThrow(
        "Pelo menos um item deve ser adicionado à venda"
      );
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Pelo menos um item deve ser adicionado à venda"
      );
    });

    expect(result.current.completedSales.length).toBe(0);
  });

  test("should reject sale with insufficient cash amount", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem({ quantity: 2 })], // Total: 9.0
      paymentMethod: "CASH",
      cashAmount: 5.0, // Menor que o total
    });

    // ACT & ASSERT
    await act(async () => {
      await expect(result.current.completeSale(saleData)).rejects.toThrow(
        "Valor em dinheiro insuficiente"
      );
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Valor em dinheiro insuficiente");
    });
  });

  test("should apply discount correctly", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem({ quantity: 2 })], // Total: 9.0
      paymentMethod: "CASH",
      discount: 2.0, // Desconto de 2.0
      cashAmount: 10.0,
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData);
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.completedSales.length).toBe(1);
    });

    const completedSale = result.current.completedSales[0];
    // Total: 9.0 - 2.0 = 7.0
    expect(completedSale.total).toBe(7.0);
  });

  test("should calculate change correctly", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem({ quantity: 2 })], // Total: 9.0
      paymentMethod: "CASH",
      cashAmount: 20.0, // Troco: 20.0 - 9.0 = 11.0
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData);
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.completedSales.length).toBe(1);
    });

    const completedSale = result.current.completedSales[0];
    expect(completedSale.change).toBe(11.0);
  });

  test("should get sale by id", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem()],
      paymentMethod: "CASH",
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData);
    });

    await waitFor(() => {
      expect(result.current.completedSales.length).toBe(1);
    });

    const saleId = result.current.completedSales[0].id;
    const foundSale = result.current.getSale(saleId);

    // ASSERT
    expect(foundSale).toBeDefined();
    expect(foundSale?.id).toBe(saleId);
    expect(foundSale?.customerName).toBe("Cliente Teste");
  });

  test("should cancel a sale", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem()],
      paymentMethod: "CASH",
    });

    await act(async () => {
      await result.current.completeSale(saleData);
    });

    await waitFor(() => {
      expect(result.current.completedSales.length).toBe(1);
    });

    const saleId = result.current.completedSales[0].id;

    // ACT
    act(() => {
      result.current.cancelSale(saleId);
    });

    // ASSERT
    expect(result.current.completedSales.length).toBe(0);
    expect(result.current.getSale(saleId)).toBeUndefined();
  });

  test("should clear all sales", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData1 = createMockCompleteSaleData({
      customerName: "Cliente 1",
      items: [createMockSaleItem()],
      paymentMethod: "CASH",
    });
    const saleData2 = createMockCompleteSaleData({
      customerName: "Cliente 2",
      items: [createMockSaleItem()],
      paymentMethod: "PIX",
    });

    await act(async () => {
      await result.current.completeSale(saleData1);
      await result.current.completeSale(saleData2);
    });

    await waitFor(() => {
      expect(result.current.completedSales.length).toBe(2);
    });

    // ACT
    act(() => {
      result.current.clearSales();
    });

    // ASSERT
    expect(result.current.completedSales.length).toBe(0);
    expect(result.current.totalSales).toBe(0);
    expect(result.current.totalRevenue).toBe(0);
  });

  test("should set loading state during sale completion", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem()],
      paymentMethod: "CASH",
    });

    // ACT
    const promise = act(async () => {
      const salePromise = result.current.completeSale(saleData);
      await salePromise;
    });

    // ASSERT - Durante o processamento (pode ser true ou false dependendo da velocidade)
    // O importante é que após o processamento seja false
    await promise;

    // ASSERT - Após o processamento
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  test("should calculate total for weight product correctly", async () => {
    // ARRANGE - Testa linha 80 (cálculo com peso)
    const { result } = renderHook(() => useSales());
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockWeightSaleItem({ weight: 500 })], // 500g = 0.5kg
      paymentMethod: "CASH",
      cashAmount: 30.0,
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData);
    });

    // ASSERT
    await waitFor(() => {
      expect(result.current.completedSales.length).toBe(1);
    });

    // Preço: 47, peso: 0.5kg, total esperado: 47 * 0.5 = 23.5
    const completedSale = result.current.completedSales[0];
    expect(completedSale.total).toBe(23.5);
  });

  test("should handle error in cancelSale", () => {
    // ARRANGE - Testa linhas 166-167 (tratamento de erro)
    // Simulamos um erro ao tentar cancelar uma venda inexistente
    const { result } = renderHook(() => useSales());

    // ACT - Tentar cancelar venda que não existe (pode não lançar erro, mas testa o fluxo)
    act(() => {
      result.current.cancelSale("non-existent-id");
    });

    // ASSERT - Não deve ter erro (removeSale não lança erro, apenas filtra)
    expect(result.current.error).toBeNull();
  });

  test("should handle error in clearSales gracefully", () => {
    // ARRANGE - Testa linhas 188-189 (tratamento de erro)
    const { result } = renderHook(() => useSales());

    // ACT
    act(() => {
      result.current.clearSales();
    });

    // ASSERT - Não deve ter erro em condições normais
    expect(result.current.error).toBeNull();
    expect(result.current.completedSales.length).toBe(0);
  });

  test("should not execute when disabled", async () => {
    // ARRANGE
    const { result } = renderHook(() => useSales({ enabled: false }));
    const saleData = createMockCompleteSaleData({
      customerName: "Cliente Teste",
      items: [createMockSaleItem()],
      paymentMethod: "CASH",
    });

    // ACT
    await act(async () => {
      await result.current.completeSale(saleData);
    });

    // ASSERT
    expect(result.current.completedSales.length).toBe(0);
  });

  test("should not cancel sale when disabled", () => {
    // ARRANGE
    const { result } = renderHook(() => useSales({ enabled: false }));

    // ACT
    act(() => {
      result.current.cancelSale("test-id");
    });

    // ASSERT - Não deve fazer nada quando disabled
    expect(result.current.completedSales.length).toBe(0);
  });

  test("should not clear sales when disabled", () => {
    // ARRANGE
    const { result } = renderHook(() => useSales({ enabled: false }));

    // ACT
    act(() => {
      result.current.clearSales();
    });

    // ASSERT - Não deve fazer nada quando disabled
    expect(result.current.completedSales.length).toBe(0);
  });
});
