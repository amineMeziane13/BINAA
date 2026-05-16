import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors.js';
import { ORAN_COMMUNES } from '../../shared/types.js';
import { logger } from '../../middleware/logger.js';

interface RegisterInput {
  email: string;
  password: string;
  role: string;
  fullName: string;
  phone: string;
  commune: string;
}

export async function register(input: RegisterInput) {
  const { email, password, role, fullName, phone, commune } = input;

  if (!ORAN_COMMUNES.includes(commune as never)) {
    throw new AppError(400, 'Invalid commune. Must be one of the 26 communes of Oran.');
  }

  const validRoles = ['CLIENT', 'FOURNISSEUR', 'ARTISAN'];
  if (!validRoles.includes(role)) {
    throw new AppError(400, 'Role must be CLIENT, FOURNISSEUR, or ARTISAN');
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new AppError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role as never,
      fullName,
      phone,
      commune,
    },
  });

  if (role === 'FOURNISSEUR' || role === 'ARTISAN') {
    await prisma.provider.create({
      data: { userId: user.id, type: role as never, profession: '', experienceYears: 0 },
    });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  logger.info('Auth', 'User registered', { userId: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  logger.info('Auth', 'User logged in', { userId: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
  };
}
