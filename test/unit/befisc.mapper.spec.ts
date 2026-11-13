import { describe, it, expect } from 'vitest';
import { BefiscMapper } from '@modules/providers/befisc/befisc.mapper';

describe('BefiscMapper send/resend OTP', () => {
  it('maps the current format (OTP text in result.message)', () => {
    const out = BefiscMapper.toInternalSendOtpResult({
      status: 1,
      txn_id: 'tx1',
      result: {
        req_date: '10-09-2026',
        request_id: '12345678',
        message: 'OTP has been sent to the registered mobile numberXXXXXX9898',
      },
    });
    expect(out.success).toBe(true);
    expect(out.providerRequestId).toBe('12345678');
    expect(out.reqDate).toBe('10-09-2026');
    expect(out.message).toContain('9898');
  });

  it('still maps the legacy otp_pending format (OTP text in result.error)', () => {
    const res = {
      status: 1,
      txn_id: 'tx2',
      result: {
        status: 'otp_pending',
        fi_code: 'IN5538',
        req_date: '12-11-2026',
        request_id: '64428351',
        pid_data_xml: null,
        error: 'OTP has been sent to the registered mobile numberXXXXXX8115',
      },
    };
    const send = BefiscMapper.toInternalSendOtpResult(res);
    expect(send.success).toBe(true);
    expect(send.providerRequestId).toBe('64428351');
    expect(send.reqDate).toBe('12-11-2026');
    expect(send.message).toBe(
      'OTP has been sent to the registered mobile numberXXXXXX8115',
    );
    expect(BefiscMapper.toInternalResendOtpResult(res).providerRequestId).toBe(
      '64428351',
    );
  });
});

describe('BefiscMapper verify OTP (documented sample)', () => {
  const sample = {
    txn_id: '073f116a-c17d-4c54-8ae5-f5019a61065e',
    api_category: 'KYC',
    message: 'Success',
    billable: true,
    status: 1,
    result: {
      record_count_details: { download_count: '10', update_count: '1' },
      personal_details: {
        ckyc_no: '30040987654321',
        full_name: 'Mr Ram Singh',
        kyc_date: '********',
        num_images: '3',
      },
      identity_details: {
        identity: {
          sequence_no: '1',
          ident_type: 'E',
          ident_num: 'XXXXXXXX1234',
          idver_status: '02',
        },
      },
      related_person_details: '',
      image_details: {
        image: [
          { sequence_no: '1', image_type: 'jpg', image_code: '02', image_data: 'AAA' },
          { sequence_no: '2', image_type: 'jpg', image_code: '04', image_data: 'BBB' },
        ],
      },
    },
  };

  it('maps counts, a single identity object, images and empty related persons', () => {
    const out = BefiscMapper.toInternalVerifyOtpResult(sample);
    expect(out.success).toBe(true);
    expect(out.result?.recordCountDetails).toEqual({
      downloadCount: '10',
      updateCount: '1',
    });
    expect(out.result?.personalDetails?.fullName).toBe('Mr Ram Singh');
    expect(out.result?.identityDetails?.identity).toHaveLength(1);
    expect(out.result?.identityDetails?.identity[0].identNum).toBe('XXXXXXXX1234');
    expect(out.result?.imageDetails?.image).toHaveLength(2);
    expect(out.result?.relatedPersonDetails).toBeUndefined();
  });

  it('maps a documented failure (status 5 OTP expired) as success=false', () => {
    const out = BefiscMapper.toInternalVerifyOtpResult({
      status: 5,
      message: 'OTP Expired',
    });
    expect(out.success).toBe(false);
    expect(out.status).toBe(5);
    expect(out.result).toBeNull();
  });
});
