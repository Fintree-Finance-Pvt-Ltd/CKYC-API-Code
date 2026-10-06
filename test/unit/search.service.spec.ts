import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchService } from '@modules/ckyc/search/search.service';
import type { CkycSearchProvider } from '@modules/providers/interfaces/ckyc-search-provider.interface';
import type { PrismaService } from '@database/prisma/prisma.service';
import type { CkycClient } from '@prisma/client';

describe('SearchService', () => {
  let service: SearchService;
  let mockSearchProvider: CkycSearchProvider;
  let mockPrisma: any;

  const mockClient: CkycClient = {
    id: BigInt(1),
    clientCode: 'LMS_SERVICE',
    clientName: 'LMS Platform',
    apiKeyHash: 'hash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockSearchProvider = {
      search: vi.fn().mockResolvedValue({
        success: true,
        providerTxnId: 'txn-12345',
        billable: true,
        status: 1,
        message: 'Success',
        result: {
          ckycNo: '30040987654321',
          ckycReferenceId: 'REF123',
          name: 'RAM SINGH',
        },
      }),
    };

    mockPrisma = {
      ckycRequest: {
        create: vi.fn().mockResolvedValue({ id: BigInt(100) }),
        update: vi.fn().mockResolvedValue({ id: BigInt(100) }),
      },
      ckycAuditLog: {
        create: vi.fn().mockResolvedValue({ id: BigInt(200) }),
      },
    };

    service = new SearchService(
      mockSearchProvider,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('should process search request, mask identifier, call provider, and persist DB records', async () => {
    const dto = {
      idType: 'PAN',
      idNumber: 'ABCDE1234F',
      consent: 'Y',
      consentText: 'Consent confirmed',
    };

    const result = await service.search(
      dto,
      mockClient,
      'CKYC-test-uuid',
      '127.0.0.1',
    );

    expect(result.success).toBe(true);
    expect(result.result?.ckycNo).toBe('30040987654321');

    // Verify DB initial logging with masked PAN
    expect(mockPrisma.ckycRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requestUuid: 'CKYC-test-uuid',
          identifierType: 'PAN',
          identifierMasked: 'AB******4F',
          status: 'INITIATED',
        }),
      }),
    );

    // Verify Provider invocation
    expect(mockSearchProvider.search).toHaveBeenCalledWith(
      expect.objectContaining({
        idType: 'PAN',
        idNumber: 'ABCDE1234F',
        consent: 'Y',
        consentText: 'Consent confirmed',
        requestId: 'CKYC-test-uuid',
      }),
    );

    // Verify DB status update and audit log
    expect(mockPrisma.ckycRequest.update).toHaveBeenCalled();
    expect(mockPrisma.ckycAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientCode: 'LMS_SERVICE',
          action: 'CKYC_SEARCH',
          status: 'SUCCESS',
        }),
      }),
    );
  });
});
