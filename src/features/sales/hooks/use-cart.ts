import { useCallback, useEffect, useMemo, useState } from "react";

import type { Product, SaleItem } from "@/features/products";
import type { BaseHookOptions, PersistenceOptions } from "@/types";

export enum CartErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  MAX_ITEMS_EXCEEDED = "MAX_ITEMS_EXCEEDED",
  INVALID_PRODUCT = "INVALID_PRODUCT",
  WEIGHT_REQUIRED = "WEIGHT_REQUIRED",
  INVALID_QUANTITY = "INVALID_QUANTITY",
  STORAGE_ERROR = "STORAGE_ERROR",
  MINIMUM_VALUE_NOT_MET = "MINIMUM_VALUE_NOT_MET",
  MAXIMUM_VALUE_EXCEEDED = "MAXIMUM_VALUE_EXCEEDED",
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
}

export interface CartError {
  type: CartErrorType;
  message: string;
  code: string;
  details?: {
    itemIndex?: number;
    productId?: number;
    currentValue?: unknown;
    expectedValue?: unknown;
    suggestion?: string;
  };
  timestamp: Date;
}

export interface CartOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: CartError;
  message?: string;
}

export interface CartItemValidation {
  isValid: boolean;
  errors: CartError[];
  warnings: string[];
}

export interface CartStatistics {
  uniqueItems: number;
  totalQuantity: number;
  subtotal: number;
  totalTax: number;
  total: number;
  averageItemValue: number;
  mostExpensiveItem?: SaleItem;
  cheapestItem?: SaleItem;
  categories: string[];
  totalWeight?: number;
}

export interface CartValidationConfig {
  requireWeightForWeightProducts?: boolean;
  requireMinimumQuantity?: boolean;
  minimumQuantity?: number;
  minimumWeight?: number;
  maximumWeight?: number;
  preventDuplicateProducts?: boolean;
  customValidators?: Array<(item: SaleItem) => CartError | null>;
}

export interface BatchOperationOptions {
  stopOnFirstError?: boolean;
  validateBeforeExecute?: boolean;
  onProgress?: (completed: number, total: number) => void;
  atomic?: boolean;
}

export interface CartItemFilter {
  category?: string;
  productType?: Product["type"];
  priceRange?: {
    min?: number;
    max?: number;
  };
  weightRange?: {
    min?: number;
    max?: number;
  };
  quantityRange?: {
    min?: number;
    max?: number;
  };
  customFilter?: (item: SaleItem) => boolean;
}

export interface CartSortOptions {
  field: "name" | "price" | "category" | "quantity" | "weight" | "total";
  direction: "asc" | "desc";
}

export interface CartUtils {
  filterItems: (items: SaleItem[], filter: CartItemFilter) => SaleItem[];
  sortItems: (items: SaleItem[], options: CartSortOptions) => SaleItem[];
  groupByCategory: (items: SaleItem[]) => Record<string, SaleItem[]>;
  calculateStatistics: (items: SaleItem[], taxRate?: number) => CartStatistics;
  validateSingleItem: (
    item: SaleItem,
    config?: CartValidationConfig
  ) => CartItemValidation;
  createError: (
    type: CartErrorType,
    message: string,
    details?: CartError["details"]
  ) => CartError;
}

export interface AddItemOptions {
  quantity?: number;
  weight?: number;
  addons?: Product[];
  selectedOptions?: SaleItem["selectedOptions"];
  notes?: string;
  discount?: number;
}

export interface UseCartOptions extends BaseHookOptions, PersistenceOptions {
  maxItems?: number;
  persistToSession?: boolean;
  validateItems?: boolean;
  onError?: (error: string) => void;
  onItemAdded?: (item: SaleItem) => void;
  onItemRemoved?: (item: SaleItem, index: number) => void;
  onCartCleared?: (previousItems: SaleItem[]) => void;
  autoCalculateTax?: boolean;
  defaultTaxRate?: number;
  minimumValue?: number;
  maximumValue?: number;
}

export interface UseCartReturn {
  items: SaleItem[];
  totalItems: number;
  totalValue: number;
  isEmpty: boolean;

