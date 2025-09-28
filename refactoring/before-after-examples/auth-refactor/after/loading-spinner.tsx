// ✅ Componente de loading nativo sem dependências externas
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* ✅ Spinner CSS puro - sem dependência externa */}
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        
        {/* ✅ Acessibilidade melhorada */}
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  );
}