import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InputSanitizerService } from '../sanitization/input-sanitizer.service';

@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  constructor(private readonly sanitizer: InputSanitizerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizer.sanitizeObject(request.body);
    }

    if (request.query && typeof request.query === 'object') {
      request.query = this.sanitizer.sanitizeObject(request.query);
    }

    if (request.params && typeof request.params === 'object') {
      request.params = this.sanitizer.sanitizeObject(request.params);
    }

    return next.handle();
  }
}
