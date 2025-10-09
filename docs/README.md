# Documentação do Projeto - Sistema PDV Mundo Gelado

**Disciplina**: Boas Práticas de Programação  
**Projeto**: Sistema PDV para Sorveteria  
**Desenvolvedor**: Eugenio Vitor Lopes dos Santos

---

## Visão Geral

Este projeto implementa um Sistema de Ponto de Venda (PDV) especializado para sorveterias, desenvolvido como trabalho da disciplina de Boas Práticas de Programação. O sistema demonstra a aplicação prática de princípios de código limpo, identificação de code smells e técnicas de refatoração.

## Objetivos do Projeto

1. **Desenvolver um MVP funcional** de sistema PDV para sorveterias
2. **Aplicar princípios de código limpo** (nomenclatura, estrutura, formatação)
3. **Identificar e catalogar code smells** no código desenvolvido
4. **Implementar refatorações** usando técnicas de Martin Fowler
5. **Documentar o processo** de melhoria da qualidade do código

## 📁 Estrutura da Documentação

### Documentos Principais

| Documento                                              | Descrição                                 | Status   |
| ------------------------------------------------------ | ----------------------------------------- | -------- |
| [**Visão do Produto**](./visao-do-produto.md)          | Declaração estratégica e definição do MVP | Completo |
| [**Product Backlog**](./product-backlog.md)            | User stories com critérios de qualidade   | Completo |
| [**Relatório de Qualidade**](./relatorio-qualidade.md) | Análise completa da qualidade do código   | Completo |

### Documentação de Refatoração

| Documento                                                                                | Descrição                         | Status   |
| ---------------------------------------------------------------------------------------- | --------------------------------- | -------- |
| [**Code Smells Identificados**](../refactoring/code-smells-identified.md)                | Catálogo de problemas encontrados | Completo |
| [**Métricas de Qualidade**](../refactoring/quality-metrics.md)                           | Análise quantitativa do código    | Completo |
| [**Exemplo de Refatoração**](../refactoring/before-after-examples/long-method-refactor/) | Caso prático detalhado            | Completo |

## Funcionalidades do Sistema

### MVP Implementado

**Gestão de Produtos**

- Seleção por categorias (Sorvetes, Milkshakes, Açaí, etc.)
- Produtos por peso e por unidade
- Customização "Monte do Seu Jeito"

**Sistema de Comandas**

- Criação e gestão de comandas por cliente
- Adição de múltiplos itens
- Controle de comandas abertas

**Processamento de Vendas**

- Carrinho de compras temporário
- Cálculo automático de totais
- Múltiplos métodos de pagamento

**Relatórios e Dashboard**

- Vendas por período
- Produtos mais vendidos
- Análise por método de pagamento

## Tecnologias Utilizadas

### Stack Principal

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Estado**: Zustand (gerenciamento de estado)
- **Validação**: Zod (validação de schemas)

### Ferramentas de Qualidade

- **ESLint**: Análise estática de código
- **Prettier**: Formatação automática
- **TypeScript**: Verificação de tipos
- **Análise Manual**: Revisão sistemática

### Convenções de Código

- **Nomenclatura**: camelCase para variáveis e funções; PascalCase para componentes e tipos
- **Formatação**: Prettier com 2 espaços de indentação
- **Linhas**: Máximo 120 caracteres
- **Funções**: Máximo 20 linhas (idealmente)
- **Parâmetros**: Máximo 4 por função

---

## Licença

Este projeto foi desenvolvido para fins educacionais como parte da disciplina de Boas Práticas de Programação.
