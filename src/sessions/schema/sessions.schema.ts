import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SessionDocument = Session & Document;

// เพิ่ม embedded schema สำหรับสมาชิกแต่ละคน
class SessionMember {
  @Prop({ required: true })
  clientId: string; // ID เฉพาะของอุปกรณ์/เบราว์เซอร์

  @Prop({ required: true })
  userLabel: string; // ชื่อที่ผู้ใช้กรอก

  @Prop({ default: Date.now })
  joinedAt: Date;
}

@Schema({ timestamps: true })
export class Session {
  readonly _id: MongooseSchema.Types.ObjectId;

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

  // เพิ่ม members array
  @Prop({ type: [Object], default: [] })
  members: SessionMember[];

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
