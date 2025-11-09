import type { BaseHookOptions, PersistenceOptions } from "@/types";
import type { Product, SaleItem } from "@/features/products";

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
  onError?: (error: CartError) => void;
  onItemAdded?: (item: SaleItem) => void;
  onItemRemoved?: (item: SaleItem, index: number) => void;
  onCartCleared?: (previousItems: SaleItem[]) => void;
  autoCalculateTax?: boolean;
  defaultTaxRate?: number;
  minimumValue?: number;
  maximumValue?: number;
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

export interface UseCartReturn {
  items: SaleItem[];
  totalItems: number;
  totalValue: number;
  isEmpty: boolean;
  statistics: CartStatistics;
  addItem: (
    product: Product,
    options?: AddItemOptions
  ) => CartOperationResult<SaleItem>;
  removeItem: (index: number) => CartOperationResult<SaleItem>;
  updateItem: (
    index: number,
    updates: Partial<SaleItem>
  ) => CartOperationResult<SaleItem>;
  clearCart: () => CartOperationResult<SaleItem[]>;
  canAddItem: (product: Product) => CartItemValidation;
  getItemTotal: (item: SaleItem) => number;
  findItemIndex: (productId: number) => number;
  hasItem: (productId: number) => boolean;
  validateItem: (index: number) => CartItemValidation;
  validateCart: () => CartItemValidation;
  addMultipleItems: (
    items: Array<{ product: Product; options?: AddItemOptions }>
  ) => CartOperationResult<SaleItem>[];
  removeMultipleItems: (indices: number[]) => CartOperationResult<SaleItem[]>;
  updateMultipleItems: (
    updates: Array<{ index: number; updates: Partial<SaleItem> }>
  ) => CartOperationResult<SaleItem>[];
  getSubtotal: () => number;
  getTotalWithTax: (taxRate?: number) => number;
  getItemsByCategory: (category: string) => SaleItem[];
  getTotalDiscount: () => number;
  getTaxSummary: (taxRate?: number) => {
    subtotal: number;
    taxAmount: number;
    total: number;
    taxRate: number;
  };
  isValid: boolean;
  validationErrors: CartError[];
  validationWarnings: string[];
  error: CartError | null;
  errorHistory: CartError[];
  clearError: () => void;
  clearErrorHistory: () => void;
  isLoading: boolean;
  isDirty: boolean;
  forcePersist: () => Promise<void>;
  reload: () => Promise<void>;
}

export const CART_VALIDATION_CONSTANTS = {
  MIN_WEIGHT: 1,
  MAX_WEIGHT: 10000,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
  MIN_CART_VALUE: 0.01,
  DEFAULT_MAX_ITEMS: 50,
  DEFAULT_TAX_RATE: 0.0,
  DEFAULT_STORAGE_KEY: "cart-items",
} as const;

export const CART_ERROR_MESSAGES = {
  [CartErrorType.VALIDATION_ERROR]: "Erro de validação do item",
  [CartErrorType.MAX_ITEMS_EXCEEDED]: "Número máximo de itens excedido",
  [CartErrorType.INVALID_PRODUCT]: "Produto inválido",
  [CartErrorType.WEIGHT_REQUIRED]: "Peso é obrigatório para este produto",
  [CartErrorType.INVALID_QUANTITY]: "Quantidade inválida",
  [CartErrorType.STORAGE_ERROR]: "Erro ao salvar dados",
  [CartErrorType.MINIMUM_VALUE_NOT_MET]:
    "Valor mínimo do carrinho não atingido",
  [CartErrorType.MAXIMUM_VALUE_EXCEEDED]: "Valor máximo do carrinho excedido",
  [CartErrorType.ITEM_NOT_FOUND]: "Item não encontrado",
  [CartErrorType.OPERATION_NOT_ALLOWED]: "Operação não permitida",
} as const;
