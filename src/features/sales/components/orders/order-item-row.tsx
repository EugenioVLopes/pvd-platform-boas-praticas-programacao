"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Product, SaleItem, useProducts } from "@/features/products";
import { AddonDialog } from "./addon-dialog";
import { AddonsBadge } from "./addons-badge";
import { SelectedOptionsBadges } from "./selected-options-badges";

interface OrderItemRowProps {
  item: SaleItem;
  onRemove: () => void;
  onUpdate?: (updatedItem: SaleItem) => void;
}

export function OrderItemRow({ item, onRemove, onUpdate }: OrderItemRowProps) {
  const [showAddons, setShowAddons] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Product[]>([]);
  const { products } = useProducts();

  const adicionais = products.filter((p) => p.type === "addon");
  const acompanhamentos = products.filter(
    (p) => p.category === "Acompanhamentos"
  );

  const subtotal =
    (item.product.type === "weight"
      ? (item.product.price * (item.weight || 0)) / 1000
      : item.product.price * (item.quantity || 1)) +
    (item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0);

  const handleToggleAddon = (product: Product) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === product.id)
        ? prev.filter((a) => a.id !== product.id)
        : [...prev, product]
    );
  };

  const handleToggleAcompanhamento = (product: Product) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === product.id)
        ? prev.filter((a) => a.id !== product.id)
        : [...prev, { ...product, price: 2.0 }]
    );
  };

  const handleConfirmAddons = () => {
    if (onUpdate && selectedAddons.length > 0) {
      const updatedItem = {
        ...item,
        addons: [...(item.addons || []), ...selectedAddons],
      };
      onUpdate(updatedItem);
    }
    setSelectedAddons([]);
    setShowAddons(false);
  };

  return (
    <>
      <TableRow className="border-b border-pink-50 transition-colors hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50">
        <TableCell className="py-5 align-top">
          <div className="flex flex-col gap-3">
            <span className="text-base font-semibold text-gray-900 md:text-lg">
              {item.product.name}
            </span>
            <SelectedOptionsBadges selectedOptions={item.selectedOptions} />
            <AddonsBadge addons={item.addons || []} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddons(true)}
              className="mt-2 flex w-fit items-center gap-1.5 border-pink-300 bg-pink-50 text-pink-700 shadow-sm transition-all hover:border-pink-400 hover:bg-pink-100 hover:text-pink-800 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Adicionais
            </Button>
          </div>
        </TableCell>
        <TableCell className="py-5 text-center align-middle">
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-gray-900">
              {item.product.type === "weight"
                ? `${(item.weight || 0).toFixed(0)}g`
                : item.quantity}
            </span>
            {item.product.type === "weight" && (
              <span className="text-xs text-gray-500">
                {((item.weight || 0) / 1000).toFixed(2)} kg
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="py-5 text-center align-middle">
          <span className="text-sm font-medium text-gray-700">
            {item.product.type === "weight"
              ? `R$ ${item.product.price.toFixed(2)}/kg`
              : `R$ ${item.product.price.toFixed(2)}`}
          </span>
        </TableCell>
        <TableCell className="py-5 text-center align-middle">
          <span className="text-lg font-bold text-pink-600">
            R$ {subtotal.toFixed(2)}
          </span>
        </TableCell>
        <TableCell className="py-5 text-center align-middle">
          <Button
            size="sm"
            variant="destructive"
            className="w-full shadow-sm transition-all hover:shadow-md md:w-auto"
            onClick={onRemove}
          >
            Remover
          </Button>
        </TableCell>
      </TableRow>

      <AddonDialog
        open={showAddons}
        onOpenChange={setShowAddons}
        adicionais={adicionais}
        acompanhamentos={acompanhamentos}
        selectedAddons={selectedAddons}
        onToggleAddon={handleToggleAddon}
        onToggleAcompanhamento={handleToggleAcompanhamento}
        onConfirm={handleConfirmAddons}
      />
    </>
  );
}
