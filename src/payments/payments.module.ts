import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { OmiseService } from './omise.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './schema/payments.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, OmiseService],
  exports: [PaymentsService, OmiseService],
})
export class PaymentsModule {}
