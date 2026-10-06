export interface BefiscSearchRequest {
  id_type: string;
  id_no: string;
  consent: string;
  consent_text: string;
  dob?: string;
  mob_num?: string;
}

export interface BefiscSearchResultPayload {
  ckyc_no?: string;
  ckyc_reference_id?: string;
  name?: string;
  fathers_name?: string;
  age?: string;
  mob_code?: string;
  mob_num?: string;
  photo?: string;
  kyc_date?: string;
  remarks?: string | null;
  [key: string]: unknown;
}

export interface BefiscSearchResponse {
  txn_id?: string;
  api_category?: string;
  billable?: boolean;
  message?: string;
  status: number;
  result?: BefiscSearchResultPayload | null;
  datetime?: string;
  [key: string]: unknown;
}

export interface BefiscSendOtpRequest {
  ckyc_no: string;
  auth_factor_type: string;
  auth_factor: string;
  consent: string;
  consent_text: string;
}

export interface BefiscSendOtpResultPayload {
  req_date?: string;
  request_id?: string;
  message?: string;
  [key: string]: unknown;
}

export interface BefiscSendOtpResponse {
  txn_id?: string;
  api_category?: string;
  billable?: boolean;
  status: number;
  message?: string;
  result?: BefiscSendOtpResultPayload | null;
  datetime?: string;
  [key: string]: unknown;
}

export interface BefiscVerifyOtpRequest {
  request_id: string;
  otp: string;
  consent: string;
  consent_text: string;
}

export interface BefiscVerifyOtpResponse {
  txn_id?: string;
  api_category?: string;
  billable?: boolean;
  status: number;
  message?: string;
  result?: {
    record_count_details?: Record<string, unknown>;
    personal_details?: Record<string, unknown>;
    identity_details?: Record<string, unknown>;
    image_details?: Record<string, unknown>;
    [key: string]: unknown;
  } | null;
  datetime?: string;
  [key: string]: unknown;
}

export interface BefiscResendOtpRequest {
  request_id: string;
  consent: string;
  consent_text: string;
}

export interface BefiscResendOtpResponse {
  txn_id?: string;
  api_category?: string;
  billable?: boolean;
  status: number;
  message?: string;
  result?: BefiscSendOtpResultPayload | null;
  datetime?: string;
  [key: string]: unknown;
}
