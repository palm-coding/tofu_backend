import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateMenuItemDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสสาขา' })
  @IsMongoId({ message: 'รหัสสาขาไม่ถูกต้อง' })
  @Type(() => String) // <--- important
  readonly branchId: MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุชื่อเมนู' })
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @IsNotEmpty({ message: 'กรุณาระบุราคา' })
  @Type(() => Number) // <--- important
  @IsNumber({}, { message: 'ราคาต้องเป็นตัวเลข' })
  @Min(0, { message: 'ราคาต้องไม่ต่ำกว่า 0' })
  readonly price: number;

  @IsNotEmpty({ message: 'กรุณาระบุหมวดหมู่' })
  @IsMongoId({ message: 'รหัสหมวดหมู่ไม่ถูกต้อง' })
  @Type(() => String) // <--- important
  readonly categoryId: MongooseSchema.Types.ObjectId;

  @IsOptional()
  @Type(() => Boolean) // <--- important
  @IsBoolean()
  readonly isAvailable?: boolean = true;
}
