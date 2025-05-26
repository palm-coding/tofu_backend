import { IsArray, IsDate, IsMongoId, IsOptional } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { Type } from 'class-transformer';

export class UpdateSessionDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly checkoutAt?: Date;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  readonly orderIds?: MongooseSchema.Types.ObjectId[];
}
