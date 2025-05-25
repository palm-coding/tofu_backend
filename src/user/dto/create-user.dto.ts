import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @IsString()
  readonly name: string;

  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  readonly email: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  readonly password: string;

  @IsOptional()
  @IsEnum(['super_admin', 'branch_owner'], { message: 'บทบาทไม่ถูกต้อง' })
  readonly role?: string;

  @ValidateIf((o) => o.role === 'branch_owner')
  @IsNotEmpty({ message: 'ผู้ดูแลสาขาต้องระบุรหัสสาขา' })
  @IsMongoId({ message: 'รหัสสาขาไม่ถูกต้อง' })
  readonly branchId?: MongooseSchema.Types.ObjectId;
}
