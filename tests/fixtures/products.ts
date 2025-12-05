import type { Product, SaleItem } from "@/features/products";

/**
 * Fixtures de produtos para testes
 */
export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Sorvete de Chocolate",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 2,
    name: "Sorvete de Morango",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 3,
    name: "Açaí no Peso",
    price: 47,
    category: "Açaí",
    type: "weight",
  },
  {
    id: 4,
    name: "Monte do Seu Jeito 200ml",
    price: 12,
    category: "Monte do Seu Jeito",
    type: "unit",
    options: {
      frutas: 1,
      cremes: 2,
      acompanhamentos: 3,
    },
  },
];

export const mockAddons: Product[] = [
  {
    id: 69,
    name: "Creme de Cookies",
    price: 3,
    category: "Adicionais",
    type: "addon",
  },
  {
    id: 70,
    name: "Nutella",
    price: 3,
    category: "Adicionais",
    type: "addon",
  },
  {
    id: 71,
    name: "Morango",
    price: 2.5,
    category: "Adicionais",
    type: "addon",
  },
];

/**
 * Cria um produto mockado
 */
export function createMockProduct(overrides?: Partial<Product>): Product {
  return {
    id: 999,
    name: "Produto Teste",
    price: 10,
    category: "Teste",
    type: "unit",
    ...overrides,
  };
}

/**
 * Cria um item de venda mockado
 */
export function createMockSaleItem(overrides?: Partial<SaleItem>): SaleItem {
  return {
    product: mockProducts[0],
    quantity: 1,
    ...overrides,
  };
}

/**
 * Cria um item de venda com peso (para produtos vendidos por peso)
 */
export function createMockWeightSaleItem(
  overrides?: Partial<SaleItem>
): SaleItem {
  return {
    product: mockProducts[2], // Açaí no Peso
    weight: 500, // 500g
    ...overrides,
  };
}

/**
 * Cria um item de venda com addons
 */
export function createMockSaleItemWithAddons(
  overrides?: Partial<SaleItem>
): SaleItem {
  return {
    product: mockProducts[0],
    quantity: 2,
    addons: [mockAddons[0], mockAddons[1]],
    ...overrides,
  };
}
