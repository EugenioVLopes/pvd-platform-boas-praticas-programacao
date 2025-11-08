"use client";

import { useState } from "react";

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

  const handleConfirm = () => {
    if (!customerName.trim()) {
      alert("Por favor, insira o nome do cliente.");
      return;
    }

    onConfirm(customerName.trim());
    setCustomerName("");
    onClose();
  };

  const handleClose = () => {
    setCustomerName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Comanda</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente</Label>
            <Input
              id="customerName"
              placeholder="Digite o nome do cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Criar Comanda</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
