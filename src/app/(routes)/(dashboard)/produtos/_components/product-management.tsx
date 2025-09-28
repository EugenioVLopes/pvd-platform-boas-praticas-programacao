"use client";

import { useProducts } from "@/hooks/use-products";
import { Product } from "@/types/product";

import { AddProductForm } from "./add-product-form";
import { ProductList } from "./product-list";

export default function ProductManagement() {
  const { products, addProduct } = useProducts();

  const handleAddProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
    };

    addProduct(newProduct);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de Produtos</h2>

      <AddProductForm onAddProduct={handleAddProduct} />

      <ProductList products={products} />
    </div>
  );
}
