import { Plus, Trash2 } from "lucide-react"; // Importe o ícone Trash2
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/types/order";

import { OrderItemsTable } from "./order-items-table";

interface OrderTabsProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onRemoveItem: (orderId: string, itemIndex: number) => void;
  calculateOrderTotal: (order: Order) => number;
  onFinalizeSale: (order: Order) => void;
  onAddProducts: () => void;
  onDeleteOrder: (orderId: string) => void; // Adicione esta linha
}

export function OrderTabs({
  orders,
  onSelectOrder,
  onRemoveItem,
  calculateOrderTotal,
  onFinalizeSale,
  onAddProducts,
  onDeleteOrder, // Adicione este parâmetro
}: OrderTabsProps) {
  // Memoizar a lista de orders para evitar re-renders desnecessários
  const memoizedOrders = useMemo(() => orders, [orders]);

  if (orders.length === 0) {
    return (
      <div className="rounded-lg bg-secondary/20 p-8 text-center">
        <p className="text-muted-foreground">Nenhuma comanda em aberto</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={orders[0]?.id} className="w-full">
      <TabsList className="h-auto w-full flex-wrap">
        {memoizedOrders.map((order) => (
          <TabsTrigger
            key={order.id}
            value={order.id}
            onClick={() => onSelectOrder(order)}
            className="flex-grow"
          >
            {order.customerName}
          </TabsTrigger>
        ))}
      </TabsList>
      {orders.map((order) => (
        <TabsContent key={order.id} value={order.id} className="space-y-4">
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Comanda de {order.customerName}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddProducts}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Produtos
                </Button>
                {/* Adicione o botão de exclusão */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        `Deseja realmente excluir a comanda de ${order.customerName}?`,
                      )
                    ) {
                      onDeleteOrder(order.id);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => onFinalizeSale(order)}
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
        </TabsContent>
      ))}
    </Tabs>
  );
}