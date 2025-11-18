import { Badge } from "@/components/ui/badge";
import { Product } from "@/features/products";

interface AddonsBadgeProps {
  readonly addons: Product[];
}

export function AddonsBadge({ addons }: AddonsBadgeProps) {
  if (!addons || addons.length === 0) return null;

  return (
    <Badge
      variant="outline"
      className="mt-2 flex flex-col gap-1 rounded-lg border-pink-400 bg-gradient-to-r from-pink-50 to-pink-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
    >
      <span className="font-bold text-pink-700">Adicionais:</span>
      <span className="text-pink-800">
        {addons.map((addon, index) => (
          <span key={addon.id}>
            {addon.name} (+R$ {addon.price.toFixed(2)})
            {index < addons.length - 1 && ", "}
          </span>
        ))}
      </span>
    </Badge>
  );
}
