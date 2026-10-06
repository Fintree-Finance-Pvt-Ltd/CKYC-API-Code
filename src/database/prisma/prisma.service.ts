import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

// Polyfill BigInt serialization for JSON.stringify across the service
if (typeof (BigInt.prototype as any).toJSON !== 'function') {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Optional() private readonly configService?: ConfigService) {
    const databaseUrl =
      configService?.get<string>('DATABASE_URL') ||
      configService?.get<string>('database.url') ||
      process.env.DATABASE_URL;

    super({
      datasources: databaseUrl
        ? {
            db: {
              url: databaseUrl,
            },
          }
        : undefined,
      log:
        process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to database successfully.');
    } catch (error) {
      this.logger.error('Failed to connect Prisma to database', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database.');
  }
}
