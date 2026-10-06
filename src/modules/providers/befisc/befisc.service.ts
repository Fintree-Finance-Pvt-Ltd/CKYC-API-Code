import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  CkycSearchProvider,
  CkycSearchProviderInput,
  CkycSearchProviderResult,
  CkycDownloadProvider,
  SendOtpProviderInput,
  SendOtpProviderResult,
  VerifyOtpProviderInput,
  VerifyOtpProviderResult,
  ResendOtpProviderInput,
  ResendOtpProviderResult,
} from '../interfaces';
import { BefiscMapper } from './befisc.mapper';
import { BEFISC_ENDPOINTS } from './befisc.constants';
import {
  BefiscSearchResponse,
  BefiscSendOtpResponse,
  BefiscVerifyOtpResponse,
  BefiscResendOtpResponse,
} from './befisc.types';

@Injectable()
export class BefiscService implements CkycSearchProvider, CkycDownloadProvider {
  private readonly logger = new Logger(BefiscService.name);
  private readonly baseUrl: string;
  private readonly authKey: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('BEFISC_BASE_URL') ||
      this.configService.get<string>('befisc.baseUrl') ||
      'https://prod.smartauth.co';
    this.authKey =
      this.configService.get<string>('BEFISC_AUTH_KEY') ||
      this.configService.get<string>('befisc.authKey') ||
      '';
    this.timeoutMs =
      this.configService.get<number>('HTTP_TIMEOUT_MS') ||
      this.configService.get<number>('ckyc.httpTimeoutMs') ||
      30000;
  }

  private getHeaders(): Record<string, string> {
    return {
      authkey: this.authKey,
      'Content-Type': 'application/json',
    };
  }

  async search(
    input: CkycSearchProviderInput,
  ): Promise<CkycSearchProviderResult> {
    const url = `${this.baseUrl}${BEFISC_ENDPOINTS.SEARCH}`;
    const payload = BefiscMapper.toBefiscSearchRequest(input);

    this.logger.log(
      `Executing Befisc CKYC Search for idType=${input.idType} requestId=${input.requestId || 'N/A'}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<BefiscSearchResponse>(url, payload, {
          headers: this.getHeaders(),
          timeout: this.timeoutMs,
        }),
      );

      return BefiscMapper.toInternalSearchResult(response.data);
    } catch (error) {
      return this.handleHttpError<CkycSearchProviderResult>(
        error,
        'CKYC Search',
        (data) =>
          BefiscMapper.toInternalSearchResult(data as BefiscSearchResponse),
      );
    }
  }

  async sendOtp(input: SendOtpProviderInput): Promise<SendOtpProviderResult> {
    const url = `${this.baseUrl}${BEFISC_ENDPOINTS.DOWNLOAD_SEND_OTP}`;
    const payload = BefiscMapper.toBefiscSendOtpRequest(input);

    this.logger.log(
      `Executing Befisc Download Send OTP for authFactorType=${input.authFactorType}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<BefiscSendOtpResponse>(url, payload, {
          headers: this.getHeaders(),
          timeout: this.timeoutMs,
        }),
      );

      return BefiscMapper.toInternalSendOtpResult(response.data);
    } catch (error) {
      return this.handleHttpError<SendOtpProviderResult>(
        error,
        'Download Send OTP',
        (data) =>
          BefiscMapper.toInternalSendOtpResult(data as BefiscSendOtpResponse),
      );
    }
  }

  async verifyOtp(
    input: VerifyOtpProviderInput,
  ): Promise<VerifyOtpProviderResult> {
    const url = `${this.baseUrl}${BEFISC_ENDPOINTS.DOWNLOAD_VERIFY_OTP}`;
    const payload = BefiscMapper.toBefiscVerifyOtpRequest(input);

    this.logger.log(
      `Executing Befisc Download Verify OTP for providerRequestId=${input.requestId}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<BefiscVerifyOtpResponse>(url, payload, {
          headers: this.getHeaders(),
          timeout: this.timeoutMs,
        }),
      );

      return BefiscMapper.toInternalVerifyOtpResult(response.data);
    } catch (error) {
      return this.handleHttpError<VerifyOtpProviderResult>(
        error,
        'Download Verify OTP',
        (data) =>
          BefiscMapper.toInternalVerifyOtpResult(
            data as BefiscVerifyOtpResponse,
          ),
      );
    }
  }

  async resendOtp(
    input: ResendOtpProviderInput,
  ): Promise<ResendOtpProviderResult> {
    const url = `${this.baseUrl}${BEFISC_ENDPOINTS.DOWNLOAD_RESEND_OTP}`;
    const payload = BefiscMapper.toBefiscResendOtpRequest(input);

    this.logger.log(
      `Executing Befisc Download Resend OTP for providerRequestId=${input.requestId}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<BefiscResendOtpResponse>(url, payload, {
          headers: this.getHeaders(),
          timeout: this.timeoutMs,
        }),
      );

      return BefiscMapper.toInternalResendOtpResult(response.data);
    } catch (error) {
      return this.handleHttpError<ResendOtpProviderResult>(
        error,
        'Download Resend OTP',
        (data) =>
          BefiscMapper.toInternalResendOtpResult(
            data as BefiscResendOtpResponse,
          ),
      );
    }
  }

  private handleHttpError<T>(
    error: unknown,
    operation: string,
    mapper: (data: unknown) => T,
  ): T {
    if (error instanceof AxiosError && error.response?.data) {
      this.logger.warn(
        `Befisc ${operation} returned error response: ${JSON.stringify(error.response.data)}`,
      );
      return mapper(error.response.data);
    }

    const message =
      error instanceof Error ? error.message : 'Unknown provider error';
    this.logger.error(`Befisc ${operation} failed: ${message}`, error);

    return {
      success: false,
      status: 500,
      message: `Provider request failed: ${message}`,
      rawResponse: error instanceof AxiosError ? error.response?.data : null,
    } as T;
  }
}
