import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Schema as MongooseSchema } from 'mongoose';

/**
 * DTO สำหรับรายการสั่งซื้อแต่ละรายการ
 */
export class OrderLineDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสเมนู' })
  @IsMongoId({ message: 'รหัสเมนูไม่ถูกต้อง' })
  readonly menuItemId: string | MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุจำนวน' })
  @IsNumber({}, { message: 'จำนวนต้องเป็นตัวเลข' })
  @Min(1, { message: 'จำนวนต้องไม่น้อยกว่า 1' })
  readonly qty: number;

  @IsOptional()
  @IsString()
  readonly note?: string;
}

/**
 * DTO สำหรับสร้างออร์เดอร์ใหม่
 */
export class CreateOrderDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสเซสชัน' })
  @IsMongoId({ message: 'รหัสเซสชันไม่ถูกต้อง' })
  readonly sessionId: string | MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสสาขา' })
  @IsMongoId({ message: 'รหัสสาขาไม่ถูกต้อง' })
  readonly branchId: string | MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสโต๊ะ' })
  @IsMongoId({ message: 'รหัสโต๊ะไม่ถูกต้อง' })
  readonly tableId: string | MongooseSchema.Types.ObjectId;

  @IsOptional()
  @IsEnum(['received', 'preparing', 'served', 'paid'], {
    message: 'สถานะไม่ถูกต้อง',
  })
  readonly status?: string = 'received';

  @IsNotEmpty({ message: 'กรุณาระบุรายการสั่งซื้อ' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  readonly orderLines: OrderLineDto[];

  @IsNotEmpty({ message: 'กรุณาระบุยอดรวม' })
  @IsNumber({}, { message: 'ยอดรวมต้องเป็นตัวเลข' })
  @Min(0, { message: 'ยอดรวมต้องไม่ต่ำกว่า 0' })
  readonly totalAmount: number;
}
