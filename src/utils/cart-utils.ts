import type {
  CartError,
  CartItemFilter,
  CartItemValidation,
  CartSortOptions,
  CartStatistics,
  CartValidationConfig,
} from "@/types/cart";
import {
  CART_ERROR_MESSAGES,
  CART_VALIDATION_CONSTANTS,
  CartErrorType,
} from "@/types/cart";
import type { SaleItem } from "@/types/product";

/**
 * Utilitários para manipulação e validação de carrinho de compras
 */
export class CartUtils {
  /**
   * Cria um erro de carrinho padronizado
   *
   * @param type - Tipo do erro
   * @param message - Mensagem personalizada (opcional)
   * @param details - Detalhes adicionais do erro
   * @returns Erro formatado
   *
   * @example
   * ```typescript
   * const error = CartUtils.createError(
   *   CartErrorType.INVALID_QUANTITY,
   *   "Quantidade deve ser maior que zero",
   *   { currentValue: -1, expectedValue: ">= 1" }
   * );
   * ```
   */
  static createError(
    type: CartErrorType,
    message?: string,
    details?: CartError["details"]
  ): CartError {
    return {
      type,
      message: message || CART_ERROR_MESSAGES[type],
      code: `CART_${type}`,
      details,
      timestamp: new Date(),
    };
  }

