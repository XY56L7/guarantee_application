import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { UserResponseDto } from '../../dto/user.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.toPublicJSON();
  }
}
