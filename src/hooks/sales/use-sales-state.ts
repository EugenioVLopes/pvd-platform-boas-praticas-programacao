import { useCallback, useState } from "react";

import { Order } from "@/types/order";
import { Product } from "@/types/product";

export interface SalesState {
  orders: Order[];
  currentOrderId: string | null;
  selectedProduct: Product | null;
  showProducts: boolean;
  selectedCategory: string | null;
  isWeightModalOpen: boolean;
  isNewOrderModalOpen: boolean;
  newOrderName: string;
  isPaymentModalOpen: boolean;
  isActionModalOpen: boolean;
  isCustomizeModalOpen: boolean;
  paymentProcessing: boolean;
  isProductDetailsOpen: boolean;
  currentProduct: Product | null;
  isCategoryOpen: boolean;
  currentCategory: string | null;
}

export function useSalesState() {
  const [state, setState] = useState<SalesState>({
    orders: [],
    currentOrderId: null,
    selectedProduct: null,
    showProducts: false,
    selectedCategory: null,
    isWeightModalOpen: false,
    isNewOrderModalOpen: false,
    newOrderName: "",
    isPaymentModalOpen: false,
    isActionModalOpen: false,
    isCustomizeModalOpen: false,
    paymentProcessing: false,
    isProductDetailsOpen: false,
    currentProduct: null,
    isCategoryOpen: false,
    currentCategory: null,
  });

  // Atualizar estado
  const updateState = useCallback((updates: Partial<SalesState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Adicionar nova comanda
  const addOrder = useCallback((customerName: string) => {
    const newOrder: Order = {
      id: crypto.randomUUID(), // Gere um ID único
      customerName,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "open",
    };
    setState((prev) => ({
      ...prev,
      orders: [...prev.orders, newOrder],
      currentOrderId: newOrder.id, // Seleciona a nova comanda automaticamente
    }));
  }, []);

  // Remover comanda
  const removeOrder = useCallback((orderId: string) => {
    setState((prev) => {
      const updatedOrders = prev.orders.filter((order) => order.id !== orderId);
      const newCurrentOrderId =
        prev.currentOrderId === orderId
          ? updatedOrders.length > 0
            ? updatedOrders[0].id
            : null
          : prev.currentOrderId;
      return {
        ...prev,
        orders: updatedOrders,
        currentOrderId: newCurrentOrderId,
      };
    });
  }, []);

  // Selecionar comanda
  const selectOrder = useCallback((orderId: string) => {
    setState((prev) => ({ ...prev, currentOrderId: orderId }));
  }, []);

  // Obter a comanda atual
  const currentOrder =
    state.orders.find((order) => order.id === state.currentOrderId) || null;

  return {
    state,
    updateState,
    addOrder,
    removeOrder,
    selectOrder,
    currentOrder,
  };
}
