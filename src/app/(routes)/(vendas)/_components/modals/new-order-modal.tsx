"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerName: string) => void;
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Comanda</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente</Label>
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
              className={error ? "border-destructive" : ""}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!customerName.trim()}>
              Criar Comanda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
