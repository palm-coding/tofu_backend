import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import {
  MenuCategory,
  MenuCategoryDocument,
} from './schema/menu-categories.schema';

/**
 * บริการจัดการหมวดหมู่เมนูอาหาร
 * รับผิดชอบการสร้าง ค้นหา แก้ไข และลบข้อมูลหมวดหมู่เมนู
 */
@Injectable()
export class MenuCategoriesService {
  constructor(
    @InjectModel(MenuCategory.name)
    private menuCategoryModel: Model<MenuCategoryDocument>,
  ) {}

  /**
   * สร้างหมวดหมู่เมนูอาหารใหม่
   * @param createMenuCategoryDto ข้อมูลหมวดหมู่เมนูที่ต้องการสร้าง
   * @returns หมวดหมู่เมนูที่สร้างขึ้นใหม่
   */
  async create(
    createMenuCategoryDto: CreateMenuCategoryDto,
  ): Promise<MenuCategory> {
    const createdMenuCategory = new this.menuCategoryModel(
      createMenuCategoryDto,
    );
    return createdMenuCategory.save();
  }

  /**
   * ดึงข้อมูลหมวดหมู่เมนูทั้งหมด
   * @returns รายการหมวดหมู่เมนูทั้งหมดในระบบ
   */
  async findAll(): Promise<MenuCategory[]> {
    return this.menuCategoryModel.find().exec();
  }

  /**
   * ค้นหาหมวดหมู่เมนูด้วยรหัส ID
   * @param id รหัสหมวดหมู่เมนู
   * @returns ข้อมูลหมวดหมู่เมนูที่ค้นพบ
   * @throws NotFoundException หากไม่พบหมวดหมู่เมนู
   */
  async findOne(id: string): Promise<MenuCategory> {
    const menuCategory = await this.menuCategoryModel.findById(id).exec();
    if (!menuCategory) {
      throw new NotFoundException(`Menu category with ID ${id} not found`);
    }
    return menuCategory;
  }

  /**
   * ค้นหาหมวดหมู่เมนูตามรหัสสาขา
   * @param branchId รหัสสาขา
   * @returns รายการหมวดหมู่เมนูทั้งหมดของสาขานั้นๆ
   */
  async findByBranch(branchId: string): Promise<MenuCategory[]> {
    return this.menuCategoryModel.find({ branchId }).exec();
  }

  /**
   * อัปเดตข้อมูลหมวดหมู่เมนู
   * @param id รหัสหมวดหมู่เมนูที่ต้องการอัปเดต
   * @param updateMenuCategoryDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลหมวดหมู่เมนูที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบหมวดหมู่เมนู
   */
  async update(
    id: string,
    updateMenuCategoryDto: UpdateMenuCategoryDto,
  ): Promise<MenuCategory> {
    const updatedMenuCategory = await this.menuCategoryModel
      .findByIdAndUpdate(id, updateMenuCategoryDto, { new: true })
      .exec();

    if (!updatedMenuCategory) {
      throw new NotFoundException(`Menu category with ID ${id} not found`);
    }

    return updatedMenuCategory;
  }

  /**
   * ลบหมวดหมู่เมนู
   * @param id รหัสหมวดหมู่เมนูที่ต้องการลบ
   * @returns ข้อมูลหมวดหมู่เมนูที่ถูกลบ
   * @throws NotFoundException หากไม่พบหมวดหมู่เมนู
   */
  async remove(id: string): Promise<MenuCategory> {
    const deletedMenuCategory = await this.menuCategoryModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedMenuCategory) {
      throw new NotFoundException(`Menu category with ID ${id} not found`);
    }

    return deletedMenuCategory;
  }
}
