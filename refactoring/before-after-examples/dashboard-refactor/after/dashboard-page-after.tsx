'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useSalesReport } from './use-sales-report'
import { type Venda } from './sales-report-utils'

interface DashboardPageProps {
  vendas: Venda[]
  dataInicio: Date
  dataFim: Date
}

// ✅ SOLUÇÃO: Componente limpo focado apenas na apresentação
export default function DashboardPageAfter({ vendas, dataInicio, dataFim }: DashboardPageProps) {
  // ✅ BENEFÍCIO: Lógica de negócios abstraída em hook customizado
  const {
    metricas,
    vendasPorCategoria,
    vendasPorMetodoPagamento,
    vendasPorHora,
    produtosMaisVendidos
  } = useSalesReport(vendas, dataInicio, dataFim)

  const cores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

  return (
    <div className="space-y-6">
      {/* ✅ BENEFÍCIO: Componente focado apenas na estrutura e apresentação */}
      <MetricsCards metricas={metricas} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={vendasPorCategoria} />
        <PaymentMethodChart data={vendasPorMetodoPagamento} cores={cores} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HourlyChart data={vendasPorHora} />
        <TopProductsList produtos={produtosMaisVendidos} />
      </div>
    </div>
  )
}

// ✅ BENEFÍCIO: Componentes menores e mais focados
interface MetricsCardsProps {
  metricas: {
    totalVendas: number
    quantidadeVendas: number
    ticketMedio: number
    totalItens: number
  }
}

function MetricsCards({ metricas }: MetricsCardsProps) {
  return (
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
  )
}

interface CategoryChartProps {
  data: Array<{
    categoria: string
    quantidade: number
    valor: number
  }>
}

function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
            <Bar dataKey="valor" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface PaymentMethodChartProps {
  data: Array<{
    metodo: string
    quantidade: number
    valor: number
    percentual: number
  }>
  cores: string[]
}

function PaymentMethodChart({ data, cores }: PaymentMethodChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ metodo, percentual }) => `${metodo} (${percentual.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="valor"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface HourlyChartProps {
  data: Array<{
    hora: string
    quantidade: number
    valor: number
  }>
}

function HourlyChart({ data }: HourlyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Horário</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Quantidade']} />
            <Bar dataKey="quantidade" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TopProductsListProps {
  produtos: Array<{
    nome: string
    quantidade: number
    valor: number
  }>
}

function TopProductsList({ produtos }: TopProductsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {produtos.slice(0, 5).map((produto, index) => (
            <div key={produto.nome} className="flex justify-between items-center">
              <span className="text-sm">{index + 1}. {produto.nome}</span>
              <span className="text-sm font-medium">{produto.quantidade} un.</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}