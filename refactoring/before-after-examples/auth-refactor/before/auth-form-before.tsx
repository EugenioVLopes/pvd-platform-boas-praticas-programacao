"use client";

import { memo, useCallback, useState } from "react";
import { PulseLoader } from "react-spinners"; // ❌ Dependência externa desnecessária

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthProps {
  onLogin: () => void;
}

// ❌ Magic String - senha hardcoded
const CORRECT_PASSWORD = "21011996";

export const Auth = memo(function Auth({ onLogin }: AuthProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ❌ Long Method - muitas responsabilidades em uma função
  // ❌ Feature Envy - lógica de validação misturada com UI
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validação inline - deveria estar separada
      if (!password.trim()) {
        setError("Por favor, digite a senha");
        return;
      }

      setIsLoading(true);
      setError("");

      // ❌ Magic Number - delay hardcoded
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ❌ Lógica de autenticação misturada com UI
      if (password === CORRECT_PASSWORD) {
        onLogin();
      } else {
        setError("Senha incorreta. Tente novamente.");
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
      {/* ❌ Loading component com dependência externa */}
      {isLoading && (
        <div className="flex justify-center">
          <PulseLoader
            color="#ff04da"
            margin={10}
            size={45}
            speedMultiplier={0.5}
          />
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