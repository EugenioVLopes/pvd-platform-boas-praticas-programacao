import type { Order } from "@/features/sales";
import type { SaleItem } from "@/features/products";

export function calculateItemTotal(item: SaleItem): number {
  if (item.product.type === "weight" && item.weight) {
    return (item.product.price * item.weight) / 1000;
  }
  const basePrice = item.product.price * (item.quantity ?? 1);
  const addonsPrice =
    item.addons?.reduce((sum, addon) => sum + addon.price, 0) ?? 0;
  return basePrice + addonsPrice;
}

export function calculateOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}
