# Product Backlog - Sistema PDV Mundo Gelado

## 📋 Épicos e User Stories

### 🏪 Épico 1: Gestão de Produtos e Vendas

| Pri   | ID    | User Story                                                                                           | Critérios de Aceitação                                                                                      | Critérios de Qualidade                                                                                                    | Est | Sprint |
| ----- | ----- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --- | ------ |
| 🔴 P1 | US001 | **Como** atendente, **quero** selecionar produtos por categoria **para** agilizar o atendimento      | • Categorias visíveis em cards<br>• Produtos filtrados por categoria<br>• Interface responsiva              | • Função de seleção < 15 linhas<br>• Nomenclatura descritiva (ProductCategory)<br>• Separação entre lógica e apresentação | 6h  | 1      |
| 🔴 P1 | US002 | **Como** atendente, **quero** adicionar produtos ao carrinho **para** montar o pedido                | • Produtos adicionados com quantidade<br>• Cálculo automático de subtotal<br>• Feedback visual de adição    | • Função addToCart < 20 linhas<br>• Validação de entrada<br>• Tratamento de erros                                         | 8h  | 1      |
| 🔴 P1 | US003 | **Como** atendente, **quero** customizar produtos "Monte do Seu Jeito" **para** atender preferências | • Seleção de frutas, cremes, acompanhamentos<br>• Limite por tipo de ingrediente<br>• Validação de seleções | • Função de customização modular<br>• Validação em função separada<br>• Nomes intencionais (selectedOptions)              | 12h | 2      |
| 🔴 P1 | US004 | **Como** atendente, **quero** processar produtos vendidos por peso **para** calcular preço correto   | • Input de peso em gramas<br>• Cálculo automático do preço<br>• Validação de peso mínimo/máximo             | • Função calculateWeightPrice < 10 linhas<br>• Constantes para limites de peso<br>• Formatação consistente                | 4h  | 1      |

---

### 📝 Épico 2: Sistema de Comandas

| Pri   | ID    | User Story                                                                                     | Critérios de Aceitação                                                                                              | Critérios de Qualidade                                                                                        | Est | Sprint |
| ----- | ----- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --- | ------ |
| 🔴 P1 | US005 | **Como** atendente, **quero** criar novas comandas **para** organizar pedidos por cliente      | • Campo nome do cliente obrigatório<br>• ID único gerado automaticamente<br>• Status inicial "aberta"               | • Função createOrder < 15 linhas<br>• Validação de nome em função separada<br>• Uso de UUID para IDs          | 6h  | 2      |
| 🔴 P1 | US006 | **Como** atendente, **quero** adicionar itens a comandas existentes **para** completar pedidos | • Seleção de comanda ativa<br>• Adição de múltiplos itens<br>• Atualização de total em tempo real                   | • Função updateOrder sem efeitos colaterais<br>• Imutabilidade de dados<br>• Nomenclatura clara (orderItems)  | 8h  | 2      |
| 🔴 P1 | US007 | **Como** atendente, **quero** visualizar todas as comandas abertas **para** controle           | • Lista de comandas com status<br>• Informações resumidas (cliente, total)<br>• Indicador visual de comandas ativas | • Componente OrderList reutilizável<br>• Função de filtro < 10 linhas<br>• Separação de responsabilidades     | 6h  | 2      |
| 🟡 P2 | US008 | **Como** atendente, **quero** imprimir comandas **para** controle da cozinha                   | • Formato de impressão térmica<br>• Informações essenciais do pedido<br>• Função de impressão acessível             | • Função formatForPrint < 20 linhas<br>• Template de impressão separado<br>• Tratamento de erros de impressão | 8h  | 3      |

---

### 💳 Épico 3: Processamento de Pagamentos

| Pri   | ID    | User Story                                                                               | Critérios de Aceitação                                                                                       | Critérios de Qualidade                                                                                           | Est | Sprint |
| ----- | ----- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | --- | ------ |
| 🔴 P1 | US009 | **Como** atendente, **quero** processar pagamentos em dinheiro **para** finalizar vendas | • Cálculo automático de troco<br>• Validação de valor recebido<br>• Confirmação de pagamento                 | • Função calculateChange < 8 linhas<br>• Validação de entrada numérica<br>• Constantes para métodos de pagamento | 6h  | 3      |
| 🔴 P1 | US010 | **Como** atendente, **quero** processar pagamentos em cartão **para** oferecer opções    | • Seleção entre crédito/débito<br>• Registro do método escolhido<br>• Finalização automática                 | • Enum para PaymentMethod<br>• Função processPayment < 15 linhas<br>• Tratamento de casos de erro                | 4h  | 3      |
| 🟡 P2 | US011 | **Como** atendente, **quero** aplicar descontos **para** vendas promocionais             | • Input de percentual ou valor fixo<br>• Validação de limites de desconto<br>• Recálculo automático do total | • Função applyDiscount < 12 linhas<br>• Validação de desconto separada<br>• Nomenclatura clara (discountAmount)  | 6h  | 4      |

---

### 📊 Épico 4: Relatórios e Dashboard

