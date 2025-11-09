import { memo } from "react";

import { Auth } from "./auth-form";

interface AuthContainerProps {
  title: string;
  minHeight: string;
  onLogin: () => void;
  error?: string | null;
}

export const AuthContainer = memo(function AuthContainer({
  title,
  minHeight,
  onLogin,
  error,
}: AuthContainerProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight }}
      role="main"
      aria-labelledby="auth-title"
    >
      <div className="w-full max-w-sm space-y-4">
        <header>
          <h1 id="auth-title" className="mb-4 text-center text-2xl font-bold">
            {title}
          </h1>
        </header>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <Auth onLogin={onLogin} />
      </div>
    </div>
  );
});

AuthContainer.displayName = "AuthContainer";
