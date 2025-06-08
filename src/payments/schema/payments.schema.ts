import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

/**
 * โมเดลสำหรับการเก็บข้อมูลการชำระเงิน
 */
@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Branch', required: true })
  branchId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Session', required: true })
  sessionId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({
    type: String,
    required: true,
    enum: ['cash', 'promptpay', 'card'],
  })
  method: string;

  @Prop({
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'expired'],
  })
  status: string;

  // ฟิลด์เพิ่มเติมสำหรับ Omise PromptPay
  @Prop({ type: String })
  sourceId: string;

  @Prop({ type: String })
  transactionId: string;

  @Prop({ type: Object })
  paymentDetails: Record<string, any>;

  @Prop({ type: String })
  qrCodeImage: string;

  @Prop({ type: Date })
  expiresAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
