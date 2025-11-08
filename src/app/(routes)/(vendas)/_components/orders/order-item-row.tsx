"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableCell, TableRow } from "@/components/ui/table";
import { useProducts } from "@/hooks/business/use-products";
import { Product, SaleItem } from "@/types/product";

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

  // Calcula o subtotal baseada no tipo do produto (por peso ou unidade)
  const subtotal =
    (item.product.type === "weight"
      ? (item.product.price * (item.weight || 0)) / 1000
      : item.product.price * (item.quantity || 1)) +
    (item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0);

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

            {item.selectedOptions && (
              <div className="flex flex-wrap gap-2">
                {item.selectedOptions.frutas.length > 0 && (
                  <Badge
                    variant="outline"
                    className="flex flex-col gap-1 rounded-lg border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
                  >
                    <span className="font-bold text-orange-700">Frutas:</span>
                    <span className="text-orange-800">
                      {item.selectedOptions.frutas.join(", ")}
                    </span>
                  </Badge>
                )}
                {item.selectedOptions.cremes.length > 0 && (
                  <Badge
                    variant="outline"
                    className="flex flex-col gap-1 rounded-lg border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
                  >
                    <span className="font-bold text-blue-700">Cremes:</span>
                    <span className="text-blue-800">
                      {item.selectedOptions.cremes.join(", ")}
                    </span>
                  </Badge>
                )}
                {item.selectedOptions.acompanhamentos.length > 0 && (
                  <Badge
                    variant="outline"
                    className="flex flex-col gap-1 rounded-lg border-green-300 bg-gradient-to-r from-green-50 to-green-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
                  >
                    <span className="font-bold text-green-700">
                      Acompanhamentos:
                    </span>
                    <span className="text-green-800">
                      {item.selectedOptions.acompanhamentos.join(", ")}
                    </span>
                  </Badge>
                )}
              </div>
            )}

            {item.addons && item.addons.length > 0 && (
              <Badge
                variant="outline"
                className="mt-2 flex flex-col gap-1 rounded-lg border-pink-400 bg-gradient-to-r from-pink-50 to-pink-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
              >
                <span className="font-bold text-pink-700">Adicionais:</span>
                <span className="text-pink-800">
                  {item.addons.map((addon, index) => (
                    <span key={addon.id}>
                      {addon.name} (+R$ {addon.price.toFixed(2)})
                      {index < item.addons!.length - 1 && ", "}
                    </span>
                  ))}
                </span>
              </Badge>
            )}

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

      <Dialog open={showAddons} onOpenChange={setShowAddons}>
        <DialogContent className="w-full max-w-[95vw] p-4 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Adicionar Acompanhamentos/Adicionais
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold md:text-base">Adicionais</h3>
              <ScrollArea className="h-[50vh] rounded-md border border-gray-200 p-2 sm:h-[60vh]">
                <div className="space-y-2">
                  {adicionais.map((adicional) => (
                    <Button
                      key={adicional.id}
                      variant={
                        selectedAddons.some((a) => a.id === adicional.id)
                          ? "default"
                          : "outline"
                      }
                      className={`w-full justify-between py-2 text-xs shadow-sm md:text-sm ${
                        selectedAddons.some((a) => a.id === adicional.id)
                          ? "bg-pink-300 text-white hover:bg-pink-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setSelectedAddons((prev) =>
                          prev.some((a) => a.id === adicional.id)
                            ? prev.filter((a) => a.id !== adicional.id)
                            : [...prev, adicional]
                        )
                      }
                    >
                      <span>{adicional.name}</span>
                      <span>+ R$ {adicional.price.toFixed(2)}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold md:text-base">
                Acompanhamentos
              </h3>
              <ScrollArea className="h-[50vh] rounded-md border border-gray-200 p-2 sm:h-[60vh]">
                <div className="space-y-2">
                  {acompanhamentos.map((acomp) => (
                    <Button
                      key={acomp.id}
                      variant={
                        selectedAddons.some((a) => a.id === acomp.id)
                          ? "default"
                          : "outline"
                      }
                      className={`w-full justify-between py-2 text-xs shadow-sm md:text-sm ${
                        selectedAddons.some((a) => a.id === acomp.id)
                          ? "bg-pink-500 text-black hover:bg-pink-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setSelectedAddons((prev) =>
                          prev.some((a) => a.id === acomp.id)
                            ? prev.filter((a) => a.id !== acomp.id)
                            : [...prev, { ...acomp, price: 2.0 }]
                        )
                      }
                    >
                      <span>{acomp.name}</span>
                      <span>+ R$ 2,00</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddons(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAddons}
              disabled={selectedAddons.length === 0}
              className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
            >
              Adicionar Selecionados
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
