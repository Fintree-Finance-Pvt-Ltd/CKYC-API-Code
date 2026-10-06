import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    description: 'Request ID returned by the initial send-otp API',
    example: '12345678',
  })
  @IsNotEmpty({ message: 'requestId is required' })
  @IsString({ message: 'requestId must be a string' })
  requestId: string;

  @ApiProperty({
    description: 'Consent flag from customer (Y/N)',
    example: 'Y',
    enum: ['Y', 'N'],
  })
  @IsNotEmpty({ message: 'consent is required' })
  @IsString({ message: 'consent must be a string' })
  consent: string;

  @ApiProperty({
    description: 'Explicit customer consent text confirmation',
    example:
      'We confirm obtaining valid customer consent to access/process their ckyc data. Consent remains valid, informed, and unwithdrawn.',
  })
  @IsNotEmpty({ message: 'consentText is required' })
  @IsString({ message: 'consentText must be a string' })
  consentText: string;
}
