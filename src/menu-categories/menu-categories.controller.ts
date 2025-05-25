import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * คอนโทรลเลอร์จัดการ API หมวดหมู่เมนูอาหาร
 * ให้บริการ endpoint สำหรับการจัดการข้อมูลหมวดหมู่เมนู
 */
@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

  /**
   * API สร้างหมวดหมู่เมนูอาหารใหม่
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * POST /menu-categories
   * @param createMenuCategoryDto ข้อมูลหมวดหมู่เมนูที่ต้องการสร้าง
   * @returns หมวดหมู่เมนูที่สร้างขึ้นใหม่
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createMenuCategoryDto: CreateMenuCategoryDto) {
    return this.menuCategoriesService.create(createMenuCategoryDto);
  }

  /**
   * API ดึงข้อมูลหมวดหมู่เมนูทั้งหมด
   * GET /menu-categories
   * @returns รายการหมวดหมู่เมนูทั้งหมด
   */
  @Get()
  async findAll() {
    return this.menuCategoriesService.findAll();
  }

  /**
   * API ดึงข้อมูลหมวดหมู่เมนูตามรหัส ID
   * GET /menu-categories/:id
   * @param id รหัสหมวดหมู่เมนู
   * @returns ข้อมูลหมวดหมู่เมนูที่ค้นพบ
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.menuCategoriesService.findOne(id);
  }

  /**
   * API ดึงข้อมูลหมวดหมู่เมนูตามรหัสสาขา
   * GET /menu-categories/branch/:branchId
   * @param branchId รหัสสาขา
   * @returns รายการหมวดหมู่เมนูทั้งหมดของสาขานั้นๆ
   */
  @Get('branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string) {
    return this.menuCategoriesService.findByBranch(branchId);
  }

  /**
   * API อัปเดตข้อมูลหมวดหมู่เมนู
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * PATCH /menu-categories/:id
   * @param id รหัสหมวดหมู่เมนูที่ต้องการอัปเดต
   * @param updateMenuCategoryDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลหมวดหมู่เมนูที่อัปเดตแล้ว
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMenuCategoryDto: UpdateMenuCategoryDto,
  ) {
    return this.menuCategoriesService.update(id, updateMenuCategoryDto);
  }

  /**
   * API ลบหมวดหมู่เมนู
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * DELETE /menu-categories/:id
   * @param id รหัสหมวดหมู่เมนูที่ต้องการลบ
   * @returns ข้อมูลหมวดหมู่เมนูที่ถูกลบ
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.menuCategoriesService.remove(id);
  }
}
