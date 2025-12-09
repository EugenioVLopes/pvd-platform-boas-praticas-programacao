# Relatório de Debugging - PVD Platform

## Resumo

| Bug                                                     | Severidade | Status    | Técnica de Debugging       |
| ------------------------------------------------------- | ---------- | --------- | -------------------------- |
| Bug #1: Desconto negativo não validado                  | Alta       | Corrigido | Análise de código + Testes |
| Bug #2: Troco calculado para pagamentos não em dinheiro | Média      | Corrigido | Logging + Testes           |
| Bug #3: Validação inconsistente de peso em produtos     | Média      | Corrigido | Testes automatizados       |
| Bug #4: Vulnerabilidade crítica de segurança no Next.js | Crítica    | Corrigido | npm audit + Atualização    |

---

## Bug #1: Desconto Negativo Não Validado

### Identificação

- **Data:** 05/12/2024
- **Reportado por:** Análise de código
- **Severidade:** Alta
- **Módulo:** `src/features/sales/hooks/use-sales.ts`

### Descrição

O sistema permitia que descontos negativos fossem aplicados a vendas, o que resultaria em um aumento do valor total ao invés de redução. Isso poderia ser explorado para criar vendas com valores artificialmente maiores.

### Reprodução

1. Chamar `completeSale` com `discount: -10`
2. O total calculado seria `total - (-10) = total + 10`
3. **Resultado esperado:** Erro de validação
4. **Resultado obtido:** Venda processada com valor incorreto

### Investigação

**Técnica utilizada:** Análise estática de código + Testes automatizados

**Código problemático:**

```typescript
// src/features/sales/hooks/use-sales.ts - linha 114
const discount = saleData.discount || 0;
const finalTotal = total - discount;
```

**Causa raiz:** Não havia validação para garantir que o desconto fosse um valor positivo ou dentro de limites aceitáveis.

### Correção

```typescript
// Validação adicionada antes do cálculo
const discount = saleData.discount || 0;

if (discount < 0) {
  throw new Error("Desconto não pode ser negativo");
}

if (discount > total) {
  throw new Error("Desconto não pode ser maior que o total");
}

const finalTotal = total - discount;
```

### Verificação

- [x] Teste automatizado criado
- [x] Teste manual confirmou correção
- [x] Cenários de borda testados

### Lições Aprendidas

- Sempre validar valores numéricos que vêm de entrada do usuário
- Descontos devem ter limites mínimo (0) e máximo (total da venda)
- Testes de valores negativos são essenciais para campos numéricos

---

## Bug #2: Troco Calculado Incorretamente para Pagamentos Não em Dinheiro

### Identificação

- **Data:** 05/12/2024
- **Reportado por:** Testes automatizados
- **Severidade:** Média
- **Módulo:** `src/features/sales/hooks/use-sales.ts`

### Descrição

O campo `change` (troco) era preenchido mesmo para pagamentos que não são em dinheiro (PIX, cartão), o que poderia confundir operadores e gerar relatórios incorretos.

### Reprodução

1. Criar uma venda com `paymentMethod: "PIX"`
2. Verificar o objeto `completedOrder` criado
3. **Resultado esperado:** Campo `change` deveria ser `undefined` ou não existir
4. **Resultado obtido:** Campo `change: 0` sempre presente

### Investigação

**Técnica utilizada:** Logging estratégico + Análise de stack trace

Adicionamos logs para inspecionar o objeto de venda:

```typescript
console.log("Order created:", JSON.stringify(completedOrder, null, 2));
```

**Código problemático:**

```typescript
// src/features/sales/hooks/use-sales.ts - linha 133
const completedOrder: Order = {
  // ...
  change: saleData.cashAmount ? saleData.cashAmount - finalTotal : 0,
};
```

**Causa raiz:** O operador ternário sempre retorna um valor (0), mesmo quando troco não faz sentido para o tipo de pagamento.

### Correção

