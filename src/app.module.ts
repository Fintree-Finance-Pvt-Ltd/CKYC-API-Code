import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { PrismaModule } from '@database/prisma/prisma.module';
import { ProvidersModule } from '@modules/providers/providers.module';
import { CkycModule } from '@modules/ckyc/ckyc.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { HealthModule } from '@modules/health/health.module';
import { AuditModule } from '@modules/audit/audit.module';
import { RequestIdMiddleware } from '@common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    ProvidersModule,
    CkycModule,
    ClientsModule,
    HealthModule,
    AuditModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
