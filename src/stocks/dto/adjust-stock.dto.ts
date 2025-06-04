// dto/adjust-stock.dto.ts
import { IsNumber, IsString, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Quantity to adjust (must be positive)',
    example: 10,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({
    description: 'Type of adjustment',
    enum: ['add', 'remove'],
    example: 'add',
  })
  @IsString()
  @IsIn(['add', 'remove'], { message: 'Type must be either "add" or "remove"' })
  type: 'add' | 'remove';

  @ApiPropertyOptional({
    description: 'Optional reason for the adjustment',
    example: 'Received new shipment',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
