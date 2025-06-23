import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { MenuItem, MenuItemSchema } from './schema/menu-items.schema';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MenuItem.name,
        schema: MenuItemSchema,
      },
    ]),
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, CloudinaryService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
