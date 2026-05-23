import { prisma } from '../../config/db.js';
import { NotFoundError, AppError } from '../../shared/errors.js';
import { extractKeywords } from '../../shared/keywords.js';

const providerInclude = { provider: { include: { user: { select: { id: true, fullName: true, commune: true } } } } };

function mapProduct(product: any) {
  if (product && product.provider && product.provider.user) {
    product.provider.fullName = product.provider.user.fullName;
    product.provider.commune = product.provider.user.commune;
  }
  return product;
}

export async function list(type?: string, providerId?: string) {
  const where: any = {};
  if (type) where.type = type;
  if (providerId) where.providerId = providerId;

  const products = await prisma.product.findMany({
    where,
    include: providerInclude,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(mapProduct);
}

export async function getById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: providerInclude,
  });
  if (!product) throw new NotFoundError('Product');
  return mapProduct(product);
}

export async function getMyProducts(userId: string) {
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw new NotFoundError('Provider profile');

  const products = await prisma.product.findMany({
    where: { providerId: provider.id },
    include: providerInclude,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(mapProduct);
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
      keywords: extractKeywords(`${data.title} ${data.description || ''}`),
    },
    include: providerInclude,
  });
}

export async function updateProduct(id: string, providerId: string, data: {
  title?: string; description?: string; price?: number;
  stockQuantity?: number; type?: string; photos?: string[];
}) {
  const existingProduct = await prisma.product.findFirst({
    where: { id, providerId },
  });

  if (!existingProduct) {
    throw new NotFoundError('Product');
  }

  const newTitle = data.title ?? existingProduct.title;
  const newDescription = data.description ?? existingProduct.description;

  return prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      type: data.type as never,
      photos: data.photos,
      keywords: extractKeywords(`${newTitle} ${newDescription}`),
    },
    include: providerInclude,
  });
}

export async function deleteProduct(id: string, providerId: string) {
  const existingProduct = await prisma.product.findFirst({
    where: { id, providerId },
  });

  if (!existingProduct) {
    throw new NotFoundError('Product');
  }

  return prisma.product.delete({
    where: { id },
  });
}
