export const PRODUCT_CATEGORIES = {
  SORVETES: "Sorvetes",
  MILKSHAKES: "Milkshakes",
  MILKSHAKES_PREMIUM: "Milkshakes Premium",
  ACAI: "Açaí",
  MONTE_SEU_JEITO: "Monte do Seu Jeito",
  BEBIDAS: "Bebidas",
  SALGADOS: "Salgados",
  SOBREMESAS: "Sobremesas",
  EMBARCADOS: "Embarcados",
  OUTROS: "Outros",
} as const;

export const PAYMENT_METHODS = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
  CASH: "CASH",
  PIX: "PIX",
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];
