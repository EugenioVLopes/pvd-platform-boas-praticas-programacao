import { useSalesProcessing } from "@/features/sales/hooks/use-sales-processing";
import type { Order, PaymentMethod } from "@/features/sales";
import {
  createMockSaleItem,
  createMockWeightSaleItem,
  mockProducts,
} from "@/tests/fixtures/products";
import { createMockOrder } from "@/tests/fixtures/sales";
import { act, renderHook, waitFor } from "@testing-library/react";

// Mock dos hooks dependentes
const mockAddItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockClearCart = jest.fn();
const mockGetItemTotal = jest.fn((item) => {
  if (item.product.type === "weight" && item.weight) {
    return (item.product.price * item.weight) / 1000;
  }
  return item.product.price * (item.quantity ?? 1);
});

const mockUpdateOrder = jest.fn();
const mockRemoveOrder = jest.fn();
const mockAddOrder = jest.fn();
const mockCompleteSale = jest.fn();
const mockToast = jest.fn();

const mockSelectCategory = jest.fn();
const mockOpenWeightModal = jest.fn();
const mockOpenCustomizeModal = jest.fn();
const mockCloseModal = jest.fn();
const mockSetShowProducts = jest.fn();
const mockSetPaymentProcessing = jest.fn();
const mockOpenPaymentModal = jest.fn();
const mockSelectOrder = jest.fn();
const mockSetNewOrderName = jest.fn();
const mockOpenNewOrderModal = jest.fn();
const mockOpenActionModal = jest.fn();

jest.mock("@/features/products/hooks/use-products", () => ({
  useProducts: () => ({
    products: mockProducts,
  }),
}));

jest.mock("@/features/sales/hooks/use-cart", () => ({
  useCart: () => ({
    items: [],
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    clearCart: mockClearCart,
    getItemTotal: mockGetItemTotal,
  }),
}));

jest.mock("@/features/sales/hooks/use-orders", () => ({
  useOrders: () => ({
    orders: [],
    updateOrder: mockUpdateOrder,
    removeOrder: mockRemoveOrder,
    addOrder: mockAddOrder,
  }),
}));

jest.mock("@/features/sales/hooks/use-sales", () => ({
  useSales: () => ({
    completeSale: mockCompleteSale,
    loading: false,
    error: null,
  }),
}));

jest.mock("@/features/sales/hooks/use-sales-ui", () => ({
  useSalesUI: () => ({
    state: {
      currentOrderId: null,
      selectedCategory: null,
      selectedProduct: null,
      showProducts: false,
      isWeightModalOpen: false,
      isCustomizeModalOpen: false,
      isPaymentModalOpen: false,
      isNewOrderModalOpen: false,
      isActionModalOpen: false,
    },
    actions: {
      selectCategory: mockSelectCategory,
      openWeightModal: mockOpenWeightModal,
      openCustomizeModal: mockOpenCustomizeModal,
      closeModal: mockCloseModal,
      setShowProducts: mockSetShowProducts,
      setPaymentProcessing: mockSetPaymentProcessing,
      openPaymentModal: mockOpenPaymentModal,
      selectOrder: mockSelectOrder,
      setNewOrderName: mockSetNewOrderName,
      openNewOrderModal: mockOpenNewOrderModal,
      openActionModal: mockOpenActionModal,
    },
  }),
}));

