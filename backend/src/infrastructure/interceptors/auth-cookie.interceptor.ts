import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('strict' as const) : ('lax' as const),
      path: '/',
    };

    return next.handle().pipe(
      map((data: any) => {
        if (data && typeof data === 'object') {
          if (data.accessToken) {
            response.cookie(ACCESS_TOKEN_COOKIE, data.accessToken, {
              ...cookieOptions,
              maxAge: ACCESS_MAX_AGE * 1000,
            });
          }
          if (data.refreshToken) {
            response.cookie(REFRESH_TOKEN_COOKIE, data.refreshToken, {
              ...cookieOptions,
              maxAge: REFRESH_MAX_AGE * 1000,
            });
          }
        }
        return data;
      }),
    );
  }
}

export function clearAuthCookies(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const opts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('strict' as const) : ('lax' as const),
    path: '/',
    maxAge: 0,
  };
  res.cookie(ACCESS_TOKEN_COOKIE, '', opts);
  res.cookie(REFRESH_TOKEN_COOKIE, '', opts);
}

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };
