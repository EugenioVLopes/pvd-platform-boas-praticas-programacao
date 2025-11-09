"use client";

import { SalesProcessing } from "@/app/(routes)/(vendas)/_components/sales-processing";
import { AuthGuard } from "@/features/auth";

export default function HomePage() {
  return (
    <AuthGuard>
      <SalesProcessing />
    </AuthGuard>
  );
}
