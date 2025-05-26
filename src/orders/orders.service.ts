import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schema/orders.schema';
import { SessionsService } from 'src/sessions/sessions.service';
import { UpdateStatusDto } from './dto/update-status.dto';

/**
 * บริการจัดการออร์เดอร์
 * รับผิดชอบการสร้าง ค้นหา แก้ไข และลบข้อมูลออร์เดอร์
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * สร้างออร์เดอร์ใหม่
   * @param createOrderDto ข้อมูลออร์เดอร์ที่ต้องการสร้าง
   * @returns ข้อมูลออร์เดอร์ที่สร้างขึ้น
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const createdOrder = new this.orderModel(createOrderDto);
    const savedOrder = await createdOrder.save();

    // แก้ไขการแปลง ObjectId เป็น string ที่ปลอดภัยกว่า
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const sessionIdStr = String(createOrderDto.sessionId);
    const orderIdStr = String(savedOrder._id);

    await this.sessionsService.addOrder(sessionIdStr, orderIdStr);

    return savedOrder;
  }

  /**
   * ดึงข้อมูลออร์เดอร์ทั้งหมด
   * @returns รายการออร์เดอร์ทั้งหมด
   */
  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate('tableId')
      .populate({
        path: 'orderLines.menuItemId',
        model: 'MenuItem',
      })
      .exec();
  }

  /**
   * ค้นหาออร์เดอร์ด้วยรหัส ID
   * @param id รหัสออร์เดอร์
   * @returns ข้อมูลออร์เดอร์ที่ค้นพบ
   * @throws NotFoundException หากไม่พบออร์เดอร์
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('sessionId')
      .populate('branchId')
      .populate('tableId')
      .populate('orderLines.menuItemId')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  /**
   * ค้นหาออร์เดอร์ตามรหัสเซสชัน
   * @param sessionId รหัสเซสชัน
   * @returns รายการออร์เดอร์ทั้งหมดในเซสชันนั้น
   */
  async findBySession(sessionId: string): Promise<Order[]> {
    return this.orderModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .populate('orderLines.menuItemId')
      .exec();
  }

  /**
   * ค้นหาออร์เดอร์ตามรหัสสาขา
   * @param branchId รหัสสาขา
   * @param status กรองตามสถานะ (ถ้ามี)
   * @returns รายการออร์เดอร์ทั้งหมดในสาขานั้น
   */
  async findByBranch(branchId: string, status?: string): Promise<Order[]> {
    const filter: any = { branchId };
    if (status) {
      filter.status = status;
    }
    return this.orderModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /**
   * อัปเดตข้อมูลออร์เดอร์
   * @param id รหัสออร์เดอร์
   * @param updateOrderDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลออร์เดอร์ที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบออร์เดอร์
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return updatedOrder;
  }

  /**
   * อัปเดตสถานะของออร์เดอร์
   * @param id รหัสออร์เดอร์
   * @param status สถานะใหม่
   * @returns ข้อมูลออร์เดอร์ที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบออร์เดอร์
   * @throws BadRequestException หากสถานะไม่ถูกต้อง
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status: updateStatusDto.status }, { new: true })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * ลบออร์เดอร์
   * @param id รหัสออร์เดอร์ที่ต้องการลบ
   * @returns ข้อมูลออร์เดอร์ที่ถูกลบ
   * @throws NotFoundException หากไม่พบออร์เดอร์
   */
  async remove(id: string): Promise<Order> {
    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();

    if (!deletedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return deletedOrder;
  }
}
