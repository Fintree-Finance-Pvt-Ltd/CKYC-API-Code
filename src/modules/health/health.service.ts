import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'UP',
      service: 'fintree-ckyc-service',
    };
  }
}
