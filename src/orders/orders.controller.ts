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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateStatusDto } from './dto/update-status.dto';

/**
 * คอนโทรลเลอร์จัดการ API ออร์เดอร์
 * ให้บริการ endpoint สำหรับการจัดการข้อมูลออร์เดอร์
 */
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * API สร้างออร์เดอร์ใหม่
   * POST /orders
   * @param createOrderDto ข้อมูลออร์เดอร์ที่ต้องการสร้าง
   * @returns ข้อมูลออร์เดอร์ที่สร้างขึ้น
   */
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  /**
   * API ดึงข้อมูลออร์เดอร์ทั้งหมด
   * GET /orders
   * @returns รายการออร์เดอร์ทั้งหมด
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  /**
   * API ค้นหาออร์เดอร์ตามรหัสเซสชัน
   * GET /orders/session/:sessionId
   * @param sessionId รหัสเซสชัน
   * @returns รายการออร์เดอร์ทั้งหมดในเซสชันนั้น
   */
  @Get('session/:sessionId')
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.ordersService.findBySession(sessionId);
  }

  /**
   * API ค้นหาออร์เดอร์ตามรหัสเซสชันและรหัสลูกค้า
   * GET /orders/session/:sessionId/client/:clientId
   * @param sessionId รหัสเซสชัน
   * @param clientId รหัสลูกค้า
   * @returns รายการออร์เดอร์ทั้งหมดในเซสชันและลูกค้านั้น
   */
  @Get('session/:sessionId/client/:clientId')
  async findBySessionAndClient(
    @Param('sessionId') sessionId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.ordersService.findBySessionAndClient(sessionId, clientId);
  }

  /**
   * API ค้นหาออร์เดอร์ตามรหัสสาขา
   * GET /orders/branch/:branchId
   * @param branchId รหัสสาขา
   * @param status กรองตามสถานะ (ถ้ามี)
   * @returns รายการออร์เดอร์ทั้งหมดในสาขานั้น
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('branch/:branchId')
  async findByBranch(
    @Param('branchId') branchId: string,
    @Query('status') status: string,
  ) {
    return this.ordersService.findByBranch(branchId, status);
  }

  /**
   * API ค้นหาออร์เดอร์ตามรหัสโต๊ะ
   * GET /orders/table/:tableId
   * @param tableId รหัสโต๊ะ
   * @param status กรองตามสถานะ (ถ้ามี)
   * @param clientId กรองตามรหัสลูกค้า (ถ้ามี)
   * @param orderBy กรองตามชื่อผู้สั่ง (ถ้ามี)
   * @param startDate กรองตามวันที่เริ่มต้น (ถ้ามี)
   * @param endDate กรองตามวันที่สิ้นสุด (ถ้ามี)
   * @returns รายการออร์เดอร์ทั้งหมดในโต๊ะนั้น
   */
  @Get('table/:tableId')
  async findByTable(
    @Param('tableId') tableId: string,
    @Query('status') status: string,
    @Query('clientId') clientId?: string,
    @Query('orderBy') orderBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const options: any = {};

    if (clientId) {
      options.clientId = clientId;
    }

    if (orderBy) {
      options.orderBy = orderBy;
    }

    if (startDate) {
      options.startDate = new Date(startDate);
    }

    if (endDate) {
      options.endDate = new Date(endDate);
    }

    return this.ordersService.findByTable(tableId, status, options);
  }

  /**
   * API ค้นหาออร์เดอร์ด้วยรหัส ID
   * GET /orders/:id
   * @param id รหัสออร์เดอร์
   * @returns ข้อมูลออร์เดอร์ที่ค้นพบ
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  /**
   * API อัปเดตข้อมูลออร์เดอร์
   * PATCH /orders/:id
   * @param id รหัสออร์เดอร์
   * @param updateOrderDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลออร์เดอร์ที่อัปเดตแล้ว
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  /**
   * API อัปเดตสถานะของออร์เดอร์
   * PATCH /orders/:id/status
   * @param id รหัสออร์เดอร์
   * @param updateStatusDto ข้อมูลสถานะใหม่
   * @returns ข้อมูลออร์เดอร์ที่อัปเดตแล้ว
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  /**
   * API ลบออร์เดอร์
   * DELETE /orders/:id
   * @param id รหัสออร์เดอร์ที่ต้องการลบ
   * @returns ข้อมูลออร์เดอร์ที่ถูกลบ
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  /**
   * API ดึงข้อมูลยอดขายประจำสัปดาห์
   * GET /orders/analytics/weekly-sales
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param startDate วันที่เริ่มต้น (yyyy-mm-dd)
   * @param endDate วันที่สิ้นสุด (yyyy-mm-dd)
   * @returns ข้อมูลยอดขายแยกตามวันในสัปดาห์
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('analytics/weekly-sales')
  async getWeeklySales(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    return this.ordersService.getWeeklySales(
      branchId,
      startDateObj,
      endDateObj,
    );
  }

  /**
   * API ดึงข้อมูลเมนูยอดนิยม
   * GET /orders/analytics/popular-menu
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param limit จำนวนรายการที่ต้องการดึง
   * @param startDate วันที่เริ่มต้น (yyyy-mm-dd)
   * @param endDate วันที่สิ้นสุด (yyyy-mm-dd)
   * @returns รายการเมนูยอดนิยมและสัดส่วนการสั่ง
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('analytics/popular-menu')
  async getPopularMenuItems(
    @Query('branchId') branchId?: string,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;
    const limitNum = limit ? parseInt(limit.toString(), 10) : 10;

    return this.ordersService.getPopularMenuItems(
      branchId,
      limitNum,
      startDateObj,
      endDateObj,
    );
  }

  /**
   * API ดึงข้อมูลยอดขายรายชั่วโมง
   * GET /orders/analytics/hourly-sales
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param date วันที่ต้องการดูข้อมูล (yyyy-mm-dd)
   * @returns ข้อมูลยอดขายแยกตามชั่วโมง
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('analytics/hourly-sales')
  async getHourlySales(
    @Query('branchId') branchId?: string,
    @Query('date') date?: string,
  ) {
    const dateObj = date ? new Date(date) : undefined;

    return this.ordersService.getHourlySales(branchId, dateObj);
  }

  /**
   * API ดึงข้อมูลยอดขายและจำนวนลูกค้าตามช่วงเวลา
   * GET /orders/analytics/sales-by-period
   * @param branchId รหัสสาขา (ถ้าต้องการข้อมูลเฉพาะสาขา)
   * @param startDate วันที่เริ่มต้น (yyyy-mm-dd)
   * @param endDate วันที่สิ้นสุด (yyyy-mm-dd)
   * @param groupBy วิธีจัดกลุ่ม ('hour', 'day', 'week', 'month')
   * @returns ข้อมูลยอดขายและจำนวนลูกค้าตามช่วงเวลา
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('analytics/sales-by-period')
  async getSalesByTimePeriod(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'hour' | 'day' | 'week' | 'month',
  ) {
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;
    const groupByParam = groupBy || 'day';

    return this.ordersService.getSalesByTimePeriod(
      branchId,
      startDateObj,
      endDateObj,
      groupByParam,
    );
  }
}
