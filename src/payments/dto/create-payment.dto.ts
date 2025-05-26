import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสสาขา' })
  @IsMongoId({ message: 'รหัสสาขาไม่ถูกต้อง' })
  readonly branchId: MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสออร์เดอร์' })
  @IsMongoId({ message: 'รหัสออร์เดอร์ไม่ถูกต้อง' })
  readonly orderId: MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสเซสชัน' })
  @IsMongoId({ message: 'รหัสเซสชันไม่ถูกต้อง' })
  readonly sessionId: MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุยอดชำระ' })
  @IsNumber({}, { message: 'ยอดชำระต้องเป็นตัวเลข' })
  @Min(0, { message: 'ยอดชำระต้องไม่น้อยกว่า 0' })
  readonly amount: number;

  @IsNotEmpty({ message: 'กรุณาระบุช่องทางชำระ' })
  @IsEnum(['cash', 'promptpay', 'card'], {
    message: 'ช่องทางชำระไม่ถูกต้อง',
  })
  readonly method: string;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'failed'], {
    message: 'สถานะไม่ถูกต้อง',
  })
  readonly status?: string = 'pending';
}
