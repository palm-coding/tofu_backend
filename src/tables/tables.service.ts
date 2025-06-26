import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Table, TableDocument } from './schema/tables.schema';
import { OrdersGateway } from 'src/orders/orders.gateway';

/**
 * บริการจัดการข้อมูลโต๊ะในร้านอาหาร
 * รับผิดชอบการสร้าง ค้นหา แก้ไข และลบข้อมูลโต๊ะ
 */
@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  /**
   * สร้างข้อมูลโต๊ะใหม่
   * @param createTableDto ข้อมูลโต๊ะที่ต้องการสร้าง
   * @returns ข้อมูลโต๊ะที่สร้างขึ้นใหม่
   */
  async create(createTableDto: CreateTableDto): Promise<Table> {
    const createdTable = new this.tableModel(createTableDto);
    return createdTable.save();
  }

  /**
   * ดึงข้อมูลโต๊ะทั้งหมด
   * @returns รายการโต๊ะทั้งหมดในระบบ
   */
  async findAll(): Promise<Table[]> {
    return this.tableModel.find().exec();
  }

  /**
   * ค้นหาโต๊ะด้วยรหัส ID
   * @param id รหัสโต๊ะ
   * @returns ข้อมูลโต๊ะที่ค้นพบ
   * @throws NotFoundException หากไม่พบโต๊ะ
   */
  async findOne(id: string): Promise<Table> {
    const table = await this.tableModel.findById(id).exec();
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  /**
   * ค้นหาโต๊ะตามรหัสสาขา
   * @param branchId รหัสสาขา
   * @returns รายการโต๊ะทั้งหมดในสาขานั้นๆ
   */
  async findByBranch(branchId: string): Promise<Table[]> {
    return this.tableModel.find({ branchId }).exec();
  }

  /**
   * อัปเดตข้อมูลโต๊ะ
   * @param id รหัสโต๊ะที่ต้องการอัปเดต
   * @param updateTableDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลโต๊ะที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบโต๊ะ
   */
  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const updatedTable = await this.tableModel
      .findByIdAndUpdate(id, updateTableDto, { new: true })
      .populate('branchId') // เพิ่ม populate เพื่อให้ได้ข้อมูลสาขา
      .exec();

    if (!updatedTable) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    // ส่งการแจ้งเตือนการเปลี่ยนแปลงสถานะโต๊ะ
    this.ordersGateway.notifyTableStatusChanged(updatedTable);

    return updatedTable;
  }

  /**
   * ลบข้อมูลโต๊ะ
   * @param id รหัสโต๊ะที่ต้องการลบ
   * @returns ข้อมูลโต๊ะที่ถูกลบ
   * @throws NotFoundException หากไม่พบโต๊ะ
   */
  async remove(id: string): Promise<Table> {
    const deletedTable = await this.tableModel.findByIdAndDelete(id).exec();

    if (!deletedTable) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return deletedTable;
  }
}
