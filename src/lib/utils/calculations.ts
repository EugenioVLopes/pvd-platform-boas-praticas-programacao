import type { Order } from "@/types/order";
import type { SaleItem } from "@/types/product";

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

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
