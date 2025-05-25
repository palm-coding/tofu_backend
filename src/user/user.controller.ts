import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDTO } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * คอนโทรลเลอร์จัดการ API ผู้ใช้งาน
 * ให้บริการ endpoint สำหรับการจัดการข้อมูลผู้ใช้งานในระบบ
 * มีการจัดการความปลอดภัยโดยใช้ ClassSerializerInterceptor เพื่อซ่อนข้อมูลที่ละเอียดอ่อน
 */
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * API ลงทะเบียนผู้ใช้งานใหม่
   * POST /users/register
   * @param registerDTO ข้อมูลสำหรับการลงทะเบียน
   * @returns ข้อมูลผู้ใช้งานที่สร้างขึ้น โดยไม่รวมรหัสผ่าน
   */
  @Post('register')
  async register(@Body() registerDTO: RegisterDTO) {
    const user = await this.userService.register(registerDTO);
    return new UserResponseDto(user);
  }

  /**
   * API สร้างผู้ใช้งานใหม่ (สำหรับผู้ดูแลระบบ)
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * POST /users
   * @param createUserDto ข้อมูลผู้ใช้งานที่ต้องการสร้าง
   * @returns ข้อมูลผู้ใช้งานที่สร้างขึ้น โดยไม่รวมรหัสผ่าน
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserResponseDto(user);
  }

  /**
   * API ดึงข้อมูลโปรไฟล์ของผู้ใช้งานที่เข้าสู่ระบบ
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * GET /users/profile
   * @returns ข้อมูลผู้ใช้งานที่เข้าสู่ระบบ โดยไม่รวมรหัสผ่าน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findByEmail(req.user.email);
    return new UserResponseDto(user);
  }

  /**
   * API ดึงรายการผู้ใช้งานทั้งหมด
   * สามารถกรองตามบทบาทและรหัสสาขาได้
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * GET /users?role=xxx&branchId=yyy
   * @returns รายการผู้ใช้งานและจำนวนทั้งหมด
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('branchId') branchId?: string,
  ) {
    const filters = {};
    if (role) filters['role'] = role;
    if (branchId) filters['branchId'] = branchId;

    const { users, total } = await this.userService.findAll(filters);

    return {
      users: users.map((user) => new UserResponseDto(user)),
      total,
    };
  }

  /**
   * API ดึงข้อมูลผู้ใช้งานตามรหัส ID
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * GET /users/:id
   * @returns ข้อมูลผู้ใช้งานที่ค้นพบ โดยไม่รวมรหัสผ่าน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return new UserResponseDto(user);
  }

  /**
   * API อัปเดตข้อมูลผู้ใช้งาน
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * PATCH /users/:id
   * @returns ข้อมูลผู้ใช้งานที่อัปเดตแล้ว โดยไม่รวมรหัสผ่าน
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  /**
   * API เปลี่ยนรหัสผ่านของผู้ใช้งาน
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * POST /users/change-password
   * @returns ข้อความแจ้งผลสำเร็จ
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(req.user.userId, changePasswordDto);
    return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }

  /**
   * API ลบผู้ใช้งาน
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * DELETE /users/:id
   * @returns ข้อมูลผู้ใช้งานที่ถูกลบ โดยไม่รวมรหัสผ่าน
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    return new UserResponseDto(user);
  }

  /**
   * API ดึงรายการผู้ใช้งานตามรหัสสาขา
   * ต้องมีการยืนยันตัวตนด้วย JWT
   * GET /users/branch/:branchId
   * @returns รายการผู้ใช้งานในสาขา โดยไม่รวมรหัสผ่าน
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string) {
    const users = await this.userService.findByBranch(branchId);
    return users.map((user) => new UserResponseDto(user));
  }
}
