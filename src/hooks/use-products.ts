"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { INITIAL_PRODUCTS } from "@/lib/constants/products-data";
import type { Product } from "@/types/product";

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
  loadProducts: (products: Product[]) => void;
  resetToInitialProducts: () => void;
}

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
      loadProducts: (products) => set({ products }),
      resetToInitialProducts: () => set({ products: INITIAL_PRODUCTS }),
    }),
    {
      name: "products-storage",
    }
  )
);
