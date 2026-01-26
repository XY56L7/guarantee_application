import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { UpdateProfileDto, UserResponseDto } from '../../dto/user.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { AuthDomainService } from '../../../domain/services/auth.domain.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly authDomainService: AuthDomainService,
  ) {}

  async execute(userId: number, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updates: any = {};

    if (dto.name) {
      updates.name = dto.name;
    }

    if (dto.password) {
      if (!this.authDomainService.validatePassword(dto.password)) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }
      updates.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.userRepository.update(userId, updates);
    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }

    return updatedUser.toPublicJSON();
  }
}
