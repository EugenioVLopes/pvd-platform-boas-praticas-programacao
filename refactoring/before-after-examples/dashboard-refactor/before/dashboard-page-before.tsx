'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Venda {
  id: string
  clienteNome: string
  itens: ItemVenda[]
  total: number
  metodoPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix'
  dataVenda: Date
  status: 'finalizada' | 'cancelada'
}

interface ItemVenda {
  produtoId: string
  produtoNome: string
  categoria: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

interface DashboardPageProps {
  vendas: Venda[]
  dataInicio: Date
  dataFim: Date
}

// ❌ PROBLEMA: Lógica de negócios complexa misturada com componente de UI
export default function DashboardPageBefore({ vendas, dataInicio, dataFim }: DashboardPageProps) {
  // ❌ PROBLEMA: Cálculo complexo de métricas diretamente no componente
  const metricas = useMemo(() => {
    // Filtrar vendas por período
    const vendasFiltradas = vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda)
      return dataVenda >= dataInicio && dataVenda <= dataFim && venda.status === 'finalizada'
    })

    // Calcular total de vendas
    const totalVendas = vendasFiltradas.reduce((acc, venda) => acc + venda.total, 0)
    
    // Calcular quantidade de vendas
    const quantidadeVendas = vendasFiltradas.length
    
    // Calcular ticket médio
    const ticketMedio = quantidadeVendas > 0 ? totalVendas / quantidadeVendas : 0
    
    // Calcular total de itens vendidos
    const totalItens = vendasFiltradas.reduce((acc, venda) => {
      return acc + venda.itens.reduce((itemAcc, item) => itemAcc + item.quantidade, 0)
    }, 0)

    return {
      totalVendas,
      quantidadeVendas,
      ticketMedio,
      totalItens
    }
  }, [vendas, dataInicio, dataFim])

  // ❌ PROBLEMA: Lógica complexa de agrupamento por categoria
  const vendasPorCategoria = useMemo(() => {
    const vendasFiltradas = vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda)
      return dataVenda >= dataInicio && dataVenda <= dataFim && venda.status === 'finalizada'
    })

    const categorias: { [key: string]: { quantidade: number; valor: number } } = {}
    
    vendasFiltradas.forEach(venda => {
      venda.itens.forEach(item => {
        if (!categorias[item.categoria]) {
          categorias[item.categoria] = { quantidade: 0, valor: 0 }
        }
        categorias[item.categoria].quantidade += item.quantidade
        categorias[item.categoria].valor += item.subtotal
      })
    })

    return Object.entries(categorias).map(([categoria, dados]) => ({
      categoria,
      quantidade: dados.quantidade,
      valor: dados.valor
    })).sort((a, b) => b.valor - a.valor)
  }, [vendas, dataInicio, dataFim])

  // ❌ PROBLEMA: Lógica complexa de agrupamento por método de pagamento
  const vendasPorMetodoPagamento = useMemo(() => {
    const vendasFiltradas = vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda)
      return dataVenda >= dataInicio && dataVenda <= dataFim && venda.status === 'finalizada'
    })

    const metodos: { [key: string]: { quantidade: number; valor: number } } = {}
    
    vendasFiltradas.forEach(venda => {
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
      percentual: (dados.valor / metricas.totalVendas) * 100
    }))
  }, [vendas, dataInicio, dataFim, metricas.totalVendas])

  // ❌ PROBLEMA: Lógica complexa de vendas por hora
  const vendasPorHora = useMemo(() => {
    const vendasFiltradas = vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda)
      return dataVenda >= dataInicio && dataVenda <= dataFim && venda.status === 'finalizada'
    })

    const horas: { [key: number]: { quantidade: number; valor: number } } = {}
    
    // Inicializar todas as horas do dia
    for (let i = 0; i < 24; i++) {
      horas[i] = { quantidade: 0, valor: 0 }
    }
    
    vendasFiltradas.forEach(venda => {
      const hora = new Date(venda.dataVenda).getHours()
      horas[hora].quantidade += 1
      horas[hora].valor += venda.total
    })

    return Object.entries(horas).map(([hora, dados]) => ({
      hora: `${hora.padStart(2, '0')}:00`,
      quantidade: dados.quantidade,
      valor: dados.valor
    })).filter(item => item.quantidade > 0) // Mostrar apenas horas com vendas
  }, [vendas, dataInicio, dataFim])

  // ❌ PROBLEMA: Lógica complexa de produtos mais vendidos
  const produtosMaisVendidos = useMemo(() => {
    const vendasFiltradas = vendas.filter(venda => {
      const dataVenda = new Date(venda.dataVenda)
      return dataVenda >= dataInicio && dataVenda <= dataFim && venda.status === 'finalizada'
    })

    const produtos: { [key: string]: { nome: string; quantidade: number; valor: number } } = {}
    
    vendasFiltradas.forEach(venda => {
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
      .slice(0, 10) // Top 10 produtos
  }, [vendas, dataInicio, dataFim])

  const cores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metricas.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantidade de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.quantidadeVendas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalItens}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
                <Bar dataKey="valor" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vendasPorMetodoPagamento}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ metodo, percentual }) => `${metodo} (${percentual.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {vendasPorMetodoPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Quantidade']} />
                <Bar dataKey="quantidade" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {produtosMaisVendidos.slice(0, 5).map((produto, index) => (
                <div key={produto.nome} className="flex justify-between items-center">
                  <span className="text-sm">{index + 1}. {produto.nome}</span>
                  <span className="text-sm font-medium">{produto.quantidade} un.</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}