import type { BaseHookOptions, PersistenceOptions } from "@/types/hooks";
import type { Product, SaleItem } from "@/types/product";

/**
 * Tipos de erro que podem ocorrer no carrinho
 */
export enum CartErrorType {
  /** Erro de validação de item */
  VALIDATION_ERROR = "VALIDATION_ERROR",
  /** Limite de itens excedido */
  MAX_ITEMS_EXCEEDED = "MAX_ITEMS_EXCEEDED",
  /** Produto inválido */
  INVALID_PRODUCT = "INVALID_PRODUCT",
  /** Peso obrigatório não fornecido */
  WEIGHT_REQUIRED = "WEIGHT_REQUIRED",
  /** Quantidade inválida */
  INVALID_QUANTITY = "INVALID_QUANTITY",
  /** Erro de persistência */
  STORAGE_ERROR = "STORAGE_ERROR",
  /** Valor mínimo não atingido */
  MINIMUM_VALUE_NOT_MET = "MINIMUM_VALUE_NOT_MET",
  /** Valor máximo excedido */
  MAXIMUM_VALUE_EXCEEDED = "MAXIMUM_VALUE_EXCEEDED",
  /** Item não encontrado */
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
  /** Operação não permitida */
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
}

/**
 * Interface para erros detalhados do carrinho
 */
export interface CartError {
  /** Tipo do erro */
  type: CartErrorType;
  /** Mensagem de erro legível */
  message: string;
  /** Código de erro único */
  code: string;
  /** Dados adicionais sobre o erro */
  details?: {
    /** Índice do item relacionado ao erro */
    itemIndex?: number;
    /** ID do produto relacionado ao erro */
    productId?: number;
    /** Valor atual que causou o erro */
    currentValue?: unknown;
    /** Valor esperado */
    expectedValue?: unknown;
    /** Sugestão de correção */
    suggestion?: string;
  };
  /** Timestamp do erro */
  timestamp: Date;
}

/**
 * Resultado de operações que podem falhar
 */
export interface CartOperationResult<T = void> {
  /** Se a operação foi bem-sucedida */
  success: boolean;
  /** Dados retornados em caso de sucesso */
  data?: T;
  /** Erro detalhado em caso de falha */
  error?: CartError;
  /** Mensagem de sucesso */
  message?: string;
}

/**
 * Interface para validação de itens do carrinho
 */
export interface CartItemValidation {
  /** Se o item é válido */
  isValid: boolean;
  /** Lista de erros de validação */
  errors: CartError[];
  /** Avisos não críticos */
  warnings: string[];
}

/**
 * Estatísticas do carrinho
 */
export interface CartStatistics {
  /** Número total de itens únicos */
  uniqueItems: number;
  /** Quantidade total de produtos */
  totalQuantity: number;
  /** Valor total sem impostos */
  subtotal: number;
  /** Valor total de impostos */
  totalTax: number;
  /** Valor total com impostos */
  total: number;
  /** Valor médio por item */
  averageItemValue: number;
  /** Item mais caro */
  mostExpensiveItem?: SaleItem;
  /** Item mais barato */
  cheapestItem?: SaleItem;
  /** Categorias representadas */
  categories: string[];
  /** Peso total (para produtos vendidos por peso) */
  totalWeight?: number;
}

/**
 * Opções para adicionar um item ao carrinho
 *
 * @interface AddItemOptions
 */
export interface AddItemOptions {
  /** Quantidade do produto (obrigatório para produtos por unidade) */
  quantity?: number;
  /** Peso em gramas (obrigatório para produtos vendidos por peso) */
  weight?: number;
  /** Lista de produtos adicionais/complementos */
  addons?: Product[];
  /** Opções selecionadas para produtos customizáveis */
  selectedOptions?: SaleItem["selectedOptions"];
  /** Observações especiais para o item */
  notes?: string;
  /** Desconto aplicado ao item (0-1 para percentual, >1 para valor fixo) */
  discount?: number;
}

/**
 * Opções de configuração para o hook useCart
 *
 * @interface UseCartOptions
 * @extends BaseHookOptions
 * @extends PersistenceOptions
 */