| Pri   | ID    | User Story                                                                                    | Critérios de Aceitação                                                                     | Critérios de Qualidade                                                                                               | Est | Sprint |
| ----- | ----- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --- | ------ |
| 🟡 P2 | US012 | **Como** proprietário, **quero** ver relatório de vendas diárias **para** controle financeiro | • Filtro por data<br>• Total de vendas e quantidade<br>• Breakdown por método de pagamento | • Função generateDailyReport < 25 linhas<br>• Lógica de filtro reutilizável<br>• Formatação de dados separada        | 10h | 4      |
| 🟡 P2 | US013 | **Como** proprietário, **quero** ver produtos mais vendidos **para** gestão de estoque        | • Ranking de produtos por quantidade<br>• Período configurável<br>• Exportação de dados    | • Função sortProductsByQuantity < 15 linhas<br>• Algoritmo de ordenação eficiente<br>• Interface de exportação limpa | 8h  | 4      |
| 🟢 P3 | US014 | **Como** proprietário, **quero** dashboard com métricas em tempo real **para** acompanhamento | • Vendas do dia atual<br>• Gráficos de performance<br>• Atualização automática             | • Componentes de gráfico reutilizáveis<br>• Hooks customizados para dados<br>• Otimização de re-renderização         | 12h | 5      |

---

## 🛠️ Itens Específicos de Qualidade de Código

### 🔧 Refatoração e Code Smells

| Pri   | ID    | Tarefa                                                  | Critérios de Aceitação                                                                                                              | Est | Sprint |
| ----- | ----- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --- | ------ |
| 🟡 P2 | QA001 | **Identificar e catalogar** code smells no código atual | • Pelo menos 5 code smells identificados<br>• Documentação com localização e severidade<br>• Uso de ferramentas de análise estática | 4h  | 3      |
| 🟡 P2 | QA002 | **Refatorar** funções longas (Long Method)              | • Funções > 30 linhas quebradas em menores<br>• Aplicação da técnica Extract Method<br>• Documentação das mudanças                  | 6h  | 3      |
| 🟡 P2 | QA003 | **Eliminar** duplicação de código (Duplicate Code)      | • Identificação de código duplicado<br>• Criação de funções utilitárias<br>• Redução de duplicação para < 5%                        | 8h  | 4      |
| 🟢 P3 | QA004 | **Melhorar** nomenclatura ambígua (Poor Naming)         | • Renomeação de variáveis genéricas<br>• Nomes descritivos e intencionais<br>• Consistência na nomenclatura                         | 4h  | 4      |
| 🟢 P3 | QA005 | **Aplicar** princípios SOLID onde apropriado            | • Single Responsibility em componentes<br>• Dependency Injection em serviços<br>• Interface Segregation                             | 10h | 5      |
| 🟢 P3 | QA006 | **Reduzir** acoplamento entre módulos                   | • Identificação de dependências desnecessárias<br>• Aplicação de padrões de design<br>• Melhoria na testabilidade                   | 8h  | 5      |

---

## ⚡ Critérios de Qualidade Gerais

### 📝 Nomenclatura

- ✅ Nomes intencionais e pronunciáveis
- ✅ Evitar abreviações desnecessárias
- ✅ Usar termos do domínio (Product, Order, Payment)
- ✅ Consistência na convenção (camelCase para JS/TS)

### 🔧 Estrutura de Funções

- ✅ Funções pequenas (< 20 linhas idealmente)
- ✅ Responsabilidade única por função
- ✅ Máximo 3-4 parâmetros
- ✅ Nível único de abstração

### 🎨 Formatação

- ✅ Indentação consistente (2 espaços)
- ✅ Linhas com máximo 120 caracteres
- ✅ Espaçamento vertical adequado
- ✅ Uso do Prettier para formatação automática

### 💬 Comentários

- ✅ Apenas quando necessário
- ✅ Explicam "por que", não "o que"
- ✅ Mantidos atualizados com o código
- ✅ JSDoc para funções públicas

---

## ✅ Definition of Done (DoD)

### Para User Stories

- [ ] Funcionalidade implementada conforme critérios de aceitação
- [ ] Código segue padrões de qualidade definidos
- [ ] Funções respeitam limite de linhas
- [ ] Nomenclatura é descritiva e consistente
- [ ] Sem code smells de alta severidade
- [ ] Formatação consistente aplicada
- [ ] Documentação atualizada se necessário

---

## 🛠️ Ferramentas de Qualidade

### 🔍 Análise Estática

- **ESLint**: Análise de código JavaScript/TypeScript
- **Prettier**: Formatação automática
- **TypeScript**: Verificação de tipos

### 📊 Métricas

| Métrica                      | Meta                |
| ---------------------------- | ------------------- |
| **Complexidade Ciclomática** | < 10 por função     |
| **Linhas por Função**        | < 20-30 linhas      |
| **Duplicação de Código**     | < 5% do total       |
| **Cobertura de Testes**      | > 80% (meta futura) |

---

## 📈 Resumo do Backlog

| Sprint       | Stories | Horas | Funcionalidades Principais |
| ------------ | ------- | ----- | -------------------------- |
| **Sprint 1** | 3       | 18h   | Produtos, Carrinho, Peso   |
| **Sprint 2** | 3       | 20h   | Comandas, Customização     |
| **Sprint 3** | 4       | 24h   | Pagamentos, Impressão, QA  |
| **Sprint 4** | 4       | 30h   | Relatórios, Refatoração    |
| **Sprint 5** | 3       | 30h   | Dashboard, SOLID           |

**💡 Total de Story Points Estimados**: **156 horas**

---

**Responsável**: Eugenio Vitor Lopes dos Santos
