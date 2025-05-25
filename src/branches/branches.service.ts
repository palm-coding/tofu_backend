import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch, BranchDocument } from './schema/branches.schema';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const createdBranch = new this.branchModel(createBranchDto);
    return createdBranch.save();
  }

  async findAll(): Promise<Branch[]> {
    return this.branchModel.find().exec();
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchModel.findById(id).exec();
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async findByCode(code: string): Promise<Branch> {
    const branch = await this.branchModel.findOne({ code }).exec();
    if (!branch) {
      throw new NotFoundException(`Branch with code ${code} not found`);
    }
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const updatedBranch = await this.branchModel
      .findByIdAndUpdate(id, updateBranchDto, { new: true })
      .exec();

    if (!updatedBranch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return updatedBranch;
  }

  async remove(id: string): Promise<Branch> {
    const deletedBranch = await this.branchModel.findByIdAndDelete(id).exec();

    if (!deletedBranch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return deletedBranch;
  }
}
