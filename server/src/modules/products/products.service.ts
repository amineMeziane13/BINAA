import { prisma } from '../../config/db.js';
import { NotFoundError, AppError } from '../../shared/errors.js';

const providerInclude = { provider: { include: { user: { select: { id: true, fullName: true, commune: true } } } } };

export async function list(type?: string, providerId?: string) {
  const where: any = {};
  if (type) where.type = type;
  if (providerId) where.providerId = providerId;

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

export async function getMyProducts(userId: string) {
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw new NotFoundError('Provider profile');

  return prisma.product.findMany({
    where: { providerId: provider.id },
    include: providerInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProviderProduct(providerId: string, data: {
  title: string; description?: string; price: number;
  stockQuantity?: number; type: string; photos?: string[];
}) {
  if (!['MATERIAL', 'EQUIPMENT', 'SERVICE'].includes(data.type)) {
    throw new AppError(400, 'Type must be MATERIAL, EQUIPMENT or SERVICE');
  }
  return prisma.product.create({
    data: {
      title: data.title,
      description: data.description || '',
      price: data.price,
      stockQuantity: data.stockQuantity ?? 0,
      type: data.type as never,
      photos: data.photos || [],
      providerId,
    },
    include: providerInclude,
  });
}
