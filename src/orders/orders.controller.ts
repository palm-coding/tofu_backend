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
}
