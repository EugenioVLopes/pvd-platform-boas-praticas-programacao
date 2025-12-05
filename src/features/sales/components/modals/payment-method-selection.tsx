"use client";

import {
  Banknote,
  CreditCard,
  CreditCardIcon as DebitCard,
  Smartphone,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/features/sales";
import { formatCurrency } from "@/lib";

interface PaymentMethodSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (
    method: PaymentMethod,
    cashAmount?: number,
    total?: number
  ) => void;
  total: number;
}

const PAYMENT_METHODS: {
  type: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "CREDIT",
    label: "Crédito",
    icon: <CreditCard className="h-6 w-6" />,
  },
  { type: "DEBIT", label: "Débito", icon: <DebitCard className="h-6 w-6" /> },
  { type: "CASH", label: "Dinheiro", icon: <Banknote className="h-6 w-6" /> },
  { type: "PIX", label: "Pix", icon: <Smartphone className="h-6 w-6" /> },
];

export function PaymentMethodSelection({
  isOpen,
  onClose,
  onSelect,
  total: initialTotal,
}: PaymentMethodSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [cashAmount, setCashAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [adjustedTotal, setAdjustedTotal] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setAdjustedTotal(initialTotal.toFixed(2));
    }
  }, [isOpen, initialTotal]);

  const validateDiscount = (newTotal: number): boolean => {
    const maxAdjustment = initialTotal * 0.1; // 10% do valor original
    const adjustment = initialTotal - newTotal;

    if (Math.abs(adjustment) > maxAdjustment) {
      setError(
        `O ajuste máximo permitido é de 10% (${formatCurrency(maxAdjustment)})`
      );
      return false;
    }

    setError(null);
    return true;
  };

  const validateAdjustedTotal = (value: string) => {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError("Por favor, insira um valor válido maior que zero.");
      return false;
    }

    return validateDiscount(parsed);
  };

  const handleConfirm = () => {
    if (!validateAdjustedTotal(adjustedTotal)) {
      return;
    }

    const finalTotal = Number.parseFloat(adjustedTotal);

    if (selectedMethod === "CASH") {
      const parsedCashAmount = Number.parseFloat(cashAmount);
      if (!validateCashAmount(cashAmount, finalTotal)) {
        return;
      }
      onSelect(selectedMethod, parsedCashAmount, finalTotal);
      resetFields(); // Limpa os campos após a venda
    } else if (selectedMethod) {
      onSelect(selectedMethod, undefined, finalTotal);
      resetFields(); // Limpa os campos após a venda
    }
  };

  const validateCashAmount = (amount: string, total: number): boolean => {
    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount)) {
      setError("Por favor, insira um valor válido.");
      return false;
    }
    if (parsedAmount < total) {
      setError(`O valor mínimo necessário é ${formatCurrency(total)}`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
    if (method !== "CASH") {
      setCashAmount("");
    }
  };

  const handleCashAmountChange = (value: string) => {
    setCashAmount(value);
    if (value) {
      validateCashAmount(value, Number(adjustedTotal));
    } else {
      setError(null);
    }
  };

  const calculaTroco = (): number => {
    const valorRecebido = Number.parseFloat(cashAmount);
    if (
      !Number.isNaN(valorRecebido) &&
      valorRecebido >= Number(adjustedTotal)
    ) {
      return valorRecebido - Number(adjustedTotal);
    }
    return 0;
  };

  const isValidCashAmount =
    selectedMethod === "CASH"
      ? !Number.isNaN(Number(cashAmount)) &&
        Number(cashAmount) >= Number(adjustedTotal)
      : true;

  const resetFields = () => {
    setSelectedMethod(null);
    setCashAmount("");
    setError(null);
    setAdjustedTotal(initialTotal.toFixed(2));
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">
            Selecionar Método de Pagamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive" className="border-destructive">
              <AlertTitle className="font-semibold">
                Erro ao Processar Pagamento
              </AlertTitle>
              <AlertDescription className="mt-1">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <Card
                key={method.type}
                className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
                  selectedMethod === method.type
                    ? "scale-105 border-2 border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border"
                }`}
                onClick={() => handleMethodSelect(method.type)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div
                    className={`mb-3 transition-transform ${
                      selectedMethod === method.type ? "scale-110" : ""
                    }`}
                  >
                    {method.icon}
                  </div>
                  <span className="text-sm font-semibold">{method.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="space-y-2">
              <Label htmlFor="adjustedTotal" className="text-sm font-medium">
                Valor final da venda
              </Label>
              <Input
                id="adjustedTotal"
                type="number"
                value={adjustedTotal}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setAdjustedTotal(newValue);
                  validateAdjustedTotal(newValue);
                }}
                step="0.01"
                min={initialTotal * 0.9}
                max={initialTotal}
                className={`h-11 text-base font-semibold ${
                  error
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
              {Number(adjustedTotal) < initialTotal && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                  <p className="text-sm font-medium text-primary">
                    Desconto aplicado:{" "}
                    <span className="font-bold">
                      {formatCurrency(initialTotal - Number(adjustedTotal))}
                    </span>{" "}
                    (
                    {(
                      ((initialTotal - Number(adjustedTotal)) / initialTotal) *
                      100
                    ).toFixed(1)}
                    %)
                  </p>
                </div>
              )}
            </div>
          </div>

          {selectedMethod === "CASH" && (
            <div className="space-y-3">
              <Label htmlFor="cashAmount" className="text-sm font-medium">
                Valor recebido em dinheiro
              </Label>
              <Input
                id="cashAmount"
                type="number"
                value={cashAmount}
                onChange={(e) => handleCashAmountChange(e.target.value)}
                placeholder={`Valor mínimo: ${formatCurrency(Number(adjustedTotal))}`}
                min={Number(adjustedTotal)}
                step="0.01"
                className={`h-11 text-base font-semibold ${
                  error
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
              {isValidCashAmount && cashAmount && (
                <div className="space-y-2 rounded-lg border-2 border-primary/20 bg-primary/5 p-4 shadow-sm">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">
                      Valor total da compra:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(Number(adjustedTotal))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">
                      Valor recebido:
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(Number(cashAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-primary/20 pt-2">
                    <span className="text-base font-bold">Troco:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(calculaTroco())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !selectedMethod ||
              (selectedMethod === "CASH" && !isValidCashAmount)
            }
            type="button"
            className="min-w-[120px]"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
