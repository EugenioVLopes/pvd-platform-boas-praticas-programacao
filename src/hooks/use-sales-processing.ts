import { useCallback, useMemo, useState } from "react";

import { useCart } from "@/hooks/sales/use-cart";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { useVendas } from "@/hooks/use-vendas";
import { PAYMENT_METHODS } from "@/lib/constants/products";
import { formatCurrency } from "@/lib/utils";
import type { Order, PaymentMethod } from "@/types/order";
import type { Product, SaleItem } from "@/types/product";

interface SalesState {
  currentOrder: Order | null;
  selectedProduct: Product | null;
  showProducts: boolean;
  selectedCategory: string | null;
  isWeightModalOpen: boolean;
  isNewOrderModalOpen: boolean;
  newOrderName: string;
  isPaymentModalOpen: boolean;
  isActionModalOpen: boolean;
  isCustomizeModalOpen: boolean;
}

export function useSalesProcessing() {
  const [state, setState] = useState<SalesState>({
    currentOrder: null,
    selectedProduct: null,
    showProducts: false,
    selectedCategory: null,
    isWeightModalOpen: false,
    isNewOrderModalOpen: false,
    newOrderName: "",
    isPaymentModalOpen: false,
    isActionModalOpen: false,
    isCustomizeModalOpen: false,
  });

  const { products } = useProducts();
  const {
    items: temporaryItems,
    addToCart,
    removeFromCart,
    clearCart,
  } = useCart();
  const { orders, updateOrder, removeOrder, addOrder } = useOrders();
  const { toast } = useToast();
  const { adicionarVenda } = useVendas();

  const calculateItemTotal = useCallback((item: SaleItem) => {
    if (item.product.type === "weight" && item.weight) {
      return (item.product.price * item.weight) / 1000;
    }
    return (
      item.product.price * (item.quantity || 1) +
      (item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0)
    );
  }, []);

  const calculateOrderTotal = useMemo(
    () => (order: Order) =>
      order.items.reduce((sum, item) => sum + calculateItemTotal(item), 0),
    [calculateItemTotal]
  );

  const handleCategorySelect = useCallback((category: string) => {
    setState((prev) => ({
      ...prev,
      selectedCategory: category,
      showProducts: true,
    }));
  }, []);

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (product.type === "weight") {
        setState((prev) => ({
          ...prev,
          selectedProduct: product,
          isWeightModalOpen: true,
        }));
      } else if (product.options) {
        setState((prev) => ({
          ...prev,
          selectedProduct: product,
          isCustomizeModalOpen: true,
        }));
      } else {
        addToCart(product, 1);
        setState((prev) => ({
          ...prev,
          showProducts: false,
          selectedCategory: null,
        }));
      }
    },
    [addToCart]
  );

  const handleWeightConfirm = useCallback(
    (weight: number) => {
      if (state.selectedProduct) {
        addToCart(state.selectedProduct, 1, weight);
      }
      setState((prev) => ({
        ...prev,
        isWeightModalOpen: false,
        selectedProduct: null,
        showProducts: false,
        selectedCategory: null,
      }));
    },
    [state.selectedProduct, addToCart]
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
      if (state.selectedProduct) {
        addToCart(state.selectedProduct, 1, undefined, addons, selectedOptions);
        console.log("Item adicionado:", {
          product: state.selectedProduct.name,
          addons,
          selectedOptions,
        });
      }
      setState((prev) => ({
        ...prev,
        selectedProduct: null,
        showProducts: false,
        selectedCategory: null,
        isCustomizeModalOpen: false,
      }));
    },
    [state.selectedProduct, addToCart]
  );
  const handlePayment = useCallback(
    (paymentMethod: PaymentMethod, cashAmount?: number) => {
      const orderToFinalize = state.currentOrder || {
        id: crypto.randomUUID(),
        customerName: "Venda Direta",
        items: temporaryItems,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "completed",
      };

      const total = calculateOrderTotal(orderToFinalize);
      const vendaFinalizada = {
        ...orderToFinalize,
        paymentMethod: PAYMENT_METHODS[paymentMethod],
        total,
        cashAmount,
        change: cashAmount ? cashAmount - total : 0,
        finalizadaEm: new Date(),
      };

      adicionarVenda(vendaFinalizada);

      if (state.currentOrder) {
        removeOrder(state.currentOrder.id);
      }

      setState((prev) => ({
        ...prev,
        currentOrder: null,
        isPaymentModalOpen: false,
      }));
      clearCart();

      toast({
        title: "Venda Finalizada",
        description: `Venda finalizada para ${orderToFinalize.customerName}. Total: ${formatCurrency(total)}. Método: ${PAYMENT_METHODS[paymentMethod]}${cashAmount ? `. Troco: ${formatCurrency(cashAmount - total)}` : ""}`,
      });
    },
    [
      state.currentOrder,
      temporaryItems,
      calculateOrderTotal,
      removeOrder,
      clearCart,
      toast,
      adicionarVenda,
    ]
  );

  const createNewOrder = useCallback(
    (customerName: string) => {
      const newOrder: Order = {
        id: crypto.randomUUID(),
        customerName,
        items: temporaryItems,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "open",
      };
      addOrder(newOrder);
      setState((prev) => ({
        ...prev,
        currentOrder: newOrder,
        newOrderName: "",
        isNewOrderModalOpen: false,
      }));
      clearCart();
    },
    [addOrder, temporaryItems, clearCart]
  );

  const handleActionSelection = useCallback(
    (
      action: "add_to_order" | "finalize_sale" | "new_order",
      orderIdOrName?: string
    ) => {
      if (action === "new_order" && orderIdOrName) {
        createNewOrder(orderIdOrName);
      } else if (action === "add_to_order" && orderIdOrName) {
        const order = orders.find((o: Order) => o.id === orderIdOrName);
        if (order) {
          updateOrder({
            ...order,
            items: [...order.items, ...temporaryItems],
            updatedAt: new Date(),
          });
          clearCart();
        }
      } else if (action === "finalize_sale") {
        setState((prev) => ({ ...prev, isPaymentModalOpen: true }));
      }
      setState((prev) => ({
        ...prev,
        isActionModalOpen: false,
        showProducts: false,
        currentOrder: null,
      }));
    },
    [orders, temporaryItems, updateOrder, createNewOrder, clearCart]
  );

  const handleUpdateOrderItem = useCallback(
    (orderId: string, itemIndex: number, updatedItem: SaleItem) => {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const updatedItems = [...order.items];
        updatedItems[itemIndex] = updatedItem;
        updateOrder({ ...order, items: updatedItems, updatedAt: new Date() });
        if (state.currentOrder?.id === orderId) {
          setState((prev) => ({
            ...prev,
            currentOrder: { ...order, items: updatedItems },
          }));
        }
      }
    },
    [orders, updateOrder, state.currentOrder]
  );

  const handleRemoveOrderItem = useCallback(
    (orderId: string, itemIndex: number) => {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const updatedItems = order.items.filter((_, idx) => idx !== itemIndex);
        updateOrder({ ...order, items: updatedItems, updatedAt: new Date() });
        if (state.currentOrder?.id === orderId) {
          setState((prev) => ({
            ...prev,
            currentOrder: { ...order, items: updatedItems },
          }));
        }
      }
    },
    [orders, updateOrder, state.currentOrder]
  );

  return {
    state,
    setState,
    products,
    temporaryItems,
    orders,
    calculateOrderTotal,
    handleCategorySelect,
    handleProductSelect,
    handleWeightConfirm,
    handleCustomizeConfirm,
    handlePayment,
    createNewOrder,
    handleActionSelection,
    handleUpdateOrderItem,
    handleRemoveOrderItem,
    handleRemoveFromCart: removeFromCart,
    handleUpdateCartItem: (index: number, item: SaleItem) => {
      removeFromCart(index);
      addToCart(item.product, item.quantity || 1, item.weight, item.addons);
    },
    removeOrder,
  };
}
