import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { StatusService } from './status.service';
import { ClientApiKeyGuard } from '@common/guards/client-api-key.guard';
import { CurrentClient } from '@common/decorators/current-client.decorator';
import type { CkycClient } from '@prisma/client';

@ApiTags('CKYC Status')
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
@Controller('ckyc/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get(':requestId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get CKYC Request Status',
    description:
      'Fetches the current processing status, provider transaction ID, and error details for an asynchronous or past CKYC request.',
  })
  @ApiParam({
    name: 'requestId',
    description: 'Unique CKYC Request UUID (e.g. CKYC-xxxxxxxx)',
    example: 'CKYC-d9172ea8-0b9b-4097-849a-db2d929b064c',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Request status fetched successfully',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Request ID not found',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or missing client credentials',
  })
  async getStatus(
    @Param('requestId') requestId: string,
    @CurrentClient() client: CkycClient,
  ) {
    return this.statusService.getRequestStatus(requestId, client);
  }
}
