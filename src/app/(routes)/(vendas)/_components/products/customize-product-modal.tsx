"use client";

import { Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product, useProducts } from "@/features/products";

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
    if (!product) return;

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
    setSearch("");
  };

  const isValid = () => {
    if (!product) return false;

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

  const removeOption = (
    category: keyof typeof selectedOptions,
    name: string
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item !== name),
    }));
  };

  const getSelectedCount = (category: keyof typeof selectedOptions) => {
    return selectedOptions[category].length;
  };

  const getMaxAllowed = (category: keyof typeof selectedOptions) => {
    if (!product) return 0;
    return product.options?.[category] || 0;
  };

  const isCategoryFull = (category: keyof typeof selectedOptions) => {
    return getSelectedCount(category) >= getMaxAllowed(category);
  };

  const getCommandItemClassName = (
    isSelected: boolean,
    isDisabled: boolean
  ) => {
    const baseClasses =
      "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors";

    if (isSelected) {
      return `${baseClasses} bg-primary/10 font-medium text-primary`;
    }

    if (isDisabled) {
      return `${baseClasses} cursor-not-allowed opacity-50`;
    }

    return `${baseClasses} hover:bg-accent`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!h-full max-h-[80vh] !w-full overflow-hidden p-0 sm:!max-w-6xl">
        <DialogHeader className="justify-center border-b px-6 py-4">
          <DialogTitle className="text-2xl font-semibold">
            Personalizar {product?.name || ""}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Selecione as opções desejadas para personalizar seu produto. Cada
            categoria tem um limite máximo de seleções.
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="flex flex-col space-y-6 overflow-y-auto px-6 py-6">
            {(selectedOptions.frutas.length > 0 ||
              selectedOptions.cremes.length > 0 ||
              selectedOptions.acompanhamentos.length > 0) && (
              <div className="space-y-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-foreground">
                  Seleções atuais:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.frutas.map((item) => (
                    <Badge
                      key={`frutas-${item}`}
                      variant="default"
                      className="flex items-center gap-1.5 pr-1 transition-all hover:scale-105"
                    >
                      <span className="text-xs font-medium">{item}</span>
                      <button
                        onClick={() => removeOption("frutas", item)}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        type="button"
                        aria-label={`Remover ${item}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedOptions.cremes.map((item) => (
                    <Badge
                      key={`cremes-${item}`}
                      variant="default"
                      className="flex items-center gap-1.5 pr-1 transition-all hover:scale-105"
                    >
                      <span className="text-xs font-medium">{item}</span>
                      <button
                        onClick={() => removeOption("cremes", item)}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        type="button"
                        aria-label={`Remover ${item}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedOptions.acompanhamentos.map((item) => (
                    <Badge
                      key={`acompanhamentos-${item}`}
                      variant="default"
                      className="flex items-center gap-1.5 pr-1 transition-all hover:scale-105"
                    >
                      <span className="text-xs font-medium">{item}</span>
                      <button
                        onClick={() => removeOption("acompanhamentos", item)}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        type="button"
                        aria-label={`Remover ${item}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">
                    Frutas
                  </h3>
                  <Badge
                    variant={isCategoryFull("frutas") ? "default" : "outline"}
                    className="text-xs font-medium"
                  >
                    {getSelectedCount("frutas")}/{getMaxAllowed("frutas")}
                  </Badge>
                </div>
                <Command className="rounded-lg border shadow-sm">
                  <CommandInput
                    placeholder="Buscar frutas..."
                    value={frutasSearch}
                    onValueChange={setFrutasSearch}
                    className="h-10"
                  />
                  <CommandList className="h-[240px] max-h-[240px] overflow-y-auto">
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                      Nenhuma fruta encontrada.
                    </CommandEmpty>
                    <CommandGroup>
                      {options.frutas.map((option) => {
                        const isSelected = selectedOptions.frutas.includes(
                          option.name
                        );
                        const isDisabled =
                          !isSelected && isCategoryFull("frutas");
                        return (
                          <CommandItem
                            key={option.id}
                            value={option.name}
                            onSelect={() =>
                              !isDisabled &&
                              handleOptionToggle(
                                "frutas",
                                option.name,
                                setFrutasSearch
                              )
                            }
                            disabled={isDisabled}
                            className={getCommandItemClassName(
                              isSelected,
                              isDisabled
                            )}
                          >
                            <span className="text-sm">{option.name}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">
                    Cremes
                  </h3>
                  <Badge
                    variant={isCategoryFull("cremes") ? "default" : "outline"}
                    className="text-xs font-medium"
                  >
                    {getSelectedCount("cremes")}/{getMaxAllowed("cremes")}
                  </Badge>
                </div>
                <Command className="rounded-lg border shadow-sm">
                  <CommandInput
                    placeholder="Buscar cremes..."
                    value={cremesSearch}
                    onValueChange={setCremesSearch}
                    className="h-10"
                  />
                  <CommandList className="h-[240px] max-h-[240px] overflow-y-auto">
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                      Nenhum creme encontrado.
                    </CommandEmpty>
                    <CommandGroup>
                      {options.cremes.map((option) => {
                        const isSelected = selectedOptions.cremes.includes(
                          option.name
                        );
                        const isDisabled =
                          !isSelected && isCategoryFull("cremes");
                        return (
                          <CommandItem
                            key={option.id}
                            value={option.name}
                            onSelect={() =>
                              !isDisabled &&
                              handleOptionToggle(
                                "cremes",
                                option.name,
                                setCremesSearch
                              )
                            }
                            disabled={isDisabled}
                            className={getCommandItemClassName(
                              isSelected,
                              isDisabled
                            )}
                          >
                            <span className="text-sm">{option.name}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">
                    Acompanhamentos
                  </h3>
                  <Badge
                    variant={
                      isCategoryFull("acompanhamentos") ? "default" : "outline"
                    }
                    className="text-xs font-medium"
                  >
                    {getSelectedCount("acompanhamentos")}/
                    {getMaxAllowed("acompanhamentos")}
                  </Badge>
                </div>
                <Command className="rounded-lg border shadow-sm">
                  <CommandInput
                    placeholder="Buscar acompanhamentos..."
                    value={acompanhamentosSearch}
                    onValueChange={setAcompanhamentosSearch}
                    className="h-10"
                  />
                  <CommandList className="h-[240px] max-h-[240px] overflow-y-auto">
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                      Nenhum acompanhamento encontrado.
                    </CommandEmpty>
                    <CommandGroup>
                      {options.acompanhamentos.map((option) => {
                        const isSelected =
                          selectedOptions.acompanhamentos.includes(option.name);
                        const isDisabled =
                          !isSelected && isCategoryFull("acompanhamentos");
                        return (
                          <CommandItem
                            key={option.id}
                            value={option.name}
                            onSelect={() =>
                              !isDisabled &&
                              handleOptionToggle(
                                "acompanhamentos",
                                option.name,
                                setAcompanhamentosSearch
                              )
                            }
                            disabled={isDisabled}
                            className={getCommandItemClassName(
                              isSelected,
                              isDisabled
                            )}
                          >
                            <span className="text-sm">{option.name}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(selectedOptions)}
            disabled={!isValid()}
            type="button"
            className="min-w-[160px]"
          >
            Confirmar Personalização
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
