# Refatoração: Eliminação de Dados Hardcoded

## 📋 Resumo

Este caso documenta a refatoração do hook `useProducts` para eliminar dados hardcoded e melhorar a separação de responsabilidades.

## 🔍 Code Smell Identificado

### Hardcoded Data (Dados Codificados)

**Problema:** O hook `useProducts` continha 74 produtos definidos estaticamente diretamente no código, resultando em um arquivo de 581 linhas com responsabilidades mistas.

**Sintomas:**

- Arquivo extremamente longo (581 linhas)
- Dados de negócio misturados com lógica de estado
- Dificuldade para manutenção e atualizações
- Impossibilidade de carregamento dinâmico
- Violação do princípio de separação de responsabilidades

## 🚨 Problemas Identificados

### 1. **Arquivo Excessivamente Longo**

```typescript
// ❌ ANTES: 581 linhas com dados hardcoded
export const useProducts = create<ProductStore>()(
  persist((set) => ({
    products: [
      // 74 produtos definidos aqui...
      {
        id: 1,
        name: "Tapioca",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      },
      // ... mais 73 produtos
    ],
    // lógica do hook...
  }))
);
```

### 2. **Responsabilidades Mistas**

- **Gerenciamento de estado** (responsabilidade do hook)
- **Definição de dados** (deveria estar separado)
- **Lógica de negócio** (misturada com dados)

### 3. **Baixa Manutenibilidade**

- Adicionar/remover produtos requer edição do hook
- Dados não podem ser carregados dinamicamente
- Dificulta testes unitários
- Viola o princípio DRY (Don't Repeat Yourself)

## ✅ Solução Aplicada

### Princípios Utilizados

1. **Separation of Concerns (SoC)**
   - Dados separados da lógica de estado
   - Cada arquivo tem uma responsabilidade específica

2. **Single Responsibility Principle (SRP)**
   - Hook focado apenas no gerenciamento de estado
   - Arquivo de dados focado apenas nos produtos

3. **Don't Repeat Yourself (DRY)**
   - Dados centralizados em um local
   - Funções utilitárias para operações comuns

### Estrutura Refatorada

```
after/
├── products-data.ts          # Dados dos produtos + utilitários
└── use-products-refactored.ts # Hook limpo e focado
```

## 📊 Comparação Before/After

### ANTES (use-products-hardcoded.ts)

```typescript
// ❌ 581 linhas com dados hardcoded
export const useProducts = create<ProductStore>()(
  persist(
    (set) => ({
      products: [
        // 74 produtos definidos aqui...
      ],
      setProducts: (products) => set({ products }),
      addProduct: (product) => /* ... */,
      updateProduct: (product) => /* ... */,
      removeProduct: (id) => /* ... */,
    })
  )
);
```

### DEPOIS (use-products-refactored.ts + products-data.ts)

**products-data.ts:**

```typescript
// ✅ Dados separados com funções utilitárias
export const INITIAL_PRODUCTS: Product[] = [
  // 74 produtos organizados...
];

export const getProductsByCategory = (category: string): Product[] => {
  return INITIAL_PRODUCTS.filter((product) => product.category === category);
};

export const getCategories = (): string[] => {
  return Array.from(
    new Set(INITIAL_PRODUCTS.map((product) => product.category))
  );
};

export const searchProducts = (query: string): Product[] => {
  // lógica de busca...
};
```

**use-products-refactored.ts:**

```typescript
// ✅ Hook limpo e focado (~40 linhas)
import { INITIAL_PRODUCTS } from "./products-data";

export const useProducts = create<ProductStore>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      setProducts: (products) => set({ products }),
      addProduct: (product) => /* ... */,
      updateProduct: (product) => /* ... */,
      removeProduct: (id) => /* ... */,
      loadProducts: (products) => set({ products }), // ✅ Nova funcionalidade
      resetToInitialProducts: () => set({ products: INITIAL_PRODUCTS }), // ✅ Nova funcionalidade
    })
  )
);
```

## 🎯 Benefícios da Refatoração

### 1. **Melhoria na Manutenibilidade**

- ✅ Redução de 581 para ~40 linhas no hook
- ✅ Dados centralizados e organizados
- ✅ Fácil adição/remoção de produtos

### 2. **Melhor Separação de Responsabilidades**

- ✅ Hook focado apenas no estado
- ✅ Dados separados da lógica
- ✅ Funções utilitárias organizadas

### 3. **Flexibilidade Aumentada**

- ✅ Possibilidade de carregamento dinâmico
- ✅ Funções utilitárias para operações comuns
- ✅ Facilita integração futura com APIs

### 4. **Testabilidade Melhorada**

- ✅ Dados podem ser mockados facilmente
- ✅ Hook pode ser testado independentemente
- ✅ Funções utilitárias testáveis isoladamente

## 📈 Métricas de Qualidade

| Métrica                  | Antes              | Depois     | Melhoria |
| ------------------------ | ------------------ | ---------- | -------- |
| Linhas de código (hook)  | 581                | ~40        | -93%     |
| Responsabilidades        | 2 (estado + dados) | 1 (estado) | -50%     |
| Complexidade ciclomática | Alta               | Baixa      | ⬇️       |
| Manutenibilidade         | Baixa              | Alta       | ⬆️       |
| Testabilidade            | Baixa              | Alta       | ⬆️       |

## 🔄 Padrões de Refatoração Aplicados

1. **Extract Data Object**
   - Extrair dados para arquivo separado
   - Criar constantes exportáveis

2. **Extract Utility Functions**
   - Criar funções para operações comuns
   - Melhorar reusabilidade

3. **Simplify Interface**
   - Reduzir complexidade do hook
   - Focar na responsabilidade principal

## 🎓 Lições Aprendidas

### ✅ Quando Separar Dados

- **Dados estáticos grandes** (>50 itens)
- **Dados que mudam frequentemente**
- **Dados que podem vir de APIs**
- **Quando o arquivo fica muito longo**

### ✅ Benefícios da Separação

- **Manutenibilidade:** Mudanças isoladas
- **Testabilidade:** Testes independentes
- **Reutilização:** Dados acessíveis em outros locais
- **Performance:** Possibilidade de lazy loading

### ⚠️ Cuidados

- **Não separar dados muito pequenos** (<10 itens)
- **Manter coesão** entre dados relacionados
- **Documentar dependências** entre arquivos

## 🔗 Arquivos Relacionados

- `before/use-products-hardcoded.ts` - Versão original com dados hardcoded
- `after/products-data.ts` - Dados separados com utilitários
- `after/use-products-refactored.ts` - Hook refatorado e limpo
