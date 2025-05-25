import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty({ message: 'กรุณากรอกชื่อสาขา' })
  @IsString()
  readonly name: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสสาขา' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'รหัสสาขาต้องประกอบด้วยตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข และเครื่องหมายขีด (-) เท่านั้น',
  })
  readonly code: string;

  @IsNotEmpty({ message: 'กรุณากรอกที่อยู่สาขา' })
  @IsString()
  readonly address: string;

  @IsNotEmpty({ message: 'กรุณากรอกเบอร์ติดต่อสาขา' })
  @IsString()
  readonly contact: string;
}
