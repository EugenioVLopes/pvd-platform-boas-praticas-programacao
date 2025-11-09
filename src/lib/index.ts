export { cn } from "./utils";

export { formatCurrency, formatDate, formatWeight } from "./formatting";

export { calculateItemTotal, calculateOrderTotal } from "./calculations";

export {
  calculateSalesMetrics,
  calculateSalesReport,
  filterOrdersByPeriod,
  getDateRangeForReportType,
  getTopSellingProducts,
  groupSalesByCategory,
  groupSalesByHour,
  groupSalesByPaymentMethod,
} from "./reports";

export { generateOrderPrintTemplate, printHtmlContent } from "./print";

export { CartUtils } from "./cart";

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
