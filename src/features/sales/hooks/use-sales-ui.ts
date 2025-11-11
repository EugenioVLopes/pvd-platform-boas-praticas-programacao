"use client";

import { useCallback, useMemo, useState } from "react";

import type { Product } from "@/features/products";
import type { BaseHookOptions } from "@/types";

export interface SalesUIState {
  isWeightModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isCustomizeModalOpen: boolean;
  isNewOrderModalOpen: boolean;
  isActionModalOpen: boolean;
  isProductDetailsOpen: boolean;
  isCategoryOpen: boolean;
  selectedProduct: Product | null;
  selectedCategory: string | null;
  currentOrderId: string | null;
  newOrderName: string;
  currentProduct: Product | null;
  currentCategory: string | null;
  showProducts: boolean;
  showOrderDetails: boolean;
  paymentProcessing: boolean;
}

type ModalStateKey = keyof Pick<
  SalesUIState,
  | "isWeightModalOpen"
  | "isPaymentModalOpen"
  | "isCustomizeModalOpen"
  | "isNewOrderModalOpen"
  | "isActionModalOpen"
  | "isProductDetailsOpen"
  | "isCategoryOpen"
>;

export interface UseSalesUIOptions extends BaseHookOptions {
  initialState?: Partial<SalesUIState>;
  autoReset?: boolean;
}

export interface SalesUIActions {
  openWeightModal: (product: Product) => void;
  openPaymentModal: () => void;
  openCustomizeModal: (product: Product) => void;
  openNewOrderModal: () => void;
  openActionModal: () => void;
  openProductDetails: (product: Product) => void;
  openCategoryModal: (category: string) => void;
  closeAllModals: () => void;
  closeModal: (modalName: ModalStateKey) => void;
  selectCategory: (category: string | null) => void;
  selectProduct: (product: Product | null) => void;
  selectOrder: (orderId: string | null) => void;
  setNewOrderName: (name: string) => void;
  toggleProductsView: () => void;
  toggleOrderDetails: () => void;
  setShowProducts: (show: boolean) => void;
  setShowOrderDetails: (show: boolean) => void;
  setPaymentProcessing: (processing: boolean) => void;
  updateState: (updates: Partial<SalesUIState>) => void;
  resetState: () => void;
}

export interface UseSalesUIReturn {
  state: SalesUIState;
  actions: SalesUIActions;
  hasOpenModal: boolean;
  currentModal: string | null;
  canShowProducts: boolean;
}

const DEFAULT_STATE: SalesUIState = {
  isWeightModalOpen: false,
  isPaymentModalOpen: false,
  isCustomizeModalOpen: false,
  isNewOrderModalOpen: false,
  isActionModalOpen: false,
  isProductDetailsOpen: false,
  isCategoryOpen: false,
  selectedProduct: null,
  selectedCategory: null,
  currentOrderId: null,
  newOrderName: "",
  currentProduct: null,
  currentCategory: null,
  showProducts: false,
  showOrderDetails: false,
  paymentProcessing: false,
};

