import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { DownloadService } from './download.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ClientApiKeyGuard } from '@common/guards/client-api-key.guard';
import { CurrentClient } from '@common/decorators/current-client.decorator';
import type { RequestWithId } from '@common/middleware/request-id.middleware';
import type { CkycClient } from '@prisma/client';

@ApiTags('CKYC Download')
@ApiSecurity('ApiKeyAuth')
@ApiHeader({
  name: 'X-CLIENT-ID',
  description: 'Client identifier allocated to your service',
  required: true,
})
@ApiHeader({
  name: 'X-API-KEY',
  description: 'Secret API Key corresponding to the Client ID',
  required: true,
})
@UseGuards(ClientApiKeyGuard)
@Controller('ckyc/download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send Download OTP',
    description:
      'Initiates an OTP dispatch to customer registered mobile or email to authorize full CKYC record download.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'OTP sent successfully to registered factor',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid input parameters or validation failure',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or missing client credentials',
  })
  async sendOtp(
    @Body() dto: SendOtpDto,
    @CurrentClient() client: CkycClient,
    @Req() req: RequestWithId,
    @Ip() ipAddress: string,
  ) {
    const requestId =
      req.requestId || (req.headers?.['x-request-id'] as string) || '';
    return this.downloadService.sendOtp(dto, client, requestId, ipAddress);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP & Download CKYC Profile',
    description:
      'Submits the customer-provided OTP to fetch full personal details, verified addresses, identity documents, and base64 photograph/signature images.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'CKYC record successfully retrieved and decrypted',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid OTP or expired request',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or missing client credentials',
  })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @CurrentClient() client: CkycClient,
    @Req() req: RequestWithId,
    @Ip() ipAddress: string,
  ) {
    const requestId =
      req.requestId || (req.headers?.['x-request-id'] as string) || '';
    return this.downloadService.verifyOtp(dto, client, requestId, ipAddress);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend Download OTP',
    description:
      'Re-triggers the OTP dispatch for an existing active download session.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'OTP resent successfully',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Rate limited (wait 90 seconds) or invalid request ID',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or missing client credentials',
  })
  async resendOtp(
    @Body() dto: ResendOtpDto,
    @CurrentClient() client: CkycClient,
    @Req() req: RequestWithId,
    @Ip() ipAddress: string,
  ) {
    const requestId =
      req.requestId || (req.headers?.['x-request-id'] as string) || '';
    return this.downloadService.resendOtp(dto, client, requestId, ipAddress);
  }
}
