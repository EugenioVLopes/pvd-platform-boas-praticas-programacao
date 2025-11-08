"use client";

import { memo, type ReactNode } from "react";

import { useAuthGuard } from "@/hooks/core/use-auth-guard";

import { AuthContainer } from "./auth-container";
import { AuthLoading } from "./auth-loading";

export interface AuthGuardProps {
  children: ReactNode;
  title?: string;
  persistAuth?: boolean;
  showLoading?: boolean;
  minHeight?: string;
}

export const AuthGuard = memo(function AuthGuard({
  children,
  title = "Acesso Restrito",
  persistAuth = true,
  showLoading = true,
  minHeight = "400px",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, error, login } = useAuthGuard({
    persistAuth,
    showLoading,
  });

  if (isLoading) {
    return (
      <AuthLoading
        minHeight={minHeight}
        message="Verificando suas credenciais..."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthContainer
        title={title}
        minHeight={minHeight}
        onLogin={login}
        error={error}
      />
    );
  }

  return <>{children}</>;
});

AuthGuard.displayName = "AuthGuard";
