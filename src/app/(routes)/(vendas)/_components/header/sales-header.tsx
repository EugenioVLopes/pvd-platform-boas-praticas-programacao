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
}: SalesHeaderProps) {
  if (!showProducts) {
    return (
      <div className="bg-secondary/30 flex flex-col items-center justify-start gap-4 rounded-lg p-4 md:flex-row">
        <select
          className="border-primary/20 focus:border-primary/50 w-full min-w-[200px] rounded-md border-2 bg-white p-2 outline-none md:w-auto"
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
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 flex items-center justify-start rounded-lg p-4">
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
