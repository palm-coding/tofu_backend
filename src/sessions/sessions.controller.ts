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
  NotFoundException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AuthGuard } from '@nestjs/passport';
import { JoinSessionDto } from './dto/join-session.dto';

/**
 * คอนโทรลเลอร์จัดการ API เซสชันลูกค้า
 * ให้บริการ endpoint สำหรับการเช็คอิน เช็คเอาท์ และจัดการข้อมูลเซสชัน
 */
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * API สร้างเซสชันใหม่ (เช็คอิน)
   * POST /sessions
   * @param createSessionDto ข้อมูลการเช็คอินลูกค้า
   * @returns ข้อมูลเซสชันที่สร้างขึ้น
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  /**
   * API ดึงข้อมูลเซสชันทั้งหมด
   * GET /sessions
   * @param activeOnly กรองเฉพาะเซสชันที่ยังไม่เช็คเอาท์
   * @returns รายการเซสชันทั้งหมด
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query('activeOnly') activeOnly: boolean = false) {
    return this.sessionsService.findAll(activeOnly);
  }

  /**
   * API ค้นหาเซสชันตามรหัสสาขา
   * GET /sessions/branch/:branchId
   * @param branchId รหัสสาขา
   * @param activeOnly กรองเฉพาะเซสชันที่ยังไม่เช็คเอาท์
   * @returns รายการเซสชันทั้งหมดในสาขานั้นๆ
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('branch/:branchId')
  async findByBranch(
    @Param('branchId') branchId: string,
    @Query('activeOnly') activeOnly: boolean = false,
  ) {
    return this.sessionsService.findByBranch(branchId, activeOnly);
  }

  /**
   * API ค้นหาเซสชันด้วย QR Code
   * GET /sessions/qr/:qrCode
   * @param qrCode QR Code ของเซสชัน
   * @param includeInactive รวมเซสชันที่เช็คเอาท์แล้วด้วยหรือไม่
   * @returns ข้อมูลเซสชันที่ค้นพบ หรือ null ถ้าไม่พบ
   */
  @Get('qr/:qrCode')
  async findByQrCode(
    @Param('qrCode') qrCode: string,
    @Query('includeInactive') includeInactive: boolean = false,
  ) {
    const session = await this.sessionsService.findByQrCode(
      qrCode,
      includeInactive,
    );
    if (!session) {
      throw new NotFoundException(`Session with QR Code ${qrCode} not found`);
    }
    return session;
  }

  /**
   * API เข้าร่วมเซสชันด้วย QR Code
   * POST /sessions/join/:qrCode
   * @param qrCode QR Code ของเซสชัน
   * @param joinSessionDto ข้อมูลผู้เข้าร่วม
   * @returns ข้อมูลเซสชัน
   */
  @Post('join/:qrCode')
  async joinSession(
    @Param('qrCode') qrCode: string,
    @Body() joinSessionDto: JoinSessionDto,
  ) {
    return this.sessionsService.joinSession(qrCode, joinSessionDto);
  }

  /**
   * API ค้นหาเซสชันตามรหัสโต๊ะ
   * GET /sessions/table/:tableId
   * @param tableId รหัสโต๊ะ
   * @param activeOnly กรองเฉพาะเซสชันที่ยังไม่เช็คเอาท์
   * @returns รายการเซสชันทั้งหมดที่ใช้โต๊ะนั้น
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('table/:tableId')
  async findByTable(
    @Param('tableId') tableId: string,
    @Query('activeOnly') activeOnly: boolean = false,
  ) {
    return this.sessionsService.findByTable(tableId, activeOnly);
  }

  /**
   * API ค้นหาเซสชันที่ยังเปิดอยู่ของโต๊ะ
   * GET /sessions/table/:tableId/active
   * @param tableId รหัสโต๊ะ
   * @returns เซสชันที่ยังเปิดอยู่ หรือ null ถ้าไม่มี
   */
  @Get('table/:tableId/active')
  async findActiveSessionByTable(@Param('tableId') tableId: string) {
    return this.sessionsService.findActiveSessionByTable(tableId);
  }

  /**
   * API ค้นหาเซสชันด้วยรหัส ID
   * GET /sessions/:id
   * @param id รหัสเซสชัน
   * @returns ข้อมูลเซสชันที่ค้นพบ
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  /**
   * API อัปเดตข้อมูลเซสชัน
   * PATCH /sessions/:id
   * @param id รหัสเซสชัน
   * @param updateSessionDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลเซสชันที่อัปเดตแล้ว
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  /**
   * API เพิ่มออเดอร์เข้าไปในเซสชัน
   * POST /sessions/:id/orders/:orderId
   * @param id รหัสเซสชัน
   * @param orderId รหัสออเดอร์
   * @returns ข้อมูลเซสชันที่อัปเดตแล้ว
   */
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/orders/:orderId')
  async addOrder(@Param('id') id: string, @Param('orderId') orderId: string) {
    return this.sessionsService.addOrder(id, orderId);
  }

  /**
   * API เช็คเอาท์ (ปิด) เซสชัน
   * POST /sessions/:id/checkout
   * @param id รหัสเซสชัน
   * @returns ข้อมูลเซสชันที่เช็คเอาท์แล้ว
   */
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/checkout')
  async checkout(@Param('id') id: string) {
    return this.sessionsService.checkout(id);
  }

  /**
   * API ลบเซสชัน
   * DELETE /sessions/:id
   * @param id รหัสเซสชัน
   * @returns ข้อมูลเซสชันที่ถูกลบ
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }
}
