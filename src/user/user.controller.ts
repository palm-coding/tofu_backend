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

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerDTO: RegisterDTO) {
    const user = await this.userService.register(registerDTO);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findByEmail(req.user.email);
    return new UserResponseDto(user);
  }

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

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(req.user.userId, changePasswordDto);
    return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    return new UserResponseDto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string) {
    const users = await this.userService.findByBranch(branchId);
    return users.map((user) => new UserResponseDto(user));
  }
}
