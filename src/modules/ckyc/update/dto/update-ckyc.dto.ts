import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class UpdateCkycDto {
  @ApiProperty({
    description: '14-digit CKYC number of the record to update',
    example: '30040987654321',
  })
  @IsNotEmpty({ message: 'ckycNo is required' })
  @IsString({ message: 'ckycNo must be a string' })
  ckycNo: string;

  @ApiProperty({
    description: 'Fields and documents to update in the CKYC registry',
    example: {
      corresAddress: {
        line1: 'Flat 402, High Residency',
        city: 'Mumbai',
        pin: '400001',
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
      'We confirm obtaining valid customer consent to update their ckyc data.',
  })
  @IsNotEmpty({ message: 'consentText is required' })
  @IsString({ message: 'consentText must be a string' })
  consentText: string;
}
