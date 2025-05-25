import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoriesController } from './menu-categories.controller';
import {
  MenuCategory,
  MenuCategorySchema,
} from './schema/menu-categories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MenuCategory.name,
        schema: MenuCategorySchema,
      },
    ]),
  ],
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService],
  exports: [MenuCategoriesService],
})
export class MenuCategoriesModule {}
