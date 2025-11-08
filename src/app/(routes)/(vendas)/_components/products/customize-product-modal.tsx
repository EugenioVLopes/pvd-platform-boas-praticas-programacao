"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProducts } from "@/hooks/business/use-products";
import { Product } from "@/types/product";

interface CustomizeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (selectedOptions: {
    frutas: string[];
    cremes: string[];
    acompanhamentos: string[];
  }) => void;
}

export function CustomizeProductModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: CustomizeProductModalProps) {
  const { products } = useProducts();

  const emptyOptions = useMemo(
    () => ({
      frutas: [] as string[],
      cremes: [] as string[],
      acompanhamentos: [] as string[],
    }),
    []
  );

  const [selectedOptions, setSelectedOptions] = useState(emptyOptions);
  const [frutasSearch, setFrutasSearch] = useState("");
  const [cremesSearch, setCremesSearch] = useState("");
  const [acompanhamentosSearch, setAcompanhamentosSearch] = useState("");

  // Resetar opções e buscas quando o modal for aberto
  useEffect(() => {
    if (isOpen) {
      setSelectedOptions(emptyOptions);
      setFrutasSearch("");
      setCremesSearch("");
      setAcompanhamentosSearch("");
    }
  }, [isOpen, emptyOptions]);

  const options = {
    frutas: products.filter((p) => p.category === "Frutas"),
    cremes: products.filter((p) => p.category === "Cremes"),
    acompanhamentos: products.filter((p) => p.category === "Acompanhamentos"),
  };

  const handleOptionToggle = (
    category: keyof typeof selectedOptions,
    name: string,
    setSearch: (value: string) => void
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[category];
      const maxAllowed = product.options?.[category] || 0;

      if (current.includes(name)) {
        return {
          ...prev,
          [category]: current.filter((item) => item !== name),
        };
      }

      if (current.length >= maxAllowed) {
        return prev;
      }

      return {
        ...prev,
        [category]: [...current, name],
      };
    });
    setSearch(""); // Limpa o campo de busca após seleção
  };

  const isValid = () => {
    return (
      selectedOptions.frutas.length <= (product.options?.frutas || 0) &&
      selectedOptions.cremes.length <= (product.options?.cremes || 0) &&
      selectedOptions.acompanhamentos.length <=
        (product.options?.acompanhamentos || 0) &&
      (selectedOptions.frutas.length > 0 ||
        selectedOptions.cremes.length > 0 ||
        selectedOptions.acompanhamentos.length > 0)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle>Personalizar {product?.name || ""}</DialogTitle>
        </DialogHeader>

        {product && (
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Frutas */}
              <div>
                <h3 className="mb-2 text-sm font-semibold md:text-base">
                  Frutas ({selectedOptions.frutas.length}/
                  {product.options?.frutas})
                </h3>
                <Command className="rounded-lg border border-gray-200">
                  <CommandInput
                    placeholder="Buscar frutas..."
                    value={frutasSearch}
                    onValueChange={setFrutasSearch}
                  />
                  <CommandList className="h-[200px] overflow-y-auto">
                    <CommandEmpty>Nenhuma fruta encontrada.</CommandEmpty>
                    <CommandGroup>
                      {options.frutas.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() =>
                            handleOptionToggle(
                              "frutas",
                              option.name,
                              setFrutasSearch
                            )
                          }
                          className="flex cursor-pointer items-center justify-between"
                        >
                          <span>{option.name}</span>
                          {selectedOptions.frutas.includes(option.name) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              {/* Cremes */}
              <div>
                <h3 className="mb-2 text-sm font-semibold md:text-base">
                  Cremes ({selectedOptions.cremes.length}/
                  {product.options?.cremes})
                </h3>
                <Command className="rounded-lg border border-gray-200">
                  <CommandInput
                    placeholder="Buscar cremes..."
                    value={cremesSearch}
                    onValueChange={setCremesSearch}
                  />
                  <CommandList className="h-[200px] overflow-y-auto">
                    <CommandEmpty>Nenhum creme encontrado.</CommandEmpty>
                    <CommandGroup>
                      {options.cremes.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() =>
                            handleOptionToggle(
                              "cremes",
                              option.name,
                              setCremesSearch
                            )
                          }
                          className="flex cursor-pointer items-center justify-between"
                        >
                          <span>{option.name}</span>
                          {selectedOptions.cremes.includes(option.name) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              {/* Acompanhamentos */}
              <div>
                <h3 className="mb-2 text-sm font-semibold md:text-base">
                  Acompanhamentos ({selectedOptions.acompanhamentos.length}/
                  {product.options?.acompanhamentos})
                </h3>
                <Command className="rounded-lg border border-gray-200">
                  <CommandInput
                    placeholder="Buscar acompanhamentos..."
                    value={acompanhamentosSearch}
                    onValueChange={setAcompanhamentosSearch}
                  />
                  <CommandList className="h-[200px] overflow-y-auto">
                    <CommandEmpty>
                      Nenhum acompanhamento encontrado.
                    </CommandEmpty>
                    <CommandGroup>
                      {options.acompanhamentos.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() =>
                            handleOptionToggle(
                              "acompanhamentos",
                              option.name,
                              setAcompanhamentosSearch
                            )
                          }
                          className="flex cursor-pointer items-center justify-between"
                        >
                          <span>{option.name}</span>
                          {selectedOptions.acompanhamentos.includes(
                            option.name
                          ) && <Check className="h-4 w-4 text-primary" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => onConfirm(selectedOptions)}
                disabled={!isValid()}
                className="bg-primary hover:bg-primary/90"
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
