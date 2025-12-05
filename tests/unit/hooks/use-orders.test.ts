import { useOrders } from "@/features/sales/hooks/use-orders";
import { createMockSaleItem, mockProducts } from "@/tests/fixtures/products";
import { act, renderHook, waitFor } from "@testing-library/react";

// Mock crypto.randomUUID
const mockUUID = "test-uuid-123";
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: jest.fn(() => mockUUID),
  },
});

// Mock localStorage e sessionStorage
const createMockStorage = () => {
  return {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
  };
};

const mockLocalStorage = createMockStorage();
const mockSessionStorage = createMockStorage();

Object.defineProperty(globalThis, "localStorage", { value: mockLocalStorage });
Object.defineProperty(globalThis, "sessionStorage", { value: mockSessionStorage });

// Silenciar console.error durante os testes (erros esperados)
const originalConsoleError = console.error;

describe("useOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);
    // Silencia console.error para testes que esperam erros
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restaura console.error após cada teste
    console.error = originalConsoleError;
  });

  describe("Inicialização", () => {
    test("deve inicializar com array vazio de pedidos", async () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useOrders());

      // ASSERT
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.orders).toEqual([]);
      expect(result.current.orderCount).toBe(0);
      expect(result.current.totalValue).toBe(0);
      expect(result.current.error).toBeNull();
    });

    test("deve carregar pedidos do localStorage quando persistToStorage está habilitado", async () => {
      // ARRANGE
      const storedOrders = [
        {
          id: "order-1",
          customerName: "João",
          items: [{ product: mockProducts[0], quantity: 1 }],
          status: "completed",
          paymentMethod: "CASH",
          total: 4.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockLocalStorage.getItem.mockReturnValueOnce(
        JSON.stringify(storedOrders) as unknown as null
      );

      // ACT
      const { result } = renderHook(() =>
        useOrders({ persistToStorage: true, storageType: "localStorage" })
      );

      // ASSERT
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].customerName).toBe("João");
    });

    test("deve carregar pedidos do sessionStorage quando configurado", async () => {
      // ARRANGE
      const storedOrders = [
        {
          id: "order-1",
          customerName: "Maria",
          items: [{ product: mockProducts[0], quantity: 2 }],
          status: "open",
          paymentMethod: "PIX",
          total: 9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockSessionStorage.getItem.mockReturnValueOnce(
        JSON.stringify(storedOrders) as unknown as null
      );

      // ACT
      const { result } = renderHook(() =>
        useOrders({ persistToStorage: true, storageType: "sessionStorage" })
      );

      // ASSERT
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].customerName).toBe("Maria");
    });

    test("deve definir erro quando falha ao carregar do storage", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValueOnce(
        "invalid-json{{{" as unknown as null
      );

      // ACT
      const { result } = renderHook(() =>
        useOrders({ persistToStorage: true })
      );

      // ASSERT
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Erro ao carregar pedidos do storage");
    });

    test("deve não carregar do storage quando enabled é false", async () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useOrders({ enabled: false }));

      // ASSERT
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.orders).toEqual([]);
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });

    test("deve não carregar do storage quando persistToStorage é false", async () => {
      // ARRANGE & ACT
      const { result } = renderHook(() =>
        useOrders({ persistToStorage: false })
      );

      // ASSERT
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.orders).toEqual([]);
    });
  });

  describe("addOrder", () => {
    test("deve adicionar um novo pedido", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const newOrder = {
        customerName: "Cliente Teste",
        items: [createMockSaleItem({ quantity: 1 })],
        status: "open" as const,
        paymentMethod: "CASH" as const,
        total: 4.5,
      };

      // ACT
      act(() => {
        result.current.addOrder(newOrder);
      });

      // ASSERT
      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].customerName).toBe("Cliente Teste");
      expect(result.current.orders[0].id).toBe(mockUUID);
      expect(result.current.orderCount).toBe(1);
    });

    test("deve rejeitar pedido sem nome de cliente", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders({ validateOrders: true }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const invalidOrder = {
        customerName: "",
        items: [createMockSaleItem()],
        status: "open" as const,
        paymentMethod: "CASH" as const,
        total: 4.5,
      };

      // ACT
      act(() => {
        result.current.addOrder(invalidOrder);
      });

      // ASSERT
      expect(result.current.orders).toHaveLength(0);
      expect(result.current.error).toBe("Nome do cliente é obrigatório");
    });

    test("deve rejeitar pedido com status inválido", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders({ validateOrders: true }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const invalidOrder = {
        customerName: "Cliente",
        items: [createMockSaleItem()],
        status: "invalid-status" as "open",
        paymentMethod: "CASH" as const,
        total: 4.5,
      };

      // ACT
      act(() => {
        result.current.addOrder(invalidOrder);
      });

      // ASSERT
      expect(result.current.orders).toHaveLength(0);
      expect(result.current.error).toBe(
        "Status do pedido deve ser 'open' ou 'completed'"
      );
    });

    test("deve adicionar pedido sem validação quando validateOrders é false", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders({ validateOrders: false }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const order = {
        customerName: "",
        items: [],
        status: "invalid" as "open",
        paymentMethod: "CASH" as const,
        total: 0,
      };

      // ACT
      act(() => {
        result.current.addOrder(order);
      });

      // ASSERT
      expect(result.current.orders).toHaveLength(1);
    });
  });

  describe("updateOrder", () => {
    test("deve atualizar um pedido existente", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente Original",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // ACT
      act(() => {
        result.current.updateOrder(mockUUID, {
          customerName: "Cliente Atualizado",
        });
      });

      // ASSERT
      expect(result.current.orders[0].customerName).toBe("Cliente Atualizado");
    });

    test("deve rejeitar atualização com nome de cliente vazio", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders({ validateOrders: true }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente Original",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // ACT
      act(() => {
        result.current.updateOrder(mockUUID, { customerName: "   " });
      });

      // ASSERT
      expect(result.current.error).toBe("Nome do cliente é obrigatório");
      expect(result.current.orders[0].customerName).toBe("Cliente Original");
    });

    test("deve atualizar status do pedido", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // ACT
      act(() => {
        result.current.updateOrder(mockUUID, { status: "completed" });
      });

      // ASSERT
      expect(result.current.orders[0].status).toBe("completed");
    });

    test("deve rejeitar atualização com status inválido", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders({ validateOrders: true }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // ACT
      act(() => {
        result.current.updateOrder(mockUUID, { status: "invalid" as "open" });
      });

      // ASSERT
      expect(result.current.error).toBe(
        "Status do pedido deve ser 'open' ou 'completed'"
      );
    });

    test("deve rejeitar atualização com items inválidos", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders({ validateOrders: true }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // ACT
      act(() => {
        result.current.updateOrder(mockUUID, {
          items: "invalid" as unknown as [],
        });
      });

      // ASSERT
      expect(result.current.error).toBe("Items do pedido devem ser um array");
    });
  });

  describe("removeOrder", () => {
    test("deve remover um pedido pelo id", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      expect(result.current.orders).toHaveLength(1);

      // ACT
      act(() => {
        result.current.removeOrder(mockUUID);
      });

      // ASSERT
      expect(result.current.orders).toHaveLength(0);
    });

    test("deve não fazer nada ao tentar remover pedido inexistente", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // ACT
      act(() => {
        result.current.removeOrder("non-existent-id");
      });

      // ASSERT
      expect(result.current.orders).toHaveLength(1);
    });
  });

  describe("getOrder", () => {
    test("deve retornar pedido pelo id", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente Específico",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // ACT
      const order = result.current.getOrder(mockUUID);

      // ASSERT
      expect(order).toBeDefined();
      expect(order?.customerName).toBe("Cliente Específico");
    });

    test("deve retornar undefined para id inexistente", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      // ACT
      const order = result.current.getOrder("non-existent");

      // ASSERT
      expect(order).toBeUndefined();
    });
  });

  describe("clearOrders", () => {
    test("deve limpar todos os pedidos", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente 1",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      expect(result.current.orders).toHaveLength(1);

      // ACT
      act(() => {
        result.current.clearOrders();
      });

      // ASSERT
      expect(result.current.orders).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe("clearError", () => {
    test("deve limpar erro", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders({ validateOrders: true }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Provoca um erro
      act(() => {
        result.current.addOrder({
          customerName: "",
          items: [],
          status: "open",
          paymentMethod: "CASH",
          total: 0,
        });
      });

      expect(result.current.error).not.toBeNull();

      // ACT
      act(() => {
        result.current.clearError();
      });

      // ASSERT
      expect(result.current.error).toBeNull();
    });
  });

  describe("totalValue", () => {
    test("deve calcular total de todos os pedidos", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente 1",
          items: [createMockSaleItem({ quantity: 1 })],
          status: "completed",
          paymentMethod: "CASH",
          total: 10,
        });
      });

      // Como crypto.randomUUID é mocado para retornar sempre o mesmo valor,
      // vou adicionar outro pedido e verificar se o mock foi chamado de novo
      const secondMockUUID = "test-uuid-456";
      (globalThis.crypto.randomUUID as jest.Mock).mockReturnValueOnce(
        secondMockUUID
      );

      act(() => {
        result.current.addOrder({
          customerName: "Cliente 2",
          items: [createMockSaleItem({ quantity: 2 })],
          status: "completed",
          paymentMethod: "PIX",
          total: 20,
        });
      });

      // ASSERT
      expect(result.current.totalValue).toBe(30);
    });

    test("deve calcular total baseado em items quando total não está definido", async () => {
      // ARRANGE
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [
            { product: mockProducts[0], quantity: 2 }, // 4.5 * 2 = 9.0
          ],
          status: "completed",
          paymentMethod: "CASH",
          total: 0, // Total não definido, vai calcular pelos items
        });
      });

      // ASSERT - Quando total é 0, usa o cálculo dos items
      expect(result.current.totalValue).toBe(9);
    });
  });

  describe("Persistência", () => {
    test("deve salvar no localStorage ao adicionar pedido", async () => {
      // ARRANGE
      const { result } = renderHook(() =>
        useOrders({ persistToStorage: true, storageType: "localStorage" })
      );
      await waitFor(() => expect(result.current.loading).toBe(false));

      // ACT
      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      // Aguarda o useEffect de persistência
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      // ASSERT
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "orders",
        expect.any(String)
      );
    });

    test("deve usar storageKey customizado", async () => {
      // ARRANGE
      const customKey = "custom-orders-key";
      const { result } = renderHook(() =>
        useOrders({ persistToStorage: true, storageKey: customKey })
      );
      await waitFor(() => expect(result.current.loading).toBe(false));

      // ACT
      act(() => {
        result.current.addOrder({
          customerName: "Cliente",
          items: [createMockSaleItem()],
          status: "open",
          paymentMethod: "CASH",
          total: 4.5,
        });
      });

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      // ASSERT
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        customKey,
        expect.any(String)
      );
    });
  });
});
