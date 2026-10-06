import {
  CkycSearchProviderInput,
  CkycSearchProviderResult,
  SendOtpProviderInput,
  SendOtpProviderResult,
  VerifyOtpProviderInput,
  VerifyOtpProviderResult,
  ResendOtpProviderInput,
  ResendOtpProviderResult,
  PersonalDetails,
  CkycDownloadData,
} from '../interfaces';
import {
  BefiscSearchRequest,
  BefiscSearchResponse,
  BefiscSendOtpRequest,
  BefiscSendOtpResponse,
  BefiscVerifyOtpRequest,
  BefiscVerifyOtpResponse,
  BefiscResendOtpRequest,
  BefiscResendOtpResponse,
} from './befisc.types';

export class BefiscMapper {
  static toBefiscSearchRequest(
    input: CkycSearchProviderInput,
  ): BefiscSearchRequest {
    const payload: BefiscSearchRequest = {
      id_type: input.idType,
      id_no: input.idNumber,
      consent: input.consent,
      consent_text: input.consentText,
    };
    if (input.dob) {
      payload.dob = input.dob;
    }
    if (input.mobileNumber) {
      payload.mob_num = input.mobileNumber;
    }
    return payload;
  }

  static toInternalSearchResult(
    res: BefiscSearchResponse,
  ): CkycSearchProviderResult {
    const isSuccess = res.status === 1;
    return {
      success: isSuccess,
      providerTxnId: res.txn_id,
      billable: res.billable,
      status: res.status,
      message: res.message || (isSuccess ? 'Success' : 'Failed'),
      result: res.result
        ? {
            ckycNo: res.result.ckyc_no ?? '',
            ckycReferenceId: res.result.ckyc_reference_id,
            name: res.result.name ?? '',
            fathersName: res.result.fathers_name,
            age: res.result.age,
            mobCode: res.result.mob_code,
            mobNum: res.result.mob_num,
            photo: res.result.photo,
            kycDate: res.result.kyc_date,
            remarks: res.result.remarks,
          }
        : null,
      rawResponse: res,
    };
  }

  static toBefiscSendOtpRequest(
    input: SendOtpProviderInput,
  ): BefiscSendOtpRequest {
    return {
      ckyc_no: input.ckycNo,
      auth_factor_type: input.authFactorType,
      auth_factor: input.authFactor,
      consent: input.consent,
      consent_text: input.consentText,
    };
  }

  static toInternalSendOtpResult(
    res: BefiscSendOtpResponse,
  ): SendOtpProviderResult {
    const isSuccess = res.status === 1;
    return {
      success: isSuccess,
      providerTxnId: res.txn_id,
      providerRequestId: res.result?.request_id,
      reqDate: res.result?.req_date,
      billable: res.billable,
      status: res.status,
      message:
        res.result?.message ||
        res.message ||
        (isSuccess ? 'Success' : 'Failed'),
      rawResponse: res,
    };
  }

  static toBefiscVerifyOtpRequest(
    input: VerifyOtpProviderInput,
  ): BefiscVerifyOtpRequest {
    return {
      request_id: input.requestId,
      otp: input.otp,
      consent: input.consent,
      consent_text: input.consentText,
    };
  }

