"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useProducts } from "@/hooks/use-products";
import { Product } from "@/types/product";

import { AddProductForm } from "./_components/add-product-form";
import { ProductList } from "./_components/product-list";

export default function ProductsPage() {
  const { products, addProduct } = useProducts();

  const handleAddProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
    };

    addProduct(newProduct);
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Produtos</h2>

        <AddProductForm onAddProduct={handleAddProduct} />

        <ProductList products={products} />
      </div>
    </AuthGuard>
  );
}
