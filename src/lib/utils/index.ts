// Utilitários compartilhados
export { cn } from "./cn";
export { formatCurrency, formatDate, formatWeight } from "./formatting";
export { calculateItemTotal, calculateOrderTotal } from "./calculations";
export {
  HookError,
  createHookError,
  getErrorDetails,
  isHookError,
  makeSafe,
  normalizeError,
  safeAsyncOperation,
  useErrorHandler,
  type UseErrorHandlerReturn,
} from "./hook-errors";
