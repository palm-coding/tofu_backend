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
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  /**
   * API สร้างรายการเมนูอาหารใหม่
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * POST /menu-items
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemsService.create(createMenuItemDto);
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
   * API อัปเดตข้อมูลเมนูอาหาร
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * PATCH /menu-items/:id
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, updateMenuItemDto);
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
