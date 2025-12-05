import type { SaleItem } from "@/features/products";
import type { Order, PaymentMethod } from "@/features/sales";
import { createMockSaleItem, createMockWeightSaleItem } from "./products";

/**
 * Fixtures de vendas para testes
 */
export const mockOrders: Order[] = [
  {
    id: "order-1",
    customerName: "João Silva",
    items: [createMockSaleItem({ quantity: 2 })],
    status: "completed",
    paymentMethod: "CASH",
    total: 9,
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-01-15T10:00:00"),
    finalizadaEm: new Date("2024-01-15T10:00:00"),
    change: 1,
  },
  {
    id: "order-2",
    customerName: "Maria Santos",
    items: [createMockWeightSaleItem({ weight: 1000 })],
    status: "completed",
    paymentMethod: "PIX",
    total: 47,
    createdAt: new Date("2024-01-15T11:00:00"),
    updatedAt: new Date("2024-01-15T11:00:00"),
    finalizadaEm: new Date("2024-01-15T11:00:00"),
  },
  {
    id: "order-3",
    customerName: "Pedro Costa",
    items: [
      createMockSaleItem({ quantity: 1 }),
      createMockSaleItem({ quantity: 3 }),
    ],
    status: "completed",
    paymentMethod: "CREDIT",
    total: 18,
    createdAt: new Date("2024-01-15T12:00:00"),
    updatedAt: new Date("2024-01-15T12:00:00"),
    finalizadaEm: new Date("2024-01-15T12:00:00"),
  },
];

/**
 * Cria uma venda mockada
 */
export function createMockOrder(overrides?: Partial<Order>): Order {
  return {
    id: `order-${Date.now()}`,
    customerName: "Cliente Teste",
    items: [createMockSaleItem()],
    status: "completed",
    paymentMethod: "CASH",
    total: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    finalizadaEm: new Date(),
    ...overrides,
  };
}

/**
 * Cria uma venda com múltiplos itens
 */
export function createMockOrderWithMultipleItems(
  items: SaleItem[],
  overrides?: Partial<Order>
): Order {
  return createMockOrder({
    items,
    total: items.reduce((sum, item) => {
      const itemTotal =
        item.product.type === "weight" && item.weight
          ? (item.product.price * item.weight) / 1000
          : item.product.price * (item.quantity ?? 1);
      return sum + itemTotal;
    }, 0),
    ...overrides,
  });
}

/**
 * Cria dados de venda completos para teste
 */
export function createMockCompleteSaleData(
  overrides?: Partial<{
    customerName: string;
    items: SaleItem[];
    paymentMethod: PaymentMethod;
    cashAmount: number;
    discount: number;
    notes: string;
  }>
) {
  return {
    customerName: "Cliente Teste",
    items: [createMockSaleItem()],
    paymentMethod: "CASH" as PaymentMethod,
    cashAmount: 10,
    discount: 0,
    notes: "",
    ...overrides,
  };
}
