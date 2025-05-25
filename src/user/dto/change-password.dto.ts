import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านปัจจุบัน' })
  @IsString()
  readonly currentPassword: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านใหม่' })
  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  readonly newPassword: string;
}
