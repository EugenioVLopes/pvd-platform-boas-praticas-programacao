import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order";

interface SalesHeaderProps {
  showProducts: boolean;
  orders: Order[];
  currentOrderId: string | undefined;
  onShowProducts: (show: boolean) => void;
  onSelectOrder: (orderId: string) => void;
  onNewOrder: () => void;
}

export function SalesHeader({
  showProducts,
  orders,
  currentOrderId,
  onShowProducts,
  onSelectOrder,
  onNewOrder,
}: SalesHeaderProps) {
  if (!showProducts) {
    return (
      <div className="flex flex-col gap-4 rounded-lg bg-secondary/30 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <select
            className="w-full min-w-[200px] rounded-md border-2 border-primary/20 bg-white p-2 outline-none focus:border-primary/50 sm:w-auto"
            value={currentOrderId || ""}
            onChange={(e) => onSelectOrder(e.target.value)}
          >
            <option value="">Selecione uma comanda</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.customerName} -{" "}
                {new Date(order.createdAt).toLocaleString()}
              </option>
            ))}
          </select>
          {currentOrderId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectOrder("")}
              className="w-full border-primary/50 hover:bg-pink-500/10 sm:w-auto"
            >
              Limpar Seleção
            </Button>
          )}
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={onNewOrder}
          className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary/90 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Comanda
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-start rounded-lg bg-secondary/30 p-4">
      <Button
        variant="outline"
        size="lg"
        className="border-primary/50 hover:bg-pink-500/10"
        onClick={() => onShowProducts(false)}
      >
        ← Voltar
      </Button>
    </div>
  );
}
