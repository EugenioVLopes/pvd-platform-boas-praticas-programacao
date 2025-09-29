# Long Method Refactor - handlePrint Function

## 📋 Descrição do Code Smell

**Code Smell:** Long Method  
**Arquivo Original:** `src/app/(routes)/(vendas)/_components/orders/order-section.tsx`  
**Função:** `handlePrint`  
**Linhas:** 31-85 (54 linhas)  
**Severidade:** Média

## 🔍 Problema Identificado

A função `handlePrint` apresentava os seguintes problemas:

### 1. **Responsabilidades Múltiplas**

- Geração de HTML para impressão
- Formatação de itens do pedido
- Configuração da janela de impressão
- Manipulação do DOM

### 2. **Código Difícil de Manter**

- 54 linhas em uma única função
- Lógica de apresentação misturada com lógica de negócio
- Template HTML hardcoded dentro da função
- Difícil de testar unitariamente

### 3. **Baixa Reutilização**

- Lógica de impressão não reutilizável
- Template de impressão acoplado ao componente
- Formatação de itens específica para este contexto

## ✅ Solução Aplicada

### **Padrão Utilizado:** Extract Method

Aplicamos o padrão Extract Method para dividir a função longa em múltiplas funções menores e especializadas:

### 1. **Criação de Utilitário Especializado**

- **Arquivo:** `src/lib/utils/print-template.ts`
- **Responsabilidade:** Geração de templates de impressão

### 2. **Funções Extraídas:**

#### **Formatação de Dados:**

- `formatOrderItem()` - Formata um item individual do pedido
- `generateOrderItemsTable()` - Gera a tabela de itens
- `generateOrderHeader()` - Gera o cabeçalho do pedido
- `generateCustomerInfo()` - Gera informações do cliente
- `generateOrderFooter()` - Gera o rodapé do pedido

#### **Configuração e Estilo:**

- `generatePrintStyles()` - Gera CSS para impressão

#### **Funções Principais:**

- `generateOrderPrintTemplate()` - Orquestra a geração do template completo
- `printHtmlContent()` - Gerencia a janela de impressão

### 3. **Função Refatorada**

A função `handlePrint` foi reduzida de **54 linhas para apenas 3 linhas**:

```typescript
const handlePrint = () => {
  const printTemplate = generateOrderPrintTemplate(order);
  printHtmlContent(printTemplate);
};
```

## 📊 Métricas de Melhoria

| Métrica               | Antes   | Depois | Melhoria                            |
| --------------------- | ------- | ------ | ----------------------------------- |
| **Linhas de Código**  | 54      | 3      | -94%                                |
| **Responsabilidades** | 4+      | 1      | Princípio da Responsabilidade Única |
| **Testabilidade**     | Baixa   | Alta   | Funções isoladas testáveis          |
| **Reutilização**      | Nenhuma | Alta   | Utilitário reutilizável             |
| **Manutenibilidade**  | Baixa   | Alta   | Código modular                      |

## 🎯 Benefícios Alcançados

### 1. **Princípio da Responsabilidade Única**

- Cada função tem uma responsabilidade específica
- Separação clara entre lógica de negócio e apresentação

### 2. **Melhor Testabilidade**

- Funções pequenas e isoladas
- Fácil criação de testes unitários
- Mocking simplificado

### 3. **Maior Reutilização**

- Utilitário de impressão pode ser usado em outros contextos
- Funções de formatação reutilizáveis

### 4. **Facilidade de Manutenção**

- Mudanças no template não afetam a lógica do componente
- Código mais legível e compreensível
- Debugging mais eficiente

### 5. **Extensibilidade**

- Fácil adição de novos tipos de impressão
- Personalização de templates por contexto
- Suporte a diferentes formatos de saída
