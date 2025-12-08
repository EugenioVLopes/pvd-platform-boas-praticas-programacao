import { useCallback, useMemo } from "react";

import type { Product, SaleItem } from "@/features/products";
import { useProducts } from "@/features/products";
import type { CompleteSaleData, Order, PaymentMethod } from "@/features/sales";
import { useCart, useOrders, useSales, useSalesUI } from "@/features/sales";
import { useToast } from "@/hooks";
import { formatCurrency } from "@/lib";

export function useSalesProcessing() {
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

  const calculateItemTotal = getItemTotal;

  const calculateOrderTotal = useMemo(
    () => (order: Order) =>
      order.items.reduce((sum, item) => sum + calculateItemTotal(item), 0),
    [calculateItemTotal]
  );

  const handleCategorySelect = useCallback(
    (category: string) => {
      uiActions.selectCategory(category);
    },
    [uiActions]
  );

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (uiState.currentOrderId) {
        const order = orders.find((o) => o.id === uiState.currentOrderId);
        if (order) {
          if (product.type === "weight") {
            uiActions.openWeightModal(product);
          } else if (product.options) {
            uiActions.openCustomizeModal(product);
          } else {
            const newItem: SaleItem = {
              product,
              quantity: 1,
            };
            updateOrder(order.id, {
              items: [...order.items, newItem],
            });
            toast({
              title: "Produto Adicionado",
              description: `${product.name} adicionado à comanda`,
            });
            uiActions.setShowProducts(false);
            uiActions.selectCategory(null);
          }
          return;
        }
      }

      // Caso contrário, adicionar ao carrinho temporário
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
    [addItem, uiActions, uiState.currentOrderId, orders, updateOrder, toast]
  );

  const handleWeightConfirm = useCallback(
    (weight: number) => {
      if (uiState.selectedProduct) {
        if (uiState.currentOrderId) {
          const order = orders.find((o) => o.id === uiState.currentOrderId);
          if (order) {
            const newItem: SaleItem = {
              product: uiState.selectedProduct,
              quantity: 1,
              weight,
            };
            updateOrder(order.id, {
              items: [...order.items, newItem],
            });
            toast({
              title: "Produto Adicionado",
              description: `${uiState.selectedProduct.name} adicionado à comanda`,
            });
            uiActions.closeModal("isWeightModalOpen");
            uiActions.setShowProducts(false);
            uiActions.selectCategory(null);
            return;
          }
        }
        addItem(uiState.selectedProduct, { quantity: 1, weight });
      }
      uiActions.closeModal("isWeightModalOpen");
      uiActions.setShowProducts(false);
      uiActions.selectCategory(null);
    },
    [
      uiState.selectedProduct,
      uiState.currentOrderId,
      orders,
      updateOrder,
      addItem,
      uiActions,
      toast,
    ]
  );

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
        if (uiState.currentOrderId) {
          const order = orders.find((o) => o.id === uiState.currentOrderId);
          if (order) {
            const newItem: SaleItem = {
              product: uiState.selectedProduct,
              quantity: 1,
              addons,
              selectedOptions,
            };
            updateOrder(order.id, {
              items: [...order.items, newItem],
            });
            toast({
              title: "Produto Adicionado",
              description: `${uiState.selectedProduct.name} adicionado à comanda`,
            });
            uiActions.closeModal("isCustomizeModalOpen");
            uiActions.setShowProducts(false);
            uiActions.selectCategory(null);
            return;
          }
        }
        addItem(uiState.selectedProduct, {
          quantity: 1,
          addons,
          selectedOptions,
        });
      }
      uiActions.closeModal("isCustomizeModalOpen");
      uiActions.setShowProducts(false);
      uiActions.selectCategory(null);
    },
    [
      uiState.selectedProduct,
      uiState.currentOrderId,
      orders,
      updateOrder,
      addItem,
      uiActions,
      toast,
    ]
  );

  const handlePayment = useCallback(
    async (paymentMethod: PaymentMethod, cashAmount?: number) => {
      try {
        uiActions.setPaymentProcessing(true);

        const currentOrder = uiState.currentOrderId
          ? orders.find((o) => o.id === uiState.currentOrderId)
          : null;

        const customerName = currentOrder?.customerName || "Venda Direta";
        const itemsToFinalize = currentOrder?.items || temporaryItems;

        const saleData: CompleteSaleData = {
          customerName,
          items: itemsToFinalize,
          paymentMethod,
          cashAmount,
        };

        await completeSale(saleData);

        if (currentOrder) {
          removeOrder(currentOrder.id);
        }

        uiActions.closeModal("isPaymentModalOpen");
        uiActions.selectOrder(null);
        clearCart();

        const total = itemsToFinalize.reduce(
          (sum, item) => sum + calculateItemTotal(item),
          0
        );
        const change = cashAmount ? cashAmount - total : 0;

        const changeText = cashAmount
          ? `. Troco: ${formatCurrency(change)}`
          : "";
        const description = `Venda finalizada para ${customerName}. Total: ${formatCurrency(total)}${changeText}`;

        toast({
          title: "Venda Finalizada",
          description,
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

  const createNewOrder = useCallback(
    (customerName: string) => {
      const orderData = {
        customerName,
        items: temporaryItems,
        status: "open" as const,
      };

      addOrder(orderData);

      uiActions.closeModal("isNewOrderModalOpen");
      uiActions.setNewOrderName("");
      clearCart();
    },
    [addOrder, temporaryItems, clearCart, uiActions]
  );

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

      uiActions.closeModal("isActionModalOpen");
      uiActions.setShowProducts(false);
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

  const currentOrder = useMemo(() => {
    return uiState.currentOrderId
      ? orders.find((o) => o.id === uiState.currentOrderId) || null
      : null;
  }, [uiState.currentOrderId, orders]);

  return {
    uiState,
    uiActions,
    currentOrder,
    products,
    temporaryItems,
    orders,
    salesLoading,
    salesError,
    calculateOrderTotal,
    calculateItemTotal,
    handleCategorySelect,
    handleProductSelect,
    handleWeightConfirm,
    handleCustomizeConfirm,
    handlePayment,
    createNewOrder,
    handleActionSelection,
    handleUpdateOrderItem,
    handleRemoveOrderItem,
    removeOrder,
    handleRemoveFromCart: removeItem,
    handleUpdateCartItem,
  };
}
