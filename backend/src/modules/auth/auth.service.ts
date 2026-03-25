import bcrypt from 'bcrypt';
import { prisma } from '../../db/client';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import { config } from '../../config';
import type { SignupInput, LoginInput } from './auth.schema';

export async function signup(data: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await bcrypt.hash(data.password, config.bcryptRounds);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
    },
    select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
  });

  const token = signToken({ id: user.id, email: user.email });
  return { token, user };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken({ id: user.id, email: user.email });
  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
}
