import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 5100;

  @IsString()
  @IsOptional()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  BEFISC_BASE_URL: string = 'https://prod.smartauth.co';

  @IsString()
  @IsOptional()
  BEFISC_AUTH_KEY: string = '';

  @IsString()
  @IsOptional()
  NETWIN_BASE_URL: string = '';

  @IsString()
  @IsOptional()
  NETWIN_CLIENT_ID: string = '';

  @IsString()
  @IsOptional()
  NETWIN_CLIENT_SECRET: string = '';

  @IsString()
  @IsOptional()
  CKYC_DEFAULT_CONSENT_TEXT: string =
    'We confirm obtaining valid customer consent to access/process their CKYC data. Consent remains valid, informed, and unwithdrawn.';

  @IsNumber()
  @IsOptional()
  HTTP_TIMEOUT_MS: number = 30000;

  @IsString()
  @IsOptional()
  API_KEY_PEPPER: string = 'DEFAULT_FINTREE_PEPPER';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
