import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { TransformResponseInterceptor } from '@common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security - Helmet
  app.use(helmet());

  // CORS
  app.enableCors();

  // API Versioning / Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Interceptor & Filter for unified response envelope
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fintree CKYC Service API')
    .setDescription(
      'Unified, provider-independent Central KYC (CKYC) microservice for Fintree platforms (LMS, Personal Loan, LAP, Mobile Apps, Partner APIs). Supports CKYC search, OTP-based profile download, upload, and update operations.',
    )
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-CLIENT-ID',
        in: 'header',
        description: 'Client identifier for service authentication',
      },
      'ApiKeyAuth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'Client secret API key for authentication',
      },
      'ApiKeySecret',
    )
    .addTag('CKYC Search', 'Endpoints for querying central CKYC registry')
    .addTag('CKYC Download', 'OTP dispatch and profile download endpoints')
    .addTag('CKYC Upload', 'New customer CKYC registration endpoints')
    .addTag('CKYC Update', 'CKYC profile modification and document refresh endpoints')
    .addTag('CKYC Status', 'Request status tracking endpoints')
    .addTag('Health', 'Microservice health monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Fintree CKYC Service API Docs',
  });

  const port = process.env.PORT || 5100;
  await app.listen(port);
  logger.log(`🚀 Fintree CKYC Service is running on http://localhost:${port}`);
  logger.log(`📄 Swagger documentation is available at http://localhost:${port}/api/docs`);
}

bootstrap();
