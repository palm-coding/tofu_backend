import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MenuCategoryDocument = MenuCategory & Document;

@Schema({ timestamps: true })
export class MenuCategory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Branch',
  })
  branchId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const MenuCategorySchema = SchemaFactory.createForClass(MenuCategory);
