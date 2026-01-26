import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Secure Backend API is running!',
      version: '2.0.0',
      features: [
        'Password Hashing (bcrypt)',
        'JWT Authentication',
        'Protected Routes',
        'Strict CORS Policy',
        'Clean Architecture',
        'NestJS with Express',
      ],
    };
  }

  @Get('api/health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
