"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/types/product";

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
}

// ❌ PROBLEMA: Dados hardcoded diretamente no hook
// - 74 produtos definidos estaticamente no código
// - Dificulta manutenção e atualizações
// - Viola o princípio de separação de responsabilidades
// - Torna o arquivo extremamente longo (581 linhas)
export const useProducts = create<ProductStore>()(
  persist(
    (set) => ({
      products: [
        // Sorvetes - 14 produtos
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
        // ... mais 11 sorvetes

        // Milkshakes - 4 produtos
        {
          id: 15,
          name: "Milkshake Chocolate 300ml",
          price: 10.0,
          category: "Milkshakes",
          type: "unit",
        },
        // ... mais 3 milkshakes

        // Milkshakes Premium - 6 produtos
        {
          id: 19,
          name: "Milkshake Ovomaltine 300ml",
          price: 11.0,
          category: "Milkshakes Premium",
          type: "unit",
        },
        // ... mais 5 milkshakes premium

        // Açaí - 1 produto
        {
          id: 25,
          name: "Açaí/Sorvete no Peso",
          price: 47,
          category: "Açaí",
          type: "weight",
        },

        // Monte do Seu Jeito - 3 produtos
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
        // ... mais 2 produtos

        // Cremes - 7 produtos
        {
          id: 29,
          name: "Açaí",
          price: 0,
          category: "Cremes",
          type: "option",
        },
        // ... mais 6 cremes

        // Frutas - 3 produtos
        {
          id: 36,
          name: "Banana",
          price: 0,
          category: "Frutas",
          type: "option",
        },
        // ... mais 2 frutas

        // Acompanhamentos - 30 produtos
        {
          id: 39,
          name: "Granulado de chocolate",
          price: 0,
          category: "Acompanhamentos",
          type: "option",
        },
        // ... mais 29 acompanhamentos

        // Adicionais - 6 produtos
        {
          id: 69,
          name: "Creme de Cookies",
          price: 3.0,
          category: "Adicionais",
          type: "addon",
        },
        // ... mais 5 adicionais
      ],
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === product.id ? product : p
          ),
        })),
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "products-storage",
    }
  )
);
