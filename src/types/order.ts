import type { SaleItem } from "./product";

export type PaymentMethod = "CREDIT" | "DEBIT" | "CASH" | "PIX";

export interface Payment {
  method: PaymentMethod;
  amount: number;
  cashReceived?: number;
  change?: number;
  timestamp: Date;
}

export interface Order {
  id: string;
  customerName: string;
  items: SaleItem[];
  status: "open" | "completed";
  paymentMethod?: PaymentMethod;
  total?: number;
  finalizadaEm?: Date;
  change?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesByPaymentMethod: Record<string, number>;
  salesByCategory: Record<string, number>;
  salesByHour: Record<string, number>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}