  static toInternalVerifyOtpResult(
    res: BefiscVerifyOtpResponse,
  ): VerifyOtpProviderResult {
    const isSuccess = res.status === 1;
    let mappedResult: CkycDownloadData | null = null;

    if (res.result) {
      const personal = res.result.personal_details as
        Record<string, unknown> | undefined;
      let mappedPersonal: PersonalDetails | undefined = undefined;

      if (personal) {
        mappedPersonal = {
          constitutionType: personal.constitution_type as string | undefined,
          accountType: personal.account_type as string | undefined,
          ckycNo: personal.ckyc_no as string | undefined,
          ckycReferenceId: personal.ckyc_reference_id as string | undefined,
          prefix: personal.prefix as string | undefined,
          firstName: personal.first_name as string | undefined,
          middleName: personal.middle_name as string | undefined,
          lastName: personal.last_name as string | undefined,
          fullName: personal.full_name as string | undefined,
          maidenPrefix: personal.maiden_prefix as string | undefined,
          maidenFname: personal.maiden_fname as string | undefined,
          maidenMname: personal.maiden_mname as string | undefined,
          maidenLname: personal.maiden_lname as string | undefined,
          maidenFullname: personal.maiden_fullname as string | undefined,
          fatherOrSpouseFlag: personal.father_or_spouse_flag as
            string | undefined,
          fatherPrefix: personal.father_prefix as string | undefined,
          fatherFname: personal.father_fname as string | undefined,
          fatherMname: personal.father_mname as string | undefined,
          fatherLname: personal.father_lname as string | undefined,
          fatherFullname: personal.father_fullname as string | undefined,
          motherPrefix: personal.mother_prefix as string | undefined,
          motherFname: personal.mother_fname as string | undefined,
          motherMname: personal.mother_mname as string | undefined,
          motherLname: personal.mother_lname as string | undefined,
          motherFullname: personal.mother_fullname as string | undefined,
          gender: personal.gender as string | undefined,
          dob: personal.dob as string | undefined,
          pan: personal.pan as string | undefined,
          resiStatus: personal.resi_status as string | undefined,
          permLine1: personal.perm_line1 as string | undefined,
          permLine2: personal.perm_line2 as string | undefined,
          permLine3: personal.perm_line3 as string | undefined,
          permCity: personal.perm_city as string | undefined,
          permDist: personal.perm_dist as string | undefined,
          permState: personal.perm_state as string | undefined,
          permCountry: personal.perm_country as string | undefined,
          permPin: personal.perm_pin as string | undefined,
          permPoa: personal.perm_poa as string | undefined,
          permCorresSameflag: personal.perm_corres_sameflag as
            string | undefined,
          corresLine1: personal.corres_line1 as string | undefined,
          corresLine2: personal.corres_line2 as string | undefined,
          corresLine3: personal.corres_line3 as string | undefined,
          corresCity: personal.corres_city as string | undefined,
          corresDist: personal.corres_dist as string | undefined,
          corresState: personal.corres_state as string | undefined,
          corresCountry: personal.corres_country as string | undefined,
          corresPin: personal.corres_pin as string | undefined,
          corresPoa: personal.corres_poa as string | undefined,
          mobCode: personal.mob_code as string | undefined,
          mobNum: personal.mob_num as string | undefined,
          email: personal.email as string | undefined,
          decDate: personal.dec_date as string | undefined,
          decPlace: personal.dec_place as string | undefined,
          kycDate: personal.kyc_date as string | undefined,
          docSub: personal.doc_sub as string | undefined,
        };
      }

      mappedResult = {
        recordCountDetails: res.result.record_count_details,
        personalDetails: mappedPersonal,
        identityDetails: res.result.identity_details,
        imageDetails: res.result.image_details,
      };
    }

    return {
      success: isSuccess,
      providerTxnId: res.txn_id,
      billable: res.billable,
      status: res.status,
      message: res.message || (isSuccess ? 'Success' : 'Failed'),
      result: mappedResult,
      rawResponse: res,
    };
  }

  static toBefiscResendOtpRequest(
    input: ResendOtpProviderInput,
  ): BefiscResendOtpRequest {
    return {
      request_id: input.requestId,
      consent: input.consent,
      consent_text: input.consentText,
    };
  }

  static toInternalResendOtpResult(
    res: BefiscResendOtpResponse,
  ): ResendOtpProviderResult {
    const isSuccess = res.status === 1;
    return {
      success: isSuccess,
      providerTxnId: res.txn_id,
      providerRequestId: res.result?.request_id,
      reqDate: res.result?.req_date,
      billable: res.billable,
      status: res.status,
      message:
        res.result?.message ||
        res.message ||
        (isSuccess ? 'Success' : 'Failed'),
      rawResponse: res,
    };
  }
}
