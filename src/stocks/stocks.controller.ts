import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { StockService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStockDto: CreateStockDto) {
    const stock = await this.stockService.create(createStockDto);
    return {
      success: true,
      message: 'Stock created successfully',
      data: stock,
    };
  }

  @Get()
  async findAll() {
    const stocks = await this.stockService.findAll();
    return {
      success: true,
      message: 'Stocks retrieved successfully',
      data: stocks,
    };
  }

  @Get('low-stock')
  async findLowStock(@Query('branchId') branchId?: string) {
    const lowStockItems = await this.stockService.findLowStock(branchId);
    return {
      success: true,
      message: 'Low stock items retrieved successfully',
      data: lowStockItems,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const stock = await this.stockService.findOne(id);
    return {
      success: true,
      message: 'Stock retrieved successfully',
      data: stock,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    const stock = await this.stockService.update(id, updateStockDto);
    return {
      success: true,
      message: 'Stock updated successfully',
      data: stock,
    };
  }

  @Patch(':id/adjust')
  @HttpCode(HttpStatus.OK)
  async adjustStock(
    @Param('id') id: string,
    @Body() adjustStockDto: AdjustStockDto,
  ) {
    const stock = await this.stockService.adjustStock(id, adjustStockDto);
    return {
      success: true,
      message: `Stock ${adjustStockDto.type === 'add' ? 'increased' : 'decreased'} successfully`,
      data: stock,
    };
  }

  @Patch('bulk-adjust')
  @HttpCode(HttpStatus.OK)
  async bulkAdjustStocks(
    @Body()
    bulkAdjustDto: {
      adjustments: Array<{
        stockId: string;
        quantity: number;
        type: 'add' | 'remove';
      }>;
    },
  ) {
    const results = await this.stockService.bulkAdjustStocks(
      bulkAdjustDto.adjustments,
    );
    return {
      success: true,
      message: 'Bulk stock adjustment completed',
      data: results,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const stock = await this.stockService.remove(id);
    return {
      success: true,
      message: 'Stock deleted successfully',
      data: stock,
    };
  }
}
