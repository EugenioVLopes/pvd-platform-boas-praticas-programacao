import { useMemo } from "react";
import {
  calculateSalesReport,
  type SalesReport,
  type Venda,
} from "./sales-report-utils";

/**
 * ✅ SOLUÇÃO: Hook customizado para orquestração
 *
 * Responsabilidades:
 * - Gerenciar o estado reativo dos dados
 * - Chamar as funções utilitárias quando necessário
 * - Otimizar re-cálculos com useMemo
 * - Fornecer interface limpa para o componente
 */
export function useSalesReport(
  vendas: Venda[],
  dataInicio: Date,
  dataFim: Date
): SalesReport {
  const relatorio = useMemo(() => {
    // ✅ BENEFÍCIO: Lógica de negócios isolada e testável
    return calculateSalesReport(vendas, dataInicio, dataFim);
  }, [vendas, dataInicio, dataFim]);

  return relatorio;
}

/**
 * ✅ BENEFÍCIO ADICIONAL: Hook específico para métricas básicas
 * Permite uso granular quando não precisamos de todo o relatório
 */
export function useSalesMetrics(
  vendas: Venda[],
  dataInicio: Date,
  dataFim: Date
) {
  const { metricas } = useSalesReport(vendas, dataInicio, dataFim);
  return metricas;
}

/**
 * ✅ BENEFÍCIO ADICIONAL: Hook específico para dados de gráficos
 * Permite otimização específica para componentes de visualização
 */
export function useSalesChartData(
  vendas: Venda[],
  dataInicio: Date,
  dataFim: Date
) {
  const { vendasPorCategoria, vendasPorMetodoPagamento, vendasPorHora } =
    useSalesReport(vendas, dataInicio, dataFim);

  return {
    vendasPorCategoria,
    vendasPorMetodoPagamento,
    vendasPorHora,
  };
}