export function useSalesUI(options: UseSalesUIOptions = {}): UseSalesUIReturn {
  const { enabled = true, initialState = {}, autoReset = true } = options;

  const [state, setState] = useState<SalesUIState>({
    ...DEFAULT_STATE,
    ...initialState,
  });

  const updateState = useCallback(
    (updates: Partial<SalesUIState>) => {
      if (!enabled) return;

      setState((prev) => ({ ...prev, ...updates }));
    },
    [enabled]
  );

  const resetState = useCallback(() => {
    if (!enabled) return;

    setState({ ...DEFAULT_STATE, ...initialState });
  }, [enabled, initialState]);

  const openWeightModal = useCallback(
    (product: Product) => {
      updateState({
        isWeightModalOpen: true,
        selectedProduct: product,
        currentProduct: product,
      });
    },
    [updateState]
  );

  const openPaymentModal = useCallback(() => {
    updateState({
      isPaymentModalOpen: true,
    });
  }, [updateState]);

  const openCustomizeModal = useCallback(
    (product: Product) => {
      updateState({
        isCustomizeModalOpen: true,
        selectedProduct: product,
        currentProduct: product,
      });
    },
    [updateState]
  );

  const openNewOrderModal = useCallback(() => {
    updateState({
      isNewOrderModalOpen: true,
      newOrderName: "",
    });
  }, [updateState]);

  const openActionModal = useCallback(() => {
    updateState({
      isActionModalOpen: true,
    });
  }, [updateState]);

  const openProductDetails = useCallback(
    (product: Product) => {
      updateState({
        isProductDetailsOpen: true,
        currentProduct: product,
      });
    },
    [updateState]
  );

  const openCategoryModal = useCallback(
    (category: string) => {
      updateState({
        isCategoryOpen: true,
        currentCategory: category,
        selectedCategory: category,
      });
    },
    [updateState]
  );

  const getModalResetUpdates = useCallback(
    (modalName: ModalStateKey): Partial<SalesUIState> => {
      const resetMap: Record<string, Partial<SalesUIState>> = {
        isWeightModalOpen: {
          selectedProduct: null,
          currentProduct: null,
        },
        isCustomizeModalOpen: {
          selectedProduct: null,
          currentProduct: null,
        },
        isNewOrderModalOpen: {
          newOrderName: "",
        },
        isProductDetailsOpen: {
          currentProduct: null,
        },
        isCategoryOpen: {
          currentCategory: null,
        },
      };

      return resetMap[modalName] || {};
    },
    []
  );

  const closeModal = useCallback(
    (modalName: ModalStateKey) => {
      const updates: Partial<SalesUIState> = {
        [modalName]: false,
      };

      if (autoReset) {
        Object.assign(updates, getModalResetUpdates(modalName));
      }

      updateState(updates);
    },
    [updateState, autoReset, getModalResetUpdates]
  );

  const closeAllModals = useCallback(() => {
    const updates: Partial<SalesUIState> = {
      isWeightModalOpen: false,
      isPaymentModalOpen: false,
      isCustomizeModalOpen: false,
      isNewOrderModalOpen: false,
      isActionModalOpen: false,
      isProductDetailsOpen: false,
      isCategoryOpen: false,
    };

    if (autoReset) {
      updates.selectedProduct = null;
      updates.currentProduct = null;
      updates.currentCategory = null;
      updates.newOrderName = "";
    }

    updateState(updates);
  }, [updateState, autoReset]);

  const selectCategory = useCallback(
    (category: string | null) => {
      updateState({
        selectedCategory: category,
        showProducts: category !== null,
      });
    },
    [updateState]
  );

  const selectProduct = useCallback(
    (product: Product | null) => {
      updateState({
        selectedProduct: product,
        currentProduct: product,
      });
    },
    [updateState]
  );

  const selectOrder = useCallback(
    (orderId: string | null) => {
      updateState({
        currentOrderId: orderId,
      });
    },
    [updateState]
  );

  const setNewOrderName = useCallback(
    (name: string) => {
      updateState({
        newOrderName: name,
      });
    },
    [updateState]
  );

  const toggleProductsView = useCallback(() => {
    updateState({
      showProducts: !state.showProducts,
    });
  }, [updateState, state.showProducts]);

  const toggleOrderDetails = useCallback(() => {
    updateState({
      showOrderDetails: !state.showOrderDetails,
    });
  }, [updateState, state.showOrderDetails]);

  const setShowProducts = useCallback(
    (show: boolean) => {
      updateState({
        showProducts: show,
      });
    },
    [updateState]
  );

  const setShowOrderDetails = useCallback(
    (show: boolean) => {
      updateState({
        showOrderDetails: show,
      });
    },
    [updateState]
  );

  const setPaymentProcessing = useCallback(
    (processing: boolean) => {
      updateState({
        paymentProcessing: processing,
      });
    },
    [updateState]
  );

  const modalStateMap: Record<ModalStateKey, string> = useMemo(
    () => ({
      isWeightModalOpen: "weight",
      isPaymentModalOpen: "payment",
      isCustomizeModalOpen: "customize",
      isNewOrderModalOpen: "newOrder",
      isActionModalOpen: "action",
      isProductDetailsOpen: "productDetails",
      isCategoryOpen: "category",
    }),
    []
  );

  const hasOpenModal = useMemo(
    () =>
      !!(
        state.isWeightModalOpen ||
        state.isPaymentModalOpen ||
        state.isCustomizeModalOpen ||
        state.isNewOrderModalOpen ||
        state.isActionModalOpen ||
        state.isProductDetailsOpen ||
        state.isCategoryOpen
      ),
    [
      state.isWeightModalOpen,
      state.isPaymentModalOpen,
      state.isCustomizeModalOpen,
      state.isNewOrderModalOpen,
      state.isActionModalOpen,
      state.isProductDetailsOpen,
      state.isCategoryOpen,
    ]
  );

  const currentModal = useMemo((): string | null => {
    const modalKey = Object.keys(modalStateMap).find(
      (key) => state[key as keyof SalesUIState]
    ) as keyof typeof modalStateMap | undefined;

    return modalKey ? modalStateMap[modalKey] : null;
  }, [state, modalStateMap]);

  const canShowProducts = !hasOpenModal && !!state.selectedCategory;

  const actions: SalesUIActions = {
    openWeightModal,
    openPaymentModal,
    openCustomizeModal,
    openNewOrderModal,
    openActionModal,
    openProductDetails,
    openCategoryModal,
    closeModal,
    closeAllModals,
    selectCategory,
    selectProduct,
    selectOrder,
    setNewOrderName,
    toggleProductsView,
    toggleOrderDetails,
    setShowProducts,
    setShowOrderDetails,
    setPaymentProcessing,
    updateState,
    resetState,
  };

  return {
    state,
    actions,
    hasOpenModal,
    currentModal,
    canShowProducts,
  };
}
