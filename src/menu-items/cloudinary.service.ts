import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'menu-items',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.log(`Uploading image to Cloudinary: ${file.originalname}`);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Upload failed: ${error.message}`);
            throw new Error(`Upload failed: ${error.message}`);
          }
          if (result) {
            this.logger.log(`Image uploaded successfully: ${result.public_id}`);
            resolve(result);
          } else {
            this.logger.error('Upload completed but result is undefined');
            reject(new Error('Upload completed but result is undefined'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      this.logger.log(`Deleting image from Cloudinary: ${publicId}`);
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted successfully: ${publicId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw error;
    }
  }

  getPublicIdFromUrl(url: string): string | null {
    if (!url) return null;

    // Extract public ID from URL format like:
    // https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image_id.jpg
    const regex = /\/v\d+\/([^/]+\/[^.]+)/;
    const match = url.match(regex);

    return match ? match[1] : null;
  }
}
