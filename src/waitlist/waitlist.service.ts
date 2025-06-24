import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Waitlist, WaitlistDocument } from './schema/waitlist.schema';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectModel(Waitlist.name) private waitlistModel: Model<WaitlistDocument>,
  ) {}

  async create(createWaitlistDto: CreateWaitlistDto): Promise<Waitlist> {
    const dto = createWaitlistDto as CreateWaitlistDto & {
      requestedAt?: Date;
      status?: string;
    };
    const created = new this.waitlistModel({
      ...dto,
      requestedAt: dto.requestedAt || new Date(),
      status: dto.status || 'waiting',
    });
    return created.save();
  }

  async findAll(): Promise<Waitlist[]> {
    return this.waitlistModel.find().exec();
  }

  async findOne(id: string): Promise<Waitlist> {
    const waitlist = await this.waitlistModel.findById(id).exec();
    if (!waitlist) throw new NotFoundException(`Waitlist #${id} not found`);
    return waitlist;
  }

  async update(
    id: string,
    updateWaitlistDto: UpdateWaitlistDto,
  ): Promise<Waitlist> {
    const updated = await this.waitlistModel
      .findByIdAndUpdate(id, updateWaitlistDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Waitlist #${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<Waitlist> {
    const deleted = await this.waitlistModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Waitlist #${id} not found`);
    return deleted;
  }
}
