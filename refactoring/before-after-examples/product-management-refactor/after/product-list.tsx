"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/features/products";

interface ProductListProps {
  products: Product[];
}

/**
 * Componente responsável apenas por renderizar a lista de produtos.
 *
 * Princípios aplicados:
 * - Single Responsibility Principle: Apenas renderiza a lista
 * - Pure Component: Não possui estado interno
 * - Reusabilidade: Pode ser usado em qualquer lugar que precise exibir produtos
 * - Separation of Concerns: Não conhece a origem dos dados
 */
export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>Nenhum produto cadastrado ainda.</p>
        <p className="text-sm">
          Use o formulário acima para adicionar produtos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/**
 * Componente auxiliar para renderizar um card individual de produto.
 * Extraído para melhorar a legibilidade e permitir reutilização.
 */
function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <p>Preço: {formatPrice(product.price, product.type)}</p>
        <p>Categoria: {product.category}</p>
        <p>Tipo: {formatProductType(product.type)}</p> */}
      </CardContent>
    </Card>
  );
}

/**
 * Função utilitária para formatação de preço.
 * Extraída para evitar duplicação de código e facilitar manutenção.
 */
function formatPrice(price: number, type: "unit" | "weight"): string {
  const formattedPrice = `R$ ${price.toFixed(2)}`;
  return type === "weight" ? `${formattedPrice}/kg` : formattedPrice;
}

/**
 * Função utilitária para formatação do tipo de produto.
 * Centraliza a lógica de tradução dos tipos.
 */
function formatProductType(type: "unit" | "weight"): string {
  return type === "weight" ? "Por Peso" : "Unitário";
}
