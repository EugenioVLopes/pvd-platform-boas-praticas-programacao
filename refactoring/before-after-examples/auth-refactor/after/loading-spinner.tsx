// ✅ Componente de loading nativo sem dependências externas
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* ✅ Spinner CSS puro - sem dependência externa */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>

        {/* ✅ Acessibilidade melhorada */}
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  );
}
