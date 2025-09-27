import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaleItem } from "@/types/product";

import { OrderItemRow } from "./order-item-row";

interface OrderItemsTableProps {
  items: SaleItem[];
  onRemoveItem: (index: number) => void;
  onUpdateItem?: (index: number, item: SaleItem) => void;
}

export function OrderItemsTable({
  items,
  onRemoveItem,
  onUpdateItem,
}: OrderItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-pink-200 shadow-sm">
      <Table className="w-full min-w-[600px]">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 md:text-sm">
              Produto
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-semibold text-gray-700 md:text-sm">
              Quantidade/Peso
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-semibold text-gray-700 md:text-sm">
              Preço
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-semibold text-gray-700 md:text-sm">
              Subtotal
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-xs font-semibold text-gray-700 md:text-sm">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <OrderItemRow
                key={`${item.product.id}-${index}`}
                item={item}
                onRemove={() => onRemoveItem(index)}
                onUpdate={
                  onUpdateItem
                    ? (updatedItem) => onUpdateItem(index, updatedItem)
                    : undefined
                }
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                Nenhum item no pedido
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}