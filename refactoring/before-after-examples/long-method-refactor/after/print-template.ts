import { Order } from "@/features/sales";
import { SaleItem } from "@/features/products";

/**
 * ✅ EXTRACT METHOD: Gera o HTML para impressão de um item do pedido
 * Responsabilidade: Formatação de um item individual
 */
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

/**
 * ✅ EXTRACT METHOD: Gera a tabela de itens do pedido
 * Responsabilidade: Formatação da tabela completa de itens
 */
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

/**
 * ✅ EXTRACT METHOD: Gera o cabeçalho do pedido
 * Responsabilidade: Formatação do cabeçalho com informações básicas
 */
function generateOrderHeader(orderId: string): string {
  return `
    <div style="text-align: center; margin-bottom: 1rem;">
      <h1 style="font-size: 1.25rem; font-weight: bold;">MUNDO GELADO</h1>
      <p>PEDIDO #${orderId.slice(-4)}</p>
      <p>${new Date().toLocaleString()}</p>
    </div>
  `;
}

/**
 * ✅ EXTRACT METHOD: Gera a seção de informações do cliente
 * Responsabilidade: Formatação das informações do cliente
 */
function generateCustomerInfo(customerName: string): string {
  return `
    <div style="margin-bottom: 1rem;">
      <p>Cliente: ${customerName}</p>
    </div>
  `;
}

/**
 * ✅ EXTRACT METHOD: Gera o rodapé do pedido
 * Responsabilidade: Formatação do rodapé
 */
function generateOrderFooter(): string {
  return `
    <div style="text-align: center; margin-top: 1rem;">
      <p>*** FIM DO PEDIDO ***</p>
    </div>
  `;
}

/**
 * ✅ EXTRACT METHOD: Gera o CSS para impressão
 * Responsabilidade: Configuração de estilos para impressão
 */
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

/**
 * ✅ FUNÇÃO PRINCIPAL: Gera o template HTML completo para impressão do pedido
 * Responsabilidade: Orquestrar a geração do template completo
 *
 * BENEFÍCIOS:
 * - Função pura e testável
 * - Reutilizável em diferentes contextos
 * - Fácil de manter e estender
 * - Separação clara de responsabilidades
 */
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

/**
 * ✅ EXTRACT METHOD: Abre uma nova janela e imprime o conteúdo HTML
 * Responsabilidade: Gerenciamento da janela de impressão
 *
 * BENEFÍCIOS:
 * - Tratamento de erro isolado
 * - Função reutilizável para qualquer conteúdo HTML
 * - Fácil de testar com mocking
 */
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

/*
ARQUITETURA DA SOLUÇÃO:

1. 🎯 SINGLE RESPONSIBILITY PRINCIPLE
   Cada função tem uma responsabilidade específica e bem definida

2. 🔧 EXTRACT METHOD PATTERN
   Função longa dividida em múltiplas funções menores e especializadas

3. 🧪 TESTABILIDADE
   - Funções puras (generateOrderPrintTemplate)
   - Dependências isoladas (printHtmlContent)
   - Fácil mocking e stubbing

4. 🔄 REUTILIZAÇÃO
   - Utilitário pode ser usado em outros contextos
   - Funções modulares e configuráveis
   - Template extensível

5. 🛠️ MANUTENIBILIDADE
   - Código legível e bem documentado
   - Mudanças isoladas em funções específicas
   - Debugging simplificado

6. 📈 EXTENSIBILIDADE
   - Fácil adição de novos tipos de impressão
   - Personalização de templates
   - Suporte a diferentes formatos
*/
