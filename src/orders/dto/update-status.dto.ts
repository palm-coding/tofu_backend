import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * DTO สำหรับอัปเดตสถานะออร์เดอร์
 */
export class UpdateStatusDto {
  @IsNotEmpty({ message: 'กรุณาระบุสถานะ' })
  @IsEnum(['received', 'preparing', 'served', 'paid'], {
    message: 'สถานะไม่ถูกต้อง',
  })
  readonly status: string;
}
