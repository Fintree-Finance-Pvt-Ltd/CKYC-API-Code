export interface SendOtpProviderInput {
  ckycNo: string;
  authFactorType: string;
  authFactor: string;
  consent: string;
  consentText: string;
  requestId?: string;
}

export interface SendOtpProviderResult {
  success: boolean;
  providerTxnId?: string;
  providerRequestId?: string;
  reqDate?: string;
  billable?: boolean;
  status: number;
  message: string;
}

export interface VerifyOtpProviderInput {
  requestId: string;
  otp: string;
  consent: string;
  consentText: string;
}

export interface PersonalDetails {
  constitutionType?: string;
  accountType?: string;
  ckycNo?: string;
  ckycReferenceId?: string;
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  maidenPrefix?: string;
  maidenFname?: string;
  maidenMname?: string;
  maidenLname?: string;
  maidenFullname?: string;
  fatherOrSpouseFlag?: string;
  fatherPrefix?: string;
  fatherFname?: string;
  fatherMname?: string;
  fatherLname?: string;
  fatherFullname?: string;
  motherPrefix?: string;
  motherFname?: string;
  motherMname?: string;
  motherLname?: string;
  motherFullname?: string;
  gender?: string;
  dob?: string;
  pan?: string;
  resiStatus?: string;
  permLine1?: string;
  permLine2?: string;
  permLine3?: string;
  permCity?: string;
  permDist?: string;
  permState?: string;
  permCountry?: string;
  permPin?: string;
  permPoa?: string;
  permCorresSameflag?: string;
  corresLine1?: string;
  corresLine2?: string;
  corresLine3?: string;
  corresCity?: string;
  corresDist?: string;
  corresState?: string;
  corresCountry?: string;
  corresPin?: string;
  corresPoa?: string;
  mobCode?: string;
  mobNum?: string;
  email?: string;
  decDate?: string;
  decPlace?: string;
  kycDate?: string;
  docSub?: string;
  disFlag?: string;
  disType?: string;
  disPercent?: string;
  disUdidNumber?: string;
  resiStdCode?: string;
  resiTelNum?: string;
  offStdCode?: string;
  offTelNum?: string;
  remarks?: string;
  kycName?: string;
  kycDesignation?: string;
  kycBranch?: string;
  kycEmpcode?: string;
  orgName?: string;
  orgCode?: string;
  numIdentity?: string;
  numRelated?: string;
  numImages?: string;
  [key: string]: unknown;
}

export interface CkycIdentityItem {
  sequenceNo?: string;
  identType?: string;
  identNum?: string;
  idverStatus?: string;
}

export interface CkycImageItem {
  sequenceNo?: string;
  imageType?: string;
  imageCode?: string;
  globalFlag?: string;
  branchCode?: string;
  imageData?: string;
}

export interface CkycDownloadData {
  recordCountDetails?: {
    downloadCount?: string;
    updateCount?: string;
  };
  personalDetails?: PersonalDetails;
  identityDetails?: { identity: CkycIdentityItem[] };
  relatedPersonDetails?: unknown;
  imageDetails?: { image: CkycImageItem[] };
}

export interface VerifyOtpProviderResult {
  success: boolean;
  providerTxnId?: string;
  billable?: boolean;
  status: number;
  message: string;
  result?: CkycDownloadData | null;
}

export interface ResendOtpProviderInput {
  requestId: string;
  consent: string;
  consentText: string;
}

export interface ResendOtpProviderResult {
  success: boolean;
  providerTxnId?: string;
  providerRequestId?: string;
  reqDate?: string;
  billable?: boolean;
  status: number;
  message: string;
}

export interface CkycDownloadProvider {
  sendOtp(input: SendOtpProviderInput): Promise<SendOtpProviderResult>;
  verifyOtp(input: VerifyOtpProviderInput): Promise<VerifyOtpProviderResult>;
  resendOtp(input: ResendOtpProviderInput): Promise<ResendOtpProviderResult>;
}
