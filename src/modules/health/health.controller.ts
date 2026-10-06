import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Returns health and uptime status for fintree-ckyc-service.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is operational',
  })
  check() {
    return this.healthService.check();
  }
}
