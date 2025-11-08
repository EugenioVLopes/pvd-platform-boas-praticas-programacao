"use client";

import { CreditCard, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Escolha uma ação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            {orders.length > 0 && (
              <Card
                className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                  selectedAction === "add_to_order"
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border"
                }`}
                onClick={() => {
                  setSelectedAction("add_to_order");
                  setError(null);
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <ShoppingCart className="mb-2 h-8 w-8" />
                  <span className="text-sm font-medium">
                    Adicionar à Comanda
                  </span>
                </CardContent>
              </Card>
            )}
            <Card
              className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                orders.length === 0 ? "col-span-2" : ""
              } ${
                selectedAction === "finalize_sale"
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border"
              }`}
              onClick={() => {
                setSelectedAction("finalize_sale");
                setError(null);
              }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CreditCard className="mb-2 h-8 w-8" />
                <span className="text-sm font-medium">Finalizar Venda</span>
              </CardContent>
            </Card>
            <Card
              className={`col-span-2 cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                selectedAction === "new_order"
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border"
              }`}
              onClick={() => {
                setSelectedAction("new_order");
                setError(null);
              }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Plus className="mb-2 h-8 w-8" />
                <span className="text-sm font-medium">Nova Comanda</span>
              </CardContent>
            </Card>
          </div>

          {selectedAction === "add_to_order" && orders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="order-select">Selecione uma comanda</Label>
              <Select
                value={selectedOrderId}
                onValueChange={(value) => {
                  setSelectedOrderId(value);
                  setError(null);
                }}
              >
                <SelectTrigger id="order-select">
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
            <div className="space-y-2">
              <Label htmlFor="customer-name">Nome do cliente</Label>
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
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedAction}>
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