export interface UseCartOptions extends BaseHookOptions, PersistenceOptions {
  /** Número máximo de itens permitidos no carrinho (padrão: 50) */
  maxItems?: number;
  /** Se deve persistir dados no sessionStorage (padrão: true) */
  persistToSession?: boolean;
  /** Se deve validar itens ao adicionar/atualizar (padrão: true) */
  validateItems?: boolean;
  /** Callback chamado quando ocorre um erro */
  onError?: (error: CartError) => void;
  /** Callback chamado quando um item é adicionado com sucesso */
  onItemAdded?: (item: SaleItem) => void;
  /** Callback chamado quando um item é removido */
  onItemRemoved?: (item: SaleItem, index: number) => void;
  /** Callback chamado quando o carrinho é limpo */
  onCartCleared?: (previousItems: SaleItem[]) => void;
  /** Se deve calcular automaticamente impostos (padrão: false) */
  autoCalculateTax?: boolean;
  /** Taxa de imposto padrão (0-1 para percentual) */
  defaultTaxRate?: number;
  /** Valor mínimo para o carrinho */
  minimumValue?: number;
  /** Valor máximo para o carrinho */
  maximumValue?: number;
}

/**
 * Configurações de validação para itens do carrinho
 */
export interface CartValidationConfig {
  /** Se deve validar peso obrigatório para produtos por peso */
  requireWeightForWeightProducts?: boolean;
  /** Se deve validar quantidade mínima */
  requireMinimumQuantity?: boolean;
  /** Quantidade mínima permitida */
  minimumQuantity?: number;
  /** Peso mínimo permitido (em gramas) */
  minimumWeight?: number;
  /** Peso máximo permitido (em gramas) */
  maximumWeight?: number;
  /** Se deve validar produtos duplicados */
  preventDuplicateProducts?: boolean;
  /** Validadores customizados */
  customValidators?: Array<(item: SaleItem) => CartError | null>;
}

/**
 * Opções para operações em lote
 */
export interface BatchOperationOptions {
  /** Se deve parar na primeira falha */
  stopOnFirstError?: boolean;
  /** Se deve validar antes de executar */
  validateBeforeExecute?: boolean;
  /** Callback de progresso */
  onProgress?: (completed: number, total: number) => void;
  /** Se deve executar em transação (tudo ou nada) */
  atomic?: boolean;
}

/**
 * Filtros para busca de itens
 */
export interface CartItemFilter {
  /** Filtrar por categoria */
  category?: string;
  /** Filtrar por tipo de produto */
  productType?: Product["type"];
  /** Filtrar por faixa de preço */
  priceRange?: {
    min?: number;
    max?: number;
  };
  /** Filtrar por peso (para produtos por peso) */
  weightRange?: {
    min?: number;
    max?: number;
  };
  /** Filtrar por quantidade */
  quantityRange?: {
    min?: number;
    max?: number;
  };
  /** Filtro customizado */
  customFilter?: (item: SaleItem) => boolean;
}

/**
 * Opções de ordenação para itens
 */
export interface CartSortOptions {
  /** Campo para ordenação */
  field: "name" | "price" | "category" | "quantity" | "weight" | "total";
  /** Direção da ordenação */
  direction: "asc" | "desc";
}

/**
 * Interface de retorno do hook useCart com operações completas de carrinho
 *
 * @interface UseCartReturn
 */
export interface UseCartReturn {
  // Estado do carrinho
  /** Lista de itens no carrinho */
  items: SaleItem[];
  /** Número total de itens (considerando quantidades) */
  totalItems: number;
  /** Valor total do carrinho */
  totalValue: number;
  /** Se o carrinho está vazio */
  isEmpty: boolean;
  /** Estatísticas detalhadas do carrinho */
  statistics: CartStatistics;

  // Ações principais com retorno detalhado
  /**
   * Adiciona um item ao carrinho
   * @param product - Produto a ser adicionado
   * @param options - Opções do item (quantidade, peso, etc.)
   * @returns Resultado da operação com detalhes de sucesso/erro
   */
  addItem: (
    product: Product,
    options?: AddItemOptions
  ) => CartOperationResult<SaleItem>;

