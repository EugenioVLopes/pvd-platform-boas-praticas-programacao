"use client";

import { Coffee, IceCream, Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ProductCategory } from "@/lib/constants/products";

interface ProductCategoriesProps {
  categories: ProductCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: ProductCategory) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Sorvetes: <IceCream className="size-10" />,
  Milkshakes: <Coffee className="size-10" />,
  "Milkshakes Premium": <Coffee className="size-10" />,
  "Monte do Seu Jeito": <Plus className="size-10" />,
};

export function ProductCategories({
  categories,
  onSelectCategory,
}: ProductCategoriesProps) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Card
              key={category}
              className="cursor-pointer border border-gray-200 transition-all duration-200 hover:border-primary hover:shadow-sm"
              onClick={() => onSelectCategory(category)}
            >
              <CardContent className="flex min-h-[100px] flex-col items-center justify-center p-6 sm:min-h-[160px]">
                <div className="text-primary">
                  {categoryIcons[category] || <Plus className="size-10" />}
                </div>
                <span className="mt-2 truncate text-center text-xl font-medium text-gray-700">
                  {category}
                </span>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-6 text-center text-gray-500">
            Nenhuma categoria disponível
          </div>
        )}
      </div>
    </div>
  );
}
