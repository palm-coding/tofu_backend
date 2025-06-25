import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Waitlist, WaitlistSchema } from './schema/waitlist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Waitlist.name, schema: WaitlistSchema },
    ]),
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
