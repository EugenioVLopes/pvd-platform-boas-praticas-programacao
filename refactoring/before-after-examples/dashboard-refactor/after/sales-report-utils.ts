// ✅ SOLUÇÃO: Funções utilitárias puras para lógica de negócios

export interface Venda {
  id: string
  clienteNome: string
  itens: ItemVenda[]
  total: number
  metodoPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix'
  dataVenda: Date
  status: 'finalizada' | 'cancelada'
}

export interface ItemVenda {
  produtoId: string
  produtoNome: string
  categoria: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export interface SalesMetrics {
  totalVendas: number
  quantidadeVendas: number
  ticketMedio: number
  totalItens: number
}

export interface CategorySales {
  categoria: string
  quantidade: number
  valor: number
}

export interface PaymentMethodSales {
  metodo: string
  quantidade: number
  valor: number
  percentual: number
}

export interface HourlySales {
  hora: string
  quantidade: number
  valor: number
}

export interface TopProduct {
  nome: string
  quantidade: number
  valor: number
}

export interface SalesReport {
  metricas: SalesMetrics
  vendasPorCategoria: CategorySales[]
  vendasPorMetodoPagamento: PaymentMethodSales[]
  vendasPorHora: HourlySales[]
  produtosMaisVendidos: TopProduct[]
}

/**
 * Filtra vendas por período e status
 */
export function filterSalesByPeriod(
  vendas: Venda[],
  dataInicio: Date,
  dataFim: Date
): Venda[] {
  return vendas.filter(venda => {
    const dataVenda = new Date(venda.dataVenda)
    return dataVenda >= dataInicio && dataVenda <= dataFim && venda.status === 'finalizada'
  })
}

/**
 * Calcula métricas básicas de vendas
 */
export function calculateSalesMetrics(vendas: Venda[]): SalesMetrics {
  const totalVendas = vendas.reduce((acc, venda) => acc + venda.total, 0)
  const quantidadeVendas = vendas.length
  const ticketMedio = quantidadeVendas > 0 ? totalVendas / quantidadeVendas : 0
  const totalItens = vendas.reduce((acc, venda) => {
    return acc + venda.itens.reduce((itemAcc, item) => itemAcc + item.quantidade, 0)
  }, 0)

  return {
    totalVendas,
    quantidadeVendas,
    ticketMedio,
    totalItens
  }
}

/**
 * Agrupa vendas por categoria de produto
 */
export function groupSalesByCategory(vendas: Venda[]): CategorySales[] {
  const categorias: { [key: string]: { quantidade: number; valor: number } } = {}
  
  vendas.forEach(venda => {
    venda.itens.forEach(item => {
      if (!categorias[item.categoria]) {
        categorias[item.categoria] = { quantidade: 0, valor: 0 }
      }
      categorias[item.categoria].quantidade += item.quantidade
      categorias[item.categoria].valor += item.subtotal
    })
  })

  return Object.entries(categorias)
    .map(([categoria, dados]) => ({
      categoria,
      quantidade: dados.quantidade,
      valor: dados.valor
    }))
    .sort((a, b) => b.valor - a.valor)
}

/**
 * Agrupa vendas por método de pagamento
 */
export function groupSalesByPaymentMethod(vendas: Venda[], totalVendas: number): PaymentMethodSales[] {
  const metodos: { [key: string]: { quantidade: number; valor: number } } = {}
  
  vendas.forEach(venda => {
    const metodo = venda.metodoPagamento
    if (!metodos[metodo]) {
      metodos[metodo] = { quantidade: 0, valor: 0 }
    }
    metodos[metodo].quantidade += 1
    metodos[metodo].valor += venda.total
  })

  const nomeMetodos: { [key: string]: string } = {
    'dinheiro': 'Dinheiro',
    'cartao_credito': 'Cartão Crédito',
    'cartao_debito': 'Cartão Débito',
    'pix': 'PIX'
  }

  return Object.entries(metodos).map(([metodo, dados]) => ({
    metodo: nomeMetodos[metodo] || metodo,
    quantidade: dados.quantidade,
    valor: dados.valor,
    percentual: totalVendas > 0 ? (dados.valor / totalVendas) * 100 : 0
  }))
}

/**
 * Agrupa vendas por hora do dia
 */
export function groupSalesByHour(vendas: Venda[]): HourlySales[] {
  const horas: { [key: number]: { quantidade: number; valor: number } } = {}
  
  // Inicializar todas as horas do dia
  for (let i = 0; i < 24; i++) {
    horas[i] = { quantidade: 0, valor: 0 }
  }
  
  vendas.forEach(venda => {
    const hora = new Date(venda.dataVenda).getHours()
    horas[hora].quantidade += 1
    horas[hora].valor += venda.total
  })

  return Object.entries(horas)
    .map(([hora, dados]) => ({
      hora: `${hora.padStart(2, '0')}:00`,
      quantidade: dados.quantidade,
      valor: dados.valor
    }))
    .filter(item => item.quantidade > 0) // Mostrar apenas horas com vendas
}

/**
 * Calcula os produtos mais vendidos
 */
export function calculateTopProducts(vendas: Venda[], limit: number = 10): TopProduct[] {
  const produtos: { [key: string]: { nome: string; quantidade: number; valor: number } } = {}
  
  vendas.forEach(venda => {
    venda.itens.forEach(item => {
      if (!produtos[item.produtoId]) {
        produtos[item.produtoId] = {
          nome: item.produtoNome,
          quantidade: 0,
          valor: 0
        }
      }
      produtos[item.produtoId].quantidade += item.quantidade
      produtos[item.produtoId].valor += item.subtotal
    })
  })

  return Object.values(produtos)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limit)
}

/**
 * Função principal que gera o relatório completo de vendas
 * ✅ BENEFÍCIO: Função pura, facilmente testável
 */
export function calculateSalesReport(
  vendas: Venda[],
  dataInicio: Date,
  dataFim: Date
): SalesReport {
  // Filtrar vendas por período
  const vendasFiltradas = filterSalesByPeriod(vendas, dataInicio, dataFim)
  
  // Calcular métricas
  const metricas = calculateSalesMetrics(vendasFiltradas)
  
  // Calcular agrupamentos
  const vendasPorCategoria = groupSalesByCategory(vendasFiltradas)
  const vendasPorMetodoPagamento = groupSalesByPaymentMethod(vendasFiltradas, metricas.totalVendas)
  const vendasPorHora = groupSalesByHour(vendasFiltradas)
  const produtosMaisVendidos = calculateTopProducts(vendasFiltradas)

  return {
    metricas,
    vendasPorCategoria,
    vendasPorMetodoPagamento,
    vendasPorHora,
    produtosMaisVendidos
  }
}