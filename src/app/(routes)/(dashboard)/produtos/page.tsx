"use client";

import { AuthGuard } from "@/features/auth";
import {
  AddProductForm,
  Product,
  ProductList,
  useProducts,
} from "@/features/products";

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
