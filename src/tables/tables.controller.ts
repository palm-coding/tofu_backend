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
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * คอนโทรลเลอร์จัดการ API โต๊ะในร้านอาหาร
 * ให้บริการ endpoint สำหรับการจัดการข้อมูลโต๊ะ
 */
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  /**
   * API สร้างโต๊ะใหม่
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * POST /tables
   * @param createTableDto ข้อมูลโต๊ะที่ต้องการสร้าง
   * @returns ข้อมูลโต๊ะที่สร้างขึ้นใหม่
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  /**
   * API ดึงข้อมูลโต๊ะทั้งหมด
   * GET /tables
   * @returns รายการโต๊ะทั้งหมดในระบบ
   */
  @Get()
  async findAll() {
    return this.tablesService.findAll();
  }

  /**
   * API ดึงข้อมูลโต๊ะตามรหัส ID
   * GET /tables/:id
   * @param id รหัสโต๊ะ
   * @returns ข้อมูลโต๊ะที่ค้นพบ
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  /**
   * API ดึงข้อมูลโต๊ะตามรหัสสาขา
   * GET /tables/branch/:branchId
   * @param branchId รหัสสาขา
   * @returns รายการโต๊ะทั้งหมดของสาขานั้นๆ
   */
  @Get('branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string) {
    return this.tablesService.findByBranch(branchId);
  }

  /**
   * API อัปเดตข้อมูลโต๊ะ
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * PATCH /tables/:id
   * @param id รหัสโต๊ะที่ต้องการอัปเดต
   * @param updateTableDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลโต๊ะที่อัปเดตแล้ว
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, updateTableDto);
  }

  /**
   * API ลบข้อมูลโต๊ะ
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * DELETE /tables/:id
   * @param id รหัสโต๊ะที่ต้องการลบ
   * @returns ข้อมูลโต๊ะที่ถูกลบ
   * @requires การยืนยันตัวตน
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
