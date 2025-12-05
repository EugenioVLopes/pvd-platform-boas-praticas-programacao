import { memo } from "react";
import { PulseLoader } from "react-spinners";

interface AuthLoadingProps {
  minHeight?: string;
  message?: string;
}

export const AuthLoading = memo(function AuthLoading({
  minHeight = "400px",
  message = "Verificando autenticação...",
}: AuthLoadingProps) {
  return (
    <output
      className="flex items-center justify-center"
      style={{ minHeight }}
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center space-y-4">
        <PulseLoader
          color="#ff04da"
          margin={10}
          size={45}
          speedMultiplier={0.5}
          aria-hidden="true"
        />
        <span className="sr-only">{message}</span>
      </div>
    </output>
  );
});

AuthLoading.displayName = "AuthLoading";
