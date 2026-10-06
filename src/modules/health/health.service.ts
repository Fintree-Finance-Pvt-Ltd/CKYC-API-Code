import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'UP',
      message: 'Service is running normally 👍',
      service: 'fintree-ckyc-service',
    };
  }
}
