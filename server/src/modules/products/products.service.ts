import { prisma } from '../../config/db.js';
import { NotFoundError, AppError } from '../../shared/errors.js';

const providerInclude = { provider: { include: { user: { select: { id: true, fullName: true } } } } };

export async function list(type?: string) {
  const where = type ? { type: type as never } : {};
  return prisma.product.findMany({
    where,
    include: providerInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: providerInclude,
  });
  if (!product) throw new NotFoundError('Product');
  return product;
}

export async function createProviderProduct(providerId: string, data: {
  title: string; description: string; price: number;
  stockQuantity: number; type: string;
}) {
  if (!['MATERIAL', 'EQUIPMENT'].includes(data.type)) {
    throw new AppError(400, 'Type must be MATERIAL or EQUIPMENT');
  }
  return prisma.product.create({
    data: { ...data, providerId, type: data.type as never },
  });
}

export async function create(providerId: string, data: {
  title: string; description: string; price: number;
  stockQuantity: number; type: string;
}) {
  if (!['MATERIAL', 'EQUIPMENT'].includes(data.type)) {
    throw new AppError(400, 'Type must be MATERIAL or EQUIPMENT');
  }
  return prisma.product.create({
    data: { ...data, providerId, type: data.type as never },
  });
}
