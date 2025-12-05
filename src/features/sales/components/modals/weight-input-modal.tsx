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
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    const weightValue = Number.parseFloat(weight);
    if (!Number.isNaN(weightValue) && weightValue > 0) {
      onConfirm(weightValue);
      setWeight("");
      setError(null);
      onClose();
    } else {
      setError("Por favor, insira um peso válido em gramas.");
    }
  };

  const handleClose = () => {
    setWeight("");
    setError(null);
    onClose();
  };

  const appendDigit = (digit: string) => {
    setWeight((prev) => prev + digit);
  };

  const deleteDigit = () => {
    setWeight((prev) => prev.slice(0, -1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">
            Inserir Peso para {productName}
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
            <Label htmlFor="weight-input" className="text-sm font-medium">
              Peso em gramas
            </Label>
            <div className="relative">
              <Input
                id="weight-input"
                type="number"
                placeholder="Digite o peso em gramas"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
                step="0.1"
                min="0"
                autoFocus
                className={`h-12 text-lg font-medium ${
                  error
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
              {weight && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  g
                </span>
              )}
            </div>
          </div>

          {/* Keypad numérico */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Ou use o teclado numérico:
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-14 text-lg font-semibold transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground active:scale-95"
                  onClick={() => appendDigit(num.toString())}
                  type="button"
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-14 text-lg font-semibold transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground active:scale-95"
                onClick={() => appendDigit("0")}
                type="button"
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-14 text-lg font-semibold transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground active:scale-95"
                onClick={() => appendDigit(".")}
                type="button"
              >
                .
              </Button>
              <Button
                variant="outline"
                className="h-14 text-lg font-semibold transition-all hover:scale-105 hover:bg-destructive hover:text-destructive-foreground active:scale-95"
                onClick={deleteDigit}
                type="button"
              >
                ←
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!weight || Number.parseFloat(weight) <= 0}
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