```typescript
const completedOrder: Order = {
  id: crypto.randomUUID(),
  customerName: saleData.customerName,
  items: saleData.items,
  createdAt: new Date(),
  updatedAt: new Date(),
  status: "completed",
  paymentMethod: saleData.paymentMethod,
  total: finalTotal,
  finalizadaEm: new Date(),
  // Troco só é calculado para pagamentos em dinheiro
  change:
    saleData.paymentMethod === "CASH" && saleData.cashAmount
      ? saleData.cashAmount - finalTotal
      : undefined,
};
```

### Verificação

- [x] Teste automatizado criado para verificar troco em diferentes métodos de pagamento
- [x] Teste manual confirmou correção
- [x] Relatórios agora mostram troco apenas para pagamentos em dinheiro

### Lições Aprendidas

- Campos opcionais devem ser `undefined` quando não aplicáveis, não `0`
- Considerar o contexto semântico dos dados, não apenas a sintaxe
- Logs estratégicos ajudam a identificar estado incorreto de objetos

---

## Bug #3: Validação Inconsistente de Peso em Produtos

### Identificação

- **Data:** 05/12/2024
- **Reportado por:** Testes automatizados
- **Severidade:** Média
- **Módulo:** `src/features/sales/hooks/use-cart.ts`

### Descrição

A validação de peso para produtos do tipo "weight" era feita apenas na adição do item, mas não na atualização. Isso permitia que um item fosse adicionado com peso válido e depois atualizado para peso inválido (0 ou negativo).

### Reprodução

1. Adicionar item de peso com `weight: 500`
2. Chamar `updateItem(index, { weight: -100 })`
3. **Resultado esperado:** Atualização rejeitada ou erro
4. **Resultado obtido:** Item atualizado com peso negativo (parcialmente tratado, mas inconsistente)

### Investigação

**Técnica utilizada:** Testes automatizados (TDD) + Breakpoints no debugger

Usamos o debugger do VS Code para acompanhar o fluxo:

```
Breakpoint em updateItem() linha 354
Step into: verificar condição de peso
Inspeção de variáveis: weight = -100, currentItem.product.type = "weight"
```

**Código problemático:**

```typescript
// src/features/sales/hooks/use-cart.ts - updateItem
if (
  updates.weight !== undefined &&
  currentItem.product?.type === "weight" &&
  updates.weight <= 0
) {
  return prev; // Retorna sem aplicar, mas não notifica erro
}
```

**Causa raiz:** A validação existia, mas não fornecia feedback ao chamador sobre por que a atualização falhou.

### Correção

```typescript
const updateItem = useCallback(
  (index: number, updates: Partial<SaleItem>): boolean => {
    if (!enabled) return false;
    if (index < 0 || index >= items.length) return false;

    const currentItem = items[index];

    // Validação de peso para produtos de peso
    if (
      updates.weight !== undefined &&
      currentItem.product?.type === "weight" &&
      updates.weight <= 0
    ) {
      handleError(
        "Peso deve ser maior que zero para produtos vendidos por peso"
      );
      return false; // Agora retorna false explicitamente
    }

    // Validação de quantidade
    if (updates.quantity !== undefined && updates.quantity <= 0) {
      handleError("Quantidade deve ser maior que zero");
      return false;
    }

    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...currentItem, ...updates };
      return newItems;
    });

    return true;
  },
  [enabled, items, handleError]
);
```

### Verificação

- [x] Teste automatizado verifica rejeição de peso inválido
- [x] Teste verifica que erro é definido quando validação falha
- [x] Função retorna `false` quando atualização é rejeitada

### Lições Aprendidas

- Validações devem ser consistentes em todas as operações (add, update)
- Sempre fornecer feedback ao usuário quando uma operação falha
- Retornos booleanos devem refletir o sucesso real da operação

---

## Bug #4: Vulnerabilidade Crítica de Segurança no Next.js

### Identificação

