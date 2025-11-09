import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaleItem } from "@/features/products";

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
    <div className="overflow-x-auto rounded-lg border border-pink-200 bg-white shadow-md">
      <Table className="w-full min-w-[600px]">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-pink-50 to-purple-50 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50">
            <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-gray-700 md:text-sm">
              Produto
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-700 md:text-sm">
              Quantidade/Peso
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-700 md:text-sm">
              Preço Unitário
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-700 md:text-sm">
              Subtotal
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-700 md:text-sm">
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
              <TableCell
                colSpan={5}
                className="py-12 text-center text-gray-400"
              >
                <div className="flex flex-col items-center gap-2">
                  <p className="text-base font-medium">Nenhum item no pedido</p>
                  <p className="text-sm text-gray-400">
                    Adicione produtos para começar
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
