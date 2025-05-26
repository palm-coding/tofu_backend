import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session, SessionDocument } from './schema/sessions.schema';
import * as crypto from 'crypto';

/**
 * บริการจัดการเซสชันลูกค้า
 * รับผิดชอบการจัดการเช็คอิน เช็คเอาท์ และการจัดการออเดอร์ในเซสชัน
 */
@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  /**
   * สร้างเซสชันใหม่ (เช็คอิน)
   * @param createSessionDto ข้อมูลการเช็คอินลูกค้า
   * @returns ข้อมูลเซสชันที่สร้างขึ้น
   */
  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    // สร้าง QR Code string ถ้าไม่ได้ระบุมา
    const qrCode = createSessionDto.qrCode || this.generateQrCodeString();

    const createdSession = new this.sessionModel({
      ...createSessionDto,
      qrCode,
      checkinAt: new Date(),
    });
    return createdSession.save();
  }

  /**
   * ดึงข้อมูลเซสชันทั้งหมด
   * @param activeOnly กรองเฉพาะเซสชันที่ยังไม่เช็คเอาท์
   * @returns รายการเซสชันทั้งหมด
   */
  async findAll(activeOnly = false): Promise<Session[]> {
    const filter = activeOnly ? { checkoutAt: null } : {};
    return this.sessionModel
      .find(filter)
      .sort({ checkinAt: -1 })
      .populate('branchId')
      .populate('tableId')
      .populate({
        path: 'orderIds',
        populate: [
          {
            path: 'orderLines',
            populate: {
              path: 'menuItemId',
              model: 'MenuItem',
            },
          },
        ],
      })
      .exec();
  }

  /**
   * ค้นหาเซสชันด้วยรหัส ID
   * @param id รหัสเซสชัน
   * @returns ข้อมูลเซสชันที่ค้นพบ
   * @throws NotFoundException หากไม่พบเซสชัน
   */
  async findOne(id: string): Promise<Session> {
    const session = await this.sessionModel
      .findById(id)
      .populate('branchId')
      .populate('tableId')
      .populate({
        path: 'orderIds',
        populate: [{ path: 'orderLines.menuItemId' }],
      })
      .exec();

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  /**
   * ค้นหาเซสชันตามรหัสสาขา
   * @param branchId รหัสสาขา
   * @param activeOnly กรองเฉพาะเซสชันที่ยังไม่เช็คเอาท์
   * @returns รายการเซสชันทั้งหมดในสาขานั้นๆ
   */
  async findByBranch(branchId: string, activeOnly = false): Promise<Session[]> {
    const filter: any = { branchId };
    if (activeOnly) {
      filter.checkoutAt = null;
    }
    return this.sessionModel
      .find(filter)
      .sort({ checkinAt: -1 })
      .populate('tableId')
      .populate('orderIds')
      .exec();
  }

  /**
   * ค้นหาเซสชันตามรหัสโต๊ะ
   * @param tableId รหัสโต๊ะ
   * @param activeOnly กรองเฉพาะเซสชันที่ยังไม่เช็คเอาท์
   * @returns รายการเซสชันทั้งหมดที่ใช้โต๊ะนั้น
   */
  async findByTable(tableId: string, activeOnly = false): Promise<Session[]> {
    const filter: any = { tableId };
    if (activeOnly) {
      filter.checkoutAt = null;
    }
    return this.sessionModel
      .find(filter)
      .sort({ checkinAt: -1 })
      .populate('orderIds')
      .exec();
  }

  /**
   * ค้นหาเซสชันที่ยังเปิดอยู่ของโต๊ะ
   * @param tableId รหัสโต๊ะ
   * @returns เซสชันที่ยังเปิดอยู่ หรือ null ถ้าไม่มี
   */
  async findActiveSessionByTable(tableId: string): Promise<Session | null> {
    return this.sessionModel.findOne({ tableId, checkoutAt: null }).exec();
  }

  /**
   * อัปเดตข้อมูลเซสชัน
   * @param id รหัสเซสชัน
   * @param updateSessionDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลเซสชันที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบเซสชัน
   */
  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const updatedSession = await this.sessionModel
      .findByIdAndUpdate(id, updateSessionDto, { new: true })
      .exec();

    if (!updatedSession) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return updatedSession;
  }

  /**
   * เพิ่มออเดอร์เข้าไปในเซสชัน
   * @param id รหัสเซสชัน
   * @param orderId รหัสออเดอร์
   * @returns ข้อมูลเซสชันที่อัปเดตแล้ว
   */
  async addOrder(id: string, orderId: string): Promise<Session> {
    const session = await this.sessionModel.findById(id).exec();

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    if (session.checkoutAt) {
      throw new Error('Cannot add order to checked-out session');
    }

    if (!session.orderIds.includes(orderId as any)) {
      session.orderIds.push(orderId as any);
      return session.save();
    }

    return session;
  }

  /**
   * เช็คเอาท์ (ปิด) เซสชัน
   * @param id รหัสเซสชัน
   * @returns ข้อมูลเซสชันที่เช็คเอาท์แล้ว
   */
  async checkout(id: string): Promise<Session> {
    const session = await this.sessionModel.findById(id).exec();

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    if (session.checkoutAt) {
      throw new Error('Session already checked out');
    }

    session.checkoutAt = new Date();
    return session.save();
  }

  /**
   * ลบเซสชัน
   * @param id รหัสเซสชัน
   * @returns ข้อมูลเซสชันที่ถูกลบ
   * @throws NotFoundException หากไม่พบเซสชัน
   */
  async remove(id: string): Promise<Session> {
    const deletedSession = await this.sessionModel.findByIdAndDelete(id).exec();

    if (!deletedSession) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return deletedSession;
  }

  /**
   * สร้างสตริงสุ่มสำหรับ QR Code
   * @returns สตริงสุ่ม
   * @private
   */
  private generateQrCodeString(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
