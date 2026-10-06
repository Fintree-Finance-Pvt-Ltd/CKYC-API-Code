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
import { UploadService } from './upload.service';
import { UploadCkycDto } from './dto/upload-ckyc.dto';
import { ClientApiKeyGuard } from '@common/guards/client-api-key.guard';
import { CurrentClient } from '@common/decorators/current-client.decorator';
import type { RequestWithId } from '@common/middleware/request-id.middleware';
import type { CkycClient } from '@prisma/client';

@ApiTags('CKYC Upload')
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
@Controller('ckyc/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload New CKYC Record',
    description:
      'Submits new KYC details and supporting documents for onboarding to the CERSAI CKYC registry.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'CKYC upload request submitted',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Validation failed or missing required fields',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or missing client credentials',
  })
  async upload(
    @Body() dto: UploadCkycDto,
    @CurrentClient() client: CkycClient,
    @Req() req: RequestWithId,
    @Ip() ipAddress: string,
  ) {
    const requestId =
      req.requestId || (req.headers?.['x-request-id'] as string) || '';
    return this.uploadService.upload(dto, client, requestId, ipAddress);
  }
}
