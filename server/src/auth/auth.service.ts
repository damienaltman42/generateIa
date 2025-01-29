import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Partial<User>): Promise<{access_token: string, user: Partial<User>}>{
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
      },
    };
  }

  async register(userData: Partial<User>) {
    const user = await this.usersService.create(userData);
    const { ...result } = user;
    return this.login(result);
  }
}