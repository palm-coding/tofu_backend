import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsOptional } from 'class-validator';

/**
 * DTO สำหรับอัปเดตข้อมูลออร์เดอร์
 * สืบทอดจาก CreateOrderDto แต่ทุกฟิลด์เป็น optional
 */
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(['received', 'preparing', 'served', 'paid'], {
    message: 'สถานะไม่ถูกต้อง',
  })
  readonly status?: string;
}
