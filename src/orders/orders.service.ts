import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schema/orders.schema';
import { SessionsService } from 'src/sessions/sessions.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrdersGateway } from './orders.gateway';

/**
 * บริการจัดการออร์เดอร์
 * รับผิดชอบการสร้าง ค้นหา แก้ไข และลบข้อมูลออร์เดอร์
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly sessionsService: SessionsService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  /**
   * สร้างออร์เดอร์ใหม่
   * @param createOrderDto ข้อมูลออร์เดอร์ที่ต้องการสร้าง
   * @returns ข้อมูลออร์เดอร์ที่สร้างขึ้น
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // สร้าง object ใหม่ที่สามารถแก้ไขได้แทนการแก้ไข DTO โดยตรง
    const orderData = { ...createOrderDto };

    // ตรวจสอบว่ามีการระบุ clientId หรือไม่
    if (orderData.clientId && !orderData.orderBy) {
      const session = await this.sessionsService.findOne(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        String(orderData.sessionId),
      );
      const member = session.members.find(
        (m) => m.clientId === orderData.clientId,
      );
      if (member) {
        orderData.orderBy = member.userLabel; // ตอนนี้แก้ไขได้แล้ว
      }
    }

    const createdOrder = new this.orderModel(orderData);
    const savedOrder = await createdOrder.save();

    // แก้ไขการแปลง ObjectId เป็น string ที่ปลอดภัยกว่า
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const sessionIdStr = String(orderData.sessionId);
    const orderIdStr = String(savedOrder._id);

    await this.sessionsService.addOrder(sessionIdStr, orderIdStr);

    // ดึงข้อมูล order พร้อม populate ข้อมูลที่เกี่ยวข้อง
    const populatedOrder = await this.findOne(orderIdStr);

    // ส่งข้อมูล order ใหม่ผ่าน WebSocket
    this.ordersGateway.notifyNewOrder(populatedOrder);

    // ส่งข้อมูลเฉพาะสาขาด้วย
    if (orderData.branchId) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const branchIdStr = String(orderData.branchId);
      this.ordersGateway.notifyNewOrderToBranch(branchIdStr, populatedOrder);
    }

    return savedOrder;
  }

  /**
   * ค้นหาออร์เดอร์ตามรหัสเซสชันและรหัสลูกค้า
   * @param sessionId รหัสเซสชัน
   * @param clientId รหัสลูกค้า
   * @returns รายการออร์เดอร์ที่ตรงตามเงื่อนไข
   */
  async findBySessionAndClient(
    sessionId: string,
    clientId: string,
  ): Promise<Order[]> {
    return this.orderModel
      .find({ sessionId, clientId })
      .sort({ createdAt: -1 })
      .populate('orderLines.menuItemId')
      .exec();
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
      .populate({
        path: 'orderLines.menuItemId',
        model: 'MenuItem',
      })
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
      .populate({
        path: 'orderLines.menuItemId',
        model: 'MenuItem',
      })
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
    return this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'tableId',
        model: 'Table',
      })
      .populate({
        path: 'orderLines.menuItemId',
        model: 'MenuItem',
      })
      .exec();
  }

  /**
   * ค้นหาออร์เดอร์ตามรหัสโต๊ะ
   * @param tableId รหัสโต๊ะ
   * @param status กรองตามสถานะ (ถ้ามี)
   * @param options ตัวเลือกเพิ่มเติมสำหรับการค้นหา
   * @returns รายการออร์เดอร์ทั้งหมดในโต๊ะนั้น
   */
  async findByTable(
    tableId: string,
    status?: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      clientId?: string;
      orderBy?: string;
    },
  ): Promise<Order[]> {
    const filter: any = { tableId };

    // กรองตามสถานะ
    if (status) {
      filter.status = status;
    }

    // กรองตามผู้สั่ง (clientId)
    if (options?.clientId) {
      filter.clientId = options.clientId;
    }

    // กรองตามชื่อผู้สั่ง (orderBy)
    if (options?.orderBy) {
      filter.orderBy = options.orderBy;
    }

    // กรองตามช่วงวันที่
    if (options?.startDate || options?.endDate) {
      filter.createdAt = {};
      if (options.startDate) {
        filter.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.createdAt.$lte = options.endDate;
      }
    }

    return this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('sessionId')
      .populate({
        path: 'orderLines.menuItemId',
        model: 'MenuItem',
      })
      .exec();
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
      .populate('sessionId') // เพิ่มการ populate ข้อมูลสำคัญ
      .populate('branchId')
      .populate('tableId')
      .populate({
        path: 'orderLines.menuItemId',
        model: 'MenuItem',
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // เพิ่มการแจ้งเตือนการเปลี่ยนสถานะผ่าน WebSocket
    this.ordersGateway.notifyOrderStatusChanged(order);

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

  /**
   * ดึงข้อมูลยอดขายประจำสัปดาห์
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param startDate วันที่เริ่มต้น
   * @param endDate วันที่สิ้นสุด
   * @returns ข้อมูลยอดขายแยกตามวันในสัปดาห์
   */
  async getWeeklySales(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    // กำหนดค่าเริ่มต้นถ้าไม่ได้ระบุ
    const now = new Date();
    const start =
      startDate ||
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const end = endDate || now;

    console.log('Fetching weekly sales from', start, 'to', end);

    // สร้างเงื่อนไขการค้นหา
    const matchStage: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (branchId) {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    console.log('branchId:', branchId);

    // ใช้ MongoDB Aggregation Framework
    const result = await this.orderModel
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            totalSales: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            day: '$_id',
            totalSales: 1,
            count: 1,
          },
        },
        { $sort: { day: 1 } },
      ])
      .exec();

    // แปลงตัวเลขวันให้เป็นชื่อวัน
    const daysOfWeek = [
      'อาทิตย์',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัสบดี',
      'ศุกร์',
      'เสาร์',
    ];
    const formattedResult = result.map((item) => ({
      ...item,
      dayName: daysOfWeek[(item.day - 1) % 7],
    }));

    return formattedResult;
  }

  /**
   * ดึงข้อมูลเมนูยอดนิยม
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param limit จำนวนรายการที่ต้องการดึง
   * @param startDate วันที่เริ่มต้น
   * @param endDate วันที่สิ้นสุด
   * @returns รายการเมนูยอดนิยมและสัดส่วนการสั่ง
   */
  async getPopularMenuItems(
    branchId?: string,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const now = new Date();
    const start =
      startDate ||
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const end = endDate || now;

    // สร้างเงื่อนไขการค้นหา
    const filter: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (branchId) {
      filter.branchId = new mongoose.Types.ObjectId(branchId);
    }

    // เพิ่มอินเตอร์เฟสสำหรับ MenuItem
    interface MenuItem {
      _id: mongoose.Types.ObjectId;
      name: string;
      price: number;
      // เพิ่มฟิลด์อื่นๆ ตามต้องการ
    }

    // ดึงข้อมูลออร์เดอร์ด้วย find และ populate
    const orders = await this.orderModel
      .find(filter)
      .populate({
        path: 'orderLines.menuItemId',
        model: 'MenuItem',
      })
      .exec();

    // สร้างแมปเพื่อเก็บข้อมูลการนับจำนวนเมนู
    const menuCountMap = new Map();

    // วนลูปผ่านทุกออร์เดอร์และนับจำนวน
    orders.forEach((order) => {
      if (order.orderLines && Array.isArray(order.orderLines)) {
        order.orderLines.forEach((line) => {
          if (line.menuItemId && typeof line.menuItemId !== 'string') {
            // ใช้ type assertion เพื่อบอก TypeScript ว่านี่คือ MenuItem
            const menuItem = line.menuItemId as unknown as MenuItem;
            const menuItemId = menuItem._id.toString();

            if (!menuCountMap.has(menuItemId)) {
              menuCountMap.set(menuItemId, {
                menuItemId,
                name: menuItem.name,
                price: menuItem.price,
                totalCount: 0,
                orders: 0,
              });
            }

            const menuData = menuCountMap.get(menuItemId);
            menuData.totalCount += line.qty;
            menuData.orders += 1;
          }
        });
      }
    });

    // แปลงแมปเป็นอาร์เรย์ และเรียงลำดับตามจำนวน
    const menuItems = Array.from(menuCountMap.values())
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, limit);

    // คำนวณสัดส่วนโดยหาค่ารวมทั้งหมดก่อน
    const totalOrders = menuItems.reduce(
      (sum, item) => sum + item.totalCount,
      0,
    );

    const formattedResult = menuItems.map((item) => ({
      ...item,
      percentage: parseFloat(
        ((item.totalCount / totalOrders) * 100).toFixed(2),
      ),
    }));

    return formattedResult;
  }

  /**
   * ดึงข้อมูลยอดขายรายชั่วโมง
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param date วันที่ต้องการดูข้อมูล (ถ้าไม่ระบุจะใช้วันปัจจุบัน)
   * @returns ข้อมูลยอดขายแยกตามชั่วโมง
   */
  async getHourlySales(branchId?: string, date?: Date): Promise<any> {
    // กำหนดวันที่
    const targetDate = date || new Date();
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      23,
      59,
      59,
    );

    const matchStage: any = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    };

    if (branchId) {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    // ใช้ MongoDB Aggregation Framework
    const result = await this.orderModel
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            totalSales: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            hour: '$_id',
            totalSales: 1,
            count: 1,
          },
        },
        { $sort: { hour: 1 } },
      ])
      .exec();

    // สร้างข้อมูลสำหรับทุกชั่วโมง (0-23) แม้จะไม่มียอดขาย
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourData = result.find((item) => item.hour === hour);
      return {
        hour,
        timeRange: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
        totalSales: hourData ? hourData.totalSales : 0,
        count: hourData ? hourData.count : 0,
      };
    });

    return hourlyData;
  }

  /**
   * ดึงข้อมูลยอดขายและจำนวนลูกค้าตามช่วงเวลา
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param startDate วันที่เริ่มต้น
   * @param endDate วันที่สิ้นสุด
   * @param groupBy วิธีจัดกลุ่ม ('hour', 'day', 'week', 'month')
   * @returns ข้อมูลยอดขายและจำนวนลูกค้าตามช่วงเวลา
   */
  async getSalesByTimePeriod(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
    groupBy: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<any> {
    const now = new Date();
    const start =
      startDate ||
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const end = endDate || now;

    const matchStage: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (branchId) {
      matchStage.branchId = new mongoose.Types.ObjectId(branchId);
    }

    // กำหนดวิธีจัดกลุ่มตามพารามิเตอร์
    let groupId;

    switch (groupBy) {
      case 'hour':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' },
        };
        break;
      case 'day':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
      case 'week':
        groupId = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        };
        break;
      case 'month':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
    }

    const result = await this.orderModel
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupId,
            totalSales: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            customers: { $addToSet: '$clientId' },
          },
        },
        {
          $project: {
            _id: 0,
            period: '$_id',
            totalSales: 1,
            orderCount: 1,
            customerCount: { $size: '$customers' },
          },
        },
        {
          $sort: {
            'period.year': 1,
            'period.month': 1,
            'period.day': 1,
            'period.hour': 1,
          },
        },
      ])
      .exec();

    // จัดรูปแบบวันที่ให้อ่านง่าย
    const formattedResult = result.map((item) => {
      let formattedDate;
      switch (groupBy) {
        case 'hour':
          formattedDate = `${item.period.year}-${item.period.month.toString().padStart(2, '0')}-${item.period.day.toString().padStart(2, '0')} ${item.period.hour.toString().padStart(2, '0')}:00`;
          break;
        case 'day':
          formattedDate = `${item.period.year}-${item.period.month.toString().padStart(2, '0')}-${item.period.day.toString().padStart(2, '0')}`;
          break;
        case 'week':
          formattedDate = `${item.period.year}-W${item.period.week.toString().padStart(2, '0')}`;
          break;
        case 'month':
          formattedDate = `${item.period.year}-${item.period.month.toString().padStart(2, '0')}`;
          break;
      }

      return {
        period: formattedDate,
        totalSales: item.totalSales,
        orderCount: item.orderCount,
        customerCount: item.customerCount,
        averageOrderValue: parseFloat(
          (item.totalSales / item.orderCount).toFixed(2),
        ),
      };
    });

    return formattedResult;
  }
}
