import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { BEFISC_AUTH_FACTOR_TYPES } from '@modules/providers/befisc/befisc.constants';

export class SendOtpDto {
  @ApiProperty({
    description: '14-digit CKYC number obtained from search',
    example: '30040987654321',
  })
  @IsNotEmpty({ message: 'ckycNo is required' })
  @IsString({ message: 'ckycNo must be a string' })
  ckycNo: string;

  @ApiProperty({
    description: 'Authentication factor type to deliver OTP',
    enum: BEFISC_AUTH_FACTOR_TYPES,
    example: 'MOBILE',
  })
  @IsNotEmpty({ message: 'authFactorType is required' })
  @IsString({ message: 'authFactorType must be a string' })
  @IsIn([...BEFISC_AUTH_FACTOR_TYPES], {
    message: `authFactorType must be one of: ${BEFISC_AUTH_FACTOR_TYPES.join(', ')}`,
  })
  authFactorType: string;

  @ApiProperty({
    description:
      'Value corresponding to authFactorType (Mobile number, Email, DOI DD-MM-YYYY, or Pincode)',
    example: '9898989898',
  })
  @IsNotEmpty({ message: 'authFactor is required' })
  @IsString({ message: 'authFactor must be a string' })
  authFactor: string;

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
