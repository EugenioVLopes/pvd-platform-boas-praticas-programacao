"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewOrderModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (customerName: string) => void;
}

export function NewOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: NewOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);

    if (!customerName.trim()) {
      setError("Por favor, insira o nome do cliente.");
      return;
    }

    onConfirm(customerName.trim());
    setCustomerName("");
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setCustomerName("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">
            Nova Comanda
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive" className="border-destructive">
              <AlertDescription className="font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="customerName" className="text-sm font-medium">
              Nome do Cliente
            </Label>
            <Input
              id="customerName"
              placeholder="Digite o nome do cliente"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              autoFocus
              className={`h-11 text-base ${
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!customerName.trim()}
            type="button"
            className="min-w-[140px]"
          >
            Criar Comanda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
