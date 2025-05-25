import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDTO } from './dto/register.dto';
import { User, UserDocument } from './schema/user.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(registerDTO: RegisterDTO): Promise<User> {
    // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
    const existingUser = await this.userModel.findOne({
      email: registerDTO.email,
    });
    if (existingUser) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานในระบบแล้ว');
    }

    // ตรวจสอบบทบาทว่าเป็น branch owner จำเป็นต้องมี branchId
    if (registerDTO.role === 'branch_owner' && !registerDTO.branchId) {
      throw new BadRequestException('ผู้ดูแลสาขาต้องระบุรหัสสาขา');
    }

    // สำหรับ super_admin ไม่จำเป็นต้องมี branchId
    if (registerDTO.role === 'super_admin') {
      const { branchId, ...superAdminData } = registerDTO;
      const newUser = new this.userModel(superAdminData);
      return await newUser.save();
    }

    const newUser = new this.userModel(registerDTO);
    return await newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานที่มีอีเมล ${email}`);
    }
    return user;
  }

  async create(createDto: CreateUserDto): Promise<User> {
    // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
    const existingUser = await this.userModel.findOne({
      email: createDto.email,
    });
    if (existingUser) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานในระบบแล้ว');
    }

    const created = new this.userModel(createDto);
    return created.save();
  }

  async findAll(filters: any = {}) {
    const users = await this.userModel.find(filters).exec();
    const total = await this.userModel.countDocuments(filters).exec();

    return {
      users,
      total,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานที่มีไอดี ${id}`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // ถ้ามีการอัพเดทอีเมล ต้องตรวจสอบว่าซ้ำหรือไม่
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id },
      });

      if (existingUser) {
        throw new ConflictException('อีเมลนี้ถูกใช้งานในระบบแล้ว');
      }
    }

    // ถ้ามีการอัพเดทรหัสผ่าน ให้เข้ารหัสก่อนบันทึก
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานที่มีไอดี ${id}`);
    }

    return updatedUser;
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<boolean> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานที่มีไอดี ${id}`);
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // บันทึกรหัสผ่านใหม่
    user.password = await bcrypt.hash(dto.newPassword, 10);
    await user.save();

    return true;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานที่มีไอดี ${id}`);
    }

    return deletedUser;
  }

  async findByBranch(branchId: string): Promise<User[]> {
    return this.userModel.find({ branchId }).exec();
  }
}
