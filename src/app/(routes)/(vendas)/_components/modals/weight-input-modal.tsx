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
    if (!isNaN(weightValue) && weightValue > 0) {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inserir Peso para {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="weight-input">Peso em gramas</Label>
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
              className={error ? "border-destructive" : ""}
            />
          </div>

          {/* Keypad numérico */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Ou use o teclado numérico:
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  onClick={() => appendDigit(num.toString())}
                  type="button"
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                onClick={() => appendDigit("0")}
                type="button"
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                onClick={() => appendDigit(".")}
                type="button"
              >
                .
              </Button>
              <Button
                variant="outline"
                className="h-12 hover:bg-destructive hover:text-destructive-foreground"
                onClick={deleteDigit}
                type="button"
              >
                ←
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!weight || Number.parseFloat(weight) <= 0}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