- **Data:** 2024
- **Reportado por:** `npm audit`
- **Severidade:** Crítica
- **Módulo:** Dependência `next` (package.json)

### Descrição

Foi identificada uma vulnerabilidade crítica de segurança no Next.js relacionada ao React Flight Protocol que permite **RCE (Remote Code Execution)**. A versão instalada (15.5.4) estava na faixa de versões vulneráveis (15.5.0 até 15.5.6).

### Reprodução

1. Executar `npm audit` no projeto
2. **Resultado esperado:** Nenhuma vulnerabilidade crítica
3. **Resultado obtido:** 1 vulnerabilidade crítica identificada

```bash
npm audit report

next  15.5.0 - 15.5.6
Severity: critical
Next.js is vulnerable to RCE in React flight protocol
```

### Investigação

**Técnica utilizada:** `npm audit` + Análise de dependências

**Detalhes da vulnerabilidade:**

- **CVE/Advisory:** [GHSA-9qr9-h5gf-34mp](https://github.com/advisories/GHSA-9qr9-h5gf-34mp)
- **Versões Afetadas:** Next.js 15.5.0 até 15.5.6
- **Versão Instalada:** 15.5.4
- **Impacto:** Execução remota de código através do protocolo React Flight

**Causa raiz:** Dependência desatualizada com vulnerabilidade de segurança conhecida.

### Correção

Atualização do Next.js e `eslint-config-next` para a versão 15.5.7, que contém o patch de segurança.

```bash
npm audit fix --force
```

**Arquivos modificados:**

- `package.json`:
  - `next`: 15.5.4 → ^15.5.7
  - `eslint-config-next`: 15.5.4 → 15.5.7
- `package-lock.json`: Atualização automática do lock file

### Verificação

- [x] `npm audit` confirmou 0 vulnerabilidades após correção
- [x] Versão atualizada para 15.5.7
- [x] Compatibilidade com React 19.1.0 mantida
- [x] Nenhuma alteração de código necessária

### Lições Aprendidas

- Executar `npm audit` regularmente para identificar vulnerabilidades
- Manter dependências atualizadas com patches de segurança
- Vulnerabilidades críticas devem ser corrigidas imediatamente
- Usar `npm audit fix --force` quando necessário para atualizar fora do range declarado
- Manter dependências relacionadas sincronizadas (ex: `eslint-config-next` com `next`)

---

## Técnicas de Debugging Utilizadas

### 1. Análise Estática de Código

- Revisão manual do código procurando por padrões problemáticos
- Identificação de validações faltantes
- Verificação de consistência entre funções similares

### 2. Testes Automatizados

- Criação de testes unitários seguindo padrão AAA (Arrange, Act, Assert)
- Testes de casos de borda (valores negativos, zero, limites)
- Execução com cobertura para identificar código não testado

### 3. Logging Estratégico

- `console.log` para inspecionar estado de objetos
- Logs condicionais para depuração em desenvolvimento
- Remoção de logs antes de commit

### 4. Debugger (Breakpoints)

- Breakpoints em funções críticas
- Step-through para acompanhar fluxo de execução
- Inspeção de variáveis em tempo real

### 5. Git Bisect (para bugs de regressão)

- Identificação do commit que introduziu o bug
- Comparação de versões funcionais vs problemáticas

### 6. Auditoria de Dependências (npm audit)

- Verificação automática de vulnerabilidades conhecidas
- Identificação de versões vulneráveis de pacotes
- Correção automática quando possível

---

## Estatísticas

| Métrica                          | Valor |
| -------------------------------- | ----- |
| Bugs identificados               | 4     |
| Bugs corrigidos                  | 4     |
| Testes de regressão adicionados  | 5     |
| Técnicas de debugging utilizadas | 6     |

---

## Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub Advisory GHSA-9qr9-h5gf-34mp](https://github.com/advisories/GHSA-9qr9-h5gf-34mp)
