import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateMenuCategoryDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสสาขา' })
  @IsMongoId({ message: 'รหัสสาขาไม่ถูกต้อง' })
  readonly branchId: MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุชื่อหมวดหมู่เมนู' })
  @IsString()
  readonly name: string;
}
