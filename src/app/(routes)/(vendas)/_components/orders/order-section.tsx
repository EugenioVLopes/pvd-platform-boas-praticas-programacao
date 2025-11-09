import { Calendar, Package, Printer, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  generateOrderPrintTemplate,
  printHtmlContent,
} from "@/lib/print";
import { Order } from "@/types/order";
import { SaleItem } from "@/types/product";

import { OrderItemsTable } from "./order-items-table";

interface OrderSectionProps {
  order: Order;
  onUpdateItem: (
    orderId: string,
    itemIndex: number,
    updatedItem: SaleItem
  ) => void;
  onRemoveItem: (orderId: string, itemIndex: number) => void;
  onFinalize: () => void;
  onDelete: () => void;
  calculateOrderTotal: (order: Order) => number;
}

export function OrderSection({
  order,
  onUpdateItem,
  onRemoveItem,
  onFinalize,
  onDelete,
  calculateOrderTotal,
}: OrderSectionProps) {
  const handlePrint = () => {
    const printTemplate = generateOrderPrintTemplate(order);
    printHtmlContent(printTemplate);
  };

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
    <div className="rounded-lg border border-pink-100 bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-lg transition-shadow hover:shadow-xl">
      {/* Cabeçalho com informações da comanda */}
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
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 sm:w-auto"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir Pedido</span>
              <span className="sm:hidden">Imprimir</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (
                  confirm(
                    `Deseja realmente excluir a comanda de ${order.customerName}?`
                  )
                ) {
                  onDelete();
                }
              }}
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Tabela de itens */}
      <OrderItemsTable
        items={order.items}
        onRemoveItem={(index) => onRemoveItem(order.id, index)}
        onUpdateItem={(index, item) => onUpdateItem(order.id, index, item)}
      />

      {/* Resumo e total */}
      <div className="mt-6 space-y-4">
        <Separator />
        <div className="flex flex-col items-end gap-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 p-4 sm:flex-row sm:justify-between">
          <div className="w-full text-left sm:w-auto">
            <p className="text-sm text-gray-600">
              Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"})
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
            onClick={onFinalize}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 font-semibold text-white shadow-md transition-all hover:from-pink-600 hover:to-purple-600 hover:shadow-lg sm:w-auto sm:min-w-[200px]"
          >
            Finalizar Venda
          </Button>
        </div>
      </div>
    </div>
  );
}
