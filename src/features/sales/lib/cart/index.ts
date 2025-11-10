import type { Product, SaleItem } from "@/features/products";
import type {
  CartError,
  CartItemFilter,
  CartItemValidation,
  CartSortOptions,
  CartStatistics,
  CartValidationConfig,
} from "@/features/sales/types";
import {
  CART_ERROR_MESSAGES,
  CART_VALIDATION_CONSTANTS,
  CartErrorType,
} from "@/features/sales/types";

export class CartUtils {
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

  private static validateProduct(item: SaleItem): CartError | null {
    if (!item.product?.id) {
      return this.createError(
        CartErrorType.INVALID_PRODUCT,
        "Item deve ter um produto válido"
      );
    }
    return null;
  }

  private static validateWeight(
    item: SaleItem,
    config: CartValidationConfig
  ): CartError[] {
    const errors: CartError[] = [];

    if (
      config.requireWeightForWeightProducts === false ||
      item.product?.type !== "weight"
    ) {
      return errors;
    }

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
      return errors;
    }

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

    return errors;
  }

  private static validateQuantity(
    item: SaleItem,
    config: CartValidationConfig
  ): CartError[] {
    const errors: CartError[] = [];

    if (item.quantity === undefined) {
      return errors;
    }

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

    return errors;
  }

  private static validateCustomValidators(
    item: SaleItem,
    config: CartValidationConfig
  ): CartError[] {
    if (!config.customValidators) {
      return [];
    }

    return config.customValidators
      .map((validator) => validator(item))
      .filter((error): error is CartError => error !== null);
  }

  static validateSingleItem(
    item: SaleItem,
    config: CartValidationConfig = {}
  ): CartItemValidation {
    const errors: CartError[] = [];
    const warnings: string[] = [];

    const productError = this.validateProduct(item);
    if (productError) {
      errors.push(productError);
    }

    errors.push(...this.validateWeight(item, config));
    errors.push(...this.validateQuantity(item, config));
    errors.push(...this.validateCustomValidators(item, config));

    if (item.product?.price === 0) {
      warnings.push("Produto com preço zero");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

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

    const itemTotals = items.map((item) => ({
      item,
      total: this.calculateItemTotal(item),
    }));

    const sortedByPrice = itemTotals.toSorted((a, b) => a.total - b.total);
    const cheapestItem = sortedByPrice[0]?.item;
    const mostExpensiveItem = sortedByPrice[sortedByPrice.length - 1]?.item;

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

  static calculateItemTotal(item: SaleItem): number {
    let total = 0;

    if (!item.product) return 0;

    if (item.product.type === "weight" && item.weight) {
      total = (item.product.price * item.weight) / 1000;
    } else {
      total = item.product.price;
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
  }

  private static matchesCategory(item: SaleItem, category?: string): boolean {
    return !category || item.product?.category === category;
  }

  private static matchesProductType(
    item: SaleItem,
    productType?: Product["type"]
  ): boolean {
    return !productType || item.product?.type === productType;
  }

  private static matchesPriceRange(
    item: SaleItem,
    priceRange?: CartItemFilter["priceRange"]
  ): boolean {
    if (!priceRange) {
      return true;
    }

    const itemTotal = this.calculateItemTotal(item);

    if (priceRange.min && itemTotal < priceRange.min) {
      return false;
    }

    if (priceRange.max && itemTotal > priceRange.max) {
      return false;
    }

    return true;
  }

  private static matchesWeightRange(
    item: SaleItem,
    weightRange?: CartItemFilter["weightRange"]
  ): boolean {
    if (!weightRange || !item.weight) {
      return true;
    }

    if (weightRange.min && item.weight < weightRange.min) {
      return false;
    }

    if (weightRange.max && item.weight > weightRange.max) {
      return false;
    }

    return true;
  }

  private static matchesQuantityRange(
    item: SaleItem,
    quantityRange?: CartItemFilter["quantityRange"]
  ): boolean {
    if (!quantityRange || !item.quantity) {
      return true;
    }

    if (quantityRange.min && item.quantity < quantityRange.min) {
      return false;
    }

    if (quantityRange.max && item.quantity > quantityRange.max) {
      return false;
    }

    return true;
  }

  static filterItems(items: SaleItem[], filter: CartItemFilter): SaleItem[] {
    return items.filter((item) => {
      if (!this.matchesCategory(item, filter.category)) {
        return false;
      }

      if (!this.matchesProductType(item, filter.productType)) {
        return false;
      }

      if (!this.matchesPriceRange(item, filter.priceRange)) {
        return false;
      }

      if (!this.matchesWeightRange(item, filter.weightRange)) {
        return false;
      }

      if (!this.matchesQuantityRange(item, filter.quantityRange)) {
        return false;
      }

      if (filter.customFilter && !filter.customFilter(item)) {
        return false;
      }

      return true;
    });
  }

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

  static areItemsEquivalent(itemA: SaleItem, itemB: SaleItem): boolean {
    if (itemA.product?.id !== itemB.product?.id) {
      return false;
    }

    const addonsA =
      itemA.addons
        ?.map((addon) => String(addon.id))
        .sort((a, b) => a.localeCompare(b, "pt-BR")) || [];
    const addonsB =
      itemB.addons
        ?.map((addon) => String(addon.id))
        .sort((a, b) => a.localeCompare(b, "pt-BR")) || [];

    if (addonsA.length !== addonsB.length) {
      return false;
    }

    for (let i = 0; i < addonsA.length; i++) {
      if (addonsA[i] !== addonsB[i]) {
        return false;
      }
    }

    const optionsA = itemA.selectedOptions;
    const optionsB = itemB.selectedOptions;

    if (!optionsA && !optionsB) {
      return true;
    }

    if (!optionsA || !optionsB) {
      return false;
    }

    const compareArrays = (arrA?: string[], arrB?: string[]) => {
      const a = (arrA || []).sort((x, y) => x.localeCompare(y, "pt-BR"));
      const b = (arrB || []).sort((x, y) => x.localeCompare(y, "pt-BR"));
      return a.length === b.length && a.every((val, i) => val === b[i]);
    };

    return (
      compareArrays(optionsA.frutas, optionsB.frutas) &&
      compareArrays(optionsA.cremes, optionsB.cremes) &&
      compareArrays(optionsA.acompanhamentos, optionsB.acompanhamentos)
    );
  }

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

  static formatWeight(weightInGrams: number): string {
    if (weightInGrams >= 1000) {
      return `${(weightInGrams / 1000).toFixed(1).replace(".", ",")} kg`;
    }
    return `${weightInGrams} g`;
  }
}
