import { IsNotEmpty, IsString } from 'class-validator';

export class JoinSessionDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสอุปกรณ์' })
  readonly clientId: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อ' })
  readonly userLabel: string;
}
