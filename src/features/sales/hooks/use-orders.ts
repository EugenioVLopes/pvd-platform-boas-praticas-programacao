import { useCallback, useEffect, useMemo, useState } from "react";

import { BaseHookOptions, PersistenceOptions } from "@/types";
import type { Order } from "@/features/sales";

const DEFAULT_STORAGE_KEY = "orders";

export interface UseOrdersOptions extends BaseHookOptions, PersistenceOptions {
  storageKey?: string;
  persistToStorage?: boolean;
  storageType?: "localStorage" | "sessionStorage";
  validateOrders?: boolean;
}

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  orderCount: number;
  totalValue: number;

  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  getOrder: (id: string) => Order | undefined;
  clearOrders: () => void;
  clearError: () => void;
}

/**
 * Hook para gerenciar pedidos com persistência local e otimizações de performance
 *
 * @param options - Opções de configuração do hook
 * @param options.enabled - Se o hook deve estar ativo
 * @param options.persistToStorage - Se deve persistir no storage
 * @param options.storageKey - Chave para armazenamento
 * @param options.storageType - Tipo de storage a usar
 * @param options.validateOrders - Se deve validar pedidos
 *
 * @returns Objeto com estado e ações para gerenciar pedidos
 *
 * @example
 * ```tsx
 * function OrdersPage() {
 *   const {
 *     orders,
 *     addOrder,
 *     updateOrder,
 *     loading,
 *     error,
 *     totalValue
 *   } = useOrders({
 *     persistToStorage: true,
 *     storageKey: "my-orders"
 *   });
 *
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <div>
 *       <h2>Total: R$ {totalValue.toFixed(2)}</h2>
 *       {orders.map(order => (
 *         <OrderCard
 *           key={order.id}
 *           order={order}
 *           onUpdate={(updates) => updateOrder(order.id, updates)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Uso com validação customizada
 * function ValidatedOrders() {
 *   const { addOrder, error } = useOrders({
 *     validateOrders: true,
 *     storageType: "sessionStorage"
 *   });
 *
 *   const handleAddOrder = () => {
 *     addOrder({
 *       customerName: "João Silva",
 *       items: [],
 *       status: "open"
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleAddOrder}>Add Order</button>
 *       {error && <p className="error">{error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    enabled = true,
    persistToStorage = true,
    storageKey = DEFAULT_STORAGE_KEY,
    storageType = "localStorage",
    validateOrders = true,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storage = useMemo(() => {
    if (typeof window === "undefined") return null;
    return storageType === "localStorage" ? localStorage : sessionStorage;
  }, [storageType]);

  const validateOrder = useCallback(
    (order: Partial<Order>, isPartial: boolean = false): string | null => {
      if (!validateOrders) return null;

      if (isPartial) {
        if (order.customerName !== undefined && !order.customerName?.trim()) {
          return "Nome do cliente é obrigatório";
        }

        if (order.items !== undefined && !Array.isArray(order.items)) {
          return "Items do pedido devem ser um array";
        }

        if (
          order.status !== undefined &&
          !["open", "completed"].includes(order.status as string)
        ) {
          return "Status do pedido deve ser 'open' ou 'completed'";
        }

        return null;
      }

      if (!order.customerName?.trim()) return "Nome do cliente é obrigatório";

      if (!Array.isArray(order.items))
        return "Items do pedido devem ser um array";

      if (!["open", "completed"].includes(order.status as string))
        return "Status do pedido deve ser 'open' ou 'completed'";

      return null;
    },
    [validateOrders]
  );

  useEffect(() => {
    if (!enabled || !storage || !persistToStorage) {
      setLoading(false);
      return;
    }

    try {
      const savedOrders = storage.getItem(storageKey);
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        const ordersWithDates = parsedOrders.map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          finalizadaEm: order.finalizadaEm
            ? new Date(order.finalizadaEm)
            : undefined,
        }));
        setOrders(ordersWithDates);
      }
    } catch (err) {
      setError("Erro ao carregar pedidos do storage");
      console.error("Error loading orders from storage:", err);
    } finally {
      setLoading(false);
    }
  }, [enabled, storage, persistToStorage, storageKey]);

  useEffect(() => {
    if (!enabled || !storage || !persistToStorage || loading) {
      return;
    }

    try {
      storage.setItem(storageKey, JSON.stringify(orders));
    } catch (err) {
      setError("Erro ao salvar pedidos no storage");
      console.error("Error saving orders to storage:", err);
    }
  }, [orders, enabled, storage, persistToStorage, storageKey, loading]);

  const orderCount = useMemo(() => orders.length, [orders]);

  const totalValue = useMemo(() => {
    return orders.reduce((total, order) => {
      const orderTotal =
        order.total ||
        order.items.reduce((sum, item) => {
          return sum + item.product.price * (item.quantity ?? 1);
        }, 0);
      return total + orderTotal;
    }, 0);
  }, [orders]);

  const addOrder = useCallback(
    (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
      const validationError = validateOrder(orderData);
      if (validationError) {
        setError(validationError);
        return;
      }

      const newOrder: Order = {
        ...orderData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setOrders((prev) => [...prev, newOrder]);
      setError(null);
    },
    [validateOrder]
  );

  const updateOrder = useCallback(
    (id: string, updates: Partial<Order>) => {
      const validationError = validateOrder(updates, true); // true = atualização parcial
      if (validationError) {
        setError(validationError);
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? { ...order, ...updates, updatedAt: new Date() }
            : order
        )
      );
      setError(null);
    },
    [validateOrder]
  );

  const removeOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    setError(null);
  }, []);

  const getOrder = useCallback(
    (id: string) => {
      return orders.find((order) => order.id === id);
    },
    [orders]
  );

  const clearOrders = useCallback(() => {
    setOrders([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    orders,
    loading,
    error,
    orderCount,
    totalValue,
    addOrder,
    updateOrder,
    removeOrder,
    getOrder,
    clearOrders,
    clearError,
  };
}