jest.mock("@/hooks", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe("useSalesProcessing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Inicialização", () => {
    test("deve inicializar com valores padrão", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useSalesProcessing());

      // ASSERT
      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.temporaryItems).toEqual([]);
      expect(result.current.orders).toEqual([]);
      expect(result.current.currentOrder).toBeNull();
      expect(result.current.salesLoading).toBe(false);
      expect(result.current.salesError).toBeNull();
    });
  });

  describe("calculateOrderTotal", () => {
    test("deve calcular o total de uma comanda corretamente", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());
      const order: Order = createMockOrder({
        items: [
          createMockSaleItem({ quantity: 2 }),
          createMockSaleItem({ quantity: 3 }),
        ],
      });

      // ACT
      const total = result.current.calculateOrderTotal(order);

      // ASSERT
      // (4.5 * 2) + (4.5 * 3) = 9 + 13.5 = 22.5
      expect(total).toBe(22.5);
    });

    test("deve calcular total com produtos por peso", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());
      const order: Order = createMockOrder({
        items: [createMockWeightSaleItem({ weight: 500 })],
      });

      // ACT
      const total = result.current.calculateOrderTotal(order);

      // ASSERT
      // (47 * 500) / 1000 = 23.5
      expect(total).toBe(23.5);
    });
  });

  describe("handleCategorySelect", () => {
    test("deve selecionar uma categoria", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleCategorySelect("Sorvetes");
      });

      // ASSERT
      expect(mockSelectCategory).toHaveBeenCalledWith("Sorvetes");
    });
  });

  describe("handleProductSelect", () => {
    test("deve adicionar produto simples ao carrinho quando não há comanda ativa", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());
      const product = mockProducts[0]; // Sorvete de Chocolate (unit)

      // ACT
      act(() => {
        result.current.handleProductSelect(product);
      });

      // ASSERT
      expect(mockAddItem).toHaveBeenCalledWith(product, { quantity: 1 });
      expect(mockSetShowProducts).toHaveBeenCalledWith(false);
      expect(mockSelectCategory).toHaveBeenCalledWith(null);
    });

    test("deve abrir modal de peso para produto por peso", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());
      const product = mockProducts[2]; // Açaí no Peso

      // ACT
      act(() => {
        result.current.handleProductSelect(product);
      });

      // ASSERT
      expect(mockOpenWeightModal).toHaveBeenCalledWith(product);
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    test("deve abrir modal de customização para produto com opções", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());
      const product = mockProducts[3]; // Monte do Seu Jeito (tem options)

      // ACT
      act(() => {
        result.current.handleProductSelect(product);
      });

      // ASSERT
      expect(mockOpenCustomizeModal).toHaveBeenCalledWith(product);
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    test("deve adicionar produto à comanda ativa quando há currentOrderId", () => {
      // ARRANGE
      const mockOrder = createMockOrder({ id: "order-1" });
      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [mockOrder],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-sales-ui"),
        "useSalesUI"
      ).mockReturnValue({
        state: {
          currentOrderId: "order-1",
          selectedCategory: null,
          selectedProduct: null,
          showProducts: false,
          isWeightModalOpen: false,
          isCustomizeModalOpen: false,
          isPaymentModalOpen: false,
          isNewOrderModalOpen: false,
          isActionModalOpen: false,
        },
        actions: {
          selectCategory: mockSelectCategory,
          openWeightModal: mockOpenWeightModal,
          openCustomizeModal: mockOpenCustomizeModal,
          closeModal: mockCloseModal,
          setShowProducts: mockSetShowProducts,
          setPaymentProcessing: mockSetPaymentProcessing,
          openPaymentModal: mockOpenPaymentModal,
          selectOrder: mockSelectOrder,
          setNewOrderName: mockSetNewOrderName,
          openNewOrderModal: mockOpenNewOrderModal,
          openActionModal: mockOpenActionModal,
        },
      });

      const { result } = renderHook(() => useSalesProcessing());
      const product = mockProducts[0];

      // ACT
      act(() => {
        result.current.handleProductSelect(product);
      });

      // ASSERT
      expect(mockUpdateOrder).toHaveBeenCalledWith("order-1", {
        items: [
          ...mockOrder.items,
          { product, quantity: 1 },
        ],
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: "Produto Adicionado",
        description: `${product.name} adicionado à comanda`,
      });
      expect(mockSetShowProducts).toHaveBeenCalledWith(false);
    });
  });

  describe("handleWeightConfirm", () => {
    test("deve adicionar produto por peso ao carrinho", () => {
      // ARRANGE
      jest.spyOn(
        require("@/features/sales/hooks/use-sales-ui"),
        "useSalesUI"
      ).mockReturnValue({
        state: {
          currentOrderId: null,
          selectedProduct: mockProducts[2], // Açaí no Peso
          selectedCategory: null,
          showProducts: false,
          isWeightModalOpen: false,
          isCustomizeModalOpen: false,
          isPaymentModalOpen: false,
          isNewOrderModalOpen: false,
          isActionModalOpen: false,
        },
        actions: {
          selectCategory: mockSelectCategory,
          openWeightModal: mockOpenWeightModal,
          openCustomizeModal: mockOpenCustomizeModal,
          closeModal: mockCloseModal,
          setShowProducts: mockSetShowProducts,
          setPaymentProcessing: mockSetPaymentProcessing,
          openPaymentModal: mockOpenPaymentModal,
          selectOrder: mockSelectOrder,
          setNewOrderName: mockSetNewOrderName,
          openNewOrderModal: mockOpenNewOrderModal,
          openActionModal: mockOpenActionModal,
        },
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleWeightConfirm(500);
      });

      // ASSERT
      expect(mockAddItem).toHaveBeenCalledWith(mockProducts[2], {
        quantity: 1,
        weight: 500,
      });
      expect(mockCloseModal).toHaveBeenCalledWith("isWeightModalOpen");
      expect(mockSetShowProducts).toHaveBeenCalledWith(false);
    });

    test("deve adicionar produto por peso à comanda ativa", () => {
      // ARRANGE
      const mockOrder = createMockOrder({ id: "order-1" });
      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [mockOrder],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-sales-ui"),
        "useSalesUI"
      ).mockReturnValue({
        state: {
          currentOrderId: "order-1",
          selectedProduct: mockProducts[2],
          selectedCategory: null,
          showProducts: false,
          isWeightModalOpen: false,
          isCustomizeModalOpen: false,
          isPaymentModalOpen: false,
          isNewOrderModalOpen: false,
          isActionModalOpen: false,
        },
        actions: {
          selectCategory: mockSelectCategory,
          openWeightModal: mockOpenWeightModal,
          openCustomizeModal: mockOpenCustomizeModal,
          closeModal: mockCloseModal,
          setShowProducts: mockSetShowProducts,
          setPaymentProcessing: mockSetPaymentProcessing,
          openPaymentModal: mockOpenPaymentModal,
          selectOrder: mockSelectOrder,
          setNewOrderName: mockSetNewOrderName,
          openNewOrderModal: mockOpenNewOrderModal,
          openActionModal: mockOpenActionModal,
        },
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleWeightConfirm(500);
      });

      // ASSERT
      expect(mockUpdateOrder).toHaveBeenCalledWith("order-1", {
        items: [
          ...mockOrder.items,
          {
            product: mockProducts[2],
            quantity: 1,
            weight: 500,
          },
        ],
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: "Produto Adicionado",
        description: `${mockProducts[2].name} adicionado à comanda`,
      });
    });
  });

  describe("handleCustomizeConfirm", () => {
    test("deve adicionar produto customizado ao carrinho", () => {
      // ARRANGE
      jest.spyOn(
        require("@/features/sales/hooks/use-sales-ui"),
        "useSalesUI"
      ).mockReturnValue({
        state: {
          currentOrderId: null,
          selectedProduct: mockProducts[3], // Monte do Seu Jeito
          selectedCategory: null,
          showProducts: false,
          isWeightModalOpen: false,
          isCustomizeModalOpen: false,
          isPaymentModalOpen: false,
          isNewOrderModalOpen: false,
          isActionModalOpen: false,
        },
        actions: {
          selectCategory: mockSelectCategory,
          openWeightModal: mockOpenWeightModal,
          openCustomizeModal: mockOpenCustomizeModal,
          closeModal: mockCloseModal,
          setShowProducts: mockSetShowProducts,
          setPaymentProcessing: mockSetPaymentProcessing,
          openPaymentModal: mockOpenPaymentModal,
          selectOrder: mockSelectOrder,
          setNewOrderName: mockSetNewOrderName,
          openNewOrderModal: mockOpenNewOrderModal,
          openActionModal: mockOpenActionModal,
        },
      });

      const { result } = renderHook(() => useSalesProcessing());
      const selectedOptions = {
        frutas: ["Morango"],
        cremes: ["Chocolate"],
        acompanhamentos: ["Granola"],
      };
      const addons = [];

      // ACT
      act(() => {
        result.current.handleCustomizeConfirm(selectedOptions, addons);
      });

      // ASSERT
      expect(mockAddItem).toHaveBeenCalledWith(mockProducts[3], {
        quantity: 1,
        addons,
        selectedOptions,
      });
      expect(mockCloseModal).toHaveBeenCalledWith("isCustomizeModalOpen");
    });
  });

  describe("handlePayment", () => {
    test("deve finalizar venda com sucesso", async () => {
      // ARRANGE
      mockCompleteSale.mockResolvedValue(undefined);
      jest.spyOn(
        require("@/features/sales/hooks/use-cart"),
        "useCart"
      ).mockReturnValue({
        items: [createMockSaleItem({ quantity: 2 })],
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        clearCart: mockClearCart,
        getItemTotal: mockGetItemTotal,
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      await act(async () => {
        await result.current.handlePayment("CASH", 20);
      });

      // ASSERT
      await waitFor(() => {
        expect(mockCompleteSale).toHaveBeenCalled();
      });

      expect(mockClearCart).toHaveBeenCalled();
      expect(mockCloseModal).toHaveBeenCalledWith("isPaymentModalOpen");
      expect(mockSelectOrder).toHaveBeenCalledWith(null);
      expect(mockSetPaymentProcessing).toHaveBeenCalledWith(false);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Venda Finalizada",
        })
      );
    });

    test("deve finalizar venda de uma comanda ativa", async () => {
      // ARRANGE
      const mockOrder = createMockOrder({
        id: "order-1",
        customerName: "Cliente Teste",
        items: [createMockSaleItem({ quantity: 2 })],
      });

      mockCompleteSale.mockResolvedValue(undefined);
      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [mockOrder],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-sales-ui"),
        "useSalesUI"
      ).mockReturnValue({
        state: {
          currentOrderId: "order-1",
          selectedProduct: null,
          selectedCategory: null,
          showProducts: false,
          isWeightModalOpen: false,
          isCustomizeModalOpen: false,
          isPaymentModalOpen: false,
          isNewOrderModalOpen: false,
          isActionModalOpen: false,
        },
        actions: {
          selectCategory: mockSelectCategory,
          openWeightModal: mockOpenWeightModal,
          openCustomizeModal: mockOpenCustomizeModal,
          closeModal: mockCloseModal,
          setShowProducts: mockSetShowProducts,
          setPaymentProcessing: mockSetPaymentProcessing,
          openPaymentModal: mockOpenPaymentModal,
          selectOrder: mockSelectOrder,
          setNewOrderName: mockSetNewOrderName,
          openNewOrderModal: mockOpenNewOrderModal,
          openActionModal: mockOpenActionModal,
        },
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      await act(async () => {
        await result.current.handlePayment("PIX");
      });

      // ASSERT
      await waitFor(() => {
        expect(mockCompleteSale).toHaveBeenCalledWith({
          customerName: "Cliente Teste",
          items: mockOrder.items,
          paymentMethod: "PIX",
          cashAmount: undefined,
        });
      });

      expect(mockRemoveOrder).toHaveBeenCalledWith("order-1");
    });

    test("deve tratar erro ao finalizar venda", async () => {
      // ARRANGE
      const error = new Error("Erro ao processar pagamento");
      mockCompleteSale.mockRejectedValue(error);

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      await act(async () => {
        await result.current.handlePayment("CASH");
      });

      // ASSERT
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Erro",
          description: "Erro ao processar pagamento",
          variant: "destructive",
        });
      });

      expect(mockSetPaymentProcessing).toHaveBeenCalledWith(false);
    });
  });

  describe("createNewOrder", () => {
    test("deve criar nova comanda", () => {
      // ARRANGE
      jest.spyOn(
        require("@/features/sales/hooks/use-cart"),
        "useCart"
      ).mockReturnValue({
        items: [createMockSaleItem({ quantity: 2 })],
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        clearCart: mockClearCart,
        getItemTotal: mockGetItemTotal,
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.createNewOrder("João Silva");
      });

      // ASSERT
      expect(mockAddOrder).toHaveBeenCalledWith({
        customerName: "João Silva",
        items: [createMockSaleItem({ quantity: 2 })],
        status: "open",
      });
      expect(mockCloseModal).toHaveBeenCalledWith("isNewOrderModalOpen");
      expect(mockSetNewOrderName).toHaveBeenCalledWith("");
      expect(mockClearCart).toHaveBeenCalled();
    });
  });

  describe("handleActionSelection", () => {
    test("deve criar nova comanda quando action é 'new_order'", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleActionSelection("new_order", "Maria Santos");
      });

      // ASSERT
      expect(mockAddOrder).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Comanda Criada",
        description: "Comanda criada para Maria Santos",
      });
      expect(mockCloseModal).toHaveBeenCalledWith("isActionModalOpen");
    });

    test("deve adicionar produtos à comanda existente", () => {
      // ARRANGE
      const mockOrder = createMockOrder({
        id: "order-1",
        customerName: "João Silva",
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [mockOrder],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-cart"),
        "useCart"
      ).mockReturnValue({
        items: [createMockSaleItem({ quantity: 1 })],
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        clearCart: mockClearCart,
        getItemTotal: mockGetItemTotal,
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleActionSelection("add_to_order", "order-1");
      });

      // ASSERT
      expect(mockUpdateOrder).toHaveBeenCalledWith("order-1", {
        items: [...mockOrder.items, createMockSaleItem({ quantity: 1 })],
      });
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Produtos Adicionados",
        description: "1 produto(s) adicionado(s) à comanda de João Silva",
      });
      expect(mockSelectOrder).toHaveBeenCalledWith("order-1");
    });

    test("deve mostrar erro quando comanda não é encontrada", () => {
      // ARRANGE
      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleActionSelection("add_to_order", "order-inexistente");
      });

      // ASSERT
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro",
        description: "Comanda não encontrada",
        variant: "destructive",
      });
    });

    test("deve abrir modal de pagamento quando action é 'finalize_sale'", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleActionSelection("finalize_sale");
      });

      // ASSERT
      expect(mockOpenPaymentModal).toHaveBeenCalled();
      expect(mockCloseModal).toHaveBeenCalledWith("isActionModalOpen");
    });
  });

  describe("handleUpdateOrderItem", () => {
    test("deve atualizar item de uma comanda", () => {
      // ARRANGE
      const mockOrder = createMockOrder({
        id: "order-1",
        items: [
          createMockSaleItem({ quantity: 1 }),
          createMockSaleItem({ quantity: 2 }),
        ],
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [mockOrder],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      const { result } = renderHook(() => useSalesProcessing());
      const updatedItem = createMockSaleItem({ quantity: 3 });

      // ACT
      act(() => {
        result.current.handleUpdateOrderItem("order-1", 0, updatedItem);
      });

      // ASSERT
      expect(mockUpdateOrder).toHaveBeenCalledWith("order-1", {
        items: [updatedItem, createMockSaleItem({ quantity: 2 })],
      });
    });
  });

  describe("handleRemoveOrderItem", () => {
    test("deve remover item de uma comanda", () => {
      // ARRANGE
      const mockOrder = createMockOrder({
        id: "order-1",
        items: [
          createMockSaleItem({ quantity: 1 }),
          createMockSaleItem({ quantity: 2 }),
        ],
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [mockOrder],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ACT
      act(() => {
        result.current.handleRemoveOrderItem("order-1", 0);
      });

      // ASSERT
      expect(mockUpdateOrder).toHaveBeenCalledWith("order-1", {
        items: [createMockSaleItem({ quantity: 2 })],
      });
    });
  });

  describe("handleUpdateCartItem", () => {
    test("deve atualizar item do carrinho", () => {
      // ARRANGE
      const { result } = renderHook(() => useSalesProcessing());
      const updatedItem = createMockSaleItem({ quantity: 3 });

      // ACT
      act(() => {
        result.current.handleUpdateCartItem(0, updatedItem);
      });

      // ASSERT
      expect(mockRemoveItem).toHaveBeenCalledWith(0);
      expect(mockAddItem).toHaveBeenCalledWith(updatedItem.product, {
        quantity: 3,
        weight: updatedItem.weight,
        addons: updatedItem.addons,
        selectedOptions: updatedItem.selectedOptions,
      });
    });
  });

  describe("currentOrder", () => {
    test("deve retornar comanda atual quando há currentOrderId", () => {
      // ARRANGE
      const mockOrder = createMockOrder({ id: "order-1" });
      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [mockOrder],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-sales-ui"),
        "useSalesUI"
      ).mockReturnValue({
        state: {
          currentOrderId: "order-1",
          selectedProduct: null,
          selectedCategory: null,
          showProducts: false,
          isWeightModalOpen: false,
          isCustomizeModalOpen: false,
          isPaymentModalOpen: false,
          isNewOrderModalOpen: false,
          isActionModalOpen: false,
        },
        actions: {
          selectCategory: mockSelectCategory,
          openWeightModal: mockOpenWeightModal,
          openCustomizeModal: mockOpenCustomizeModal,
          closeModal: mockCloseModal,
          setShowProducts: mockSetShowProducts,
          setPaymentProcessing: mockSetPaymentProcessing,
          openPaymentModal: mockOpenPaymentModal,
          selectOrder: mockSelectOrder,
          setNewOrderName: mockSetNewOrderName,
          openNewOrderModal: mockOpenNewOrderModal,
          openActionModal: mockOpenActionModal,
        },
      });

      const { result } = renderHook(() => useSalesProcessing());

      // ASSERT
      expect(result.current.currentOrder).toEqual(mockOrder);
    });

    test("deve retornar null quando não há currentOrderId", () => {
      // ARRANGE
      // Resetar mocks para usar valores padrão
      jest.spyOn(
        require("@/features/sales/hooks/use-orders"),
        "useOrders"
      ).mockReturnValue({
        orders: [],
        updateOrder: mockUpdateOrder,
        removeOrder: mockRemoveOrder,
        addOrder: mockAddOrder,
      });

      jest.spyOn(
        require("@/features/sales/hooks/use-sales-ui"),
        "useSalesUI"
      ).mockReturnValue({
        state: {
          currentOrderId: null,
          selectedProduct: null,
          selectedCategory: null,
          showProducts: false,
          isWeightModalOpen: false,
          isCustomizeModalOpen: false,
          isPaymentModalOpen: false,
          isNewOrderModalOpen: false,
          isActionModalOpen: false,
        },
        actions: {
          selectCategory: mockSelectCategory,
          openWeightModal: mockOpenWeightModal,
          openCustomizeModal: mockOpenCustomizeModal,
          closeModal: mockCloseModal,
          setShowProducts: mockSetShowProducts,
          setPaymentProcessing: mockSetPaymentProcessing,
          openPaymentModal: mockOpenPaymentModal,
          selectOrder: mockSelectOrder,
          setNewOrderName: mockSetNewOrderName,
          openNewOrderModal: mockOpenNewOrderModal,
          openActionModal: mockOpenActionModal,
        },
      });

      // ACT
      const { result } = renderHook(() => useSalesProcessing());

      // ASSERT
      expect(result.current.currentOrder).toBeNull();
    });
  });
});

