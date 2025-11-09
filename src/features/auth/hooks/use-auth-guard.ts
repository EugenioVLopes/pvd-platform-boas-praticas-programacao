import { useCallback, useEffect, useState } from "react";

/**
 * Opções de configuração para o hook useAuthGuard
 */
export interface UseAuthGuardOptions {
  /** Se deve persistir o estado de autenticação no localStorage (padrão: true) */
  persistAuth?: boolean;
  /** Se deve mostrar estado de loading durante inicialização (padrão: true) */
  showLoading?: boolean;
}

/**
 * Retorno do hook useAuthGuard
 */
export interface UseAuthGuardReturn {
  /** Estado atual de autenticação do usuário */
  isAuthenticated: boolean;
  /** Indica se o hook está carregando dados de autenticação */
  isLoading: boolean;
  /** Mensagem de erro, se houver */
  error: string | null;
  /** Função para realizar login do usuário */
  login: () => void;
  /** Função para realizar logout do usuário */
  logout: () => void;
  /** Função para limpar erros manualmente */
  clearError: () => void;
}

const AUTH_STORAGE_KEY = "auth";

/**
 * Hook para gerenciar autenticação de usuários com persistência opcional
 *
 * Este hook fornece funcionalidades completas de autenticação incluindo:
 * - Verificação de estado de autenticação
 * - Persistência no localStorage (opcional)
 * - Gerenciamento de estados de loading e erro
 * - Funções para login e logout
 *
 * @param options - Opções de configuração do hook
 * @param options.persistAuth - Se deve persistir autenticação no localStorage (padrão: true)
 * @param options.showLoading - Se deve mostrar loading durante inicialização (padrão: true)
 *
 * @returns Objeto com estado e ações de autenticação
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { isAuthenticated, isLoading, error, login, logout } = useAuthGuard({
 *     persistAuth: true,
 *     showLoading: true
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <ErrorMessage message={error} />;
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <button onClick={login}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthGuard({
  persistAuth = true,
  showLoading = true,
}: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(showLoading);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback(
    (errorMessage: string, originalError?: unknown) => {
      console.error(`[useAuthGuard] ${errorMessage}:`, originalError);
      setError(errorMessage);
    },
    []
  );

  const checkStoredAuth = useCallback(() => {
    if (!persistAuth) return false;

    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      return !!storedAuth;
    } catch (err) {
      handleError("Falha ao verificar dados de autenticação armazenados", err);
      return false;
    }
  }, [persistAuth, handleError]);

  const login = useCallback(() => {
    try {
      setIsLoading(true);

      if (persistAuth) {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
      }

      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setIsAuthenticated(false);
      handleError(
        "Falha ao realizar login. Verifique se o armazenamento local está disponível",
        err
      );
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth, handleError]);

  const logout = useCallback(() => {
    try {
      setIsLoading(true);

      if (persistAuth) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      handleError(
        "Falha ao realizar logout. Os dados podem não ter sido removidos completamente",
        err
      );
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth, handleError]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isStoredAuth = checkStoredAuth();
        setIsAuthenticated(isStoredAuth);
      } catch (err) {
        handleError("Falha ao inicializar estado de autenticação", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [checkStoredAuth, handleError]);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