  /**
   * Remove um item do carrinho pelo índice
   * @param index - Índice do item a ser removido
   * @returns Resultado da operação
   */
  removeItem: (index: number) => CartOperationResult<SaleItem>;

  /**
   * Atualiza um item do carrinho
   * @param index - Índice do item a ser atualizado
   * @param updates - Atualizações a serem aplicadas
   * @returns Resultado da operação
   */
  updateItem: (
    index: number,
    updates: Partial<SaleItem>
  ) => CartOperationResult<SaleItem>;

  /**
   * Limpa todo o carrinho
   * @returns Resultado da operação
   */
  clearCart: () => CartOperationResult<SaleItem[]>;

  // Utilitários de validação e consulta
  /**
   * Verifica se um produto pode ser adicionado ao carrinho
   * @param product - Produto a ser verificado
   * @returns Resultado da validação com detalhes
   */
  canAddItem: (product: Product) => CartItemValidation;

  /**
   * Calcula o total de um item específico
   * @param item - Item para calcular o total
   * @returns Valor total do item
   */
  getItemTotal: (item: SaleItem) => number;

  /**
   * Encontra o índice de um item pelo ID do produto
   * @param productId - ID do produto
   * @returns Índice do item ou -1 se não encontrado
   */
  findItemIndex: (productId: number) => number;

  /**
   * Verifica se um produto específico está no carrinho
   * @param productId - ID do produto
   * @returns Se o produto está no carrinho
   */
  hasItem: (productId: number) => boolean;

  /**
   * Valida um item específico do carrinho
   * @param index - Índice do item a ser validado
   * @returns Resultado da validação
   */
  validateItem: (index: number) => CartItemValidation;

  /**
   * Valida todo o carrinho
   * @returns Resultado da validação geral
   */
  validateCart: () => CartItemValidation;

  // Operações em lote
  /**
   * Adiciona múltiplos itens ao carrinho
   * @param items - Lista de itens a serem adicionados
   * @returns Lista de resultados para cada item
   */
  addMultipleItems: (
    items: Array<{ product: Product; options?: AddItemOptions }>
  ) => CartOperationResult<SaleItem>[];

  /**
   * Remove múltiplos itens do carrinho
   * @param indices - Índices dos itens a serem removidos
   * @returns Resultado da operação
   */
  removeMultipleItems: (indices: number[]) => CartOperationResult<SaleItem[]>;

  /**
   * Atualiza múltiplos itens do carrinho
   * @param updates - Lista de atualizações a serem aplicadas
   * @returns Lista de resultados para cada atualização
   */
  updateMultipleItems: (
    updates: Array<{ index: number; updates: Partial<SaleItem> }>
  ) => CartOperationResult<SaleItem>[];

  // Cálculos avançados
  /**
   * Obtém o subtotal do carrinho (sem impostos)
   * @returns Valor do subtotal
   */
  getSubtotal: () => number;

  /**
   * Calcula o total com impostos
   * @param taxRate - Taxa de imposto (opcional, usa a padrão se não fornecida)
   * @returns Valor total com impostos
   */
  getTotalWithTax: (taxRate?: number) => number;

  /**
   * Obtém itens de uma categoria específica
   * @param category - Nome da categoria
   * @returns Lista de itens da categoria
   */
  getItemsByCategory: (category: string) => SaleItem[];

  /**
   * Calcula desconto total aplicado
   * @returns Valor total de desconto
   */
  getTotalDiscount: () => number;

  /**
   * Obtém resumo de impostos
   * @param taxRate - Taxa de imposto
   * @returns Detalhes dos impostos
   */
  getTaxSummary: (taxRate?: number) => {
    subtotal: number;
    taxAmount: number;
    total: number;
    taxRate: number;
  };

  // Estado de validação aprimorado
  /** Se o carrinho está válido */
  isValid: boolean;
  /** Lista de erros de validação detalhados */
  validationErrors: CartError[];
  /** Lista de avisos não críticos */
  validationWarnings: string[];

