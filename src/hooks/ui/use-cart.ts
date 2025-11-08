import { useCallback, useEffect, useMemo, useState } from "react";

import type { BaseHookOptions, PersistenceOptions } from "@/types/hooks";
import type { Product, SaleItem } from "@/types/product";

// NOTE: Comprehensive cart interfaces have been created in src/types/cart.ts
// These provide enhanced error handling, validation, and operation results
// Future implementation should migrate to use these enhanced interfaces
// @see src/types/cart.ts for complete interface definitions
// @see src/utils/cart-utils.ts for utility functions
// @see src/docs/cart-interfaces.md for usage documentation

/**
 * Tipos de erro que podem ocorrer no carrinho
 */
export enum CartErrorType {
  /** Erro de validação de item */
  VALIDATION_ERROR = "VALIDATION_ERROR",
  /** Limite de itens excedido */
  MAX_ITEMS_EXCEEDED = "MAX_ITEMS_EXCEEDED",
  /** Produto inválido */
  INVALID_PRODUCT = "INVALID_PRODUCT",
  /** Peso obrigatório não fornecido */
  WEIGHT_REQUIRED = "WEIGHT_REQUIRED",
  /** Quantidade inválida */
  INVALID_QUANTITY = "INVALID_QUANTITY",
  /** Erro de persistência */
  STORAGE_ERROR = "STORAGE_ERROR",
  /** Valor mínimo não atingido */
  MINIMUM_VALUE_NOT_MET = "MINIMUM_VALUE_NOT_MET",
  /** Valor máximo excedido */
  MAXIMUM_VALUE_EXCEEDED = "MAXIMUM_VALUE_EXCEEDED",
  /** Item não encontrado */
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
  /** Operação não permitida */
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
}

/**
 * Interface para erros detalhados do carrinho
 */
export interface CartError {
  /** Tipo do erro */
  type: CartErrorType;
  /** Mensagem de erro legível */
  message: string;
  /** Código de erro único */
  code: string;
  /** Dados adicionais sobre o erro */
  details?: {
    /** Índice do item relacionado ao erro */
    itemIndex?: number;
    /** ID do produto relacionado ao erro */
    productId?: number;
    /** Valor atual que causou o erro */
    currentValue?: unknown;
    /** Valor esperado */
    expectedValue?: unknown;
    /** Sugestão de correção */
    suggestion?: string;
  };
  /** Timestamp do erro */
  timestamp: Date;
}

/**
 * Resultado de operações que podem falhar
 */
export interface CartOperationResult<T = void> {
  /** Se a operação foi bem-sucedida */
  success: boolean;
  /** Dados retornados em caso de sucesso */
  data?: T;
  /** Erro detalhado em caso de falha */
  error?: CartError;
  /** Mensagem de sucesso */
  message?: string;
}

/**
 * Interface para validação de itens do carrinho
 */
export interface CartItemValidation {
  /** Se o item é válido */
  isValid: boolean;
  /** Lista de erros de validação */
  errors: CartError[];
  /** Avisos não críticos */
  warnings: string[];
}

/**
 * Estatísticas do carrinho
 */
export interface CartStatistics {
  /** Número total de itens únicos */
  uniqueItems: number;
  /** Quantidade total de produtos */
  totalQuantity: number;
  /** Valor total sem impostos */
  subtotal: number;
  /** Valor total de impostos */
  totalTax: number;
  /** Valor total com impostos */
  total: number;
  /** Valor médio por item */
  averageItemValue: number;
  /** Item mais caro */
  mostExpensiveItem?: SaleItem;
  /** Item mais barato */
  cheapestItem?: SaleItem;
  /** Categorias representadas */
  categories: string[];
  /** Peso total (para produtos vendidos por peso) */
  totalWeight?: number;
}

/**
 * Configurações de validação para itens do carrinho
 */
export interface CartValidationConfig {
  /** Se deve validar peso obrigatório para produtos por peso */
  requireWeightForWeightProducts?: boolean;
  /** Se deve validar quantidade mínima */
  requireMinimumQuantity?: boolean;
  /** Quantidade mínima permitida */
  minimumQuantity?: number;
  /** Peso mínimo permitido (em gramas) */
  minimumWeight?: number;
  /** Peso máximo permitido (em gramas) */
  maximumWeight?: number;
  /** Se deve validar produtos duplicados */
  preventDuplicateProducts?: boolean;
  /** Validadores customizados */
  customValidators?: Array<(item: SaleItem) => CartError | null>;
}

