"use client";

import { useProducts } from "@/hooks/business/use-products";
import { Product } from "@/types/product";

import { AddProductForm } from "./add-product-form";
import { ProductList } from "./product-list";

/**
 * Container Component responsável por:
 * - Gerenciar o estado global dos produtos (via hook)
 * - Coordenar a comunicação entre componentes filhos
 * - Implementar a lógica de negócio (adicionar produtos)
 *
 * Princípios aplicados:
 * - Container/Presentational Pattern: Separa lógica de apresentação
 * - Single Responsibility Principle: Apenas coordena e gerencia estado
 * - Composition over Inheritance: Compõe funcionalidades através de componentes
 * - Dependency Injection: Injeta dependências nos componentes filhos
 */
export default function ProductManagement() {
  const { products, setProducts } = useProducts();

  /**
   * Função responsável por adicionar um novo produto à lista.
   * Implementa a lógica de negócio de forma centralizada.
   */
  const handleAddProduct = (productData: Omit<Product, "id">) => {
    // Gera um ID único baseado no timestamp e um número aleatório
    // Solução mais robusta que usar apenas o length do array
    const newId = Date.now() + Math.floor(Math.random() * 1000);

    const newProduct: Product = {
      ...productData,
      id: newId,
    };

    // Adiciona o produto à lista existente
    setProducts([...products, newProduct]);
  };

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Gerenciamento de Produtos</h2>
      </header>

      <section aria-label="Formulário de adição de produtos">
        <AddProductForm onAddProduct={handleAddProduct} />
      </section>

      <section aria-label="Lista de produtos cadastrados">
        <ProductList products={products} />
      </section>
    </div>
  );
}
