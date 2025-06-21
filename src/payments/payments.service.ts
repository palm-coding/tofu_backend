import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentDocument } from './schema/payments.schema';
import { OmiseService } from './omise.service';
import { PromptPayPaymentDto } from './dto/promptpay-payment.dto';
import { OrdersGateway } from '../orders/orders.gateway';

/**
 * บริการจัดการรายการชำระเงิน
 * รับผิดชอบการสร้าง ค้นหา และอัปเดตรายการชำระเงิน
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly omiseService: OmiseService, // บริการสำหรับจัดการการชำระเงินผ่าน Omise
    private readonly ordersGateway: OrdersGateway, // ใช้สำหรับส่งข้อมูลไปยัง WebSocket
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

  /**
   * สร้างการชำระเงินใหม่ผ่าน PromptPay
   * @param promptPayDto ข้อมูลการชำระเงินผ่าน PromptPay
   * @returns รายการชำระเงินที่สร้างขึ้น
   */
  async createPromptPayPayment(
    promptPayDto: PromptPayPaymentDto,
  ): Promise<Payment> {
    try {
      const { amount, branchId, orderId, sessionId, metadata } = promptPayDto;
      this.logger.log(`Creating PromptPay payment for order ${orderId}`);
      // 1. สร้าง source สำหรับ PromptPay QR Code
      const source = await this.omiseService.createPromptPaySource(amount);
      // 2. สร้าง charge จาก source
      const charge = await this.omiseService.createChargeFromPromptPay(
        amount,
        source.id,
        `ชำระเงินสำหรับออร์เดอร์: ${orderId}`,
        metadata || { orderId },
      );

      // 3. สร้างรายการชำระเงินในฐานข้อมูล
      const paymentData = {
        branchId,
        orderId,
        sessionId,
        amount,
        method: 'promptpay',
        status: 'pending', // การชำระเงินแบบ PromptPay จะเริ่มต้นด้วยสถานะ pending เสมอ
        sourceId: source.id,
        transactionId: charge.id,
        paymentDetails: charge,
        qrCodeImage:
          source.qr_code_url ||
          source.scannable_code?.image?.download_uri ||
          `https://api.omise.co/charges/${charge.id}/documents/qrcode`, // URL ของรูปภาพ QR Code
        expiresAt: new Date(Date.now() + 86400000), // หมดอายุใน 24 ชั่วโมง
      };

      console.log('Payment Data:', paymentData);

      const createdPayment = new this.paymentModel(paymentData);
      const savedPayment = await createdPayment.save();
      this.logger.log(
        `PromptPay payment created successfully: ${savedPayment.id}`,
      );
      return savedPayment;
    } catch (error) {
      this.logger.error(
        `Failed to create PromptPay payment: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `การสร้างรายการชำระเงิน PromptPay ล้มเหลว: ${error.message}`,
      );
    }
  }

  /**
   * อัปเดตสถานะการชำระเงินจาก webhook ของ Omise
   * @param chargeId รหัสการชำระเงิน
   * @param status สถานะใหม่
   * @returns รายการชำระเงินที่อัปเดต
   */
  async updatePaymentStatusFromWebhook(
    chargeId: string,
    status: string,
  ): Promise<Payment> {
    this.logger.log(
      `Updating payment status for charge ${chargeId} to ${status}`,
    );

    const payment = await this.paymentModel.findOne({
      transactionId: chargeId,
    });

    if (!payment) {
      this.logger.error(`Payment not found for charge ID: ${chargeId}`);
      throw new NotFoundException(
        `ไม่พบรายการชำระเงินสำหรับ transactionId: ${chargeId}`,
      );
    }

    // แปลงสถานะจาก Omise เป็นสถานะในระบบของเรา
    let paymentStatus: string;
    switch (status) {
      case 'successful':
        paymentStatus = 'paid';
        break;
      case 'failed':
      case 'expired':
        paymentStatus = 'failed';
        break;
      default:
        paymentStatus = 'pending';
    }

    // บันทึกสถานะเดิมเพื่อตรวจสอบการเปลี่ยนแปลง
    const oldStatus = payment.status;

    // อัปเดตสถานะการชำระเงิน
    payment.status = paymentStatus;

    // ดึงข้อมูลการชำระเงินล่าสุดจาก Omise
    const charge = await this.omiseService.retrieveCharge(chargeId);
    payment.paymentDetails = charge;

    const updatedPayment = await payment.save();
    this.logger.log(
      `Payment status updated to ${paymentStatus} for payment ID: ${payment.id}`,
    );

    // ส่งการแจ้งเตือนผ่าน WebSocket ถ้าสถานะมีการเปลี่ยนแปลง
    if (oldStatus !== paymentStatus) {
      this.ordersGateway.notifyPaymentStatusChanged(updatedPayment);
    }

    return updatedPayment;
  }

  /**
   * ตรวจสอบสถานะการชำระเงิน PromptPay
   * @param paymentId รหัสรายการชำระเงิน
   * @returns รายการชำระเงินที่อัปเดตสถานะแล้ว
   */
  async checkPromptPayStatus(paymentId: string): Promise<Payment> {
    this.logger.log(
      `Checking PromptPay payment status for payment ID: ${paymentId}`,
    );

    const payment = await this.findOne(paymentId);

    if (payment.method !== 'promptpay') {
      throw new Error('รายการชำระเงินนี้ไม่ใช่การชำระผ่าน PromptPay');
    }

    if (payment.status !== 'pending') {
      return payment; // ถ้าไม่อยู่ในสถานะ pending แล้ว ไม่จำเป็นต้องตรวจสอบซ้ำ
    }

    try {
      // ตรวจสอบสถานะล่าสุดจาก Omise
      const charge = await this.omiseService.retrieveCharge(
        payment.transactionId,
      );

      // อัปเดตข้อมูลและสถานะการชำระเงิน
      payment.paymentDetails = charge;
      const oldStatus = payment.status;

      if (charge.status === 'successful') {
        payment.status = 'paid';
        this.logger.log(`Payment ID ${paymentId} has been paid`);
      } else if (charge.status === 'failed' || charge.status === 'expired') {
        payment.status = 'failed';
        this.logger.log(`Payment ID ${paymentId} has failed or expired`);
      }

      const updatedPayment = await (payment as PaymentDocument).save();

      // ส่งการแจ้งเตือนผ่าน WebSocket ถ้าสถานะมีการเปลี่ยนแปลง
      if (oldStatus !== updatedPayment.status) {
        this.ordersGateway.notifyPaymentStatusChanged(updatedPayment);
      }

      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Failed to check PromptPay status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
