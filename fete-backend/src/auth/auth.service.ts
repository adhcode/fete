import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { SignupDto, LoginDto, AuthResponse, JwtPayload } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    // Check if email already exists
    const existing = await this.prisma.organizer.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create organizer
    const organizer = await this.prisma.organizer.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Generate JWT
    const accessToken = this.generateToken(organizer.id, organizer.email);

    return {
      accessToken,
      organizer,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find organizer
    const organizer = await this.prisma.organizer.findUnique({
      where: { email: dto.email },
    });

    if (!organizer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(dto.password, organizer.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const accessToken = this.generateToken(organizer.id, organizer.email);

    return {
      accessToken,
      organizer: {
        id: organizer.id,
        email: organizer.email,
        name: organizer.name,
      },
    };
  }

  async getMe(organizerId: string) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { id: organizerId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!organizer) {
      throw new UnauthorizedException('Organizer not found');
    }

    return organizer;
  }

  private generateToken(organizerId: string, email: string): string {
    const payload: JwtPayload = {
      sub: organizerId,
      email,
    };

    return this.jwtService.sign(payload);
  }
}
