import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentDocument } from './schema/payments.schema';

/**
 * บริการจัดการรายการชำระเงิน
 * รับผิดชอบการสร้าง ค้นหา และอัปเดตรายการชำระเงิน
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * สร้างรายการชำระเงินใหม่
   * @param createPaymentDto ข้อมูลการชำระเงิน
   * @returns รายการชำระเงินที่สร้างขึ้น
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const createdPayment = new this.paymentModel(createPaymentDto);
    return createdPayment.save();
  }

  /**
   * ดึงข้อมูลรายการชำระเงินทั้งหมด
   * @returns รายการชำระเงินทั้งหมด
   */
  async findAll(): Promise<Payment[]> {
    return this.paymentModel
      .find()
      .sort({ createdAt: -1 })
      .populate('branchId')
      .populate('orderId')
      .populate('sessionId')
      .exec();
  }

  /**
   * ค้นหารายการชำระเงินด้วยรหัส ID
   * @param id รหัสรายการชำระเงิน
   * @returns ข้อมูลรายการชำระเงินที่ค้นพบ
   * @throws NotFoundException หากไม่พบรายการ
   */
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('branchId')
      .populate('orderId')
      .populate('sessionId')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  /**
   * ค้นหารายการชำระเงินตามรหัสออร์เดอร์
   * @param orderId รหัสออร์เดอร์
   * @returns รายการชำระเงินทั้งหมดของออร์เดอร์นั้น
   */
  async findByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ orderId })
      .sort({ createdAt: -1 })
      .populate('branchId')
      .populate('sessionId')
      .exec();
  }

  /**
   * ค้นหารายการชำระเงินตามรหัสเซสชัน
   * @param sessionId รหัสเซสชัน
   * @returns รายการชำระเงินทั้งหมดของเซสชันนั้น
   */
  async findBySession(sessionId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .populate('branchId')
      .populate('orderId')
      .exec();
  }

  /**
   * ค้นหารายการชำระเงินตามรหัสสาขา
   * @param branchId รหัสสาขา
   * @param status กรองตามสถานะ (ถ้ามี)
   * @returns รายการชำระเงินทั้งหมดของสาขานั้น
   */
  async findByBranch(branchId: string, status?: string): Promise<Payment[]> {
    const filter: any = { branchId };
    if (status) {
      filter.status = status;
    }
    return this.paymentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('orderId')
      .populate('sessionId')
      .exec();
  }

  /**
   * อัปเดตข้อมูลการชำระเงิน
   * @param id รหัสรายการชำระเงิน
   * @param updatePaymentDto ข้อมูลที่ต้องการอัปเดต
   * @returns ข้อมูลรายการชำระเงินที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบรายการ
   */
  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, updatePaymentDto, { new: true })
      .populate('branchId')
      .populate('orderId')
      .populate('sessionId')
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  /**
   * อัปเดตสถานะการชำระเงิน
   * @param id รหัสรายการชำระเงิน
   * @param status สถานะใหม่
   * @returns ข้อมูลรายการชำระเงินที่อัปเดตแล้ว
   * @throws NotFoundException หากไม่พบรายการ
   */
  async updateStatus(id: string, status: string): Promise<Payment> {
    if (!['pending', 'paid', 'failed'].includes(status)) {
      throw new Error('Invalid status');
    }

    const payment = await this.paymentModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('branchId')
      .populate('orderId')
      .populate('sessionId')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * ลบรายการชำระเงิน
   * @param id รหัสรายการชำระเงินที่ต้องการลบ
   * @returns ข้อมูลรายการชำระเงินที่ถูกลบ
   * @throws NotFoundException หากไม่พบรายการ
   */
  async remove(id: string): Promise<Payment> {
    const deletedPayment = await this.paymentModel.findByIdAndDelete(id).exec();

    if (!deletedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return deletedPayment;
  }
}
