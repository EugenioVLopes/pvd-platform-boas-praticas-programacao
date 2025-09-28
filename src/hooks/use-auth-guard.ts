import { useCallback, useEffect, useState } from "react";

export interface UseAuthGuardOptions {
  persistAuth?: boolean;
  showLoading?: boolean;
}

export interface UseAuthGuardReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "auth";

export function useAuthGuard({
  persistAuth = true,
  showLoading = true,
}: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(showLoading);
  const [error, setError] = useState<string | null>(null);

  const checkStoredAuth = useCallback(() => {
    if (!persistAuth) return false;

    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      return !!storedAuth;
    } catch (err) {
      setError("Erro ao acessar dados de autenticação");
      return false;
    }
  }, [persistAuth]);

  const login = useCallback(() => {
    try {
      if (persistAuth) {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
      }
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError("Erro ao salvar dados de autenticação");
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    try {
      if (persistAuth) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      setError("Erro ao remover dados de autenticação");
    }
  }, [persistAuth]);

  useEffect(() => {
    const isStoredAuth = checkStoredAuth();
    setIsAuthenticated(isStoredAuth);
    setIsLoading(false);
  }, [checkStoredAuth]);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
