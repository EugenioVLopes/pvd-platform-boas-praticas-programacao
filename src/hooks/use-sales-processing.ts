import { useCallback, useMemo } from "react";

import { useOrders } from "@/hooks/business/use-orders";
import { useProducts } from "@/hooks/business/use-products";
import { CompleteSaleData, useSales } from "@/hooks/business/use-sales";
import { useToast } from "@/hooks/core/use-toast";
import { useCart } from "@/hooks/ui/use-cart";
import { useSalesUI } from "@/hooks/ui/use-sales-ui";
import { formatCurrency } from "@/lib/utils";
import type { Order, PaymentMethod } from "@/types/order";
import type { Product, SaleItem } from "@/types/product";

export function useSalesProcessing() {
  // Hooks consolidados
  const { products } = useProducts();
  const {
    items: temporaryItems,
    addItem,
    removeItem,
    clearCart,
    getItemTotal,
  } = useCart();
  const { orders, updateOrder, removeOrder, addOrder } = useOrders();
  const { toast } = useToast();
  const { completeSale, loading: salesLoading, error: salesError } = useSales();
  const { state: uiState, actions: uiActions } = useSalesUI();

  // Usar função de cálculo do useCart para consistência
  const calculateItemTotal = getItemTotal;

  const calculateOrderTotal = useMemo(
    () => (order: Order) =>
      order.items.reduce((sum, item) => sum + calculateItemTotal(item), 0),
    [calculateItemTotal]
  );

  // Handlers de categoria usando o novo hook de UI
  const handleCategorySelect = useCallback(
    (category: string) => {
      uiActions.selectCategory(category);
    },
    [uiActions]
  );

  // Handlers de produto usando o novo hook de UI
  const handleProductSelect = useCallback(
    (product: Product) => {
      if (product.type === "weight") {
        uiActions.openWeightModal(product);
      } else if (product.options) {
        uiActions.openCustomizeModal(product);
      } else {
        addItem(product, { quantity: 1 });
        uiActions.setShowProducts(false);
        uiActions.selectCategory(null);
      }
    },
    [addItem, uiActions]
  );

  // Handler de confirmação de peso usando o novo hook de UI
  const handleWeightConfirm = useCallback(
    (weight: number) => {
      if (uiState.selectedProduct) {
        addItem(uiState.selectedProduct, { quantity: 1, weight });
      }
      uiActions.closeModal("isWeightModalOpen");
      uiActions.setShowProducts(false);
      uiActions.selectCategory(null);
    },
    [uiState.selectedProduct, addItem, uiActions]
  );

  // Handler de customização usando o novo hook de UI
  const handleCustomizeConfirm = useCallback(
    (
      selectedOptions: {
        frutas: string[];
        cremes: string[];
        acompanhamentos: string[];
      },
      addons: Product[] = []
    ) => {
      if (uiState.selectedProduct) {
        addItem(uiState.selectedProduct, {
          quantity: 1,
          addons,
          selectedOptions,
        });
        console.log("Item adicionado:", {
          product: uiState.selectedProduct.name,
          addons,
          selectedOptions,
        });
      }
      uiActions.closeModal("isCustomizeModalOpen");
      uiActions.setShowProducts(false);
      uiActions.selectCategory(null);
    },
    [uiState.selectedProduct, addItem, uiActions]
  );
  // Handler de pagamento usando o novo hook de vendas
  const handlePayment = useCallback(
    async (paymentMethod: PaymentMethod, cashAmount?: number) => {
      try {
        uiActions.setPaymentProcessing(true);

        // Determinar o pedido a finalizar
        const currentOrder = uiState.currentOrderId
          ? orders.find((o) => o.id === uiState.currentOrderId)
          : null;

        const customerName = currentOrder?.customerName || "Venda Direta";
        const itemsToFinalize = currentOrder?.items || temporaryItems;

        // Preparar dados da venda
        const saleData: CompleteSaleData = {
          customerName,
          items: itemsToFinalize,
          paymentMethod,
          cashAmount,
        };

        // Finalizar venda usando o novo hook
        await completeSale(saleData);

        // Limpar estado após sucesso
        if (currentOrder) {
          removeOrder(currentOrder.id);
        }

        uiActions.closeModal("isPaymentModalOpen");
        uiActions.selectOrder(null);
        clearCart();

        // Calcular total para exibição
        const total = itemsToFinalize.reduce(
          (sum, item) => sum + calculateItemTotal(item),
          0
        );
        const change = cashAmount ? cashAmount - total : 0;

        toast({
          title: "Venda Finalizada",
          description: `Venda finalizada para ${customerName}. Total: ${formatCurrency(total)}${cashAmount ? `. Troco: ${formatCurrency(change)}` : ""}`,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao finalizar venda";
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        uiActions.setPaymentProcessing(false);
      }
    },
    [
      uiState.currentOrderId,
      orders,
      temporaryItems,
      completeSale,
      removeOrder,
      clearCart,
      calculateItemTotal,
      toast,
      uiActions,
    ]
  );

  // Criação de novo pedido usando o hook de UI
  const createNewOrder = useCallback(
    (customerName: string) => {
      const orderData = {
        customerName,
        items: temporaryItems,
        status: "open" as const,
      };

      addOrder(orderData);

      // Limpar seleção atual já que criamos um novo pedido
      uiActions.closeModal("isNewOrderModalOpen");
      uiActions.setNewOrderName("");
      clearCart();
    },
    [addOrder, temporaryItems, clearCart, uiActions]
  );

  // Handler de seleção de ação usando o hook de UI
  const handleActionSelection = useCallback(
    (
      action: "add_to_order" | "finalize_sale" | "new_order",
      orderIdOrName?: string
    ) => {
      if (action === "new_order" && orderIdOrName) {
        createNewOrder(orderIdOrName);
        toast({
          title: "Comanda Criada",
          description: `Comanda criada para ${orderIdOrName}`,
        });
      } else if (action === "add_to_order" && orderIdOrName) {
        const order = orders.find((o: Order) => o.id === orderIdOrName);
        if (order) {
          updateOrder(order.id, {
            items: [...order.items, ...temporaryItems],
          });
          clearCart();
          toast({
            title: "Produtos Adicionados",
            description: `${temporaryItems.length} produto(s) adicionado(s) à comanda de ${order.customerName}`,
          });
          // Selecionar a comanda para visualização
          uiActions.selectOrder(orderIdOrName);
        } else {
          toast({
            title: "Erro",
            description: "Comanda não encontrada",
            variant: "destructive",
          });
        }
      } else if (action === "finalize_sale") {
        uiActions.openPaymentModal();
      }

      // Limpar estado da UI
      uiActions.closeModal("isActionModalOpen");
      uiActions.setShowProducts(false);
      // Não limpar a seleção se produtos foram adicionados a uma comanda
      if (action !== "add_to_order") {
        uiActions.selectOrder(null);
      }
    },
    [
      orders,
      temporaryItems,
      updateOrder,
      createNewOrder,
      clearCart,
      uiActions,
      toast,
    ]
  );

  // Handlers de atualização de itens do pedido
  const handleUpdateOrderItem = useCallback(
    (orderId: string, itemIndex: number, updatedItem: SaleItem) => {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const updatedItems = [...order.items];
        updatedItems[itemIndex] = updatedItem;
        updateOrder(order.id, { items: updatedItems });
      }
    },
    [orders, updateOrder]
  );

  const handleRemoveOrderItem = useCallback(
    (orderId: string, itemIndex: number) => {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const updatedItems = order.items.filter((_, idx) => idx !== itemIndex);
        updateOrder(order.id, { items: updatedItems });
      }
    },
    [orders, updateOrder]
  );

  // Handler otimizado para atualizar item do carrinho
  const handleUpdateCartItem = useCallback(
    (index: number, item: SaleItem) => {
      removeItem(index);
      addItem(item.product, {
        quantity: item.quantity || 1,
        weight: item.weight,
        addons: item.addons,
        selectedOptions: item.selectedOptions,
      });
    },
    [removeItem, addItem]
  );

  // Obter pedido atual baseado no ID selecionado
  const currentOrder = useMemo(() => {
    return uiState.currentOrderId
      ? orders.find((o) => o.id === uiState.currentOrderId) || null
      : null;
  }, [uiState.currentOrderId, orders]);

  return {
    // Estado consolidado
    uiState,
    uiActions,
    currentOrder,

    // Dados
    products,
    temporaryItems,
    orders,

    // Estados de loading/error
    salesLoading,
    salesError,

    // Funções de cálculo
    calculateOrderTotal,
    calculateItemTotal,

    // Handlers principais
    handleCategorySelect,
    handleProductSelect,
    handleWeightConfirm,
    handleCustomizeConfirm,
    handlePayment,
    createNewOrder,
    handleActionSelection,

    // Handlers de pedidos
    handleUpdateOrderItem,
    handleRemoveOrderItem,
    removeOrder,

    // Handlers de carrinho
    handleRemoveFromCart: removeItem,
    handleUpdateCartItem,
  };
}
