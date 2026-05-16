import { prisma } from '../../config/db.js';
import { AppError, NotFoundError } from '../../shared/errors.js';
import { AuthPayload } from '../../middleware/auth.js';
import { logger } from '../../middleware/logger.js';
import { autoAssign } from '../assignment/assignment.engine.js';

const orderInclude = {
  client: { select: { id: true, fullName: true } },
  assignedProvider: { include: { user: { select: { id: true, fullName: true } } } },
};

export async function list(user: AuthPayload) {
  if (user.role === 'ADMIN') {
    return prisma.commande.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  const provider = await prisma.provider.findUnique({ where: { userId: user.userId } });

  return prisma.commande.findMany({
    where: {
      OR: [
        { clientId: user.userId },
        ...(provider ? [{ assignedProviderId: provider.id }] : []),
      ],
    },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(user: AuthPayload, data: {
  type: string; baseAmount: number;
  requestedProfession?: string;
  requestedProductType?: string;
}) {
  if (user.role !== 'CLIENT') {
    throw new AppError(403, 'Only clients can create orders');
  }

  const validTypes = ['PRODUCT', 'ARTISAN_SERVICE'];
  if (!validTypes.includes(data.type)) {
    throw new AppError(400, 'Type must be PRODUCT or ARTISAN_SERVICE');
  }

  const setting = await prisma.platformSetting.findUnique({ where: { key: 'COMMISSION_RATE' } });
  const commissionRate = setting ? parseFloat(setting.value) : 0.1;
  const totalAmount = data.baseAmount * (1 + commissionRate);

  const order = await prisma.commande.create({
    data: {
      clientId: user.userId,
      type: data.type as never,
      baseAmount: data.baseAmount,
      commissionRate,
      totalAmount,
      status: 'PENDING_ASSIGNMENT',
    },
  });

  logger.info('Orders', 'Order created', { orderId: order.id, clientId: user.userId, type: data.type });

  const assigned = await autoAssign(order.id, data.type, data.requestedProfession, data.requestedProductType);

  const updated = await prisma.commande.findUnique({
    where: { id: order.id },
    include: orderInclude,
  });

  if (assigned) {
    logger.info('Orders', 'Order auto-assigned', { orderId: order.id, providerId: assigned });
  } else {
    logger.info('Orders', 'No auto-assign found, awaiting admin', { orderId: order.id });
  }

  return updated;
}

export async function pay(orderId: string, user: AuthPayload) {
  const order = await prisma.commande.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order');
  if (order.clientId !== user.userId) throw new AppError(403, 'Not your order');
  if (order.status !== 'PENDING_PAYMENT') throw new AppError(400, 'Order is not awaiting payment');

  const updated = await prisma.commande.update({
    where: { id: orderId },
    data: { status: 'PAID' },
  });

  logger.info('Orders', 'Order paid', { orderId, clientId: user.userId });
  return updated;
}
