import { Calendar, Package, Plus, Trash2, User } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  onDeleteOrder: (orderId: string) => void;
}

export function OrderTabs({
  orders,
  onSelectOrder,
  onRemoveItem,
  calculateOrderTotal,
  onFinalizeSale,
  onAddProducts,
  onDeleteOrder,
}: OrderTabsProps) {
  const memoizedOrders = useMemo(() => orders, [orders]);

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-pink-100 bg-gradient-to-br from-pink-50/50 to-purple-50/50 p-12 text-center shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Package className="h-12 w-12 text-pink-400" />
          <p className="text-lg font-medium text-gray-700">
            Nenhuma comanda em aberto
          </p>
          <p className="text-sm text-gray-500">
            Crie uma nova comanda para começar
          </p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={orders[0]?.id} className="w-full">
      <TabsList className="h-auto w-full flex-wrap gap-2 bg-pink-50/50 p-2">
        {memoizedOrders.map((order) => {
          const totalItems = order.items.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          );
          return (
            <TabsTrigger
              key={order.id}
              value={order.id}
              onClick={() => onSelectOrder(order)}
              className="flex-grow data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{order.customerName}</span>
                <Badge
                  variant="secondary"
                  className="ml-1 bg-pink-100 text-pink-700"
                >
                  {totalItems}
                </Badge>
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {orders.map((order) => {
        const totalItems = order.items.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        const orderDate = new Date(order.createdAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const total = calculateOrderTotal(order);

        return (
          <TabsContent key={order.id} value={order.id} className="space-y-4">
            <div className="rounded-lg border border-pink-100 bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-lg transition-shadow hover:shadow-xl">
              <div className="mb-6 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                        <User className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {order.customerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Comanda #{order.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {orderDate}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1.5 border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                      >
                        <Package className="h-3.5 w-3.5" />
                        {totalItems} {totalItems === 1 ? "item" : "itens"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                      >
                        {order.status === "open" ? "Em Aberto" : "Finalizada"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddProducts}
                      className="flex items-center justify-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Produtos
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            `Deseja realmente excluir a comanda de ${order.customerName}?`
                          )
                        ) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <OrderItemsTable
                items={order.items}
                onRemoveItem={(index) => onRemoveItem(order.id, index)}
              />

              <div className="mt-6 space-y-4">
                <Separator />
                <div className="flex flex-col items-end gap-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 p-4 sm:flex-row sm:justify-between">
                  <div className="w-full text-left sm:w-auto">
                    <p className="text-sm text-gray-600">
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "itens"})
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total da Comanda</p>
                      <p className="text-3xl font-bold text-pink-600">
                        {formatCurrency(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="lg"
                    onClick={() => onFinalizeSale(order)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 font-semibold text-white shadow-md transition-all hover:from-pink-600 hover:to-purple-600 hover:shadow-lg sm:w-auto sm:min-w-[200px]"
                  >
                    Finalizar Venda
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
