"use client";

import { memo, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthValidator } from "./auth-validation";
import { LoadingSpinner } from "./loading-spinner";

interface AuthProps {
  onLogin: () => void;
}

// ✅ Componente focado apenas na UI e interação
export const Auth = memo(function Auth({ onLogin }: AuthProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Método mais limpo e focado
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setIsLoading(true);
      setError("");

      // ✅ Lógica de validação e autenticação extraída
      const result = await AuthValidator.authenticateUser(password);

      if (result.success) {
        onLogin();
      } else {
        setError(result.error || "");
        setPassword("");
      }

      setIsLoading(false);
    },
    [password, onLogin]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      if (error) setError("");
    },
    [error]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
      aria-label="Formulário de autenticação"
    >
      {/* ✅ Componente de loading nativo */}
      {isLoading && (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="password" className="sr-only">
          Senha de acesso
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Digite sua senha"
          required
          disabled={isLoading}
          aria-invalid={!!error}
          aria-describedby={error ? "password-error" : undefined}
          autoComplete="current-password"
          className={error ? "border-red-500 focus:border-red-500" : ""}
        />
        {error && (
          <p
            id="password-error"
            role="alert"
            aria-live="polite"
            className="text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !password.trim()}
        className="w-full"
        aria-describedby={isLoading ? "loading-message" : undefined}
      >
        {isLoading ? "Verificando..." : "Entrar"}
      </Button>

      {isLoading && (
        <span id="loading-message" className="sr-only">
          Verificando suas credenciais, aguarde...
        </span>
      )}
    </form>
  );
});

Auth.displayName = "Auth";
