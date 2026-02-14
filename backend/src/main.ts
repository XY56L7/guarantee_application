import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './infrastructure/modules/app.module';
import { SanitizationInterceptor } from './infrastructure/interceptors/sanitization.interceptor';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

function validateJwtSecret(jwtSecret: string | undefined): void {
  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET is required. Set it in your .env file or environment variables.',
    );
  }

  if (jwtSecret.length < 32) {
    throw new Error(
      `JWT_SECRET must be at least 32 characters long. Current length: ${jwtSecret.length}. Use a strong random secret in production.`,
    );
  }

  if (
    jwtSecret === 'your_super_secret_jwt_key_here' ||
    jwtSecret === 'your-secret-key' ||
    jwtSecret === 'your_super_secret_jwt_key_here_minimum_32_chars'
  ) {
    throw new Error(
      'JWT_SECRET must be changed from the default value. Use a strong random secret in production.',
    );
  }

  const hasUpperCase = /[A-Z]/.test(jwtSecret);
  const hasLowerCase = /[a-z]/.test(jwtSecret);
  const hasNumber = /[0-9]/.test(jwtSecret);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    jwtSecret,
  );

  if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
    console.warn(
      'WARNING: JWT_SECRET should contain uppercase, lowercase, numbers, and special characters for better security.',
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const jwtSecret = configService.get<string>('JWT_SECRET');

  validateJwtSecret(jwtSecret);

  app.use(cookieParser());

  app.use(helmet());

  const isProduction = nodeEnv === 'production';

  if (isProduction) {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }

  app.use((req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 10 * 1024 * 1024;
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Request entity too large. Maximum size is 10MB.',
      });
    }
    next();
  });
  const frontendUrlRaw =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:8080';
  const frontendUrl = frontendUrlRaw.replace(/\/+$/, '');

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin) {
        if (isProduction) {
          return callback(
            new Error('CORS: Origin header required in production'),
          );
        }
        return callback(null, true);
      }

      if (isProduction) {
        const allowedOrigins = [
          frontendUrl,
          frontendUrl + '/',
        ].filter((o, i, a) => a.indexOf(o) === i);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(
            new Error(`CORS: Origin ${origin} not allowed in production`),
          );
        }
      } else {
        const allowedOrigins: (string | RegExp)[] = [
          'http://localhost:3000',
          'http://localhost:8080',
          'http://10.0.2.2:3000',
        ];
        const localhostRegex = /^http:\/\/localhost:\d+$/;

        const isAllowed =
          allowedOrigins.some((allowed) => {
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
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const sanitizationInterceptor = app.get(SanitizationInterceptor);
  app.useGlobalInterceptors(sanitizationInterceptor);

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
