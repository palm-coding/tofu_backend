import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsDate,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWaitlistDto {
  @IsString()
  @IsNotEmpty()
  readonly branchId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly partyName: string;

  @IsNumber()
  @Min(1)
  readonly partySize: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly contactInfo: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'requestedAt must be a valid ISO 8601 date string' })
  readonly requestedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'notifiedAt must be a valid ISO 8601 date string' })
  readonly notifiedAt?: Date;

  @IsOptional()
  @IsString()
  @IsIn(['waiting', 'seated', 'cancelled'], {
    message: 'status must be one of: waiting, seated, cancelled',
  })
  readonly status?: string;
}
