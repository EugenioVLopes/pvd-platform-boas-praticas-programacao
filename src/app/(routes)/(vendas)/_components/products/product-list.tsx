import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/features/products";

interface ProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductList({ products, onProductSelect }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.length > 0 ? (
        products.map((product) => (
          <Card
            key={product.id}
            className="group cursor-pointer border border-pink-200 transition-all duration-200 hover:border-primary hover:shadow-md"
            onClick={() => onProductSelect(product)}
          >
            <CardHeader className="ice-cream-gradient rounded-t-lg p-3">
              <CardTitle className="truncate text-center text-sm font-semibold text-black/80 md:text-lg">
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 pt-3 text-center">
              <p className="text-lg font-bold text-primary md:text-xl">
                {product.type === "weight"
                  ? `R$ ${product.price.toFixed(2)}/kg`
                  : `R$ ${product.price.toFixed(2)}`}
              </p>
              <p className="text-xs text-black text-muted-foreground md:text-sm">
                {product.category}
              </p>
              <p className="text-xs italic text-muted-foreground">
                {product.type === "weight" ? "Vendido por peso" : "Unitário"}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full py-8 text-center text-gray-500">
          Nenhum produto encontrado nesta categoria
        </div>
      )}
    </div>
  );
}
