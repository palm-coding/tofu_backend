import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Table, TableDocument } from './schema/tables.schema';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const createdTable = new this.tableModel(createTableDto);
    return createdTable.save();
  }

  async findAll(): Promise<Table[]> {
    return this.tableModel.find().exec();
  }

  async findOne(id: string): Promise<Table> {
    const table = await this.tableModel.findById(id).exec();
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async findByBranch(branchId: string): Promise<Table[]> {
    return this.tableModel.find({ branchId }).exec();
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const updatedTable = await this.tableModel
      .findByIdAndUpdate(id, updateTableDto, { new: true })
      .exec();

    if (!updatedTable) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return updatedTable;
  }

  async remove(id: string): Promise<Table> {
    const deletedTable = await this.tableModel.findByIdAndDelete(id).exec();

    if (!deletedTable) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return deletedTable;
  }
}
