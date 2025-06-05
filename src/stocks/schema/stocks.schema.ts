// src/stocks/schemas/stocks.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockDocument = Stock & Document;

@Schema({ timestamps: { createdAt: false, updatedAt: true } })
export class Stock {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Branch' })
  branchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Ingredient' })
  ingredientId: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  quantity: number;

  @Prop({ type: Number, required: true })
  lowThreshold: number;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
