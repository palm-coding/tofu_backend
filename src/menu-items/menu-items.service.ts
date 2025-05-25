import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItem, MenuItemDocument } from './schema/menu-items.schema';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  /**
   * สร้างรายการเมนูอาหารใหม่ในระบบ
   * @param createMenuItemDto ข้อมูลเมนูอาหารที่ต้องการสร้าง
   * @returns รายการเมนูอาหารที่สร้างขึ้น
   */
  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const createdMenuItem = new this.menuItemModel(createMenuItemDto);
    return createdMenuItem.save();
  }

  /**
   * ดึงข้อมูลรายการเมนูอาหารทั้งหมดในระบบ
   * @returns รายการเมนูอาหารทั้งหมด
   */
  async findAll(): Promise<MenuItem[]> {
    return this.menuItemModel.find().exec();
  }

  /**
   * ค้นหาเมนูอาหารตามรหัส ID
   * @param id รหัสเมนูอาหาร
   * @returns ข้อมูลเมนูอาหารที่ค้นพบ
   * @throws NotFoundException หากไม่พบเมนูอาหาร
   */
  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    return menuItem;
  }

  /**
   * ค้นหาเมนูอาหารตามรหัสสาขา
   * @param branchId รหัสสาขา
   * @returns รายการเมนูอาหารทั้งหมดในสาขานั้นๆ
   */
  async findByBranch(branchId: string): Promise<MenuItem[]> {
    return this.menuItemModel.find({ branchId }).exec();
  }

  /**
   * ค้นหาเมนูอาหารตามรหัสหมวดหมู่
   * @param categoryId รหัสหมวดหมู่
   * @returns รายการเมนูอาหารในหมวดหมู่นั้นๆ
   */
  async findByCategory(categoryId: string): Promise<MenuItem[]> {
    return this.menuItemModel.find({ categoryId }).exec();
  }

  /**
   * ค้นหาเมนูอาหารตามรหัสสาขาและรหัสหมวดหมู่
   * @param branchId รหัสสาขา
   * @param categoryId รหัสหมวดหมู่
   * @returns รายการเมนูอาหารที่ตรงตามเงื่อนไขทั้งสองอย่าง
   */
  async findByBranchAndCategory(
    branchId: string,
    categoryId: string,
  ): Promise<MenuItem[]> {
    return this.menuItemModel.find({ branchId, categoryId }).exec();
  }

  /**
   * อัปเดตข้อมูลเมนูอาหาร
   * @param id รหัสเมนูอาหารที่ต้องการอัปเดต
   * @param updateMenuItemDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลเมนูอาหารที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบเมนูอาหาร
   */
  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    const updatedMenuItem = await this.menuItemModel
      .findByIdAndUpdate(id, updateMenuItemDto, { new: true })
      .exec();

    if (!updatedMenuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return updatedMenuItem;
  }

  /**
   * ลบเมนูอาหารออกจากระบบ
   * @param id รหัสเมนูอาหารที่ต้องการลบ
   * @returns ข้อมูลเมนูอาหารที่ถูกลบ
   * @throws NotFoundException หากไม่พบเมนูอาหาร
   */
  async remove(id: string): Promise<MenuItem> {
    const deletedMenuItem = await this.menuItemModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedMenuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return deletedMenuItem;
  }

  /**
   * สลับสถานะพร้อมขายของเมนูอาหาร (เปิด/ปิดการขาย)
   * @param id รหัสเมนูอาหารที่ต้องการสลับสถานะ
   * @returns ข้อมูลเมนูอาหารที่อัปเดตสถานะแล้ว
   * @throws NotFoundException หากไม่พบเมนูอาหาร
   */
  async toggleAvailability(id: string): Promise<MenuItem> {
    const menuItem = await this.findOne(id);

    const updatedMenuItem = await this.menuItemModel
      .findByIdAndUpdate(
        id,
        { isAvailable: !menuItem.isAvailable },
        { new: true },
      )
      .exec();

    if (!updatedMenuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return updatedMenuItem;
  }
}
