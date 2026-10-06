import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DownloadService } from '@modules/ckyc/download/download.service';
import type { CkycDownloadProvider } from '@modules/providers/interfaces/ckyc-download-provider.interface';
import type { PrismaService } from '@database/prisma/prisma.service';
import type { CkycClient } from '@prisma/client';

describe('DownloadService', () => {
  let service: DownloadService;
  let mockDownloadProvider: CkycDownloadProvider;
  let mockPrisma: any;

  const mockClient: CkycClient = {
    id: BigInt(1),
    clientCode: 'PL_SERVICE',
    clientName: 'Personal Loan Platform',
    apiKeyHash: 'hash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockDownloadProvider = {
      sendOtp: vi.fn().mockResolvedValue({
        success: true,
        providerTxnId: 'txn-send-otp',
        providerRequestId: 'REQ12345',
        reqDate: '10-09-2026',
        billable: true,
        status: 1,
        message: 'OTP Sent',
      }),
      verifyOtp: vi.fn().mockResolvedValue({
        success: true,
        providerTxnId: 'txn-verify-otp',
        billable: true,
        status: 1,
        message: 'Success',
        result: {
          personalDetails: {
            ckycNo: '30040987654321',
            fullName: 'Mr Ram Singh',
          },
        },
      }),
      resendOtp: vi.fn().mockResolvedValue({
        success: true,
        providerTxnId: 'txn-resend-otp',
        providerRequestId: 'REQ12345',
        reqDate: '10-09-2026',
        billable: true,
        status: 1,
        message: 'OTP Resent',
      }),
    };

    mockPrisma = {
      ckycRequest: {
        create: vi.fn().mockResolvedValue({ id: BigInt(1) }),
        update: vi.fn().mockResolvedValue({ id: BigInt(1) }),
      },
      ckycOtpSession: {
        create: vi.fn().mockResolvedValue({ id: BigInt(1) }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      ckycAuditLog: {
        create: vi.fn().mockResolvedValue({ id: BigInt(1) }),
      },
    };

    service = new DownloadService(
      mockDownloadProvider,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('should process sendOtp and create OTP session', async () => {
    const result = await service.sendOtp(
      {
        ckycNo: '30040987654321',
        authFactorType: 'MOBILE',
        authFactor: '9898989898',
        consent: 'Y',
        consentText: 'Consent confirmed',
      },
      mockClient,
      'CKYC-download-uuid',
    );

    expect(result.success).toBe(true);
    expect(result.providerRequestId).toBe('REQ12345');
    expect(mockPrisma.ckycOtpSession.create).toHaveBeenCalled();
  });

  it('should process verifyOtp and update OTP session to VERIFIED', async () => {
    const result = await service.verifyOtp(
      {
        requestId: 'REQ12345',
        otp: '123123',
        consent: 'Y',
        consentText: 'Consent confirmed',
      },
      mockClient,
      'CKYC-verify-uuid',
    );

    expect(result.success).toBe(true);
    expect(mockPrisma.ckycOtpSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerRequestId: 'REQ12345' },
        data: expect.objectContaining({ status: 'VERIFIED' }),
      }),
    );
  });
});
