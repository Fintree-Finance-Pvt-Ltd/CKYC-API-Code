export interface CkycSearchProviderInput {
  idType: string;
  idNumber: string;
  dob?: string;
  mobileNumber?: string;
  consent: string;
  consentText: string;
  requestId?: string;
}

export interface CkycSearchResultData {
  ckycNo: string;
  ckycReferenceId?: string;
  name: string;
  fathersName?: string;
  age?: string;
  mobCode?: string;
  mobNum?: string;
  photo?: string;
  kycDate?: string;
  remarks?: string | null;
}

export interface CkycSearchProviderResult {
  success: boolean;
  providerTxnId?: string;
  billable?: boolean;
  status: number;
  message: string;
  result?: CkycSearchResultData | null;
  rawResponse?: unknown;
}

export interface CkycSearchProvider {
  search(input: CkycSearchProviderInput): Promise<CkycSearchProviderResult>;
}