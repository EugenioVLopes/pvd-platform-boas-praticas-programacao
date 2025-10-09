# Code Smells Identificados

## 1. Long Method - useSalesProcessing Hook

**Arquivo:** src/hooks/use-sales-processing.ts
**Linha:** 26-304
**Descrição:** O hook useSalesProcessing possui 278 linhas com múltiplas responsabilidades: gerenciamento de estado, manipulação de produtos, processamento de pedidos e cálculos. Viola o princípio de responsabilidade única.
**Severidade:** Alta
**Ferramenta:** Análise manual de código
**Status:** Pendente
**Refatoração Sugerida:** Extract Method - dividir em hooks menores (useProductSelection, useOrderManagement, usePaymentProcessing)

## 2. God Class - useSalesProcessing Hook

**Arquivo:** src/hooks/use-sales-processing.ts
**Linha:** 26-304
**Descrição:** Hook centraliza todas as operações de vendas: seleção de produtos, gerenciamento de carrinho, processamento de pedidos, cálculos e modais. Possui mais de 15 funções diferentes.
**Severidade:** Alta
**Ferramenta:** Análise manual de código
**Status:** Pendente
**Refatoração Sugerida:** Extract Class - separar responsabilidades em hooks especializados

## 3. Large Class - useProducts Store

**Arquivo:** src/hooks/use-products.ts
**Linha:** 16-581
**Descrição:** Store do Zustand com 565 linhas contendo array gigante de produtos hardcoded (mais de 500 produtos) misturado com lógica de negócio.
**Severidade:** Alta
**Ferramenta:** Análise manual de código
**Status:** Refatorado ✅
**Refatoração Aplicada:** Extract Data - dados movidos para arquivo separado (products-data.ts), hook reduzido para ~40 linhas
**Documentação:** refactoring/before-after-examples/hardcoded-data-refactor/

## 3.1. Hardcoded Data - useProducts Hook

**Arquivo:** src/hooks/use-products.ts
**Linha:** 19-562
**Descrição:** Hook contém 74 produtos definidos estaticamente no código, resultando em arquivo de 581 linhas com responsabilidades mistas (estado + dados).
**Severidade:** Alta
**Ferramenta:** Análise manual de código
**Status:** Refatorado ✅
**Refatoração Aplicada:** Separation of Concerns - dados extraídos para products-data.ts com funções utilitárias
**Benefícios:** Redução de 93% nas linhas do hook, melhor manutenibilidade, possibilidade de carregamento dinâmico
**Documentação:** refactoring/before-after-examples/hardcoded-data-refactor/

## 4. Long Method - handlePrint Function

**Arquivo:** src/app/(routes)/(vendas)/\_components/orders/order-section.tsx
**Linha:** 31-85 (original)
**Descrição:** Função handlePrint possuía 54 linhas com lógica complexa de geração de HTML para impressão. Misturava lógica de negócio com apresentação.
**Severidade:** Média
**Ferramenta:** Análise manual de código
**Status:** ✅ **RESOLVIDO**
**Refatoração Aplicada:** Extract Method - criado utilitário `src/lib/utils/print-template.ts` com funções especializadas
**Data da Resolução:** $(Get-Date -Format "dd/MM/yyyy")
**Melhorias Alcançadas:**

- Função reduzida de 54 para 3 linhas (-94%)
- Separação de responsabilidades (SRP)
- Criação de utilitário reutilizável
- Melhoria na testabilidade
- Documentação completa em `refactoring/before-after-examples/long-method-refactor/`

## 5. Duplicate Code - Cálculo de Totais

**Arquivo:** Múltiplos arquivos
**Linha:** Várias
**Descrição:** Lógica de cálculo de totais (calculateItemTotal, calculateOrderTotal) duplicada em vários componentes: order-management.tsx, order-item-row.tsx, sales-processing.tsx, cart-section.tsx, daily-summary.tsx
**Severidade:** Média
**Ferramenta:** Busca por regex
**Status:** Pendente
**Refatoração Sugerida:** Extract Function - centralizar cálculos em utils/calculations.ts (já existe parcialmente)

## 6. Feature Envy - SalesProcessing Component

**Arquivo:** src/app/(routes)/(vendas)/\_components/sales-processing.tsx
**Linha:** 19-165
**Descrição:** Componente principal acessa excessivamente métodos e propriedades do hook useSalesProcessing (mais de 15 propriedades/métodos diferentes).
**Severidade:** Média
**Ferramenta:** Análise manual de código
**Status:** Pendente
**Refatoração Sugerida:** Move Method - mover lógica de apresentação para o componente, manter apenas estado no hook

## 7. Long Parameter List - OrderSection Props

**Arquivo:** src/app/(routes)/(vendas)/\_components/orders/order-section.tsx
**Linha:** 10-21
**Descrição:** Interface OrderSectionProps possui 6 parâmetros, incluindo funções complexas com múltiplos argumentos.
**Severidade:** Baixa
**Ferramenta:** Análise manual de código
**Status:** Pendente
**Refatoração Sugerida:** Introduce Parameter Object - agrupar parâmetros relacionados em objetos

## 8. Data Class - Product Type

**Arquivo:** src/types/product.ts
**Linha:** Toda a interface
**Descrição:** Interface Product contém apenas dados sem comportamento associado. Lógica de manipulação de produtos espalhada por vários arquivos.
**Severidade:** Baixa
**Ferramenta:** Análise manual de código
**Status:** Pendente
**Refatoração Sugerida:** Add Behavior - criar classe Product com métodos para cálculos e validações

## 9. Inappropriate Intimacy - Acoplamento de Imports

**Arquivo:** src/app/(routes)/(dashboard)/sales-report/page.tsx
**Linha:** 8
**Descrição:** Import com caminho relativo excessivo (../../../../) indica acoplamento forte e estrutura de pastas problemática.
**Severidade:** Baixa
**Ferramenta:** Busca por regex
**Status:** Pendente
**Refatoração Sugerida:** Reorganize Imports - usar alias de importação ou reestruturar pastas

## 10. Dead Code - Exports Não Utilizados

**Arquivo:** Múltiplos arquivos
**Linha:** Várias
**Descrição:** Várias funções e componentes exportados que podem não estar sendo utilizados, identificados através da análise de exports.
**Severidade:** Baixa
**Ferramenta:** Busca por regex
**Status:** Pendente
**Refatoração Sugerida:** Remove Dead Code - verificar uso real e remover exports desnecessários

---

## Resumo da Análise

**Total de Code Smells:** 10

- **Alta Severidade:** 3
- **Média Severidade:** 4
- **Baixa Severidade:** 3

**Principais Problemas Identificados:**

1. Hook useSalesProcessing concentra muitas responsabilidades (God Class + Long Method)
2. Store useProducts mistura dados com lógica (Large Class)
3. Duplicação de lógica de cálculos em vários componentes
4. Acoplamento forte entre componentes

**Prioridades de Refatoração:**

1. Dividir useSalesProcessing em hooks menores
2. Extrair dados de produtos para arquivo separado
3. Centralizar lógica de cálculos
4. Simplificar função de impressão

## Critérios de Severidade

- **Alta:** Impacto significativo na manutenibilidade, performance ou legibilidade
- **Média:** Problemas que dificultam a manutenção mas não impedem o funcionamento
- **Baixa:** Melhorias menores de qualidade de código
