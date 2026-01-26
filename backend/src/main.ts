import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins: (string | RegExp)[] = [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://10.0.2.2:3000',
      ];

      const localhostRegex = /^http:\/\/localhost:\d+$/;
      
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return allowed === origin;
      }) || localhostRegex.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
  console.log(`JWT expires in: ${process.env.JWT_EXPIRES_IN || '1h'}`);
}

bootstrap();
