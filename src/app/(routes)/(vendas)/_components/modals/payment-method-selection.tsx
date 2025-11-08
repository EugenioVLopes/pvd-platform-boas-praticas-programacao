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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "@/types/order";

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

  // Atualiza o valor inicial do adjustedTotal quando o modal é aberto
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
    if (isNaN(parsed) || parsed <= 0) {
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
    if (isNaN(parsedAmount)) {
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
    if (!isNaN(valorRecebido) && valorRecebido >= Number(adjustedTotal)) {
      return valorRecebido - Number(adjustedTotal);
    }
    return 0;
  };

  const isValidCashAmount =
    selectedMethod === "CASH"
      ? !isNaN(Number(cashAmount)) &&
        Number(cashAmount) >= Number(adjustedTotal)
      : true;

  // Função para limpar os campos
  const resetFields = () => {
    setSelectedMethod(null);
    setCashAmount("");
    setError(null);
    setAdjustedTotal(initialTotal.toFixed(2)); // Reseta para o valor total inicial
  };

  // Resetar estado ao fechar o modal
  const handleClose = () => {
    resetFields();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecionar Método de Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erro ao Processar Pagamento</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <Card
                key={method.type}
                className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                  selectedMethod === method.type
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border"
                }`}
                onClick={() => handleMethodSelect(method.type)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2">{method.icon}</div>
                  <span className="text-sm font-medium">{method.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustedTotal">Valor final da venda</Label>
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
              min={initialTotal * 0.9} // Limita o input para no máximo 10% de desconto
              max={initialTotal}
              className={error ? "border-destructive" : ""}
            />
            {Number(adjustedTotal) < initialTotal && (
              <p className="text-sm text-muted-foreground">
                Desconto aplicado:{" "}
                <span className="font-medium text-primary">
                  {formatCurrency(initialTotal - Number(adjustedTotal))}
                </span>{" "}
                (
                {(
                  ((initialTotal - Number(adjustedTotal)) / initialTotal) *
                  100
                ).toFixed(1)}
                %)
              </p>
            )}
          </div>

          {selectedMethod === "CASH" && (
            <div className="space-y-2">
              <Label htmlFor="cashAmount">Valor recebido em dinheiro</Label>
              <Input
                id="cashAmount"
                type="number"
                value={cashAmount}
                onChange={(e) => handleCashAmountChange(e.target.value)}
                placeholder={`Valor mínimo: ${formatCurrency(Number(adjustedTotal))}`}
                min={Number(adjustedTotal)}
                step="0.01"
                className={error ? "border-destructive" : ""}
              />
              {isValidCashAmount && cashAmount && (
                <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Valor total da compra:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(Number(adjustedTotal))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Valor recebido:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(Number(cashAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-semibold">Troco:</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(calculaTroco())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                !selectedMethod ||
                (selectedMethod === "CASH" && !isValidCashAmount)
              }
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
