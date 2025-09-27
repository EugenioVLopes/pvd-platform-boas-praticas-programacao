import { useCallback, useState } from "react";

import type { Product, SaleItem } from "@/types/product";

export function useCart() {
  const [items, setItems] = useState<SaleItem[]>([]);

  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      weight?: number,
      addons?: Product[],
      selectedOptions?: SaleItem["selectedOptions"],
    ) => {
      setItems((prev) => [
        ...prev,
        { product, quantity, weight, addons, selectedOptions },
      ]);
    },
    [],
  );

  const removeFromCart = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addToCart,
    removeFromCart,
    clearCart,
  };
}