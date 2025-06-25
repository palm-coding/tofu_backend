import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  console.log('='.repeat(60));
  console.log('🚀 TOFU BACKEND STARTING');
  console.log('='.repeat(60));

  console.log('🔧 Environment Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('PORT:', process.env.PORT);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enhanced CORS configuration for production
  const corsOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://tofu-frontend-one.vercel.app',
          'https://tofu-backend.onrender.com',
        ]
      : [
          'http://localhost:3001',
          'http://localhost:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3000',
        ];

  console.log('🌐 CORS Origins configured:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true, // This is crucial for cookies
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Set-Cookie',
      'Cookie',
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight for 24 hours
  });

  app.use(cookieParser());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log('='.repeat(60));
  console.log(`🚀 Application running on port ${port}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Backend URL: https://tofu-backend.onrender.com`);
  console.log('='.repeat(60));
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});
