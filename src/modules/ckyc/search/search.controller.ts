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
import { SearchService } from './search.service';
import { SearchCkycDto } from './dto/search-ckyc.dto';
import { ClientApiKeyGuard } from '@common/guards/client-api-key.guard';
import { CurrentClient } from '@common/decorators/current-client.decorator';
import type { RequestWithId } from '@common/middleware/request-id.middleware';
import type { CkycClient } from '@prisma/client';

@ApiTags('CKYC Search')
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
@Controller('ckyc/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search CKYC Record',
    description:
      'Queries the central CKYC registry using identity document details (PAN, Voter ID, Passport, etc.) to locate customer CKYC records.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'CKYC search completed successfully',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Validation failed or missing required fields',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or missing client credentials',
  })
  async search(
    @Body() dto: SearchCkycDto,
    @CurrentClient() client: CkycClient,
    @Req() req: RequestWithId,
    @Ip() ipAddress: string,
  ) {
    const requestId =
      req.requestId || (req.headers?.['x-request-id'] as string) || '';

    return this.searchService.search(dto, client, requestId, ipAddress);
  }
}