  /**
   * Valida um item individual do carrinho
   *
   * @param item - Item a ser validado
   * @param config - Configuração de validação
   * @returns Resultado da validação
   *
   * @example
   * ```typescript
   * const validation = CartUtils.validateSingleItem(item, {
   *   requireWeightForWeightProducts: true,
   *   minimumQuantity: 1
   * });
   *
   * if (!validation.isValid) {
   *   validation.errors.forEach(error => console.error(error.message));
   * }
   * ```
   */
  static validateSingleItem(
    item: SaleItem,
    config: CartValidationConfig = {}
  ): CartItemValidation {
    const errors: CartError[] = [];
    const warnings: string[] = [];

    // Validar produto
    if (!item.product || !item.product.id) {
      errors.push(
        this.createError(
          CartErrorType.INVALID_PRODUCT,
          "Item deve ter um produto válido"
        )
      );
    }

    // Validar peso para produtos vendidos por peso
    if (
      config.requireWeightForWeightProducts !== false &&
      item.product?.type === "weight"
    ) {
      if (!item.weight || item.weight <= 0) {
        errors.push(
          this.createError(
            CartErrorType.WEIGHT_REQUIRED,
            "Peso é obrigatório para produtos vendidos por peso",
            {
              productId: item.product.id,
              currentValue: item.weight,
              expectedValue: "> 0",
            }
          )
        );
      } else {
        // Validar limites de peso
        const minWeight =
          config.minimumWeight || CART_VALIDATION_CONSTANTS.MIN_WEIGHT;
        const maxWeight =
          config.maximumWeight || CART_VALIDATION_CONSTANTS.MAX_WEIGHT;

        if (item.weight < minWeight) {
          errors.push(
            this.createError(
              CartErrorType.VALIDATION_ERROR,
              `Peso mínimo é ${minWeight}g`,
              {
                productId: item.product.id,
                currentValue: item.weight,
                expectedValue: `>= ${minWeight}`,
              }
            )
          );
        }

        if (item.weight > maxWeight) {
          errors.push(
            this.createError(
              CartErrorType.VALIDATION_ERROR,
              `Peso máximo é ${maxWeight}g`,
              {
                productId: item.product.id,
                currentValue: item.weight,
                expectedValue: `<= ${maxWeight}`,
              }
            )
          );
        }
      }
    }

    // Validar quantidade
    if (item.quantity !== undefined) {
      const minQuantity =
        config.minimumQuantity || CART_VALIDATION_CONSTANTS.MIN_QUANTITY;

      if (item.quantity < minQuantity) {
        errors.push(
          this.createError(
            CartErrorType.INVALID_QUANTITY,
            `Quantidade mínima é ${minQuantity}`,
            {
              productId: item.product?.id,
              currentValue: item.quantity,
              expectedValue: `>= ${minQuantity}`,
            }
          )
        );
      }

      if (item.quantity > CART_VALIDATION_CONSTANTS.MAX_QUANTITY) {
        errors.push(
          this.createError(
            CartErrorType.INVALID_QUANTITY,
            `Quantidade máxima é ${CART_VALIDATION_CONSTANTS.MAX_QUANTITY}`,
            {
              productId: item.product?.id,
              currentValue: item.quantity,
              expectedValue: `<= ${CART_VALIDATION_CONSTANTS.MAX_QUANTITY}`,
            }
          )
        );
      }
    }

    // Executar validadores customizados
    if (config.customValidators) {
      for (const validator of config.customValidators) {
        const customError = validator(item);
        if (customError) {
          errors.push(customError);
        }
      }
    }

    // Avisos para melhorias
    if (item.product?.price === 0) {
      warnings.push("Produto com preço zero");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calcula estatísticas detalhadas do carrinho
   *
   * @param items - Itens do carrinho
   * @param taxRate - Taxa de imposto (opcional)
   * @returns Estatísticas calculadas
   *
   * @example
   * ```typescript
   * const stats = CartUtils.calculateStatistics(cartItems, 0.1);
   * console.log(`Total: R$ ${stats.total.toFixed(2)}`);
   * console.log(`Categorias: ${stats.categories.join(", ")}`);
   * ```
   */
  static calculateStatistics(
    items: SaleItem[],
    taxRate: number = CART_VALIDATION_CONSTANTS.DEFAULT_TAX_RATE
  ): CartStatistics {
    if (items.length === 0) {
      return {
        uniqueItems: 0,
        totalQuantity: 0,
        subtotal: 0,
        totalTax: 0,
        total: 0,
        averageItemValue: 0,
        categories: [],
        totalWeight: 0,
      };
    }

    // Calcular valores básicos
    const subtotal = items.reduce((sum, item) => {
      return sum + this.calculateItemTotal(item);
    }, 0);

    const totalTax = subtotal * taxRate;
    const total = subtotal + totalTax;

    const totalQuantity = items.reduce((sum, item) => {
      return sum + (item.quantity || 1);
    }, 0);

    const totalWeight = items.reduce((sum, item) => {
      return sum + (item.weight || 0);
    }, 0);

    // Encontrar itens mais caro e mais barato
    const itemTotals = items.map((item) => ({
      item,
      total: this.calculateItemTotal(item),
    }));

    const sortedByPrice = itemTotals.sort((a, b) => a.total - b.total);
    const cheapestItem = sortedByPrice[0]?.item;
    const mostExpensiveItem = sortedByPrice[sortedByPrice.length - 1]?.item;

    // Extrair categorias únicas
    const categories = Array.from(
      new Set(items.map((item) => item.product?.category).filter(Boolean))
    ) as string[];

    return {
      uniqueItems: items.length,
      totalQuantity,
      subtotal,
      totalTax,
      total,
      averageItemValue: subtotal / items.length,
      mostExpensiveItem,
      cheapestItem,
      categories,
      totalWeight: totalWeight > 0 ? totalWeight : undefined,
    };
  }

  /**
   * Calcula o total de um item específico
   *
   * @param item - Item para calcular o total
   * @returns Valor total do item
   *
   * @example
   * ```typescript
   * const itemTotal = CartUtils.calculateItemTotal(saleItem);
   * console.log(`Item total: R$ ${itemTotal.toFixed(2)}`);
   * ```
   */
  static calculateItemTotal(item: SaleItem): number {
    let total = 0;

    if (!item.product) return 0;

    // Preço base do produto
    if (item.product.type === "weight" && item.weight) {
      // Produtos vendidos por peso (preço por kg, peso em gramas)
      total = (item.product.price * item.weight) / 1000;
    } else {
      // Produtos vendidos por unidade
      total = item.product.price;
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
  }

  /**
   * Filtra itens do carrinho baseado em critérios
   *
   * @param items - Itens a serem filtrados
   * @param filter - Critérios de filtro
   * @returns Itens filtrados
   *
   * @example
   * ```typescript
   * const foodItems = CartUtils.filterItems(items, {
   *   category: "food",
   *   priceRange: { min: 10, max: 50 }
   * });
   * ```
   */
  static filterItems(items: SaleItem[], filter: CartItemFilter): SaleItem[] {
    return items.filter((item) => {
      // Filtro por categoria
      if (filter.category && item.product?.category !== filter.category) {
        return false;
      }

      // Filtro por tipo de produto
      if (filter.productType && item.product?.type !== filter.productType) {
        return false;
      }

      // Filtro por faixa de preço
      if (filter.priceRange) {
        const itemTotal = this.calculateItemTotal(item);
        if (filter.priceRange.min && itemTotal < filter.priceRange.min) {
          return false;
        }
        if (filter.priceRange.max && itemTotal > filter.priceRange.max) {
          return false;
        }
      }

      // Filtro por peso
      if (filter.weightRange && item.weight) {
        if (filter.weightRange.min && item.weight < filter.weightRange.min) {
          return false;
        }
        if (filter.weightRange.max && item.weight > filter.weightRange.max) {
          return false;
        }
      }

      // Filtro por quantidade
      if (filter.quantityRange && item.quantity) {
        if (
          filter.quantityRange.min &&
          item.quantity < filter.quantityRange.min
        ) {
          return false;
        }
        if (
          filter.quantityRange.max &&
          item.quantity > filter.quantityRange.max
        ) {
          return false;
        }
      }

      // Filtro customizado
      if (filter.customFilter && !filter.customFilter(item)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Ordena itens do carrinho
   *
   * @param items - Itens a serem ordenados
   * @param options - Opções de ordenação
   * @returns Itens ordenados
   *
   * @example
   * ```typescript
   * const sortedItems = CartUtils.sortItems(items, {
   *   field: "price",
   *   direction: "desc"
   * });
   * ```
   */
  static sortItems(items: SaleItem[], options: CartSortOptions): SaleItem[] {
    const { field, direction } = options;
    const multiplier = direction === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      switch (field) {
        case "name":
          valueA = a.product?.name || "";
          valueB = b.product?.name || "";
          break;
        case "price":
          valueA = a.product?.price || 0;
          valueB = b.product?.price || 0;
          break;
        case "category":
          valueA = a.product?.category || "";
          valueB = b.product?.category || "";
          break;
        case "quantity":
          valueA = a.quantity || 0;
          valueB = b.quantity || 0;
          break;
        case "weight":
          valueA = a.weight || 0;
          valueB = b.weight || 0;
          break;
        case "total":
          valueA = this.calculateItemTotal(a);
          valueB = this.calculateItemTotal(b);
          break;
        default:
          return 0;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * multiplier;
      }

      return ((valueA as number) - (valueB as number)) * multiplier;
    });
  }

  /**
   * Agrupa itens por categoria
   *
   * @param items - Itens a serem agrupados
   * @returns Itens agrupados por categoria
   *
   * @example
   * ```typescript
   * const grouped = CartUtils.groupByCategory(items);
   * Object.entries(grouped).forEach(([category, items]) => {
   *   console.log(`${category}: ${items.length} itens`);
   * });
   * ```
   */
  static groupByCategory(items: SaleItem[]): Record<string, SaleItem[]> {
    return items.reduce(
      (groups, item) => {
        const category = item.product?.category || "Sem categoria";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      },
      {} as Record<string, SaleItem[]>
    );
  }

  /**
   * Verifica se dois itens são equivalentes (mesmo produto e opções)
   *
   * @param itemA - Primeiro item
   * @param itemB - Segundo item
   * @returns Se os itens são equivalentes
   *
   * @example
   * ```typescript
   * const isDuplicate = CartUtils.areItemsEquivalent(newItem, existingItem);
   * if (isDuplicate) {
   *   console.log("Item já existe no carrinho");
   * }
   * ```
   */
  static areItemsEquivalent(itemA: SaleItem, itemB: SaleItem): boolean {
    // Comparar produtos
    if (itemA.product?.id !== itemB.product?.id) {
      return false;
    }

    // Comparar addons
    const addonsA = itemA.addons?.map((addon) => addon.id).sort() || [];
    const addonsB = itemB.addons?.map((addon) => addon.id).sort() || [];

    if (addonsA.length !== addonsB.length) {
      return false;
    }

    for (let i = 0; i < addonsA.length; i++) {
      if (addonsA[i] !== addonsB[i]) {
        return false;
      }
    }

    // Comparar opções selecionadas
    const optionsA = itemA.selectedOptions;
    const optionsB = itemB.selectedOptions;

    if (!optionsA && !optionsB) {
      return true;
    }

    if (!optionsA || !optionsB) {
      return false;
    }

    // Comparar cada tipo de opção
    const compareArrays = (arrA?: string[], arrB?: string[]) => {
      const a = (arrA || []).sort();
      const b = (arrB || []).sort();
      return a.length === b.length && a.every((val, i) => val === b[i]);
    };

    return (
      compareArrays(optionsA.frutas, optionsB.frutas) &&
      compareArrays(optionsA.cremes, optionsB.cremes) &&
      compareArrays(optionsA.acompanhamentos, optionsB.acompanhamentos)
    );
  }

  /**
   * Formata valor monetário para exibição
   *
   * @param value - Valor a ser formatado
   * @param currency - Moeda (padrão: "BRL")
   * @param locale - Localização (padrão: "pt-BR")
   * @returns Valor formatado
   *
   * @example
   * ```typescript
   * const formatted = CartUtils.formatCurrency(123.45);
   * console.log(formatted); // "R$ 123,45"
   * ```
   */
  static formatCurrency(
    value: number,
    currency: string = "BRL",
    locale: string = "pt-BR"
  ): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  }

  /**
   * Formata peso para exibição
   *
   * @param weightInGrams - Peso em gramas
   * @returns Peso formatado
   *
   * @example
   * ```typescript
   * const formatted = CartUtils.formatWeight(1500);
   * console.log(formatted); // "1,5 kg"
   * ```
   */
  static formatWeight(weightInGrams: number): string {
    if (weightInGrams >= 1000) {
      return `${(weightInGrams / 1000).toFixed(1).replace(".", ",")} kg`;
    }
    return `${weightInGrams} g`;
  }
}
