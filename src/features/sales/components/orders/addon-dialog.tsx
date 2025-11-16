import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/features/products";
import { ProductList } from "./product-list";

interface AddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adicionais: Product[];
  acompanhamentos: Product[];
  selectedAddons: Product[];
  onToggleAddon: (product: Product) => void;
  onToggleAcompanhamento: (product: Product) => void;
  onConfirm: () => void;
}

export function AddonDialog({
  open,
  onOpenChange,
  adicionais,
  acompanhamentos,
  selectedAddons,
  onToggleAddon,
  onToggleAcompanhamento,
  onConfirm,
}: AddonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] p-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            Adicionar Acompanhamentos/Adicionais
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProductList
            title="Adicionais"
            products={adicionais}
            selectedAddons={selectedAddons}
            onToggle={onToggleAddon}
          />
          <ProductList
            title="Acompanhamentos"
            products={acompanhamentos}
            selectedAddons={selectedAddons}
            onToggle={onToggleAcompanhamento}
            priceOverride={2.0}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={selectedAddons.length === 0}
            className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
          >
            Adicionar Selecionados
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

