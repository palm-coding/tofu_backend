import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Branch',
  })
  branchId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'MenuCategory',
  })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: true })
  isAvailable: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
