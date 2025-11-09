"use client";

import { useCallback, useMemo, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AsyncHookState, BaseHookOptions } from "@/types";
import type { Order, PaymentMethod } from "@/features/sales";
import type { SaleItem } from "@/features/products";

export interface CompleteSaleData {
  customerName: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  cashAmount?: number;
  discount?: number;
  notes?: string;
}

export interface UseSalesOptions extends BaseHookOptions {
  autoSave?: boolean;
  storageKey?: string;
}

export interface UseSalesReturn {
  completedSales: Order[];
  completeSale: (saleData: CompleteSaleData) => Promise<void>;
  cancelSale: (saleId: string) => void;
  getSale: (saleId: string) => Order | undefined;
  clearSales: () => void;
  loading: boolean;
  error: string | null;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
}

interface SalesStore {
  sales: Order[];
  addSale: (sale: Order) => void;
  removeSale: (saleId: string) => void;
  clearSales: () => void;
}

const useSalesStore = create<SalesStore>()(
  persist(
    (set) => ({
      sales: [],
      addSale: (sale) =>
        set((state) => ({
          sales: [...state.sales, { ...sale, status: "completed" }],
        })),
      removeSale: (saleId) =>
        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== saleId),
        })),
      clearSales: () => set({ sales: [] }),
    }),
    {
      name: "sales-storage",
    }
  )
);

export function useSales(options: UseSalesOptions = {}): UseSalesReturn {
  const { enabled = true } = options;

  const [asyncState, setAsyncState] = useState<AsyncHookState<null>>({
    data: null,
    loading: false,
    error: null,
  });

  const { sales, addSale, removeSale, clearSales } = useSalesStore();

  const calculateItemTotal = useCallback((item: SaleItem): number => {
    let baseTotal = 0;

    if (item.product.type === "weight" && item.weight) {
      baseTotal = (item.product.price * item.weight) / 1000;
    } else {
      baseTotal = item.product.price * (item.quantity || 1);
    }

    const addonsTotal =
      item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;

    return baseTotal + addonsTotal;
  }, []);

  const calculateSaleTotal = useCallback(
    (items: SaleItem[]): number => {
      return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    },
    [calculateItemTotal]
  );

  const completeSale = useCallback(
    async (saleData: CompleteSaleData): Promise<void> => {
      if (!enabled) return;

      setAsyncState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        if (!saleData.customerName.trim()) {
          throw new Error("Nome do cliente é obrigatório");
        }

        if (!saleData.items.length) {
          throw new Error("Pelo menos um item deve ser adicionado à venda");
        }

        const total = calculateSaleTotal(saleData.items);
        const discount = saleData.discount || 0;
        const finalTotal = total - discount;

        if (saleData.paymentMethod === "CASH" && saleData.cashAmount) {
          if (saleData.cashAmount < finalTotal) {
            throw new Error("Valor em dinheiro insuficiente");
          }
        }

        const completedOrder: Order = {
          id: crypto.randomUUID(),
          customerName: saleData.customerName,
          items: saleData.items,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "completed",
          paymentMethod: saleData.paymentMethod,
          total: finalTotal,
          finalizadaEm: new Date(),
          change: saleData.cashAmount ? saleData.cashAmount - finalTotal : 0,
        };

        await new Promise((resolve) => setTimeout(resolve, 100));

        addSale(completedOrder);

        setAsyncState((prev) => ({ ...prev, loading: false, data: null }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao finalizar venda";
        setAsyncState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [enabled, calculateSaleTotal, addSale]
  );

  const cancelSale = useCallback(
    (saleId: string): void => {
      if (!enabled) return;

      try {
        removeSale(saleId);
        setAsyncState((prev) => ({ ...prev, error: null }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao cancelar venda";
        setAsyncState((prev) => ({ ...prev, error: errorMessage }));
      }
    },
    [enabled, removeSale]
  );

  const getSale = useCallback(
    (saleId: string): Order | undefined => {
      return sales.find((sale) => sale.id === saleId);
    },
    [sales]
  );

  const handleClearSales = useCallback((): void => {
    if (!enabled) return;

    try {
      clearSales();
      setAsyncState((prev) => ({ ...prev, error: null }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao limpar vendas";
      setAsyncState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [enabled, clearSales]);

  const metrics = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + (sale.total || 0),
      0
    );
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      averageTicket,
    };
  }, [sales]);

  return {
    completedSales: sales,
    loading: asyncState.loading,
    error: asyncState.error,
    completeSale,
    cancelSale,
    getSale,
    clearSales: handleClearSales,
    ...metrics,
  };
}
