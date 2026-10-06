import { Inject, Injectable, Logger } from '@nestjs/common';
import { CKYC_DOWNLOAD_PROVIDER } from '@modules/providers/provider.tokens';
import type {
  CkycDownloadProvider,
  SendOtpProviderResult,
  VerifyOtpProviderResult,
  ResendOtpProviderResult,
} from '@modules/providers/interfaces';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { PrismaService } from '@database/prisma/prisma.service';
import { CkycOperation, CkycProvider, CkycRequestStatus } from '@prisma/client';
import type { CkycClient } from '@prisma/client';
import { maskIdentifier } from '@common/utils/masking.util';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(
    @Inject(CKYC_DOWNLOAD_PROVIDER)
    private readonly downloadProvider: CkycDownloadProvider,
    private readonly prisma: PrismaService,
  ) {}

  async sendOtp(
    dto: SendOtpDto,
    client: CkycClient,
    requestId: string,
    ipAddress?: string,
  ): Promise<SendOtpProviderResult> {
    const maskedCkyc = maskIdentifier(dto.ckycNo);
    const maskedAuthFactor = maskIdentifier(dto.authFactor);

    this.logger.log(
      `[${requestId}] Initiating CKYC Download Send OTP for ckycNo=${maskedCkyc} authFactorType=${dto.authFactorType}`,
    );

    let requestRecord: { id: bigint } | null = null;
    try {
      requestRecord = await this.prisma.ckycRequest.create({
        data: {
          requestUuid: requestId,
          clientId: client.id,
          operation: CkycOperation.DOWNLOAD_SEND_OTP,
          provider: CkycProvider.BEFISC,
          identifierType: 'CKYC_NO',
          identifierMasked: maskedCkyc,
          status: CkycRequestStatus.INITIATED,
        },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to create request record in DB: ${err instanceof Error ? err.message : err}`,
      );
    }

    const result = await this.downloadProvider.sendOtp({
      ckycNo: dto.ckycNo,
      authFactorType: dto.authFactorType,
      authFactor: dto.authFactor,
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
            providerRequestId: result.providerRequestId,
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

      if (result.success && result.providerRequestId) {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await this.prisma.ckycOtpSession.create({
          data: {
            requestUuid: requestId,
            providerRequestId: result.providerRequestId,
            ckycMasked: maskedCkyc,
            authFactorMasked: maskedAuthFactor,
            status: 'OTP_SENT',
            expiresAt,
          },
        });
      }

      await this.prisma.ckycAuditLog.create({
        data: {
          requestUuid: requestId,
          clientCode: client.clientCode,
          action: 'DOWNLOAD_SEND_OTP',
          provider: 'BEFISC',
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

  async verifyOtp(
    dto: VerifyOtpDto,
    client: CkycClient,
    requestId: string,
    ipAddress?: string,
  ): Promise<VerifyOtpProviderResult> {
    this.logger.log(
      `[${requestId}] Initiating CKYC Download Verify OTP for providerRequestId=${dto.requestId}`,
    );

    let requestRecord: { id: bigint } | null = null;
    try {
      requestRecord = await this.prisma.ckycRequest.create({
        data: {
          requestUuid: requestId,
          clientId: client.id,
          operation: CkycOperation.DOWNLOAD_VERIFY_OTP,
          provider: CkycProvider.BEFISC,
          providerRequestId: dto.requestId,
          status: CkycRequestStatus.INITIATED,
        },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to create request record in DB: ${err instanceof Error ? err.message : err}`,
      );
    }

    const result = await this.downloadProvider.verifyOtp({
      requestId: dto.requestId,
      otp: dto.otp,
      consent: dto.consent,
      consentText: dto.consentText,
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

      if (result.success) {
        await this.prisma.ckycOtpSession.updateMany({
          where: { providerRequestId: dto.requestId },
          data: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
          },
        });
      }

      await this.prisma.ckycAuditLog.create({
        data: {
          requestUuid: requestId,
          clientCode: client.clientCode,
          action: 'DOWNLOAD_VERIFY_OTP',
          provider: 'BEFISC',
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

  async resendOtp(
    dto: ResendOtpDto,
    client: CkycClient,
    requestId: string,
    ipAddress?: string,
  ): Promise<ResendOtpProviderResult> {
    this.logger.log(
      `[${requestId}] Initiating CKYC Download Resend OTP for providerRequestId=${dto.requestId}`,
    );

    let requestRecord: { id: bigint } | null = null;
    try {
      requestRecord = await this.prisma.ckycRequest.create({
        data: {
          requestUuid: requestId,
          clientId: client.id,
          operation: CkycOperation.DOWNLOAD_RESEND_OTP,
          provider: CkycProvider.BEFISC,
          providerRequestId: dto.requestId,
          status: CkycRequestStatus.INITIATED,
        },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error(
        `[${requestId}] Failed to create request record in DB: ${err instanceof Error ? err.message : err}`,
      );
    }

    const result = await this.downloadProvider.resendOtp({
      requestId: dto.requestId,
      consent: dto.consent,
      consentText: dto.consentText,
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
          action: 'DOWNLOAD_RESEND_OTP',
          provider: 'BEFISC',
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
