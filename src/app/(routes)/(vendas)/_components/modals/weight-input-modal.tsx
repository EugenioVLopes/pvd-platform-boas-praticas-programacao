"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface WeightInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  productName: string;
}

export function WeightInputModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: WeightInputModalProps) {
  const [weight, setWeight] = useState<string>("");

  const handleConfirm = () => {
    const weightValue = Number.parseFloat(weight);
    if (!isNaN(weightValue) && weightValue > 0) {
      onConfirm(weightValue);
      setWeight(""); // Limpa o campo após confirmar
      onClose();
    } else {
      alert("Por favor, insira um peso válido em gramas.");
    }
  };

  // Função para adicionar dígitos ao peso
  const appendDigit = (digit: string) => {
    setWeight((prev) => prev + digit);
  };

  // Função para apagar o último dígito
  const deleteDigit = () => {
    setWeight((prev) => prev.slice(0, -1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Peso para {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Campo de entrada */}
          <Input
            type="number"
            placeholder="Peso em gramas"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
            step="0.1"
            min="0"
          />

          {/* Keypad numérico */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="bg-pink-400 p-4 text-white"
                onClick={() => appendDigit(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              className="bg-pink-400 p-4 text-white"
              onClick={() => appendDigit("0")}
            >
              0
            </Button>
            <Button
              variant="outline"
              className="bg-pink-400 p-4 text-white"
              onClick={() => appendDigit(".")}
            >
              .
            </Button>
            <Button variant="outline" onClick={deleteDigit}>
              ←
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}