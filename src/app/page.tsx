"use client";

import { AuthGuard } from "@/features/auth";
import { SalesProcessing } from "@/features/sales";

export default function HomePage() {
  return (
    <AuthGuard>
      <SalesProcessing />
    </AuthGuard>
  );
}
