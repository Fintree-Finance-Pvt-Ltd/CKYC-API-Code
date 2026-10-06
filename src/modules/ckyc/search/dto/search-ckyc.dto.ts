import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BEFISC_ID_TYPES } from '@modules/providers/befisc/befisc.constants';

export class SearchCkycDto {
  @ApiProperty({
    description: 'Type of ID document to search for CKYC',
    enum: BEFISC_ID_TYPES,
    example: 'PAN',
  })
  @IsNotEmpty({ message: 'idType is required' })
  @IsString({ message: 'idType must be a string' })
  @IsIn([...BEFISC_ID_TYPES], {
    message: `idType must be one of: ${BEFISC_ID_TYPES.join(', ')}`,
  })
  idType: string;

  @ApiProperty({
    description: 'Document identifier number corresponding to the idType',
    example: 'ABCDE1234F',
  })
  @IsNotEmpty({ message: 'idNumber is required' })
  @IsString({ message: 'idNumber must be a string' })
  idNumber: string;

  @ApiPropertyOptional({
    description: 'Date of Birth in DD-MM-YYYY format',
    example: '01-01-1995',
  })
  @IsOptional()
  @IsString({ message: 'dob must be a string' })
  dob?: string;

  @ApiPropertyOptional({
    description: '10-digit registered mobile number',
    example: '9876543210',
  })
  @IsOptional()
  @IsString({ message: 'mobileNumber must be a string' })
  mobileNumber?: string;

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
      'We confirm obtaining valid customer consent to access/process their ckyc data. Consent remains valid, informed, and unwithdrawn.',
  })
  @IsNotEmpty({ message: 'consentText is required' })
  @IsString({ message: 'consentText must be a string' })
  consentText: string;
}
