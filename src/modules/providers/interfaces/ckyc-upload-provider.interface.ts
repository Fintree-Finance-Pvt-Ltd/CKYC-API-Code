export interface CkycUploadProviderInput {
  clientCode?: string;
  data: Record<string, unknown>;
  consent: string;
  consentText: string;
  requestId?: string;
}

export interface CkycUploadProviderResult {
  success: boolean;
  providerTxnId?: string;
  providerRequestId?: string;
  status: number | string;
  message: string;
  result?: Record<string, unknown> | null;
  rawResponse?: unknown;
}

export interface CkycUploadProvider {
  upload(input: CkycUploadProviderInput): Promise<CkycUploadProviderResult>;
}