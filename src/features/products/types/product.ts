export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  type: "unit" | "weight" | "option" | "addon";
  options?: {
    frutas: number;
    cremes: number;
    acompanhamentos: number;
  };
}

export interface SaleItem {
  product: Product;
  quantity?: number;
  weight?: number; // em gramas, para produtos vendidos por peso
  selectedOptions?: {
    frutas: string[];
    cremes: string[];
    acompanhamentos: string[];
  };
  addons?: Product[];
}
