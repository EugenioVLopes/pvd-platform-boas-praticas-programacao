import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/constants/products";
import { Product } from "@/types/product";

import { ProductCategories } from "./product-categories";
import { ProductList } from "./product-list";

function getAvailableCategories(products: Product[]): ProductCategory[] {
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const validCategories = Object.values(PRODUCT_CATEGORIES);
  return categories.filter((category): category is ProductCategory =>
    validCategories.includes(category as ProductCategory)
  );
}

interface ProductsViewProps {
  selectedCategory: ProductCategory | null;
  products: Product[];
  onCategorySelect: (category: ProductCategory) => void;
  onProductSelect: (product: Product) => void;
}

export function ProductsView({
  selectedCategory,
  products,
  onCategorySelect,
  onProductSelect,
}: ProductsViewProps) {
  const categories = getAvailableCategories(products);

  return (
    <>
      <ProductCategories
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onCategorySelect}
      />
      {selectedCategory && (
        <ProductList
          products={products.filter((p) => p.category === selectedCategory)}
          onProductSelect={onProductSelect}
        />
      )}
    </>
  );
}
