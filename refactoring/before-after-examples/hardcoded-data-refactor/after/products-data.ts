import type { Product } from "@/types/product";

// ✅ SOLUÇÃO: Dados separados em arquivo dedicado
// - Facilita manutenção e atualizações
// - Permite carregamento dinâmico de dados
// - Melhora a organização do código
// - Possibilita futuras integrações com APIs

export const INITIAL_PRODUCTS: Product[] = [
  // Sorvetes
  {
    id: 1,
    name: "Tapioca",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 2,
    name: "Oreo",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 3,
    name: "Chocolate",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 4,
    name: "Morango",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 5,
    name: "Creme com Passas",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 6,
    name: "Creme com Brownie",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 7,
    name: "Serenata",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 8,
    name: "Ferreiro Rocher",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 9,
    name: "Ninho com Nutella",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 10,
    name: "Algodão Doce",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 11,
    name: "Abacaxi ao Vinho",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 12,
    name: "Kinder Bueno",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 13,
    name: "Menta",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },
  {
    id: 14,
    name: "Ovomaltine",
    price: 4.5,
    category: "Sorvetes",
    type: "unit",
  },

  // Milkshakes
  {
    id: 15,
    name: "Milkshake Chocolate 300ml",
    price: 10.0,
    category: "Milkshakes",
    type: "unit",
  },
  {
    id: 16,
    name: "Milkshake Chocolate 500ml",
    price: 13.0,
    category: "Milkshakes",
    type: "unit",
  },
  {
    id: 17,
    name: "Milkshake Morango 300ml",
    price: 10.0,
    category: "Milkshakes",
    type: "unit",
  },
  {
    id: 18,
    name: "Milkshake Morango 500ml",
    price: 13.0,
    category: "Milkshakes",
    type: "unit",
  },

  // Milkshakes Premium
  {
    id: 19,
    name: "Milkshake Ovomaltine 300ml",
    price: 11.0,
    category: "Milkshakes Premium",
    type: "unit",
  },
  {
    id: 20,
    name: "Milkshake Ovomaltine 500ml",
    price: 15.0,
    category: "Milkshakes Premium",
    type: "unit",
  },
  {
    id: 21,
    name: "Milkshake Oreo 300ml",
    price: 11.0,
    category: "Milkshakes Premium",
    type: "unit",
  },
  {
    id: 22,
    name: "Milkshake Oreo 500ml",
    price: 15.0,
    category: "Milkshakes Premium",
    type: "unit",
  },
  {
    id: 23,
    name: "Milkshake Nutella 300ml",
    price: 11.0,
    category: "Milkshakes Premium",
    type: "unit",
  },
  {
    id: 24,
    name: "Milkshake Nutella 500ml",
    price: 15.0,
    category: "Milkshakes Premium",
    type: "unit",
  },

  // Açaí
  {
    id: 25,
    name: "Açaí/Sorvete no Peso",
    price: 47,
    category: "Açaí",
    type: "weight",
  },

  // Monte do Seu Jeito
  {
    id: 26,
    name: "Monte do Seu Jeito 200ml",
    price: 12.0,
    category: "Monte do Seu Jeito",
    type: "unit",
    options: {
      frutas: 1,
      cremes: 2,
      acompanhamentos: 3,
    },
  },
  {
    id: 27,
    name: "Monte do Seu Jeito 300ml",
    price: 15.0,
    category: "Monte do Seu Jeito",
    type: "unit",
    options: {
      frutas: 2,
      cremes: 2,
      acompanhamentos: 4,
    },
  },
  {
    id: 28,
    name: "Monte do Seu Jeito 500ml",
    price: 18.0,
    category: "Monte do Seu Jeito",
    type: "unit",
    options: {
      frutas: 3,
      cremes: 2,
      acompanhamentos: 5,
    },
  },

  // Cremes
  {
    id: 29,
    name: "Açaí",
    price: 0,
    category: "Cremes",
    type: "option",
  },
  {
    id: 30,
    name: "Açaí zero açúcar",
    price: 0,
    category: "Cremes",
    type: "option",
  },
  {
    id: 31,
    name: "Cupuaçu",
    price: 0,
    category: "Cremes",
    type: "option",
  },
  {
    id: 32,
    name: "Ninho (cobertura)",
    price: 0,
    category: "Cremes",
    type: "option",
  },
  {
    id: 33,
    name: "Ninho (sorvete)",
    price: 0,
    category: "Cremes",
    type: "option",
  },
  {
    id: 34,
    name: "Ovomaltine",
    price: 0,
    category: "Cremes",
    type: "option",
  },
  {
    id: 35,
    name: "Amendoim",
    price: 0,
    category: "Cremes",
    type: "option",
  },

  // Frutas
  {
    id: 36,
    name: "Banana",
    price: 0,
    category: "Frutas",
    type: "option",
  },
  {
    id: 37,
    name: "Uva",
    price: 0,
    category: "Frutas",
    type: "option",
  },
  {
    id: 38,
    name: "Kiwi",
    price: 0,
    category: "Frutas",
    type: "option",
  },

  // Acompanhamentos
  {
    id: 39,
    name: "Granulado de chocolate",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 40,
    name: "Granulado colorido",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 41,
    name: "Jujuba",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 42,
    name: "Disquete",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 43,
    name: "Flocos de arroz",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 44,
    name: "Creme de avelã",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 45,
    name: "Leite condensado",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 46,
    name: "Ovomaltine",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 47,
    name: "Canudo wafer",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 48,
    name: "Paçoquinha triturada",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 49,
    name: "Castanha",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 50,
    name: "Granola",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 51,
    name: "Amendoim",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 52,
    name: "Amendoim torrado",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 53,
    name: "Paçoquinha (INTEIRA)",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 54,
    name: "Farinha de aveia",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 55,
    name: "Oreo triturado",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 56,
    name: "Leite em pó",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 57,
    name: "Farinha láctea",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 58,
    name: "Mashmallows",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 59,
    name: "Chocoball",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 60,
    name: "Chocoball branco",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 61,
    name: "Chocopower",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 62,
    name: "Cereja",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 63,
    name: "Coco ralado",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 64,
    name: "Gotas de choco. Preto",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 65,
    name: "Gotas de choco. Branco",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 66,
    name: "Fini beijos",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 67,
    name: "Fini bananinhas",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },
  {
    id: 68,
    name: "Fini dentadura",
    price: 0,
    category: "Acompanhamentos",
    type: "option",
  },

  // Adicionais
  {
    id: 69,
    name: "Creme de Cookies",
    price: 3.0,
    category: "Adicionais",
    type: "addon",
  },
  {
    id: 70,
    name: "Nutella",
    price: 3.0,
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
  {
    id: 72,
    name: "Banana",
    price: 1.0,
    category: "Adicionais",
    type: "addon",
  },
  {
    id: 73,
    name: "Uva",
    price: 2.0,
    category: "Adicionais",
    type: "addon",
  },
  {
    id: 74,
    name: "Kiwi",
    price: 2.0,
    category: "Adicionais",
    type: "addon",
  },
];

// Função utilitária para obter produtos por categoria
export const getProductsByCategory = (category: string): Product[] => {
  return INITIAL_PRODUCTS.filter((product) => product.category === category);
};

// Função utilitária para obter todas as categorias
export const getCategories = (): string[] => {
  return Array.from(
    new Set(INITIAL_PRODUCTS.map((product) => product.category))
  );
};

// Função utilitária para buscar produtos
export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return INITIAL_PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  );
};
