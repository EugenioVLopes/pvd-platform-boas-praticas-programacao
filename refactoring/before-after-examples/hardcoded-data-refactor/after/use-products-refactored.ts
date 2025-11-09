"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/features/products";
import { INITIAL_PRODUCTS } from "./products-data";

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
  loadProducts: (products: Product[]) => void;
  resetToInitialProducts: () => void;
}

// ✅ SOLUÇÃO: Hook limpo e focado apenas na lógica de estado
// - Dados separados em arquivo dedicado
// - Hook reduzido de 581 para ~40 linhas
// - Melhor separação de responsabilidades
// - Facilita testes e manutenção
// - Permite carregamento dinâmico de dados
export const useProducts = create<ProductStore>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,

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

      // ✅ Nova funcionalidade: Carregar produtos dinamicamente
      loadProducts: (products) => set({ products }),

      // ✅ Nova funcionalidade: Resetar para produtos iniciais
      resetToInitialProducts: () => set({ products: INITIAL_PRODUCTS }),
    }),
    {
      name: "products-storage",
    }
  )
);
