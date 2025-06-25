import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug'],
  });

  // Debug Environment Variables
  console.log('🔧 Environment Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // CORS configuration - อนุญาตทุก origin ชั่วคราวเพื่อ debug
  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: [
        'https://tofu-frontend-one.vercel.app',
        'https://tofu-backend.onrender.com',
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Set-Cookie',
      ],
      exposedHeaders: ['Set-Cookie'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
  } else {
    app.enableCors({
      origin: [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3000',
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
      ],
      exposedHeaders: ['Set-Cookie'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
  }

  app.use(cookieParser());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application running on port ${port}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
