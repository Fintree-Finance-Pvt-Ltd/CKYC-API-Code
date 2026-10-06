import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BefiscService } from '@modules/providers/befisc/befisc.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('BefiscService', () => {
  let befiscService: BefiscService;
  let mockHttpService: HttpService;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockHttpService = {
      post: vi.fn(),
    } as unknown as HttpService;

    mockConfigService = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'BEFISC_BASE_URL' || key === 'befisc.baseUrl') {
          return 'https://prod.smartauth.co';
        }
        if (key === 'BEFISC_AUTH_KEY' || key === 'befisc.authKey') {
          return 'mock-auth-key';
        }
        if (key === 'HTTP_TIMEOUT_MS' || key === 'ckyc.httpTimeoutMs') {
          return 10000;
        }
        return null;
      }),
    } as unknown as ConfigService;

    befiscService = new BefiscService(mockHttpService, mockConfigService);
  });

  it('should format payload and map search response correctly', async () => {
    const mockAxiosResponse: AxiosResponse = {
      data: {
        txn_id: 'd9172ea8-0b9b-4097-849a-db2d929b064c',
        api_category: 'KYC',
        billable: true,
        message: 'Success',
        status: 1,
        result: {
          ckyc_no: '30040987654321',
          ckyc_reference_id: 'AZXSQW12345677',
          name: 'RAM SINGH',
          fathers_name: 'SHAM SINGH',
          age: '21',
          mob_code: '91',
          mob_num: 'XXXXXX9876',
          photo: '<base64_photo>',
          kyc_date: '19-03-2020',
          remarks: null,
        },
        datetime: '2026-09-15 17:27:08.178522',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    (mockHttpService.post as any).mockReturnValue(of(mockAxiosResponse));

    const result = await befiscService.search({
      idType: 'PAN',
      idNumber: 'ABCDE1234F',
      consent: 'Y',
      consentText: 'Consent confirmed',
    });

    expect(result.success).toBe(true);
    expect(result.providerTxnId).toBe('d9172ea8-0b9b-4097-849a-db2d929b064c');
    expect(result.result?.ckycNo).toBe('30040987654321');
    expect(result.result?.name).toBe('RAM SINGH');

    expect(mockHttpService.post).toHaveBeenCalledWith(
      'https://prod.smartauth.co/YKHV',
      {
        id_type: 'PAN',
        id_no: 'ABCDE1234F',
        consent: 'Y',
        consent_text: 'Consent confirmed',
      },
      expect.objectContaining({
        headers: {
          authkey: 'mock-auth-key',
          'Content-Type': 'application/json',
        },
      }),
    );
  });
});
