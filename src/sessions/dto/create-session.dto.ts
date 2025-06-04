import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty({ message: 'กรุณาระบุรหัสสาขา' })
  @IsMongoId({ message: 'รหัสสาขาไม่ถูกต้อง' })
  branchId: string;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสโต๊ะ' })
  @IsMongoId({ message: 'รหัสโต๊ะไม่ถูกต้อง' })
  tableId: string;

  @IsOptional()
  @IsString()
  qrCode?: string;
}
