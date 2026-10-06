import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from '@modules/health/health.controller';
import { HealthService } from '@modules/health/health.service';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthService: HealthService;

  beforeEach(() => {
    healthService = new HealthService();
    healthController = new HealthController(healthService);
  });

  it('should return UP status and service identifier', () => {
    const result = healthController.check();
    expect(result).toEqual({
      status: 'UP',
      service: 'fintree-ckyc-service',
    });
  });
});
