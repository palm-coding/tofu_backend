import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsOptional()
  @IsEnum(['pending', 'paid', 'failed'], {
    message: 'สถานะไม่ถูกต้อง',
  })
  readonly status?: string;
}
