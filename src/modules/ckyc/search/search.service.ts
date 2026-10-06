import { Inject, Injectable, Logger } from '@nestjs/common';
import { CKYC_SEARCH_PROVIDER } from '@modules/providers/provider.tokens';
import type {
  CkycSearchProvider,
  CkycSearchProviderResult,
} from '@modules/providers/interfaces';
import { SearchCkycDto } from './dto/search-ckyc.dto';
import { PrismaService } from '@database/prisma/prisma.service';
import { CkycOperation, CkycProvider, CkycRequestStatus } from '@prisma/client';
import type { CkycClient } from '@prisma/client';
import { maskIdentifier } from '@common/utils/masking.util';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(CKYC_SEARCH_PROVIDER)
    private readonly searchProvider: CkycSearchProvider,
    private readonly prisma: PrismaService,
  ) {}

  async search(
    dto: SearchCkycDto,
    client: CkycClient,
    requestId: string,
    ipAddress?: string,
  ): Promise<CkycSearchProviderResult> {
    const maskedId = maskIdentifier(dto.idNumber);

    this.logger.log(
      `[${requestId}] Initiating CKYC Search for client=${client.clientCode} idType=${dto.idType} idNumber=${maskedId}`,
    );

    let requestRecord: { id: bigint } | null = null;
    try {
      requestRecord = await this.prisma.ckycRequest.create({
        data: {
          requestUuid: requestId,
          clientId: client.id,
          operation: CkycOperation.SEARCH,
          provider: CkycProvider.BEFISC,
          identifierType: dto.idType,
          identifierMasked: maskedId,
          status: CkycRequestStatus.INITIATED,
        },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to create initial request record in DB: ${err instanceof Error ? err.message : err}`,
      );
    }

    const result = await this.searchProvider.search({
      idType: dto.idType,
      idNumber: dto.idNumber,
      dob: dto.dob,
      mobileNumber: dto.mobileNumber,
      consent: dto.consent,
      consentText: dto.consentText,
      requestId,
    });

    try {
      if (requestRecord) {
        await this.prisma.ckycRequest.update({
          where: { id: requestRecord.id },
          data: {
            providerTxnId: result.providerTxnId,
            status: result.success
              ? CkycRequestStatus.SUCCESS
              : CkycRequestStatus.FAILED,
            providerStatus: result.status,
            billable: result.billable ?? false,
            errorCode: result.success ? null : `BEFISC_${result.status}`,
            errorMessage: result.success ? null : result.message,
          },
        });
      }

      await this.prisma.ckycAuditLog.create({
        data: {
          requestUuid: requestId,
          clientCode: client.clientCode,
          action: 'CKYC_SEARCH',
          provider: 'BEFISC',
          status: result.success ? 'SUCCESS' : 'FAILED',
          ipAddress: ipAddress || null,
        },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to update DB status or audit log: ${err instanceof Error ? err.message : err}`,
      );
    }

    return result;
  }
}
