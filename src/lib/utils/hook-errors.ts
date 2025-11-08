import { useCallback, useState } from "react";

export class HookError extends Error {
  constructor(
    message: string,
    public readonly hookName: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "HookError";
  }
}

export function normalizeError(
  error: unknown,
  fallbackMessage = "Erro inesperado"
): string {
  if (error === null || error === undefined) {
    return fallbackMessage;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallbackMessage;
}

export function createHookError(
  message: string,
  hookName: string,
  originalError?: unknown
): HookError {
  const normalizedOriginal =
    originalError instanceof Error ? originalError : undefined;
  return new HookError(message, hookName, normalizedOriginal);
}

export interface UseErrorHandlerReturn {
  error: string | null;
  setError: (error: HookError) => void;
  clearError: () => void;
  handleAsyncError: <T>(promise: Promise<T>) => Promise<T | null>;
  withErrorHandling: <T extends (...args: unknown[]) => unknown>(fn: T) => T;
}

/**
 * Hook para tratamento consistente de erros
 *
 * @example
 * ```tsx
 * function useMyCustomHook() {
 *   const { error, handleAsyncError, clearError } = useErrorHandler('useMyCustomHook');
 *
 *   const fetchData = useCallback(async () => {
 *     return await handleAsyncError(
 *       fetch('/api/data').then(res => res.json())
 *     );
 *   }, [handleAsyncError]);
 *
 *   return { error, fetchData, clearError };
 * }
 * ```
 */
export function useErrorHandler(hookName: string): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<string | null>(null);

  const setError = useCallback(
    (error: HookError) => {
      const errorMessage = normalizeError(error, `Erro em ${hookName}`);
      setErrorState(errorMessage);

      if (process.env.NODE_ENV === "development") {
        console.error(`[${hookName}] Erro:`, error);
      }
    },
    [hookName]
  );

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleAsyncError = useCallback(
    async <T>(promise: Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await promise;
      } catch (err) {
        const hookError = createHookError(
          normalizeError(err, "Operação assíncrona falhou"),
          hookName,
          err
        );
        setError(hookError);
        return null;
      }
    },
    [hookName, setError, clearError]
  );

  const withErrorHandling = useCallback(
    <T extends (...args: unknown[]) => unknown>(fn: T): T => {
      return ((...args: Parameters<T>) => {
        try {
          clearError();
          return fn(...args);
        } catch (err) {
          const hookError = createHookError(
            normalizeError(err, "Execução da função falhou"),
            hookName,
            err
          );
          setError(hookError);
          return null;
        }
      }) as T;
    },
    [hookName, setError, clearError]
  );

  return {
    error,
    setError,
    clearError,
    handleAsyncError,
    withErrorHandling,
  };
}

export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(errorMessage || "Operação assíncrona falhou:", error);
    }
    return null;
  }
}

export function makeSafe<T extends (...args: unknown[]) => unknown, F>(
  fn: T,
  fallbackValue: F
): (...args: Parameters<T>) => ReturnType<T> | F {
  return (...args: Parameters<T>): ReturnType<T> | F => {
    try {
      return fn(...args) as ReturnType<T>;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Execução segura da função falhou:", error);
      }
      return fallbackValue;
    }
  };
}

export function isHookError(error: unknown): error is HookError {
  return error instanceof HookError;
}

export function getErrorDetails(error: unknown): {
  message: string;
  name: string;
  stack?: string;
  hookName?: string;
} {
  if (isHookError(error)) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      hookName: error.hookName,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return {
    message: normalizeError(error),
    name: "Unknown",
  };
}
