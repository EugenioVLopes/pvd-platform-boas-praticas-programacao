"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/features/products";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Nenhum produto cadastrado ainda.
          </p>
        </CardContent>
      </Card>
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

function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Categoria:</span> {product.category}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Tipo:</span>
            {formatProductType(product.type)}
          </p>
          <p className="text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function formatProductType(type: string): string {
  const typeMap: Record<string, string> = {
    unit: "Unitário",
    weight: "Por Peso",
  };
  return typeMap[type] || type;
}
