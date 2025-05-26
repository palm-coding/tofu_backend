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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * คอนโทรลเลอร์จัดการ API รายการชำระเงิน
 * ให้บริการ endpoint สำหรับการจัดการข้อมูลการชำระเงิน
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * API สร้างรายการชำระเงินใหม่
   * POST /payments
   * @param createPaymentDto ข้อมูลการชำระเงิน
   * @returns รายการชำระเงินที่สร้างขึ้น
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  /**
   * API ดึงข้อมูลรายการชำระเงินทั้งหมด
   * GET /payments
   * @returns รายการชำระเงินทั้งหมด
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  /**
   * API ค้นหารายการชำระเงินตามรหัสออร์เดอร์
   * GET /payments/order/:orderId
   * @param orderId รหัสออร์เดอร์
   * @returns รายการชำระเงินทั้งหมดของออร์เดอร์นั้น
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }

  /**
   * API ค้นหารายการชำระเงินตามรหัสเซสชัน
   * GET /payments/session/:sessionId
   * @param sessionId รหัสเซสชัน
   * @returns รายการชำระเงินทั้งหมดของเซสชันนั้น
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('session/:sessionId')
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.paymentsService.findBySession(sessionId);
  }

  /**
   * API ค้นหารายการชำระเงินตามรหัสสาขา
   * GET /payments/branch/:branchId
   * @param branchId รหัสสาขา
   * @param status กรองตามสถานะ (ถ้ามี)
   * @returns รายการชำระเงินทั้งหมดของสาขานั้น
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('branch/:branchId')
  async findByBranch(
    @Param('branchId') branchId: string,
    @Query('status') status: string,
  ) {
    return this.paymentsService.findByBranch(branchId, status);
  }

  /**
   * API ค้นหารายการชำระเงินด้วยรหัส ID
   * GET /payments/:id
   * @param id รหัสรายการชำระเงิน
   * @returns ข้อมูลรายการชำระเงินที่ค้นพบ
   */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  /**
   * API อัปเดตข้อมูลการชำระเงิน
   * PATCH /payments/:id
   * @param id รหัสรายการชำระเงิน
   * @param updatePaymentDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลรายการชำระเงินที่อัปเดตแล้ว
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  /**
   * API อัปเดตสถานะการชำระเงิน
   * PATCH /payments/:id/status/:status
   * @param id รหัสรายการชำระเงิน
   * @param status สถานะใหม่
   * @returns ข้อมูลรายการชำระเงินที่อัปเดตแล้ว
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status/:status')
  async updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.paymentsService.updateStatus(id, status);
  }

  /**
   * API ลบรายการชำระเงิน
   * DELETE /payments/:id
   * @param id รหัสรายการชำระเงินที่ต้องการลบ
   * @returns ข้อมูลรายการชำระเงินที่ถูกลบ
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
