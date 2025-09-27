"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";

export default function ProductManagement() {
  const { products, setProducts } = useProducts();
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    type: "unit",
  });

  const addProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.category) {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          name: newProduct.name,
          price: Number.parseFloat(newProduct.price),
          category: newProduct.category,
          type: newProduct.type as "unit" | "weight",
        },
      ]);
      setNewProduct({ name: "", price: "", category: "", type: "unit" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gerenciamento de Produtos</h2>
      <div className="flex space-x-2">
        <Input
          placeholder="Nome do Produto"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <Input
          placeholder="Preço"
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <Input
          placeholder="Categoria"
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
        />
        <Select
          value={newProduct.type}
          onValueChange={(value) =>
            setNewProduct({ ...newProduct, type: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unit">Unitário</SelectItem>
            <SelectItem value="weight">Por Peso</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={addProduct}>Adicionar Produto</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Preço:{" "}
                {product.type === "weight"
                  ? `R$ ${product.price.toFixed(2)}/kg`
                  : `R$ ${product.price.toFixed(2)}`}
              </p>
              <p>Categoria: {product.category}</p>
              <p>Tipo: {product.type === "weight" ? "Por Peso" : "Unitário"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
