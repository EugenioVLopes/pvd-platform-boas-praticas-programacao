import { AuthGuard } from "@/components/auth/auth-guard";

import ProductManagement from "./_components/product-management";

export default function ProductsPage() {
  return (
    <AuthGuard>
      <ProductManagement />
    </AuthGuard>
  );
}
