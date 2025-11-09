"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/features/products";

interface NewProductData {
  name: string;
  price: string;
  category: string;
  type: string;
}

interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, "id">) => void;
}

export function AddProductForm({ onAddProduct }: AddProductFormProps) {
  const [newProduct, setNewProduct] = useState<NewProductData>({
    name: "",
    price: "",
    category: "",
    type: "unit",
  });

  const handleSubmit = () => {
    if (
      !newProduct.name.trim() ||
      !newProduct.price ||
      !newProduct.category.trim()
    ) {
      return;
    }

    const productData: Omit<Product, "id"> = {
      name: newProduct.name.trim(),
      price: Number.parseFloat(newProduct.price),
      category: newProduct.category.trim(),
      type: newProduct.type as "unit" | "weight",
    };

    onAddProduct(productData);

    resetForm();
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      category: "",
      type: "unit",
    });
  };

  const updateField = (field: keyof NewProductData, value: string) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    newProduct.name.trim() && newProduct.price && newProduct.category.trim();

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Nome do Produto"
        value={newProduct.name}
        onChange={(e) => updateField("name", e.target.value)}
      />
      <Input
        placeholder="Preço"
        type="number"
        min="0"
        step="0.01"
        value={newProduct.price}
        onChange={(e) => updateField("price", e.target.value)}
      />
      <Input
        placeholder="Categoria"
        value={newProduct.category}
        onChange={(e) => updateField("category", e.target.value)}
      />
      <Select
        value={newProduct.type}
        onValueChange={(value) => updateField("type", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de Produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unit">Unitário</SelectItem>
          <SelectItem value="weight">Por Peso</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleSubmit} disabled={!isFormValid}>
        Adicionar Produto
      </Button>
    </div>
  );
}
