import { Inject, Injectable, Logger } from '@nestjs/common';
import { CKYC_UPDATE_PROVIDER } from '@modules/providers/provider.tokens';
import type {
  CkycUpdateProvider,
  CkycUpdateProviderResult,
} from '@modules/providers/interfaces';
import { UpdateCkycDto } from './dto/update-ckyc.dto';
import { PrismaService } from '@database/prisma/prisma.service';
import { CkycOperation, CkycProvider, CkycRequestStatus } from '@prisma/client';
import type { CkycClient } from '@prisma/client';
import { maskIdentifier } from '@common/utils/masking.util';

@Injectable()
export class UpdateService {
  private readonly logger = new Logger(UpdateService.name);

  constructor(
    @Inject(CKYC_UPDATE_PROVIDER)
    private readonly updateProvider: CkycUpdateProvider,
    private readonly prisma: PrismaService,
  ) {}

  async update(
    dto: UpdateCkycDto,
    client: CkycClient,
    requestId: string,
    ipAddress?: string,
  ): Promise<CkycUpdateProviderResult> {
    const maskedCkyc = maskIdentifier(dto.ckycNo);

    this.logger.log(
      `[${requestId}] Initiating CKYC Update for ckycNo=${maskedCkyc} client=${client.clientCode}`,
    );

    let requestRecord: { id: bigint } | null = null;
    try {
      requestRecord = await this.prisma.ckycRequest.create({
        data: {
          requestUuid: requestId,
          clientId: client.id,
          operation: CkycOperation.UPDATE,
          provider: CkycProvider.NETWIN,
          identifierType: 'CKYC_NO',
          identifierMasked: maskedCkyc,
          status: CkycRequestStatus.INITIATED,
        },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to create update request record: ${err instanceof Error ? err.message : err}`,
      );
    }

    const result = await this.updateProvider.update({
      ckycNo: dto.ckycNo,
      data: dto.data,
      consent: dto.consent,
      consentText: dto.consentText,
      requestId,
    });

    try {
      if (requestRecord) {
        await this.prisma.ckycRequest.update({
          where: { id: requestRecord.id },
          data: {
            status: result.success
              ? CkycRequestStatus.SUCCESS
              : CkycRequestStatus.FAILED,
            errorMessage: result.message,
          },
        });
      }

      await this.prisma.ckycAuditLog.create({
        data: {
          requestUuid: requestId,
          clientCode: client.clientCode,
          action: 'CKYC_UPDATE',
          provider: 'NETWIN',
          status: result.success ? 'SUCCESS' : 'FAILED',
          ipAddress: ipAddress || null,
        },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to update DB state: ${err instanceof Error ? err.message : err}`,
      );
    }

    return result;
  }
}
