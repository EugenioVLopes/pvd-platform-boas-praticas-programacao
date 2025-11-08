export interface BaseHookOptions {
  enabled?: boolean;
}

export interface AsyncHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginatedHookState<T> extends AsyncHookState<T[]> {
  hasMore: boolean;
  page: number;
}

export interface CollectionHookState<T> {
  items: T[];
  count: number;
  loading: boolean;
  error: string | null;
}

export interface ModalState<T = unknown> {
  isOpen: boolean;
  data?: T;
}

export interface SelectionState<T> {
  selected: T | null;
  previous: T | null;
}

export interface PersistenceOptions {
  persist?: boolean;
  storageKey?: string;
  storageType?: "localStorage" | "sessionStorage";
}

export interface ValidationOptions<T> {
  validate?: (value: T) => boolean | string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface CrudHookReturn<
  T,
  CreateData = Partial<T>,
  UpdateData = Partial<T>,
> {
  items: T[];
  loading: boolean;
  error: string | null;

  create: (data: CreateData) => Promise<T> | T;
  update: (id: string, data: UpdateData) => Promise<T> | T;
  remove: (id: string) => Promise<void> | void;
  getById: (id: string) => T | undefined;
  clear: () => void;
}

export interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface AsyncOperationReturn<T, Args extends unknown[] = unknown[]> {
  execute: (...args: Args) => Promise<T>;
  loading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
}
