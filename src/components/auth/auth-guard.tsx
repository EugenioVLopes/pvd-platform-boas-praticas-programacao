"use client";

import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";

import { Auth } from "./auth-form";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aqui podemos verificar se existe um token no localStorage depois
    const auth = localStorage.getItem("auth");
    setIsAuthenticated(!!auth);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <PulseLoader
          color="#ff04da"
          margin={10}
          size={45}
          speedMultiplier={0.5}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Auth
          onLogin={() => {
            localStorage.setItem("auth", "true");
            setIsAuthenticated(true);
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
