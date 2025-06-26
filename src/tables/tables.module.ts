import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Table, TableSchema } from './schema/tables.schema';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    OrdersModule,
    MongooseModule.forFeature([
      {
        name: Table.name,
        schema: TableSchema,
      },
    ]),
  ],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService, MongooseModule],
})
export class TablesModule {}
