import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib";
import { Order } from "@/features/sales";

import { OrderItemsTable } from "./order-items-table";

interface CurrentOrderViewProps {
  order: Order;
  onRemoveItem: (orderId: string, index: number) => void;
  onFinalizeSale: () => void;
  calculateOrderTotal: (order: Order) => number;
}

export function CurrentOrderView({
  order,
  onRemoveItem,
  onFinalizeSale,
  calculateOrderTotal,
}: CurrentOrderViewProps) {
  return (
    <div className="rounded-lg bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Comanda de {order.customerName}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={onFinalizeSale}
          >
            Finalizar Venda
          </Button>
        </div>
      </div>
      <OrderItemsTable
        items={order.items}
        onRemoveItem={(index) => onRemoveItem(order.id, index)}
      />
      <div className="mt-4 text-right">
        <p className="text-lg font-medium">
          Total: {formatCurrency(calculateOrderTotal(order))}
        </p>
      </div>
    </div>
  );
}
