import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Branch',
  })
  branchId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Order',
  })
  orderId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Session',
  })
  sessionId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({
    required: true,
    enum: ['cash', 'promptpay', 'card'],
    default: 'cash',
  })
  method: string;

  @Prop({
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
