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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * คอนโทรลเลอร์จัดการ API สาขาของร้าน
 * ให้บริการ endpoint สำหรับการจัดการข้อมูลสาขา
 */
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  /**
   * API สร้างสาขาใหม่
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * POST /branches
   * @param createBranchDto ข้อมูลสาขาที่ต้องการสร้าง
   * @returns ข้อมูลสาขาที่สร้างขึ้นใหม่
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  /**
   * API ดึงข้อมูลสาขาทั้งหมด
   * GET /branches
   * @returns รายการสาขาทั้งหมดในระบบ
   */
  @Get()
  async findAll() {
    return this.branchesService.findAll();
  }

  /**
   * API ดึงข้อมูลสาขาตามรหัส ID
   * GET /branches/:id
   * @param id รหัสสาขา
   * @returns ข้อมูลสาขาที่ค้นพบ
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  /**
   * API ดึงข้อมูลสาขาตามรหัสสาขา
   * GET /branches/code/:code
   * @param code รหัสสาขา
   * @returns ข้อมูลสาขาที่ค้นพบ
   */
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.branchesService.findByCode(code);
  }

  /**
   * API อัปเดตข้อมูลสาขา
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * PATCH /branches/:id
   * @param id รหัสสาขาที่ต้องการอัปเดต
   * @param updateBranchDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลสาขาที่อัปเดตแล้ว
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchesService.update(id, updateBranchDto);
  }

  /**
   * API ลบข้อมูลสาขา
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * DELETE /branches/:id
   * @param id รหัสสาขาที่ต้องการลบ
   * @returns ข้อมูลสาขาที่ถูกลบ
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
