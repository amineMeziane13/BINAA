import { prisma } from '../../config/db.js';
import { AppError, NotFoundError } from '../../shared/errors.js';
import { logger } from '../../middleware/logger.js';

export async function assignOrder(orderId: string, providerId: string) {
  const order = await prisma.commande.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order');
  if (order.status !== 'PENDING_ASSIGNMENT') {
    throw new AppError(400, 'Order is not pending assignment');
  }

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    throw new AppError(400, 'Provider not found');
  }

  const updated = await prisma.commande.update({
    where: { id: orderId },
    data: { assignedProviderId: providerId, status: 'PENDING_PAYMENT' },
  });

  logger.info('Admin', 'Order assigned', { orderId, providerId });
  return updated;
}

export async function setCommission(rate: number) {
  if (rate < 0 || rate > 1) {
    throw new AppError(400, 'Commission rate must be between 0 and 1');
  }

  const setting = await prisma.platformSetting.upsert({
    where: { key: 'COMMISSION_RATE' },
    create: { key: 'COMMISSION_RATE', value: rate.toString() },
    update: { value: rate.toString() },
  });

  logger.info('Admin', 'Commission rate updated', { rate });
  return setting;
}

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      phone: true,
      commune: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');

  await prisma.user.delete({ where: { id } });
  logger.info('Admin', 'User account deleted by admin', { userId: id });
}

export async function listSettings() {
  return prisma.platformSetting.findMany();
}

export async function updateSetting(key: string, value: any) {
  const valStr = String(value);
  const setting = await prisma.platformSetting.upsert({
    where: { key },
    create: { key, value: valStr },
    update: { value: valStr },
  });
  logger.info('Admin', 'Platform setting updated', { key, value: valStr });
  return setting;
}