  // Estado de erro aprimorado
  /** Último erro ocorrido */
  error: CartError | null;
  /** Histórico de erros */
  errorHistory: CartError[];
  /** Limpa o erro atual */
  clearError: () => void;
  /** Limpa todo o histórico de erros */
  clearErrorHistory: () => void;

  // Utilitários de estado
  /** Se alguma operação está em andamento */
  isLoading: boolean;
  /** Se o carrinho foi modificado desde a última persistência */
  isDirty: boolean;
  /** Força a persistência dos dados */
  forcePersist: () => Promise<void>;
  /** Recarrega dados da persistência */
  reload: () => Promise<void>;
}

/**
 * Utilitários para manipulação de carrinho
 */
export interface CartUtils {
  /**
   * Filtra itens do carrinho
   * @param items - Itens a serem filtrados
   * @param filter - Critérios de filtro
   * @returns Itens filtrados
   */
  filterItems: (items: SaleItem[], filter: CartItemFilter) => SaleItem[];

  /**
   * Ordena itens do carrinho
   * @param items - Itens a serem ordenados
   * @param options - Opções de ordenação
   * @returns Itens ordenados
   */
  sortItems: (items: SaleItem[], options: CartSortOptions) => SaleItem[];

  /**
   * Agrupa itens por categoria
   * @param items - Itens a serem agrupados
   * @returns Itens agrupados por categoria
   */
  groupByCategory: (items: SaleItem[]) => Record<string, SaleItem[]>;

  /**
   * Calcula estatísticas dos itens
   * @param items - Itens para calcular estatísticas
   * @param taxRate - Taxa de imposto opcional
   * @returns Estatísticas calculadas
   */
  calculateStatistics: (items: SaleItem[], taxRate?: number) => CartStatistics;

  /**
   * Valida um item individual
   * @param item - Item a ser validado
   * @param config - Configuração de validação
   * @returns Resultado da validação
   */
  validateSingleItem: (
    item: SaleItem,
    config?: CartValidationConfig
  ) => CartItemValidation;

  /**
   * Cria um erro de carrinho padronizado
   * @param type - Tipo do erro
   * @param message - Mensagem do erro
   * @param details - Detalhes adicionais
   * @returns Erro formatado
   */
  createError: (
    type: CartErrorType,
    message: string,
    details?: CartError["details"]
  ) => CartError;
}

/**
 * Constantes para validação de carrinho
 */
export const CART_VALIDATION_CONSTANTS = {
  /** Peso mínimo em gramas */
  MIN_WEIGHT: 1,
  /** Peso máximo em gramas */
  MAX_WEIGHT: 10000,
  /** Quantidade mínima */
  MIN_QUANTITY: 1,
  /** Quantidade máxima */
  MAX_QUANTITY: 999,
  /** Valor mínimo do carrinho */
  MIN_CART_VALUE: 0.01,
  /** Número máximo de itens por padrão */
  DEFAULT_MAX_ITEMS: 50,
  /** Taxa de imposto padrão */
  DEFAULT_TAX_RATE: 0.0,
  /** Chave de armazenamento padrão */
  DEFAULT_STORAGE_KEY: "cart-items",
} as const;

/**
 * Mensagens de erro padronizadas
 */
export const CART_ERROR_MESSAGES = {
  [CartErrorType.VALIDATION_ERROR]: "Erro de validação do item",
  [CartErrorType.MAX_ITEMS_EXCEEDED]: "Número máximo de itens excedido",
  [CartErrorType.INVALID_PRODUCT]: "Produto inválido",
  [CartErrorType.WEIGHT_REQUIRED]: "Peso é obrigatório para este produto",
  [CartErrorType.INVALID_QUANTITY]: "Quantidade inválida",
  [CartErrorType.STORAGE_ERROR]: "Erro ao salvar dados",
  [CartErrorType.MINIMUM_VALUE_NOT_MET]:
    "Valor mínimo do carrinho não atingido",
  [CartErrorType.MAXIMUM_VALUE_EXCEEDED]: "Valor máximo do carrinho excedido",
  [CartErrorType.ITEM_NOT_FOUND]: "Item não encontrado",
  [CartErrorType.OPERATION_NOT_ALLOWED]: "Operação não permitida",
} as const;
