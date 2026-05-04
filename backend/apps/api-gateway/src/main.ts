import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpErrorFilter } from '@une/ms-common/filters';
import { env } from './config/env';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS con soporte para cookies
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true, // Permite enviar/recibir cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Middleware para parsear cookies
  app.use(cookieParser());
  
  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no definidas
      forbidNonWhitelisted: false, // No lanzar error por propiedades extra
      transform: true, // Transformar tipos automáticamente
    })
  );
  
  app.useGlobalFilters(new HttpErrorFilter());
  await app.listen(env.PORT);
}
bootstrap();
