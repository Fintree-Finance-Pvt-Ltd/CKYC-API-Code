import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    requestUuid: string;
    clientCode: string;
    action: string;
    provider?: string;
    status: string;
    ipAddress?: string | null;
  }) {
    try {
      return await this.prisma.ckycAuditLog.create({
        data: {
          requestUuid: data.requestUuid,
          clientCode: data.clientCode,
          action: data.action,
          provider: data.provider,
          status: data.status,
          ipAddress: data.ipAddress || null,
        },
      });
    } catch (err) {
      this.logger.error('Failed to persist audit log entry', err);
    }
  }
}
