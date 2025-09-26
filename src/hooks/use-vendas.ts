"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Order } from "@/types/order";

interface VendasStore {
  vendas: Order[];
  adicionarVenda: (venda: Order) => void;
  limparVendas: () => void;
}

export const useVendas = create<VendasStore>()(
  persist(
    (set) => ({
      vendas: [],
      adicionarVenda: (venda) =>
        set((state) => ({
          vendas: [...state.vendas, { ...venda, status: "completed" }],
        })),
      limparVendas: () => set({ vendas: [] }),
    }),
    {
      name: "vendas-storage",
    }
  )
);
