export interface Identifiable {
  id: string | number;
}

export interface Timestamps {
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BaseEntity extends Identifiable, Timestamps {}

export type SortDirection = "asc" | "desc";

export interface SortOptions<T extends string = string> {
  field: T;
  direction: SortDirection;
}

export interface FilterOptions {
  search?: string;
  [key: string]: unknown;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "cancelled";

export interface WithStatus {
  status: Status;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
