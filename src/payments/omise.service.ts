import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Omise from 'omise';

/**
 * บริการจัดการการชำระเงินผ่าน Omise
 * รับผิดชอบการสร้างและจัดการ PromptPay QR Code
 */
@Injectable()
export class OmiseService {
  private omise: any;
  private readonly logger = new Logger(OmiseService.name);

  /**
   * สร้าง OmiseService พร้อมกำหนดค่า API key
   * @param configService บริการสำหรับเข้าถึงตัวแปรการกำหนดค่า
   */
  constructor(private configService: ConfigService) {
    this.omise = Omise({
      publicKey: this.configService.get<string>('OMISE_PUBLIC_KEY'),
      secretKey: this.configService.get<string>('OMISE_SECRET_KEY'),
    });
    this.logger.log('Initialized Omise payment service');
  }

  /**
   * สร้าง Source ประเภท PromptPay
   * @param amount จำนวนเงินที่ต้องการชำระ (หน่วยบาท)
   * @returns ข้อมูล source พร้อม QR code สำหรับการชำระเงิน
   */
  async createPromptPaySource(amount: number): Promise<any> {
    try {
      this.logger.log(`Creating PromptPay source for ${amount} THB`);

      // ตรวจสอบว่า amount มากกว่า 20 บาท (ข้อกำหนดของ Omise)
      if (amount < 20) {
        throw new Error('Amount must be at least 20 THB for PromptPay');
      }

      // สร้าง source ประเภท promptpay
      const source = await this.omise.sources.create({
        amount: amount * 100, // แปลงเป็นสตางค์ (1 บาท = 100 สตางค์)
        currency: 'thb',
        type: 'promptpay',
      });
      this.logger.log(`PromptPay source created successfully: ${source.id}`);
      this.logger.log(`Source structure: ${JSON.stringify(source, null, 2)}`);

      // ตรวจสอบว่า source มี scannable_code หรือไม่
      if (!source.scannable_code) {
        this.logger.warn(
          `Source ${source.id} does not contain scannable_code property. Using fallback QR code URL.`,
        );

        // สร้าง fallback QR code URL โดยใช้ API ของ Omise
        // สำหรับโหมดทดสอบ เราสามารถใช้ QR code placeholder
        source.qr_code_url = `https://api.omise.co/charges/${source.id}/documents/qrcode`;
      } else {
        source.qr_code_url = source.scannable_code.image.download_uri;
      }

      return source;
    } catch (error) {
      this.logger.error(
        `Failed to create PromptPay source: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * สร้างการชำระเงินจาก Source ประเภท PromptPay
   * @param amount จำนวนเงิน (หน่วยบาท)
   * @param sourceId รหัส source
   * @param description คำอธิบายการชำระเงิน
   * @param metadata ข้อมูลเพิ่มเติมที่ต้องการบันทึก
   * @returns ข้อมูลการชำระเงิน
   */
  async createChargeFromPromptPay(
    amount: number,
    sourceId: string,
    description: string,
    metadata: Record<string, any> = {},
  ): Promise<any> {
    try {
      this.logger.log(
        `Creating charge from PromptPay source ${sourceId} for ${amount} THB`,
      );
      // สร้าง charge จาก source ประเภท PromptPay
      const charge = await this.omise.charges.create({
        amount: amount * 100,
        currency: 'thb',
        source: sourceId,
        description,
        metadata,
        return_uri:
          'https://3582-110-168-69-44.ngrok-free.app/payments/webhook',
      });
      this.logger.log(`Charge created successfully: ${charge.id}`);
      return charge;
    } catch (error) {
      this.logger.error(
        `Failed to create charge from PromptPay: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * ดึงข้อมูลรายการชำระเงิน
   * @param chargeId รหัสรายการชำระเงิน
   * @returns ข้อมูลรายการชำระเงิน
   */
  async retrieveCharge(chargeId: string): Promise<any> {
    try {
      this.logger.log(`Retrieving charge ${chargeId}`);
      const charge = await this.omise.charges.retrieve(chargeId);
      this.logger.log(
        `Charge retrieved: ${chargeId}, status: ${charge.status}`,
      );
      return charge;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve charge: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
