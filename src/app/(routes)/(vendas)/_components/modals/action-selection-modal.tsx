"use client";

import { CreditCard, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

  const handleConfirm = () => {
    if (selectedAction === "new_order") {
      if (!newOrderName.trim()) {
        alert("Por favor, insira um nome para a nova comanda.");
        return;
      }
      onSelectAction("new_order", newOrderName);
    } else if (selectedAction === "add_to_order") {
      if (!selectedOrderId) {
        alert("Por favor, selecione uma comanda.");
        return;
      }
      onSelectAction("add_to_order", selectedOrderId);
    } else if (selectedAction === "finalize_sale") {
      onSelectAction("finalize_sale");
    }
    setSelectedAction(null);
    setNewOrderName("");
    setSelectedOrderId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Escolha uma ação</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {orders.length > 0 && (
            <Card
              className={`cursor-pointer transition-colors ${
                selectedAction === "add_to_order"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              onClick={() => setSelectedAction("add_to_order")}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <ShoppingCart className="mb-2 h-6 w-6" />
                <span>Adicionar à Comanda</span>
              </CardContent>
            </Card>
          )}
          <Card
            className={`cursor-pointer transition-colors ${orders.length === 0 ? "col-span-2" : ""} ${
              selectedAction === "finalize_sale"
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            onClick={() => setSelectedAction("finalize_sale")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <CreditCard className="mb-2 h-6 w-6" />
              <span>Finalizar Venda</span>
            </CardContent>
          </Card>
          <Card
            className={`col-span-2 cursor-pointer transition-colors ${
              selectedAction === "new_order"
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            onClick={() => setSelectedAction("new_order")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Plus className="mb-2 h-6 w-6" />
              <span>Nova Comanda</span>
            </CardContent>
          </Card>
        </div>
        {selectedAction === "add_to_order" && orders.length > 0 && (
          <div className="mt-4">
            <select
              className="w-full rounded border p-2"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
            >
              <option value="">Selecione uma comanda</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.customerName}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedAction === "new_order" && (
          <div className="mt-4">
            <Input
              placeholder="Nome do cliente"
              value={newOrderName}
              onChange={(e) => setNewOrderName(e.target.value)}
            />
          </div>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}