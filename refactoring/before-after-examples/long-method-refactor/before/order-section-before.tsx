import { Printer, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/types/order";
import { SaleItem } from "@/types/product";

// import { OrderItemsTable } from "./order-items-table"; // Comentado para documentação

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
  // ❌ PROBLEMA: Long Method - 54 linhas com múltiplas responsabilidades
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pedido #${order.id.slice(-4)}</title>
            <style>
              @media print { body * { visibility: visible; } @page { margin: 0; size: 80mm auto; } }
            </style>
          </head>
          <body>
            <div style="text-align: center; margin-bottom: 1rem;">
              <h1 style="font-size: 1.25rem; font-weight: bold;">MUNDO GELADO</h1>
              <p>PEDIDO #${order.id.slice(-4)}</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
            <div style="margin-bottom: 1rem;">
              <p>Cliente: ${order.customerName}</p>
            </div>
            <table style="width: 100%; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 0.5rem 0;">
              <tr>
                <th style="text-align: left;">Item</th>
                <th style="text-align: right;">Qtd</th>
              </tr>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>
                    ${item.product.name}
                    ${
                      item.selectedOptions
                        ? `
                      ${item.selectedOptions.frutas.length > 0 ? `<div style="font-size: 0.875rem;">Frutas: ${item.selectedOptions.frutas.join(", ")}</div>` : ""}
                      ${item.selectedOptions.cremes.length > 0 ? `<div style="font-size: 0.875rem;">Cremes: ${item.selectedOptions.cremes.join(", ")}</div>` : ""}
                      ${item.selectedOptions.acompanhamentos.length > 0 ? `<div style="font-size: 0.875rem;">Acomp: ${item.selectedOptions.acompanhamentos.join(", ")}</div>` : ""}
                    `
                        : ""
                    }
                    ${item.addons?.length ? `<div style="font-size: 0.875rem;">Adicionais: ${item.addons.map((addon) => addon.name).join(", ")}</div>` : ""}
                  </td>
                  <td style="text-align: right;">${item.product.type === "weight" ? `${item.weight}g` : item.quantity || 1}</td>
                </tr>
              `
                )
                .join("")}
            </table>
            <div style="text-align: center; margin-top: 1rem;">
              <p>*** FIM DO PEDIDO ***</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Comanda de {order.customerName}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir Pedido
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
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
          <Button
            size="sm"
            onClick={onFinalize}
            className="bg-primary hover:bg-primary/90"
          >
            Finalizar Venda
          </Button>
        </div>
      </div>
      {/* <OrderItemsTable
        items={order.items}
        onRemoveItem={(index: number) => onRemoveItem(order.id, index)}
        onUpdateItem={(index: number, item: SaleItem) => onUpdateItem(order.id, index, item)}
      /> */}
      <div className="mt-4 text-right">
        <p className="text-lg font-medium">
          Total: {formatCurrency(calculateOrderTotal(order))}
        </p>
      </div>
    </div>
  );
}

/*
PROBLEMAS IDENTIFICADOS:

1. 🔴 Long Method (54 linhas)
   - Função handlePrint muito longa
   - Múltiplas responsabilidades em uma função

2. 🔴 Mistura de Responsabilidades
   - Lógica de negócio misturada com apresentação
   - Geração de HTML dentro do componente React
   - Manipulação de DOM e formatação de dados juntas

3. 🔴 Baixa Testabilidade
   - Difícil de testar unitariamente
   - Dependência de window.open
   - Lógica complexa não isolada

4. 🔴 Baixa Reutilização
   - Template de impressão não reutilizável
   - Formatação específica para este contexto
   - Código duplicado potencial

5. 🔴 Manutenibilidade
   - Mudanças no template requerem alteração do componente
   - Código difícil de ler e entender
   - Debugging complexo
*/