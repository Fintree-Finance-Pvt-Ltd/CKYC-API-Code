export interface CkycUpdateProviderInput {
  ckycNo: string;
  data: Record<string, unknown>;
  consent: string;
  consentText: string;
  requestId?: string;
}

export interface CkycUpdateProviderResult {
  success: boolean;
  providerTxnId?: string;
  providerRequestId?: string;
  status: number | string;
  message: string;
  result?: Record<string, unknown> | null;
  rawResponse?: unknown;
}

export interface CkycUpdateProvider {
  update(input: CkycUpdateProviderInput): Promise<CkycUpdateProviderResult>;
}