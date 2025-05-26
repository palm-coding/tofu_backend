import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
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

  @Prop({ required: true })
  qrCode: string;

  @Prop({ required: true })
  userLabel: string;

  @Prop({ required: true, default: Date.now })
  checkinAt: Date;

  @Prop({ default: null })
  checkoutAt: Date;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Order' }],
    default: [],
  })
  orderIds: MongooseSchema.Types.ObjectId[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);
