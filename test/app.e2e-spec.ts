import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformResponseInterceptor } from '@common/interceptors/transform-response.interceptor';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { PrismaService } from '@database/prisma/prisma.service';

describe('CKYC Service API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: () => Promise.resolve(),
        $disconnect: () => Promise.resolve(),
        ckycClient: {
          findUnique: () => Promise.resolve(null),
        },
        ckycRequest: {
          create: () => Promise.resolve({ id: BigInt(1) }),
          update: () => Promise.resolve({ id: BigInt(1) }),
          findUnique: () => Promise.resolve(null),
        },
        ckycAuditLog: {
          create: () => Promise.resolve({ id: BigInt(1) }),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health should return UP status with standard envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(res.body).toMatchObject({
      success: true,
      data: {
        status: 'UP',
        message: 'Service is running normally 👍',
        service: 'fintree-ckyc-service',
      },
      error: null,
    });
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('POST /api/v1/ckyc/search should reject unauthorized request without credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/ckyc/search')
      .send({
        idType: 'PAN',
        idNumber: 'ABCDE1234F',
        consent: 'Y',
        consentText: 'Confirmed',
      })
      .expect(401);

    expect(res.body).toMatchObject({
      success: false,
      data: null,
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  });
});
