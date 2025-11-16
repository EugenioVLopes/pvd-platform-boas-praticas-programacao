import { Button } from "@/components/ui/button";
import { Product } from "@/features/products";

interface ProductButtonProps {
  product: Product;
  isSelected: boolean;
  onToggle: () => void;
  priceOverride?: number;
}

export function ProductButton({
  product,
  isSelected,
  onToggle,
  priceOverride,
}: ProductButtonProps) {
  const price = priceOverride ?? product.price;
  const displayPrice = priceOverride ? "2,00" : price.toFixed(2);
  const bgColor = isSelected
    ? priceOverride
      ? "bg-pink-500 text-black hover:bg-pink-600"
      : "bg-pink-300 text-white hover:bg-pink-600"
    : "bg-white hover:bg-gray-50";

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`w-full justify-between py-2 text-xs shadow-sm md:text-sm ${bgColor}`}
      onClick={onToggle}
    >
      <span>{product.name}</span>
      <span>+ R$ {displayPrice}</span>
    </Button>
  );
}

