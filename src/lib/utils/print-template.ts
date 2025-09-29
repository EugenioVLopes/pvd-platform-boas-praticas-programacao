import { Order } from "@/types/order";
import { SaleItem } from "@/types/product";

function formatOrderItem(item: SaleItem): string {
  const optionsHtml = item.selectedOptions
    ? `
      ${item.selectedOptions.frutas.length > 0 ? `<div style="font-size: 0.875rem;">Frutas: ${item.selectedOptions.frutas.join(", ")}</div>` : ""}
      ${item.selectedOptions.cremes.length > 0 ? `<div style="font-size: 0.875rem;">Cremes: ${item.selectedOptions.cremes.join(", ")}</div>` : ""}
      ${item.selectedOptions.acompanhamentos.length > 0 ? `<div style="font-size: 0.875rem;">Acomp: ${item.selectedOptions.acompanhamentos.join(", ")}</div>` : ""}
    `
    : "";

  const addonsHtml = item.addons?.length
    ? `<div style="font-size: 0.875rem;">Adicionais: ${item.addons.map((addon) => addon.name).join(", ")}</div>`
    : "";

  const quantity =
    item.product.type === "weight" ? `${item.weight}g` : item.quantity || 1;

  return `
    <tr>
      <td>
        ${item.product.name}
        ${optionsHtml}
        ${addonsHtml}
      </td>
      <td style="text-align: right;">${quantity}</td>
    </tr>
  `;
}

function generateOrderItemsTable(items: SaleItem[]): string {
  const itemsHtml = items.map(formatOrderItem).join("");

  return `
    <table style="width: 100%; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 0.5rem 0;">
      <tr>
        <th style="text-align: left;">Item</th>
        <th style="text-align: right;">Qtd</th>
      </tr>
      ${itemsHtml}
    </table>
  `;
}

function generateOrderHeader(orderId: string): string {
  return `
    <div style="text-align: center; margin-bottom: 1rem;">
      <h1 style="font-size: 1.25rem; font-weight: bold;">MUNDO GELADO</h1>
      <p>PEDIDO #${orderId.slice(-4)}</p>
      <p>${new Date().toLocaleString()}</p>
    </div>
  `;
}

function generateCustomerInfo(customerName: string): string {
  return `
    <div style="margin-bottom: 1rem;">
      <p>Cliente: ${customerName}</p>
    </div>
  `;
}

function generateOrderFooter(): string {
  return `
    <div style="text-align: center; margin-top: 1rem;">
      <p>*** FIM DO PEDIDO ***</p>
    </div>
  `;
}

function generatePrintStyles(): string {
  return `
    <style>
      @media print { 
        body * { visibility: visible; } 
        @page { margin: 0; size: 80mm auto; } 
      }
    </style>
  `;
}

export function generateOrderPrintTemplate(order: Order): string {
  const header = generateOrderHeader(order.id);
  const customerInfo = generateCustomerInfo(order.customerName);
  const itemsTable = generateOrderItemsTable(order.items);
  const footer = generateOrderFooter();
  const styles = generatePrintStyles();

  return `
    <html>
      <head>
        <title>Pedido #${order.id.slice(-4)}</title>
        ${styles}
      </head>
      <body>
        ${header}
        ${customerInfo}
        ${itemsTable}
        ${footer}
      </body>
    </html>
  `;
}

export function printHtmlContent(htmlContent: string): void {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    console.error("Não foi possível abrir a janela de impressão");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