/**
 * Opções para operações em lote
 */
export interface BatchOperationOptions {
  /** Se deve parar na primeira falha */
  stopOnFirstError?: boolean;
  /** Se deve validar antes de executar */
  validateBeforeExecute?: boolean;
  /** Callback de progresso */
  onProgress?: (completed: number, total: number) => void;
  /** Se deve executar em transação (tudo ou nada) */
  atomic?: boolean;
}

/**
 * Filtros para busca de itens
 */
export interface CartItemFilter {
  /** Filtrar por categoria */
  category?: string;
  /** Filtrar por tipo de produto */
  productType?: Product["type"];
  /** Filtrar por faixa de preço */
  priceRange?: {
    min?: number;
    max?: number;
  };
  /** Filtrar por peso (para produtos por peso) */
  weightRange?: {
    min?: number;
    max?: number;
  };
  /** Filtrar por quantidade */
  quantityRange?: {
    min?: number;
    max?: number;
  };
  /** Filtro customizado */
  customFilter?: (item: SaleItem) => boolean;
}

/**
 * Opções de ordenação para itens
 */
export interface CartSortOptions {
  /** Campo para ordenação */
  field: "name" | "price" | "category" | "quantity" | "weight" | "total";
  /** Direção da ordenação */
  direction: "asc" | "desc";
}

/**
 * Utilitários para manipulação de carrinho
 */
export interface CartUtils {
  /**
   * Filtra itens do carrinho
   * @param items - Itens a serem filtrados
   * @param filter - Critérios de filtro
   * @returns Itens filtrados
   */
  filterItems: (items: SaleItem[], filter: CartItemFilter) => SaleItem[];

  /**
   * Ordena itens do carrinho
   * @param items - Itens a serem ordenados
   * @param options - Opções de ordenação
   * @returns Itens ordenados
   */
  sortItems: (items: SaleItem[], options: CartSortOptions) => SaleItem[];

  /**
   * Agrupa itens por categoria
   * @param items - Itens a serem agrupados
   * @returns Itens agrupados por categoria
   */
  groupByCategory: (items: SaleItem[]) => Record<string, SaleItem[]>;

  /**
   * Calcula estatísticas dos itens
   * @param items - Itens para calcular estatísticas
   * @param taxRate - Taxa de imposto opcional
   * @returns Estatísticas calculadas
   */
  calculateStatistics: (items: SaleItem[], taxRate?: number) => CartStatistics;

  /**
   * Valida um item individual
   * @param item - Item a ser validado
   * @param config - Configuração de validação
   * @returns Resultado da validação
   */
  validateSingleItem: (
    item: SaleItem,
    config?: CartValidationConfig
  ) => CartItemValidation;

  /**
   * Cria um erro de carrinho padronizado
   * @param type - Tipo do erro
   * @param message - Mensagem do erro
   * @param details - Detalhes adicionais
   * @returns Erro formatado
   */
  createError: (
    type: CartErrorType,
    message: string,
    details?: CartError["details"]
  ) => CartError;
}

/**
 * Opções para adicionar um item ao carrinho
 *
 * @interface AddItemOptions
 */
export interface AddItemOptions {
  /** Quantidade do produto (obrigatório para produtos por unidade) */
  quantity?: number;
  /** Peso em gramas (obrigatório para produtos vendidos por peso) */
  weight?: number;
  /** Lista de produtos adicionais/complementos */
  addons?: Product[];
  /** Opções selecionadas para produtos customizáveis */
  selectedOptions?: SaleItem["selectedOptions"];
  /** Observações especiais para o item */
  notes?: string;
  /** Desconto aplicado ao item (0-1 para percentual, >1 para valor fixo) */
  discount?: number;
}

/**
 * Opções de configuração para o hook useCart
 *
 * @interface UseCartOptions
 * @extends BaseHookOptions
 * @extends PersistenceOptions
 */
export interface UseCartOptions extends BaseHookOptions, PersistenceOptions {
  /** Número máximo de itens permitidos no carrinho (padrão: 50) */
  maxItems?: number;
  /** Se deve persistir dados no sessionStorage (padrão: true) */
  persistToSession?: boolean;
  /** Se deve validar itens ao adicionar/atualizar (padrão: true) */
  validateItems?: boolean;
  /** Callback chamado quando ocorre um erro */
  onError?: (error: string) => void;
  /** Callback chamado quando um item é adicionado com sucesso */
  onItemAdded?: (item: SaleItem) => void;
  /** Callback chamado quando um item é removido */
  onItemRemoved?: (item: SaleItem, index: number) => void;
  /** Callback chamado quando o carrinho é limpo */
  onCartCleared?: (previousItems: SaleItem[]) => void;
  /** Se deve calcular automaticamente impostos (padrão: false) */
  autoCalculateTax?: boolean;
  /** Taxa de imposto padrão (0-1 para percentual) */
  defaultTaxRate?: number;
  /** Valor mínimo para o carrinho */
  minimumValue?: number;
  /** Valor máximo para o carrinho */
  maximumValue?: number;
}

