import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SaleItem } from "@/types/product";

import { OrderItemsTable } from "../orders/order-items-table";

interface CartSectionProps {
  items: SaleItem[];
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, item: SaleItem) => void;
  onProceed: () => void;
  hasOpenOrders: boolean;
}

export function CartSection({
  items,
  onRemoveItem,
  onUpdateItem,
  onProceed,
  hasOpenOrders,
}: CartSectionProps) {
  const total = useMemo(
    () =>
      items.reduce((acc, item) => {
        const itemTotal =
          (item.product.type === "weight"
            ? (item.product.price * (item.weight || 0)) / 1000
            : item.product.price * (item.quantity || 1)) +
          (item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0);
        return acc + itemTotal;
      }, 0),
    [items]
  );

  return (
    <div className="space-y-4">
      <OrderItemsTable
        items={items}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
      />
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Total: {formatCurrency(total)}</p>
        {hasOpenOrders ? (
          <Button
            onClick={onProceed}
            className="bg-primary hover:bg-primary/90"
          >
            Adicionar à Comanda
          </Button>
        ) : (
          <Button
            onClick={onProceed}
            className="bg-primary hover:bg-primary/90"
          >
            Prosseguir
          </Button>
        )}
      </div>
    </div>
  );
}
