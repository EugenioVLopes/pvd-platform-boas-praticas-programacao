"use client";

import { useEffect, useState } from "react";

import { Auth } from "./auth-form";

interface ReportAuthGuardProps {
  children: React.ReactNode;
}

export function ReportAuthGuard({ children }: ReportAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <h2 className="mb-4 text-center text-2xl font-bold">
            Acesso Restrito
          </h2>
          <Auth onLogin={() => setIsAuthenticated(true)} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
