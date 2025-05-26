import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

// Schema สำหรับรายการสั่งซื้อแต่ละรายการ
class OrderLine {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'MenuItem',
  })
  menuItemId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 1 })
  qty: number;

  @Prop({ default: null })
  note: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Session',
  })
  sessionId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Branch',
  })
  branchId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Table',
  })
  tableId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: ['received', 'preparing', 'served', 'paid'],
    default: 'received',
  })
  status: string;

  @Prop({ type: [OrderLine], required: true })
  orderLines: OrderLine[];

  @Prop({ required: true, type: Number })
  totalAmount: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
