// src/ingredients/schemas/ingredients.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IngredientDocument = Ingredient & Document;

@Schema({ timestamps: true }) // Automatically manages createdAt and updatedAt
export class Ingredient {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  unit: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);
