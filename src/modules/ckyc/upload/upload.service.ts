import { Inject, Injectable, Logger } from '@nestjs/common';
import { CKYC_UPLOAD_PROVIDER } from '@modules/providers/provider.tokens';
import type {
  CkycUploadProvider,
  CkycUploadProviderResult,
} from '@modules/providers/interfaces';
import { UploadCkycDto } from './dto/upload-ckyc.dto';
import { PrismaService } from '@database/prisma/prisma.service';
import { CkycOperation, CkycProvider, CkycRequestStatus } from '@prisma/client';
import type { CkycClient } from '@prisma/client';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(CKYC_UPLOAD_PROVIDER)
    private readonly uploadProvider: CkycUploadProvider,
    private readonly prisma: PrismaService,
  ) {}

  async upload(
    dto: UploadCkycDto,
    client: CkycClient,
    requestId: string,
    ipAddress?: string,
  ): Promise<CkycUploadProviderResult> {
    this.logger.log(
      `[${requestId}] Initiating CKYC Upload for client=${client.clientCode}`,
    );

    let requestRecord: { id: bigint } | null = null;
    try {
      requestRecord = await this.prisma.ckycRequest.create({
        data: {
          requestUuid: requestId,
          clientId: client.id,
          operation: CkycOperation.UPLOAD,
          provider: CkycProvider.NETWIN,
          status: CkycRequestStatus.INITIATED,
        },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to create upload request record: ${err instanceof Error ? err.message : err}`,
      );
    }

    const result = await this.uploadProvider.upload({
      clientCode: client.clientCode,
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
          action: 'CKYC_UPLOAD',
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
