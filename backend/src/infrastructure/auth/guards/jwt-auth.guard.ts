import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { SecurityLogger } from '../../logging/security.logger';
import { TokenBlacklistService } from '../token-blacklist.service';
import { ACCESS_TOKEN_COOKIE } from '../../interceptors/auth-cookie.interceptor';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private securityLogger: SecurityLogger,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const tokenFromCookie = request.cookies?.[ACCESS_TOKEN_COOKIE];

    const token =
      tokenFromCookie || (authHeader ? authHeader.split(' ')[1] : null);

    if (!token) {
      this.securityLogger.logTokenValidationFailure(
        '',
        tokenFromCookie
          ? 'No token in cookie'
          : 'No authorization header or cookie',
      );
      throw new UnauthorizedException('Access denied. No token provided.');
    }

    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      this.securityLogger.logTokenValidationFailure(token, 'Token blacklisted');
      throw new UnauthorizedException('Token has been revoked.');
    }

    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'access') {
        this.securityLogger.logTokenValidationFailure(
          token,
          'Invalid token type',
        );
        throw new UnauthorizedException('Invalid token type.');
      }

      request.user = decoded;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        this.securityLogger.logTokenValidationFailure(token, 'Token expired');
        throw new UnauthorizedException(
          'Token expired. Please refresh your token.',
        );
      }
      this.securityLogger.logTokenValidationFailure(token, 'Invalid token');
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
