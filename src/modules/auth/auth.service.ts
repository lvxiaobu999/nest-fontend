import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SafeUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

export interface LoginResponse {
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.validateLogin(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return { user };
  }
}
