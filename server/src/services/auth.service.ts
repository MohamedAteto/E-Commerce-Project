import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { UserDTO, JwtUserPayload } from '../types/auth.js';
import { AppError } from '../types/api.js';
import { env } from '../config/env.js';
import { User } from '@prisma/client';

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  private mapToDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as 'CUSTOMER' | 'ADMIN',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateToken(payload: JwtUserPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  async register(input: RegisterInput): Promise<{ user: UserDTO; token: string }> {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const newUser = await this.userRepo.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'CUSTOMER',
    });

    const token = this.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as 'CUSTOMER' | 'ADMIN',
    });

    return {
      user: this.mapToDTO(newUser),
      token,
    };
  }

  async login(input: LoginInput): Promise<{ user: UserDTO; token: string }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    return {
      user: this.mapToDTO(user),
      token,
    };
  }

  async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
    }
    return this.mapToDTO(user);
  }
}

export const authService = new AuthService();
