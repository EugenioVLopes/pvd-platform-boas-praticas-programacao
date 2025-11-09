"use client";

import { useCallback, useState } from "react";

import type { Product } from "@/features/products";
import type { BaseHookOptions } from "@/types";

/**
 * Estado completo da interface de vendas
 */
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

/**
 * Opções de configuração para o hook useSalesUI
 */
export interface UseSalesUIOptions extends BaseHookOptions {
  /** Estado inicial personalizado */
  initialState?: Partial<SalesUIState>;
  /** Se deve resetar o estado ao fechar modais */
  autoReset?: boolean;
}

/**
 * Ações disponíveis para gerenciar o estado da UI
 */
export interface SalesUIActions {
  openWeightModal: (product: Product) => void;
  openPaymentModal: () => void;
  openCustomizeModal: (product: Product) => void;
  openNewOrderModal: () => void;
  openActionModal: () => void;
  openProductDetails: (product: Product) => void;
  openCategoryModal: (category: string) => void;
  closeAllModals: () => void;
  closeModal: (
    modalName: keyof Pick<
      SalesUIState,
      | "isWeightModalOpen"
      | "isPaymentModalOpen"
      | "isCustomizeModalOpen"
      | "isNewOrderModalOpen"
      | "isActionModalOpen"
      | "isProductDetailsOpen"
      | "isCategoryOpen"
    >
  ) => void;
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

/**
 * Interface de retorno do hook useSalesUI
 */
export interface UseSalesUIReturn {
  state: SalesUIState;
  actions: SalesUIActions;
  hasOpenModal: boolean;
  currentModal: string | null;
  canShowProducts: boolean;
}

/**
 * Estado inicial padrão
 */
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

/**
 * Hook para gerenciar estado da interface de vendas
 *
 * Extrai e centraliza todo o gerenciamento de estado da UI que estava
 * espalhado no `useSalesProcessing`, incluindo:
 * - Estados de modais
 * - Seleções de produtos e categorias
 * - Estados de visualização
 * - Controle de fluxo da interface
 *
 * @param options - Opções de configuração do hook
 * @returns Objeto com estado e ações para gerenciar a UI de vendas
 *
 * @example
 * ```tsx
 * function SalesInterface() {
 *   const { state, actions, hasOpenModal } = useSalesUI({
 *     autoReset: true
 *   });
 *
 *   const handleProductSelect = (product: Product) => {
 *     if (product.type === 'weight') {
 *       actions.openWeightModal(product);
 *     } else if (product.options) {
 *       actions.openCustomizeModal(product);
 *     } else {
 *       // Adicionar diretamente ao carrinho
 *       actions.selectProduct(product);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {state.showProducts && (
 *         <ProductGrid onProductSelect={handleProductSelect} />
 *       )}
 *
 *       <WeightModal
 *         isOpen={state.isWeightModalOpen}
 *         product={state.selectedProduct}
 *         onClose={() => actions.closeModal('isWeightModalOpen')}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
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
      newOrderName: "", // Reset nome
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
    (
      modalName: keyof Pick<
        SalesUIState,
        | "isWeightModalOpen"
        | "isPaymentModalOpen"
        | "isCustomizeModalOpen"
        | "isNewOrderModalOpen"
        | "isActionModalOpen"
        | "isProductDetailsOpen"
        | "isCategoryOpen"
      >
    ): Partial<SalesUIState> => {
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
    (
      modalName: keyof Pick<
        SalesUIState,
        | "isWeightModalOpen"
        | "isPaymentModalOpen"
        | "isCustomizeModalOpen"
        | "isNewOrderModalOpen"
        | "isActionModalOpen"
        | "isProductDetailsOpen"
        | "isCategoryOpen"
      >
    ) => {
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

  const getCurrentModal = useCallback((): string | null => {
    const modalStateMap: Record<
      keyof Pick<
        SalesUIState,
        | "isWeightModalOpen"
        | "isPaymentModalOpen"
        | "isCustomizeModalOpen"
        | "isNewOrderModalOpen"
        | "isActionModalOpen"
        | "isProductDetailsOpen"
        | "isCategoryOpen"
      >,
      string
    > = {
      isWeightModalOpen: "weight",
      isPaymentModalOpen: "payment",
      isCustomizeModalOpen: "customize",
      isNewOrderModalOpen: "newOrder",
      isActionModalOpen: "action",
      isProductDetailsOpen: "productDetails",
      isCategoryOpen: "category",
    };

    const modalKey = Object.keys(modalStateMap).find(
      (key) => state[key as keyof SalesUIState]
    ) as keyof typeof modalStateMap | undefined;

    return modalKey ? modalStateMap[modalKey] : null;
  }, [state]);

  const hasOpenModal = !!(
    state.isWeightModalOpen ||
    state.isPaymentModalOpen ||
    state.isCustomizeModalOpen ||
    state.isNewOrderModalOpen ||
    state.isActionModalOpen ||
    state.isProductDetailsOpen ||
    state.isCategoryOpen
  );

  const currentModal = getCurrentModal();

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
