import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { SignupDto, AuthResponseDto } from '../../dto/auth.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { AuthDomainService } from '../../../domain/services/auth.domain.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly authDomainService: AuthDomainService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: SignupDto): Promise<AuthResponseDto> {
    this.authDomainService.validateUserData(dto.email, dto.password, dto.name);

    const exists = await this.userRepository.exists(dto.email);
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      name: dto.name,
    } as any);

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      success: true,
      message: 'User created successfully',
      user: user.toPublicJSON(),
      token,
    };
  }
}
