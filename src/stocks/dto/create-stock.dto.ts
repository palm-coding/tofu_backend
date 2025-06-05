import { IsMongoId, IsNumber } from 'class-validator';

export class CreateStockDto {
  @IsMongoId()
  branchId: string;

  @IsMongoId()
  ingredientId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  lowThreshold: number;
}