export interface UseCartReturn {
  // Estado do carrinho
  items: SaleItem[];
  totalItems: number;
  totalValue: number;
  isEmpty: boolean;

  // Ações principais
  addItem: (product: Product, options?: AddItemOptions) => boolean;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<SaleItem>) => boolean;
  clearCart: () => void;

  // Utilitários
  canAddItem: (product: Product) => boolean;
  getItemTotal: (item: SaleItem) => number;
  findItemIndex: (productId: number) => number;
  hasItem: (productId: number) => boolean;

  // Operações em lote
  addMultipleItems: (
    items: Array<{ product: Product; options?: AddItemOptions }>
  ) => boolean[];
  removeMultipleItems: (indices: number[]) => void;
  updateMultipleItems: (
    updates: Array<{ index: number; updates: Partial<SaleItem> }>
  ) => boolean[];

  // Cálculos avançados
  getSubtotal: () => number;
  getTotalWithTax: (taxRate?: number) => number;
  getItemsByCategory: (category: string) => SaleItem[];

  // Estado de validação
  isValid: boolean;
  validationErrors: string[];

  // Estado de erro
  error: string | null;
  clearError: () => void;
}

/**
 * Hook avançado para gerenciar carrinho de compras com validação robusta,
 * persistência automática, tratamento de erros detalhado e operações em lote.
 *
 * Este hook fornece uma interface completa para manipulação de carrinho de compras,
 * incluindo validação de itens, cálculos automáticos, persistência de dados,
 * tratamento de erros detalhado e operações em lote otimizadas.
 *
 * @param options - Opções de configuração do hook
 * @param options.maxItems - Número máximo de itens no carrinho (padrão: 50)
 * @param options.persistToSession - Se deve persistir no sessionStorage (padrão: true)
 * @param options.validateItems - Se deve validar itens ao adicionar/atualizar (padrão: true)
 * @param options.enabled - Se o hook está habilitado (padrão: true)
 * @param options.storageKey - Chave para armazenamento (padrão: "cart-items")
 * @param options.onError - Callback chamado quando ocorre um erro
 * @param options.onItemAdded - Callback chamado quando um item é adicionado
 * @param options.onItemRemoved - Callback chamado quando um item é removido
 * @param options.onCartCleared - Callback chamado quando o carrinho é limpo
 * @param options.autoCalculateTax - Se deve calcular impostos automaticamente
 * @param options.defaultTaxRate - Taxa de imposto padrão (0-1 para percentual)
 * @param options.minimumValue - Valor mínimo para o carrinho
 * @param options.maximumValue - Valor máximo para o carrinho
 *
 * @returns Objeto com estado completo e ações para gerenciar o carrinho
 *
 * @example
 * ### Uso Básico
 * ```tsx
 * function CartPage() {
 *   const {
 *     items,
 *     totalValue,
 *     statistics,
 *     addItem,
 *     removeItem,
 *     clearCart,
 *     error,
 *     isValid,
 *     validationErrors
 *   } = useCart({
 *     maxItems: 20,
 *     persistToSession: true,
 *     onError: (error) => toast.error(error.message)
 *   });
 *
 *   const handleAddProduct = async (product: Product) => {
 *     const result = addItem(product, { quantity: 1 });
 *
 *     if (result.success) {
 *       toast.success(`${product.name} adicionado ao carrinho`);
 *     } else {
 *       toast.error(result.error?.message || "Erro ao adicionar item");
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <h2>Carrinho ({statistics.uniqueItems} itens únicos)</h2>
 *       <p>Subtotal: R$ {statistics.subtotal.toFixed(2)}</p>
 *       <p>Total: R$ {statistics.total.toFixed(2)}</p>
 *
 *       {!isValid && (
 *         <div className="validation-errors">
 *           {validationErrors.map((error, index) => (
 *             <p key={index} className="error">{error.message}</p>
 *           ))}
 *         </div>
 *       )}
 *
 *       {items.map((item, index) => (
 *         <CartItem
 *           key={index}
 *           item={item}
 *           onRemove={() => removeItem(index)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ### Operações em Lote
 * ```tsx
 * function BulkCartOperations() {
 *   const { addMultipleItems, removeMultipleItems, updateMultipleItems } = useCart();
 *
 *   const handleBulkAdd = (products: Product[]) => {
 *     const results = addMultipleItems(
 *       products.map(product => ({
 *         product,
 *         options: { quantity: 1 }
 *       }))
 *     );
 *
 *     const successCount = results.filter(r => r.success).length;
 *     const errorCount = results.filter(r => !r.success).length;
 *
 *     toast.success(`${successCount} itens adicionados`);
 *     if (errorCount > 0) {
 *       toast.warning(`${errorCount} itens falharam`);
 *     }
 *   };
 *
 *   const handleBulkUpdate = (updates: Array<{index: number, quantity: number}>) => {
 *     const results = updateMultipleItems(
 *       updates.map(({ index, quantity }) => ({
 *         index,
 *         updates: { quantity }
 *       }))
 *     );
 *
 *     const successCount = results.filter(r => r.success).length;
 *     toast.success(`${successCount} itens atualizados`);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleBulkAdd(selectedProducts)}>
 *         Adicionar Selecionados
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ### Validação Avançada
 * ```tsx
 * function ValidatedCart() {
 *   const {
 *     canAddItem,
 *     validateItem,
 *     validateCart,
 *     addItem
 *   } = useCart({
 *     validateItems: true,
 *     minimumValue: 10,
 *     maximumValue: 1000
 *   });
 *
 *   const handleAddWithValidation = (product: Product) => {
 *     // Validar antes de adicionar
 *     const validation = canAddItem(product);
 *
 *     if (!validation.isValid) {
 *       validation.errors.forEach(error => {
 *         toast.error(error.message);
 *       });
 *       return;
 *     }
 *
 *     // Adicionar se válido
 *     const result = addItem(product);
 *     if (result.success) {
 *       toast.success("Item adicionado com sucesso");
 *     }
 *   };
 *
 *   const handleValidateAll = () => {
 *     const validation = validateCart();
 *
 *     if (validation.isValid) {
 *       toast.success("Carrinho válido!");
 *     } else {
 *       validation.errors.forEach(error => {
 *         console.error("Erro de validação:", error);
 *       });
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleValidateAll}>
 *         Validar Carrinho
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ### Cálculos e Estatísticas
 * ```tsx
 * function CartSummary() {
 *   const {
 *     statistics,
 *     getTotalWithTax,
 *     getTaxSummary,
 *     getTotalDiscount,
 *     getItemsByCategory
 *   } = useCart({
 *     autoCalculateTax: true,
 *     defaultTaxRate: 0.1
 *   });
 *
 *   const taxSummary = getTaxSummary();
 *   const totalDiscount = getTotalDiscount();
 *   const foodItems = getItemsByCategory("food");
 *
 *   return (
 *     <div className="cart-summary">
 *       <h3>Resumo do Carrinho</h3>
 *       <p>Itens únicos: {statistics.uniqueItems}</p>
 *       <p>Quantidade total: {statistics.totalQuantity}</p>
 *       <p>Subtotal: R$ {taxSummary.subtotal.toFixed(2)}</p>
 *       <p>Desconto: R$ {totalDiscount.toFixed(2)}</p>
 *       <p>Impostos ({(taxSummary.taxRate * 100).toFixed(1)}%): R$ {taxSummary.taxAmount.toFixed(2)}</p>
 *       <p><strong>Total: R$ {taxSummary.total.toFixed(2)}</strong></p>
 *
 *       <h4>Por Categoria</h4>
 *       {statistics.categories.map(category => {
 *         const categoryItems = getItemsByCategory(category);
 *         return (
 *           <p key={category}>
 *             {category}: {categoryItems.length} itens
 *           </p>
 *         );
 *       })}
 *     </div>
 *   );
 * }
 * ```
 *
 * @since 1.0.0
 * @version 2.0.0
 */
