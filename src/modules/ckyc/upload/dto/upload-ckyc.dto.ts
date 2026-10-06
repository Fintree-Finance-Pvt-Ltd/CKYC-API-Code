import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class UploadCkycDto {
  @ApiProperty({
    description: 'CKYC record payload matching CERSAI upload specifications',
    example: {
      constitutionType: '01',
      accountType: '01',
      personalDetails: {
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  })
  @IsNotEmpty({ message: 'data is required' })
  @IsObject({ message: 'data must be a valid JSON object' })
  data: Record<string, unknown>;

  @ApiProperty({
    description: 'Consent flag from customer (Y/N)',
    example: 'Y',
    enum: ['Y', 'N'],
  })
  @IsNotEmpty({ message: 'consent is required' })
  @IsString({ message: 'consent must be a string' })
  @IsIn(['Y', 'y'], { message: 'Customer consent must be Y to proceed' })
  consent: string;

  @ApiProperty({
    description: 'Explicit customer consent text confirmation',
    example:
      'We confirm obtaining valid customer consent to upload their ckyc data.',
  })
  @IsNotEmpty({ message: 'consentText is required' })
  @IsString({ message: 'consentText must be a string' })
  consentText: string;
}
