import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/features/products";
import { ProductButton } from "./product-button";

interface ProductListProps {
  readonly title: string;
  readonly products: Product[];
  readonly selectedAddons: Product[];
  readonly onToggle: (product: Product) => void;
  readonly priceOverride?: number;
}

export function ProductList({
  title,
  products,
  selectedAddons,
  onToggle,
  priceOverride,
}: ProductListProps) {
  const isSelected = (product: Product) =>
    selectedAddons.some((a) => a.id === product.id);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold md:text-base">{title}</h3>
      <ScrollArea className="h-[50vh] rounded-md border border-gray-200 p-2 sm:h-[60vh]">
        <div className="space-y-2">
          {products.map((product) => (
            <ProductButton
              key={product.id}
              product={product}
              isSelected={isSelected(product)}
              onToggle={() => onToggle(product)}
              priceOverride={priceOverride}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