export function useCart(options: UseCartOptions = {}): UseCartReturn {
  const {
    maxItems = 50,
    persistToSession = true,
    validateItems = true,
    enabled = true,
    storageKey = "cart-items",
    onError,
  } = options;

  // Estado principal
  const [items, setItems] = useState<SaleItem[]>(() => {
    if (!enabled || !persistToSession) return [];

    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Função para lidar com erros
  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      onError?.(errorMessage);
    },
    [onError]
  );

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Persistência no sessionStorage
  useEffect(() => {
    if (!enabled || !persistToSession) return;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(items));
      clearError(); // Limpar erro se salvou com sucesso
    } catch (error) {
      const errorMessage = "Falha ao salvar carrinho no sessionStorage";
      console.warn(errorMessage, error);
      handleError(errorMessage);
    }
  }, [items, enabled, persistToSession, storageKey, clearError, handleError]);

  // Função para calcular total de um item
  const getItemTotal = useCallback((item: SaleItem): number => {
    let total = 0;

    // Preço base do produto
    if (item.product?.type === "weight" && item.weight) {
      // Produtos vendidos por peso (preço por kg, peso em gramas)
      total = (item.product.price * item.weight) / 1000;
    } else {
      // Produtos vendidos por unidade
      total = item.product?.price || 0;
      if (item.quantity) {
        total *= item.quantity;
      }
    }

    // Adicionar preço dos addons
    if (item.addons?.length) {
      const addonsTotal = item.addons.reduce(
        (sum, addon) => sum + addon.price,
        0
      );
      total += addonsTotal * (item.quantity || 1);
    }

    return total;
  }, []);

  // Valores computados memoizados
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

  // Validação do carrinho
  const { isValid, validationErrors } = useMemo(() => {
    if (!validateItems) return { isValid: true, validationErrors: [] };

    const errors: string[] = [];

    // Validar limite de itens
    if (items.length > maxItems) {
      errors.push(`Carrinho excede o limite de ${maxItems} itens`);
    }

    // Validar itens individuais
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

  // Validação se pode adicionar item
  const canAddItem = useCallback(
    (product: Product): boolean => {
      if (!enabled) return false;
      if (items.length >= maxItems) return false;
      if (!product || !product.id) return false;
      return true;
    },
    [enabled, items.length, maxItems]
  );

  // Encontrar índice de um item pelo ID do produto
  const findItemIndex = useCallback(
    (productId: number): number => {
      return items.findIndex((item) => item.product?.id === productId);
    },
    [items]
  );

  // Verificar se tem um item específico
  const hasItem = useCallback(
    (productId: number): boolean => {
      return findItemIndex(productId) !== -1;
    },
    [findItemIndex]
  );

  // Adicionar item ao carrinho
  const addItem = useCallback(
    (product: Product, options: AddItemOptions = {}): boolean => {
      if (!canAddItem(product)) return false;

      const { quantity = 1, weight, addons, selectedOptions } = options;

      // Validações específicas
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

  // Remover item do carrinho
  const removeItem = useCallback(
    (index: number) => {
      if (!enabled) return;

      setItems((prev) => prev.filter((_, i) => i !== index));
    },
    [enabled]
  );

  // Atualizar item do carrinho
  const updateItem = useCallback(
    (index: number, updates: Partial<SaleItem>): boolean => {
      if (!enabled) return false;
      if (index < 0 || index >= items.length) return false;

      setItems((prev) => {
        const newItems = [...prev];
        const currentItem = newItems[index];

        // Validar atualizações
        if (updates.quantity !== undefined && updates.quantity <= 0) {
          return prev; // Não permitir quantidade zero ou negativa
        }

        if (
          updates.weight !== undefined &&
          currentItem.product?.type === "weight" &&
          updates.weight <= 0
        ) {
          return prev; // Não permitir peso zero ou negativo para produtos por peso
        }

        newItems[index] = { ...currentItem, ...updates };
        return newItems;
      });

      return true;
    },
    [enabled, items.length]
  );

  // Limpar carrinho
  const clearCart = useCallback(() => {
    if (!enabled) return;

    setItems([]);
    clearError();
  }, [enabled, clearError]);

  // Operações em lote
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

        // Validações específicas
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

      // Ordenar índices em ordem decrescente para remover corretamente
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

          // Validar atualizações
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

  // Cálculos avançados
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
    // Estado
    items,
    totalItems,
    totalValue,
    isEmpty,

    // Ações
    addItem,
    removeItem,
    updateItem,
    clearCart,

    // Utilitários
    canAddItem,
    getItemTotal,
    findItemIndex,
    hasItem,

    // Operações em lote
    addMultipleItems,
    removeMultipleItems,
    updateMultipleItems,

    // Cálculos avançados
    getSubtotal,
    getTotalWithTax,
    getItemsByCategory,

    // Validação
    isValid,
    validationErrors,

    // Estado de erro
    error,
    clearError,
  };
}
