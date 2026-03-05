import { z } from 'zod';

export const SignupDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export type SignupDto = z.infer<typeof SignupDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export interface AuthResponse {
  accessToken: string;
  organizer: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface JwtPayload {
  sub: string; // organizer ID
  email: string;
  iat?: number;
  exp?: number;
}
