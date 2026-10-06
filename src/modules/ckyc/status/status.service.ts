import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import type { CkycClient } from '@prisma/client';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRequestStatus(requestId: string, client: CkycClient) {
    this.logger.log(
      `Checking status for requestId=${requestId} by client=${client.clientCode}`,
    );

    const record = await this.prisma.ckycRequest.findUnique({
      where: { requestUuid: requestId },
      include: {
        client: {
          select: {
            clientCode: true,
            clientName: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(
        `No CKYC request found with requestId '${requestId}'`,
      );
    }

    return {
      requestId: record.requestUuid,
      operation: record.operation,
      provider: record.provider,
      status: record.status,
      providerTxnId: record.providerTxnId,
      providerRequestId: record.providerRequestId,
      providerStatus: record.providerStatus,
      billable: record.billable,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      client: record.client,
    };
  }
}
