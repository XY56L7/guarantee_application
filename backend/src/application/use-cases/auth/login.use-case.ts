import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { LoginDto, AuthResponseDto } from '../../dto/auth.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { AuthDomainService } from '../../../domain/services/auth.domain.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly authDomainService: AuthDomainService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    this.authDomainService.validateUserData(dto.email, dto.password);

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      success: true,
      message: 'Login successful',
      user: user.toPublicJSON(),
      token,
    };
  }
}
