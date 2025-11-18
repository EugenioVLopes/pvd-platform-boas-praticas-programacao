import { Badge } from "@/components/ui/badge";
import { SaleItem } from "@/features/products";

interface SelectedOptionsBadgesProps {
  readonly selectedOptions: SaleItem["selectedOptions"];
}

export function SelectedOptionsBadges({
  selectedOptions,
}: SelectedOptionsBadgesProps) {
  if (!selectedOptions) return null;

  const hasFrutas = selectedOptions.frutas.length > 0;
  const hasCremes = selectedOptions.cremes.length > 0;
  const hasAcompanhamentos = selectedOptions.acompanhamentos.length > 0;

  if (!hasFrutas && !hasCremes && !hasAcompanhamentos) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {hasFrutas && (
        <Badge
          variant="outline"
          className="flex flex-col gap-1 rounded-lg border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
        >
          <span className="font-bold text-orange-700">Frutas:</span>
          <span className="text-orange-800">
            {selectedOptions.frutas.join(", ")}
          </span>
        </Badge>
      )}
      {hasCremes && (
        <Badge
          variant="outline"
          className="flex flex-col gap-1 rounded-lg border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
        >
          <span className="font-bold text-blue-700">Cremes:</span>
          <span className="text-blue-800">
            {selectedOptions.cremes.join(", ")}
          </span>
        </Badge>
      )}
      {hasAcompanhamentos && (
        <Badge
          variant="outline"
          className="flex flex-col gap-1 rounded-lg border-green-300 bg-gradient-to-r from-green-50 to-green-100/50 px-3 py-1.5 text-xs font-medium shadow-sm md:flex-row md:items-center"
        >
          <span className="font-bold text-green-700">Acompanhamentos:</span>
          <span className="text-green-800">
            {selectedOptions.acompanhamentos.join(", ")}
          </span>
        </Badge>
      )}
    </div>
  );
}
