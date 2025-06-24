import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WaitlistDocument = Waitlist & Document;

@Schema({ timestamps: true }) // Adds createdAt / updatedAt
export class Waitlist {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Branch' })
  branchId: Types.ObjectId;

  @Prop({ required: true })
  partyName: string;

  @Prop({ required: true })
  partySize: number;

  @Prop({ required: true })
  contactInfo: string;

  @Prop({ required: true })
  requestedAt: Date;

  @Prop({ default: null })
  notifiedAt: Date;

  @Prop({
    required: true,
    enum: ['waiting', 'notified', 'seated', 'cancelled'],
    default: 'waiting',
  })
  status: string;
}

export const WaitlistSchema = SchemaFactory.createForClass(Waitlist);
