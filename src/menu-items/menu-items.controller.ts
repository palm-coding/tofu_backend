import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { AuthGuard } from '@nestjs/passport';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * API สร้างรายการเมนูอาหารใหม่พร้อมรูปภาพ
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * POST /menu-items
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = createMenuItemDto.imageUrl;

    if (file) {
      const cloudinaryResponse = await this.cloudinaryService.uploadImage(file);
      imageUrl = cloudinaryResponse.secure_url;
    }

    return this.menuItemsService.create({
      ...createMenuItemDto,
      imageUrl,
    });
  }

  /**
   * API ดึงข้อมูลรายการเมนูอาหาร สามารถกรองตามสาขาและหมวดหมู่ได้
   * GET /menu-items
   * Query Parameters: branchId, categoryId
   */
  @Get()
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    if (branchId && categoryId) {
      return this.menuItemsService.findByBranchAndCategory(
        branchId,
        categoryId,
      );
    } else if (branchId) {
      return this.menuItemsService.findByBranch(branchId);
    } else if (categoryId) {
      return this.menuItemsService.findByCategory(categoryId);
    }
    return this.menuItemsService.findAll();
  }

  /**
   * API ดึงข้อมูลเมนูอาหารตามรหัส ID
   * GET /menu-items/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  /**
   * API อัปเดตข้อมูลเมนูอาหารพร้อมรูปภาพ
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * PATCH /menu-items/:id
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = updateMenuItemDto.imageUrl;

    // ตรวจสอบและอัปโหลดรูปภาพใหม่ หากมีการแนบมา
    if (file) {
      // ลบรูปเก่าก่อน หากมี
      const menuItem = await this.menuItemsService.findOne(id);
      if (menuItem.imageUrl) {
        const publicId = this.cloudinaryService.getPublicIdFromUrl(
          menuItem.imageUrl,
        );
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }

      // อัปโหลดรูปใหม่
      const cloudinaryResponse = await this.cloudinaryService.uploadImage(file);
      imageUrl = cloudinaryResponse.secure_url;
    }

    return this.menuItemsService.update(id, {
      ...updateMenuItemDto,
      imageUrl,
    });
  }

  /**
   * API สลับสถานะพร้อมขายของเมนูอาหาร (เปิด/ปิดการขาย)
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * PATCH /menu-items/:id/toggle-availability
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/toggle-availability')
  async toggleAvailability(@Param('id') id: string) {
    return this.menuItemsService.toggleAvailability(id);
  }

  /**
   * API ลบเมนูอาหาร
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * DELETE /menu-items/:id
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }
}
