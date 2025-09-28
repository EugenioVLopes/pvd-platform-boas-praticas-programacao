# Refatoração: Complex Business Logic in UI

## 📋 Visão Geral

Este exemplo demonstra a refatoração de um **code smell** comum: **Complex Business Logic in UI**. O problema ocorre quando componentes React contêm lógica de negócios complexa misturada com código de apresentação, prejudicando a legibilidade, reutilização e testabilidade.

## 🚨 Problema Identificado

### Code Smell: Complex Business Logic in UI

**Componente:** `DashboardPage.tsx`

O componente original contém lógica de negócios complexa diretamente em hooks `useMemo`, incluindo:

- Cálculo de métricas de vendas
- Agrupamento de dados por categoria, método de pagamento e hora
- Determinação de produtos mais vendidos
- Transformações de dados para gráficos

### Problemas Específicos

1. **Dificuldade de Leitura**
   - Lógica de transformação de dados ofusca a estrutura do componente
   - Componente perde o foco na apresentação

2. **Lógica Não Reutilizável**
   - Cálculos duplicados se necessários em outras partes da aplicação
   - Impossibilidade de usar a lógica em endpoints de API

3. **Dificuldade de Teste**
   - Lógica acoplada ao ciclo de vida do componente React
   - Testes de unidade complexos e frágeis

## ✅ Solução Implementada

### Estratégia de Refatoração

1. **Separação de Responsabilidades**
   - Extrair lógica de negócios para funções puras
   - Manter componentes focados na apresentação

2. **Criação de Camadas**
   - **Utilitários:** Funções puras para cálculos
   - **Hooks:** Orquestração e estado reativo
   - **Componentes:** Apresentação e UI

### Estrutura da Solução

```
dashboard-refactor/
├── before/
│   └── dashboard-page-before.tsx    # ❌ Versão com problemas
└── after/
    ├── sales-report-utils.ts        # ✅ Funções utilitárias puras
    ├── use-sales-report.ts          # ✅ Hook customizado
    └── dashboard-page-after.tsx     # ✅ Componente refatorado
```

## 📁 Arquivos da Solução

### 1. `sales-report-utils.ts` - Funções Utilitárias

**Responsabilidades:**

- Definir interfaces TypeScript
- Implementar funções puras para cálculos
- Fornecer lógica reutilizável e testável

**Funções Principais:**

- `filterSalesByPeriod()` - Filtra vendas por período
- `calculateMetrics()` - Calcula métricas básicas
- `groupSalesByCategory()` - Agrupa vendas por categoria
- `groupSalesByPaymentMethod()` - Agrupa por método de pagamento
- `groupSalesByHour()` - Agrupa por horário
- `getTopSellingProducts()` - Identifica produtos mais vendidos
- `calculateSalesReport()` - Função principal que orquestra todos os cálculos

### 2. `use-sales-report.ts` - Hook Customizado

**Responsabilidades:**

- Gerenciar estado reativo dos dados
- Chamar funções utilitárias quando necessário
- Otimizar re-cálculos com `useMemo`
- Fornecer interface limpa para componentes

**Hooks Disponíveis:**

- `useSalesReport()` - Hook principal completo
- `useSalesMetrics()` - Hook específico para métricas
- `useSalesChartData()` - Hook específico para dados de gráficos

### 3. `dashboard-page-after.tsx` - Componente Refatorado

**Responsabilidades:**

- Apresentação e estrutura da UI
- Composição de componentes menores
- Uso de hooks para obter dados processados

**Melhorias:**

- Componente principal focado na estrutura
- Subcomponentes especializados (`MetricsCards`, `CategoryChart`, etc.)
- Lógica de negócios completamente abstraída

## 🔄 Comparação: Antes vs Depois

### Antes (Problemático)

```typescript
// ❌ Lógica complexa misturada com UI
const metricas = useMemo(() => {
  const vendasFiltradas = vendas.filter((venda) => {
    const dataVenda = new Date(venda.data);
    return dataVenda >= dataInicio && dataVenda <= dataFim;
  });

  const totalVendas = vendasFiltradas.reduce(
    (acc, venda) => acc + venda.valor,
    0
  );
  const quantidadeVendas = vendasFiltradas.length;
  const ticketMedio = quantidadeVendas > 0 ? totalVendas / quantidadeVendas : 0;
  // ... mais 50+ linhas de lógica complexa
}, [vendas, dataInicio, dataFim]);
```

### Depois (Solução)

```typescript
// ✅ Lógica abstraída em hook customizado
const {
  metricas,
  vendasPorCategoria,
  vendasPorMetodoPagamento,
  vendasPorHora,
  produtosMaisVendidos,
} = useSalesReport(vendas, dataInicio, dataFim);
```

## 🎯 Benefícios Alcançados

### 1. **Legibilidade Melhorada**

- Componente focado na apresentação
- Lógica de negócios claramente separada
- Código mais fácil de entender e manter

### 2. **Reutilização**

- Funções utilitárias podem ser usadas em qualquer lugar
- Hooks customizados reutilizáveis
- Lógica disponível para APIs, testes, etc.

### 3. **Testabilidade**

- Funções puras fáceis de testar
- Testes de unidade simples e confiáveis
- Mocking simplificado nos testes de componentes

### 4. **Manutenibilidade**

- Mudanças na lógica de negócios isoladas
- Componentes estáveis e previsíveis
- Debugging mais eficiente

### 5. **Performance**

- Otimizações específicas por camada
- Re-renderizações mais controladas
- Memoização eficiente

## 📚 Princípios Aplicados

### Single Responsibility Principle (SRP)

- Cada função tem uma responsabilidade específica
- Componentes focados apenas na apresentação
- Hooks responsáveis apenas pela orquestração

### Separation of Concerns

- Lógica de negócios separada da apresentação
- Cálculos isolados em funções puras
- Estado reativo gerenciado por hooks

### Don't Repeat Yourself (DRY)

- Lógica centralizada e reutilizável
- Funções utilitárias compartilháveis
- Hooks customizados para padrões comuns

### Testability

- Funções puras facilmente testáveis
- Dependências explícitas
- Mocking simplificado
