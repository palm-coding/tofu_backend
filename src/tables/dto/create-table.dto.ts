import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateTableDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสสาขา' })
  @IsMongoId({ message: 'รหัสสาขาไม่ถูกต้อง' })
  readonly branchId: MongooseSchema.Types.ObjectId;

  @IsNotEmpty({ message: 'กรุณาระบุชื่อโต๊ะ' })
  @IsString()
  readonly name: string;

  @IsNotEmpty({ message: 'กรุณาระบุจำนวนที่นั่ง' })
  readonly capacity: number;

  @IsEnum(['available', 'occupied', 'reserved'], {
    message: 'สถานะโต๊ะต้องเป็น available, occupied หรือ reserved',
  })
  readonly status: string = 'available';
}
