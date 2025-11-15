"use client";

import { CreditCard, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Action = "add_to_order" | "finalize_sale" | "new_order";

interface ActionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: Action, orderIdOrName?: string) => void;
  orders: { id: string; customerName: string }[];
  productName: string;
}

export function ActionSelectionModal({
  isOpen,
  onClose,
  onSelectAction,
  orders,
}: ActionSelectionModalProps) {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [newOrderName, setNewOrderName] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);

    if (selectedAction === "new_order") {
      if (!newOrderName.trim()) {
        setError("Por favor, insira um nome para a nova comanda.");
        return;
      }
      onSelectAction("new_order", newOrderName);
    } else if (selectedAction === "add_to_order") {
      if (!selectedOrderId) {
        setError("Por favor, selecione uma comanda.");
        return;
      }
      onSelectAction("add_to_order", selectedOrderId);
    } else if (selectedAction === "finalize_sale") {
      onSelectAction("finalize_sale");
    }
    setSelectedAction(null);
    setNewOrderName("");
    setSelectedOrderId("");
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedAction(null);
    setNewOrderName("");
    setSelectedOrderId("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">
            Escolha uma ação
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

          <div className="grid grid-cols-2 gap-3">
            {orders.length > 0 && (
              <Card
                className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
                  selectedAction === "add_to_order"
                    ? "scale-105 border-2 border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border"
                }`}
                onClick={() => {
                  setSelectedAction("add_to_order");
                  setError(null);
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <ShoppingCart
                    className={`mb-3 h-10 w-10 transition-transform ${
                      selectedAction === "add_to_order" ? "scale-110" : ""
                    }`}
                  />
                  <span className="text-sm font-semibold">
                    Adicionar à Comanda
                  </span>
                </CardContent>
              </Card>
            )}
            <Card
              className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
                orders.length === 0 ? "col-span-2" : ""
              } ${
                selectedAction === "finalize_sale"
                  ? "scale-105 border-2 border-primary bg-primary text-primary-foreground shadow-lg"
                  : "border-border"
              }`}
              onClick={() => {
                setSelectedAction("finalize_sale");
                setError(null);
              }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CreditCard
                  className={`mb-3 h-10 w-10 transition-transform ${
                    selectedAction === "finalize_sale" ? "scale-110" : ""
                  }`}
                />
                <span className="text-sm font-semibold">Finalizar Venda</span>
              </CardContent>
            </Card>
            <Card
              className={`col-span-2 cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
                selectedAction === "new_order"
                  ? "scale-105 border-2 border-primary bg-primary text-primary-foreground shadow-lg"
                  : "border-border"
              }`}
              onClick={() => {
                setSelectedAction("new_order");
                setError(null);
              }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Plus
                  className={`mb-3 h-10 w-10 transition-transform ${
                    selectedAction === "new_order" ? "scale-110" : ""
                  }`}
                />
                <span className="text-sm font-semibold">Nova Comanda</span>
              </CardContent>
            </Card>
          </div>

          {selectedAction === "add_to_order" && orders.length > 0 && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <Label htmlFor="order-select" className="text-sm font-medium">
                Selecione uma comanda
              </Label>
              <Select
                value={selectedOrderId}
                onValueChange={(value) => {
                  setSelectedOrderId(value);
                  setError(null);
                }}
              >
                <SelectTrigger id="order-select" className="h-11">
                  <SelectValue placeholder="Selecione uma comanda" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedAction === "new_order" && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <Label htmlFor="customer-name" className="text-sm font-medium">
                Nome do cliente
              </Label>
              <Input
                id="customer-name"
                placeholder="Digite o nome do cliente"
                value={newOrderName}
                onChange={(e) => {
                  setNewOrderName(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm();
                  }
                }}
                autoFocus
                className="h-11"
              />
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleClose} type="button">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedAction}
              type="button"
              className="min-w-[120px]"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
