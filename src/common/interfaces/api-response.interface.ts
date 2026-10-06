export interface ApiSuccessResponse<T = unknown> {
  success: true;
  requestId: string;
  data: T;
  error: null;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  requestId: string;
  data: null;
  error: ApiErrorDetail;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
