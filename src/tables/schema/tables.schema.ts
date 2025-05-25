import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TableDocument = Table & Document;

@Schema({ timestamps: true })
export class Table {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Branch',
  })
  branchId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available',
  })
  status: string;
}

export const TableSchema = SchemaFactory.createForClass(Table);
