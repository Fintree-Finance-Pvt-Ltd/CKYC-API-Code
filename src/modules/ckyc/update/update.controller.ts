import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Put,
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
import { UpdateService } from './update.service';
import { UpdateCkycDto } from './dto/update-ckyc.dto';
import { ClientApiKeyGuard } from '@common/guards/client-api-key.guard';
import { CurrentClient } from '@common/decorators/current-client.decorator';
import type { RequestWithId } from '@common/middleware/request-id.middleware';
import type { CkycClient } from '@prisma/client';

@ApiTags('CKYC Update')
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
@Controller('ckyc/update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Existing CKYC Record',
    description:
      'Submits modifications, new addresses, or refreshed identity documents for an existing CKYC number.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'CKYC update request submitted',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Validation failed or missing required fields',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or missing client credentials',
  })
  async update(
    @Body() dto: UpdateCkycDto,
    @CurrentClient() client: CkycClient,
    @Req() req: RequestWithId,
    @Ip() ipAddress: string,
  ) {
    const requestId =
      req.requestId || (req.headers?.['x-request-id'] as string) || '';
    return this.updateService.update(dto, client, requestId, ipAddress);
  }
}
