import { useAuthGuard } from "@/features/auth/hooks/use-auth-guard";
import { act, renderHook, waitFor } from "@testing-library/react";

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock do console.error para evitar logs durante testes
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("useAuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("Inicialização", () => {
    test("deve inicializar com valores padrão quando não há autenticação armazenada", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue(null);

      // ACT
      const { result } = renderHook(() => useAuthGuard());

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test("deve inicializar autenticado quando há autenticação armazenada", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue("true");

      // ACT
      const { result } = renderHook(() => useAuthGuard());

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    test("deve inicializar com loading quando showLoading é true", async () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useAuthGuard({ showLoading: true }));

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificamos que após inicialização, o loading foi desativado
      expect(result.current.isAuthenticated).toBeDefined();
    });

    test("deve inicializar sem loading quando showLoading é false", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useAuthGuard({ showLoading: false }));

      // ASSERT
      expect(result.current.isLoading).toBe(false);
    });

    test("deve não verificar localStorage quando persistAuth é false", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue("true");

      // ACT
      const { result } = renderHook(() => useAuthGuard({ persistAuth: false }));

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    test("deve realizar login com sucesso", async () => {
      // ARRANGE
      const { result } = renderHook(() => useAuthGuard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ACT
      await act(async () => {
        result.current.login();
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("auth", "true");
    });

    test("deve realizar login sem persistir quando persistAuth é false", async () => {
      // ARRANGE
      const { result } = renderHook(() => useAuthGuard({ persistAuth: false }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ACT
      await act(async () => {
        result.current.login();
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    test("deve tratar erro ao realizar login quando localStorage falha", async () => {
      // ARRANGE
      const storageError = new Error("Storage quota exceeded");
      mockLocalStorage.setItem.mockImplementation(() => {
        throw storageError;
      });

      const { result } = renderHook(() => useAuthGuard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // ACT
      await act(async () => {
        result.current.login();
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(
        "Falha ao realizar login. Verifique se o armazenamento local está disponível"
      );
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    test("deve realizar logout com sucesso", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue("true");
      const { result } = renderHook(() => useAuthGuard());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // ACT
      await act(async () => {
        result.current.logout();
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("auth");
    });

    test("deve realizar logout sem remover do localStorage quando persistAuth é false", async () => {
      // ARRANGE
      const { result } = renderHook(() => useAuthGuard({ persistAuth: false }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login primeiro
      await act(async () => {
        result.current.login();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // ACT - Logout
      await act(async () => {
        result.current.logout();
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    test("deve tratar erro ao realizar logout quando localStorage falha", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue("true");
      const storageError = new Error("Storage error");
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw storageError;
      });

      const { result } = renderHook(() => useAuthGuard());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // ACT
      await act(async () => {
        result.current.logout();
      });

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(
        "Falha ao realizar logout. Os dados podem não ter sido removidos completamente"
      );
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe("clearError", () => {
    test("deve limpar erro quando chamado", async () => {
      // ARRANGE
      const { result } = renderHook(() => useAuthGuard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Forçar um erro
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      await act(async () => {
        result.current.login();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // ACT
      act(() => {
        result.current.clearError();
      });

      // ASSERT
      expect(result.current.error).toBeNull();
    });
  });

  describe("checkStoredAuth", () => {
    test("deve retornar false quando não há autenticação armazenada", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue(null);

      // ACT
      const { result } = renderHook(() => useAuthGuard());

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    test("deve retornar true quando há autenticação armazenada", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue("true");

      // ACT
      const { result } = renderHook(() => useAuthGuard());

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    test("deve tratar erro quando localStorage.getItem falha", async () => {
      // ARRANGE
      const storageError = new Error("Storage error");
      mockLocalStorage.getItem.mockImplementation(() => {
        throw storageError;
      });

      // ACT
      const { result } = renderHook(() => useAuthGuard());

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(
        "Falha ao verificar dados de autenticação armazenados"
      );
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe("useEffect - initializeAuth", () => {
    test("deve inicializar autenticação corretamente no mount", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue("true");

      // ACT
      const { result } = renderHook(() => useAuthGuard());

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    test("deve tratar erro durante inicialização", async () => {
      // ARRANGE
      const storageError = new Error("Storage error");
      mockLocalStorage.getItem.mockImplementation(() => {
        throw storageError;
      });

      // ACT
      const { result } = renderHook(() => useAuthGuard());

      // ASSERT
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // O erro é capturado no checkStoredAuth, não no initializeAuth diretamente
      expect(result.current.error).toBe(
        "Falha ao verificar dados de autenticação armazenados"
      );
    });
  });

  describe("Integração - Fluxo completo", () => {
    test("deve manter estado de autenticação após re-render quando persistAuth é true", async () => {
      // ARRANGE
      mockLocalStorage.getItem.mockReturnValue("true");

      // ACT
      const { result, rerender } = renderHook(() => useAuthGuard());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Simular re-render
      rerender();

      // ASSERT
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });
});
