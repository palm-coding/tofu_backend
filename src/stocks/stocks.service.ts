import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Stock, StockDocument } from './schema/stocks.schema';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name)
    private stockModel: Model<StockDocument>,
  ) {}

  async create(createDto: CreateStockDto): Promise<Stock> {
    const stock = new this.stockModel(createDto);
    return stock.save();
  }

  async findAll(): Promise<Stock[]> {
    return this.stockModel
      .find()
      .populate('branchId')
      .populate('ingredientId')
      .exec();
  }

  async findOne(id: string): Promise<Stock> {
    this.validateObjectId(id);

    const stock = await this.stockModel
      .findById(id)
      .populate('branchId')
      .populate('ingredientId')
      .exec();

    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    return stock;
  }

  async update(id: string, updateDto: UpdateStockDto): Promise<Stock> {
    this.validateObjectId(id);

    const updated = await this.stockModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<Stock> {
    this.validateObjectId(id);

    const deleted = await this.stockModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    return deleted;
  }

  // ✅ New method to adjust stock quantity
  async adjustStock(id: string, adjustDto: AdjustStockDto): Promise<Stock> {
    this.validateObjectId(id);

    // Validate adjustment data
    if (!adjustDto.quantity || adjustDto.quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    if (!['add', 'remove'].includes(adjustDto.type)) {
      throw new BadRequestException('Type must be either "add" or "remove"');
    }

    // Find the current stock
    const currentStock = await this.stockModel.findById(id).exec();
    if (!currentStock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    // Calculate new quantity
    let newQuantity: number;
    if (adjustDto.type === 'add') {
      newQuantity = currentStock.quantity + adjustDto.quantity;
    } else {
      newQuantity = currentStock.quantity - adjustDto.quantity;

      // Prevent negative stock (optional - you might want to allow this)
      if (newQuantity < 0) {
        throw new BadRequestException(
          `Cannot remove ${adjustDto.quantity} items. Only ${currentStock.quantity} available in stock`,
        );
      }
    }

    // Update the stock with new quantity
    const updatedStock = await this.stockModel
      .findByIdAndUpdate(
        id,
        {
          quantity: newQuantity,
          lastUpdated: new Date(),
          // Optionally store the reason for the adjustment
          ...(adjustDto.reason && { lastAdjustmentReason: adjustDto.reason }),
        },
        { new: true },
      )
      .populate('branchId')
      .populate('ingredientId')
      .exec();

    if (!updatedStock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    return updatedStock;
  }

  // ✅ Additional helper method to find stocks by branch
  async findByBranch(branchId: string): Promise<Stock[]> {
    this.validateObjectId(branchId);

    return this.stockModel
      .find({ branchId })
      .populate('branchId')
      .populate('ingredientId')
      .exec();
  }

  // ✅ Additional helper method to find low stock items
  async findLowStock(branchId?: string): Promise<Stock[]> {
    const query = branchId
      ? { branchId, $expr: { $lte: ['$quantity', '$lowThreshold'] } }
      : { $expr: { $lte: ['$quantity', '$lowThreshold'] } };

    return this.stockModel
      .find(query)
      .populate('branchId')
      .populate('ingredientId')
      .exec();
  }

  // ✅ Bulk adjust multiple stocks (useful for inventory reconciliation)
  async bulkAdjustStocks(
    adjustments: Array<{
      stockId: string;
      quantity: number;
      type: 'add' | 'remove';
    }>,
  ): Promise<Stock[]> {
    const results: Stock[] = [];

    for (const adjustment of adjustments) {
      try {
        const adjustedStock = await this.adjustStock(adjustment.stockId, {
          quantity: adjustment.quantity,
          type: adjustment.type,
          reason: 'Bulk adjustment',
        });
        results.push(adjustedStock);
      } catch (error) {
        // Log error but continue with other adjustments
        console.error(
          `Failed to adjust stock ${adjustment.stockId}:`,
          error.message,
        );
      }
    }

    return results;
  }

  // ✅ Private helper method for ID validation
  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
  }
}
