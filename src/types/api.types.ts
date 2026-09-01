export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export type ErrorCode = 
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "INVALID_INPUT"
  | "DUPLICATE_ENTRY"
  | "UNKNOWN_ERROR";

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}
