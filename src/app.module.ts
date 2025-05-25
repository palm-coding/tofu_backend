import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BranchesModule } from './branches/branches.module';
import { TablesModule } from './tables/tables.module';
import { MenuCategoriesModule } from './menu-categories/menu-categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    BranchesModule,
    TablesModule,
    MenuCategoriesModule,
    MenuItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
