import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch, BranchDocument } from './schema/branches.schema';

/**
 * บริการจัดการสาขาของร้าน
 * รับผิดชอบการสร้าง ค้นหา แก้ไข และลบข้อมูลสาขา
 */
@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
  ) {}

  /**
   * สร้างสาขาใหม่
   * @param createBranchDto ข้อมูลสาขาที่ต้องการสร้าง
   * @returns ข้อมูลสาขาที่สร้างขึ้นใหม่
   */
  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const createdBranch = new this.branchModel(createBranchDto);
    return createdBranch.save();
  }

  /**
   * ดึงข้อมูลสาขาทั้งหมด
   * @returns รายการสาขาทั้งหมดในระบบ
   */
  async findAll(): Promise<Branch[]> {
    return this.branchModel.find().exec();
  }

  /**
   * ค้นหาสาขาด้วยรหัส ID
   * @param id รหัสสาขา
   * @returns ข้อมูลสาขาที่ค้นพบ
   * @throws NotFoundException หากไม่พบสาขา
   */
  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchModel.findById(id).exec();
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  /**
   * ค้นหาสาขาด้วยรหัสสาขา (code)
   * @param code รหัสสาขา
   * @returns ข้อมูลสาขาที่ค้นพบ
   * @throws NotFoundException หากไม่พบสาขา
   */
  async findByCode(code: string): Promise<Branch> {
    const branch = await this.branchModel.findOne({ code }).exec();
    if (!branch) {
      throw new NotFoundException(`Branch with code ${code} not found`);
    }
    return branch;
  }

  /**
   * อัปเดตข้อมูลสาขา
   * @param id รหัสสาขาที่ต้องการอัปเดต
   * @param updateBranchDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลสาขาที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบสาขา
   */
  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const updatedBranch = await this.branchModel
      .findByIdAndUpdate(id, updateBranchDto, { new: true })
      .exec();

    if (!updatedBranch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return updatedBranch;
  }

  /**
   * ลบข้อมูลสาขา
   * @param id รหัสสาขาที่ต้องการลบ
   * @returns ข้อมูลสาขาที่ถูกลบ
   * @throws NotFoundException หากไม่พบสาขา
   */
  async remove(id: string): Promise<Branch> {
    const deletedBranch = await this.branchModel.findByIdAndDelete(id).exec();

    if (!deletedBranch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return deletedBranch;
  }
}
