import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';

/**
 * DTO สำหรับการรับข้อมูลการชำระเงินผ่าน PromptPay
 * ใช้สำหรับการสร้างการชำระเงินด้วย QR code PromptPay
 */
export class PromptPayPaymentDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสสาขา' })
  readonly branchId: string;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสออร์เดอร์' })
  readonly orderId: string;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสเซสชัน' })
  readonly sessionId: string;

  @IsNotEmpty({ message: 'กรุณาระบุจำนวนเงิน' })
  @IsNumber({}, { message: 'จำนวนเงินต้องเป็นตัวเลข' })
  @Min(20, { message: 'จำนวนเงินต้องไม่น้อยกว่า 20 บาท' })
  readonly amount: number;

  @IsOptional()
  @IsObject({ message: 'Metadata ต้องเป็นออบเจ็กต์' })
  readonly metadata?: Record<string, any>;
}
