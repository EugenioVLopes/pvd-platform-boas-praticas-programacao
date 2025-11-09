# Sistema PDV Mundo Gelado

Sistema de Ponto de Venda (PDV) especializado para sorveterias e açaiterias, desenvolvido como projeto da disciplina **Boas Práticas de Programação**. O sistema demonstra a aplicação prática de princípios de código limpo, identificação de code smells e técnicas de refatoração.

## 🎯 Sobre o Projeto

O Sistema PDV Mundo Gelado é uma solução completa para pequenos empreendedores do setor de sorveterias, oferecendo:

- **Interface intuitiva** para registro rápido de vendas
- **Sistema de comandas** para controle de múltiplos pedidos simultâneos
- **Customização de produtos** (Monte do Seu Jeito)
- **Relatórios em tempo real** para tomada de decisões
- **Processamento de pagamentos** (dinheiro, cartão, PIX)

### Objetivos do Projeto

1. Desenvolver um MVP funcional de sistema PDV para sorveterias
2. Aplicar princípios de código limpo (nomenclatura, estrutura, formatação)
3. Identificar e catalogar code smells no código desenvolvido
4. Implementar refatorações usando técnicas de Martin Fowler
5. Documentar o processo de melhoria da qualidade do código

## 🚀 Tecnologias Utilizadas

### Stack Principal

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Linguagem de programação tipada
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e sem estilo
- **Zustand** - Gerenciamento de estado leve
- **Zod** - Validação de schemas
- **React Hook Form** - Gerenciamento de formulários
- **Recharts** - Biblioteca de gráficos
- **Turbopack** - Bundler de alta performance

### Ferramentas de Qualidade

- **ESLint** - Análise estática de código
- **Prettier** - Formatação automática
- **TypeScript** - Verificação de tipos
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **npm**, **yarn**, **pnpm** ou **bun**
- **Docker** e **Docker Compose** (opcional, para execução em container)

## 🔧 Instalação e Execução

### Instalação Local

1. Clone o repositório:

```bash
git clone https://github.com/EugenioVLopes/pvd-platform-boas-praticas-programacao.git
cd pvd-platform-boas-praticas-programacao
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Execução com Docker

1. Construa e inicie os containers:

```bash
docker-compose up --build
```

2. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

Para parar os containers:

```bash
docker-compose down
```

## 📁 Estrutura do Projeto

```
pvd-platform-boas-praticas-programacao/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── (routes)/           # Rotas agrupadas
│   │   │   ├── (dashboard)/    # Dashboard e relatórios
│   │   │   └── (vendas)/       # Sistema de vendas
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página inicial
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes de UI (shadcn/ui)
│   │   ├── layout/             # Componentes de layout
│   │   └── providers/          # Providers React
│   ├── features/               # Features organizadas por domínio
│   │   ├── auth/               # Autenticação
│   │   ├── products/           # Gestão de produtos
│   │   ├── sales/              # Sistema de vendas
│   │   └── reports/            # Relatórios
│   ├── hooks/                  # Custom hooks compartilhados
│   ├── lib/                    # Utilitários e configurações
│   │   ├── constants/          # Constantes do sistema
│   │   └── utils/              # Funções utilitárias
│   └── types/                  # Definições de tipos TypeScript
├── docs/                       # Documentação do projeto
│   ├── visao-do-produto.md     # Visão estratégica do produto
│   ├── product-backlog.md      # Backlog de funcionalidades
│   └── relatorio-qualidade.md  # Relatório de qualidade de código
├── refactoring/                # Documentação de refatorações
│   ├── code-smells-identified.md
│   └── before-after-examples/  # Exemplos de refatoração
├── public/                     # Arquivos estáticos
├── Dockerfile                  # Configuração Docker
├── docker-compose.yml         # Docker Compose
└── package.json               # Dependências e scripts
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento com Turbopack
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa análise de código com ESLint
- `npm run lint:fix` - Corrige automaticamente problemas do ESLint
- `npm run test` - Executa testes com Jest
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura de testes
- `npm run format` - Formata código com Prettier
- `npm run type-check` - Verifica tipos TypeScript sem gerar arquivos

## 📚 Funcionalidades

### 🏪 Gestão de Produtos

- Seleção de produtos por categoria (Sorvetes, Milkshakes, Açaí, etc.)
- Produtos vendidos por peso e por unidade
- Customização "Monte do Seu Jeito" com frutas, cremes e acompanhamentos
- Gestão de produtos e categorias

### 📝 Sistema de Comandas

- Criação e gestão de comandas por cliente
- Adição de múltiplos itens a comandas
- Controle visual de comandas abertas
- Finalização e impressão de comandas

### 💳 Processamento de Vendas

- Carrinho de compras interativo
- Cálculo automático de totais e subtotais
- Múltiplos métodos de pagamento (dinheiro, cartão, PIX)
- Cálculo automático de troco
- Impressão de comprovantes

### 📊 Relatórios e Dashboard

- Relatório de vendas diárias
- Análise de vendas por período
- Produtos mais vendidos
- Breakdown por método de pagamento
- Gráficos e visualizações interativas

### Princípios Aplicados

- **Nomenclatura descritiva** - Nomes intencionais e pronunciáveis
- **Funções pequenas** - Máximo de 20-30 linhas por função
- **Responsabilidade única** - Cada função/componente com uma única responsabilidade
- **Separação de concerns** - Lógica de negócio separada da apresentação
- **DRY (Don't Repeat Yourself)** - Eliminação de duplicação de código

A documentação completa do projeto está disponível na pasta [`docs/`](./docs/):

- **[Visão do Produto](./docs/visao-do-produto.md)** - Declaração estratégica e definição do MVP
- **[Product Backlog](./docs/product-backlog.md)** - User stories com critérios de qualidade
- **[Relatório de Qualidade](./docs/relatorio-qualidade.md)** - Análise completa da qualidade do código
- **[Code Smells Identificados](./refactoring/code-smells-identified.md)** - Catálogo de problemas encontrados

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos como parte da disciplina de Boas Práticas de Programação.

---

**Responsável**: Eugenio Vitor Lopes dos Santos
