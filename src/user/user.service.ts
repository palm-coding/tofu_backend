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

/**
 * บริการจัดการผู้ใช้งานในระบบ
 * รับผิดชอบการสร้าง ค้นหา แก้ไข และลบข้อมูลผู้ใช้งาน
 * จัดการการลงทะเบียน และการเปลี่ยนรหัสผ่าน
 */
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * ลงทะเบียนผู้ใช้งานใหม่ในระบบ
   * @param registerDTO ข้อมูลที่ใช้ในการลงทะเบียน
   * @returns ข้อมูลผู้ใช้งานที่สร้างใหม่
   * @throws ConflictException หากมีอีเมลนี้ในระบบแล้ว
   * @throws BadRequestException หากข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
   */
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { branchId, ...superAdminData } = registerDTO;
      const newUser = new this.userModel(superAdminData);
      return await newUser.save();
    }

    const newUser = new this.userModel(registerDTO);
    return await newUser.save();
  }

  /**
   * ค้นหาผู้ใช้งานด้วยอีเมล
   * @param email อีเมลของผู้ใช้งาน
   * @returns ข้อมูลผู้ใช้งานที่ค้นพบ
   * @throws NotFoundException หากไม่พบผู้ใช้งานที่มีอีเมลนี้
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    console.log('🔍 UserService.findByEmail called with:', email);
    console.log('📊 Database connection status:', this.userModel.db.readyState);

    try {
      const user = await this.userModel.findOne({ email }).exec();
      console.log('📋 Query result:', !!user);

      if (user) {
        console.log('👤 Found user details:');
        console.log('  - ID:', user._id);
        console.log('  - Email:', user.email);
        console.log('  - Role:', user.role);
        console.log('  - Has password:', !!user.password);
      } else {
        console.log('❌ User not found with email:', email);
      }

      return user; // ไม่ throw error สำหรับ auth process
    } catch (error) {
      console.error('❌ Database query error:', error.message);
      throw error;
    }
  }

  /**
   * สร้างผู้ใช้งานใหม่
   * @param createDto ข้อมูลผู้ใช้งานที่ต้องการสร้าง
   * @returns ข้อมูลผู้ใช้งานที่สร้างใหม่
   * @throws ConflictException หากมีอีเมลนี้ในระบบแล้ว
   */
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

  /**
   * ค้นหาผู้ใช้งานทั้งหมดที่ตรงตามเงื่อนไข
   * @param filters เงื่อนไขในการค้นหา (role, branchId)
   * @returns รายการผู้ใช้งานและจำนวนทั้งหมด
   */
  async findAll(filters: any = {}) {
    const users = await this.userModel.find(filters).exec();
    const total = await this.userModel.countDocuments(filters).exec();

    return {
      users,
      total,
    };
  }

  /**
   * ค้นหาผู้ใช้งานด้วยรหัส ID
   * @param id รหัสผู้ใช้งาน
   * @returns ข้อมูลผู้ใช้งานที่ค้นพบ
   * @throws NotFoundException หากไม่พบผู้ใช้งาน
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานที่มีไอดี ${id}`);
    }
    return user;
  }

  /**
   * อัปเดตข้อมูลผู้ใช้งาน
   * @param id รหัสผู้ใช้งานที่ต้องการอัปเดต
   * @param updateUserDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลผู้ใช้งานที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบผู้ใช้งาน
   * @throws ConflictException หากอีเมลที่ต้องการอัปเดตมีผู้ใช้งานอื่นใช้แล้ว
   */
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

  /**
   * เปลี่ยนรหัสผ่านของผู้ใช้งาน
   * @param id รหัสผู้ใช้งาน
   * @param dto ข้อมูลรหัสผ่านปัจจุบันและรหัสผ่านใหม่
   * @returns true หากเปลี่ยนรหัสผ่านสำเร็จ
   * @throws NotFoundException หากไม่พบผู้ใช้งาน
   * @throws BadRequestException หากรหัสผ่านปัจจุบันไม่ถูกต้อง
   */
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

  /**
   * ลบผู้ใช้งาน
   * @param id รหัสผู้ใช้งานที่ต้องการลบ
   * @returns ข้อมูลผู้ใช้งานที่ถูกลบ
   * @throws NotFoundException หากไม่พบผู้ใช้งาน
   */
  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานที่มีไอดี ${id}`);
    }

    return deletedUser;
  }

  /**
   * ค้นหาผู้ใช้งานตามรหัสสาขา
   * @param branchId รหัสสาขา
   * @returns รายการผู้ใช้งานทั้งหมดในสาขานั้น
   */
  async findByBranch(branchId: string): Promise<User[]> {
    return this.userModel.find({ branchId }).exec();
  }
}