  addItem: (product: Product, options?: AddItemOptions) => boolean;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<SaleItem>) => boolean;
  clearCart: () => void;

  canAddItem: (product: Product) => boolean;
  getItemTotal: (item: SaleItem) => number;
  findItemIndex: (productId: number) => number;
  hasItem: (productId: number) => boolean;

  addMultipleItems: (
    items: Array<{ product: Product; options?: AddItemOptions }>
  ) => boolean[];
  removeMultipleItems: (indices: number[]) => void;
  updateMultipleItems: (
    updates: Array<{ index: number; updates: Partial<SaleItem> }>
  ) => boolean[];

  getSubtotal: () => number;
  getTotalWithTax: (taxRate?: number) => number;
  getItemsByCategory: (category: string) => SaleItem[];

  isValid: boolean;
  validationErrors: string[];

  error: string | null;
  clearError: () => void;
}

export function useCart(options: UseCartOptions = {}): UseCartReturn {
  const {
    maxItems = 50,
    persistToSession = true,
    validateItems = true,
    enabled = true,
    storageKey = "cart-items",
    onError,
  } = options;

  const [items, setItems] = useState<SaleItem[]>(() => {
    if (!enabled || !persistToSession) return [];

    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      onError?.(errorMessage);
    },
    [onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled || !persistToSession) return;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(items));
      clearError();
    } catch (error) {
      const errorMessage = "Falha ao salvar carrinho no sessionStorage";
      console.warn(errorMessage, error);
      handleError(errorMessage);
    }
  }, [items, enabled, persistToSession, storageKey, clearError, handleError]);

  const getItemTotal = useCallback((item: SaleItem): number => {
    let total = 0;

    if (item.product?.type === "weight" && item.weight) {
      total = (item.product.price * item.weight) / 1000;
    } else {
      total = item.product?.price || 0;
      if (item.quantity) {
        total *= item.quantity;
      }
    }

    if (item.addons?.length) {
      const addonsTotal = item.addons.reduce(
        (sum, addon) => sum + addon.price,
        0
      );
      total += addonsTotal * (item.quantity || 1);
    }

    return total;
  }, []);

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => {
      return total + (item.quantity || 1);
    }, 0);
  }, [items]);

  const totalValue = useMemo(() => {
    return items.reduce((total, item) => {
      return total + getItemTotal(item);
    }, 0);
  }, [items, getItemTotal]);

  const isEmpty = useMemo(() => items.length === 0, [items]);

  const { isValid, validationErrors } = useMemo(() => {
    if (!validateItems) return { isValid: true, validationErrors: [] };

    const errors: string[] = [];

    if (items.length > maxItems) {
      errors.push(`Carrinho excede o limite de ${maxItems} itens`);
    }

    items.forEach((item, index) => {
      if (!item.product) {
        errors.push(`Item ${index + 1}: Produto inválido`);
      }

      if (
        item.product?.type === "weight" &&
        (!item.weight || item.weight <= 0)
      ) {
        errors.push(
          `Item ${index + 1}: Peso obrigatório para produtos vendidos por peso`
        );
      }

      if (item.quantity && item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
      }
    });

    return {
      isValid: errors.length === 0,
      validationErrors: errors,
    };
  }, [items, maxItems, validateItems]);

  const canAddItem = useCallback(
    (product: Product): boolean => {
      if (!enabled) return false;
      if (items.length >= maxItems) return false;
      if (!product || !product.id) return false;
      return true;
    },
    [enabled, items.length, maxItems]
  );

  const findItemIndex = useCallback(
    (productId: number): number => {
      return items.findIndex((item) => item.product?.id === productId);
    },
    [items]
  );

  const hasItem = useCallback(
    (productId: number): boolean => {
      return findItemIndex(productId) !== -1;
    },
    [findItemIndex]
  );

  const addItem = useCallback(
    (product: Product, options: AddItemOptions = {}): boolean => {
      if (!canAddItem(product)) return false;

      const { quantity = 1, weight, addons, selectedOptions } = options;

      if (product.type === "weight" && (!weight || weight <= 0)) {
        return false;
      }

      if (quantity <= 0) {
        return false;
      }

      const newItem: SaleItem = {
        product,
        quantity: product.type === "weight" ? undefined : quantity,
        weight: product.type === "weight" ? weight : undefined,
        addons,
        selectedOptions,
      };

      setItems((prev) => [...prev, newItem]);
      return true;
    },
    [canAddItem]
  );

  const removeItem = useCallback(
    (index: number) => {
      if (!enabled) return;

      setItems((prev) => prev.filter((_, i) => i !== index));
    },
    [enabled]
  );

  const updateItem = useCallback(
    (index: number, updates: Partial<SaleItem>): boolean => {
      if (!enabled) return false;
      if (index < 0 || index >= items.length) return false;

      setItems((prev) => {
        const newItems = [...prev];
        const currentItem = newItems[index];

        if (updates.quantity !== undefined && updates.quantity <= 0) {
          return prev;
        }

        if (
          updates.weight !== undefined &&
          currentItem.product?.type === "weight" &&
          updates.weight <= 0
        ) {
          return prev;
        }

        newItems[index] = { ...currentItem, ...updates };
        return newItems;
      });

      return true;
    },
    [enabled, items.length]
  );

  const clearCart = useCallback(() => {
    if (!enabled) return;

    setItems([]);
    clearError();
  }, [enabled, clearError]);

  const addMultipleItems = useCallback(
    (
      itemsToAdd: Array<{ product: Product; options?: AddItemOptions }>
    ): boolean[] => {
      if (!enabled) return itemsToAdd.map(() => false);

      const results: boolean[] = [];
      const newItems: SaleItem[] = [];

      for (const { product, options } of itemsToAdd) {
        if (
          !canAddItem(product) ||
          items.length + newItems.length >= maxItems
        ) {
          results.push(false);
          continue;
        }

        const { quantity = 1, weight, addons, selectedOptions } = options || {};

        if (product.type === "weight" && (!weight || weight <= 0)) {
          results.push(false);
          continue;
        }

        if (quantity <= 0) {
          results.push(false);
          continue;
        }

        const newItem: SaleItem = {
          product,
          quantity: product.type === "weight" ? undefined : quantity,
          weight: product.type === "weight" ? weight : undefined,
          addons,
          selectedOptions,
        };

        newItems.push(newItem);
        results.push(true);
      }

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
      }

      return results;
    },
    [enabled, canAddItem, items.length, maxItems]
  );

  const removeMultipleItems = useCallback(
    (indices: number[]) => {
      if (!enabled) return;

      const sortedIndices = [...indices].sort((a, b) => b - a);

      setItems((prev) => {
        const newItems = [...prev];
        for (const index of sortedIndices) {
          if (index >= 0 && index < newItems.length) {
            newItems.splice(index, 1);
          }
        }
        return newItems;
      });
    },
    [enabled]
  );

  const updateMultipleItems = useCallback(
    (
      updates: Array<{ index: number; updates: Partial<SaleItem> }>
    ): boolean[] => {
      if (!enabled) return updates.map(() => false);

      const results: boolean[] = [];

      setItems((prev) => {
        const newItems = [...prev];

        for (const { index, updates: itemUpdates } of updates) {
          if (index < 0 || index >= newItems.length) {
            results.push(false);
            continue;
          }

          const currentItem = newItems[index];

          if (itemUpdates.quantity !== undefined && itemUpdates.quantity <= 0) {
            results.push(false);
            continue;
          }

          if (
            itemUpdates.weight !== undefined &&
            currentItem.product?.type === "weight" &&
            itemUpdates.weight <= 0
          ) {
            results.push(false);
            continue;
          }

          newItems[index] = { ...currentItem, ...itemUpdates };
          results.push(true);
        }

        return newItems;
      });

      return results;
    },
    [enabled]
  );

  const getSubtotal = useCallback((): number => {
    return totalValue;
  }, [totalValue]);

  const getTotalWithTax = useCallback(
    (taxRate: number = 0): number => {
      return totalValue * (1 + taxRate);
    },
    [totalValue]
  );

  const getItemsByCategory = useCallback(
    (category: string): SaleItem[] => {
      return items.filter((item) => item.product?.category === category);
    },
    [items]
  );

  return {
    items,
    totalItems,
    totalValue,
    isEmpty,

    addItem,
    removeItem,
    updateItem,
    clearCart,

    canAddItem,
    getItemTotal,
    findItemIndex,
    hasItem,

    addMultipleItems,
    removeMultipleItems,
    updateMultipleItems,

    getSubtotal,
    getTotalWithTax,
    getItemsByCategory,

    isValid,
    validationErrors,

    error,
    clearError,
  };
}
