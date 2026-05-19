import { prisma } from '../../config/db.js';
import { AppError, NotFoundError } from '../../shared/errors.js';
import { AuthPayload } from '../../middleware/auth.js';
import { logger } from '../../middleware/logger.js';
import { autoAssign } from '../assignment/assignment.engine.js';

const orderInclude = {
  client: { select: { id: true, fullName: true, commune: true, phone: true } },
  assignedProvider: { include: { user: { select: { id: true, fullName: true, commune: true } } } },
};

function mapOrder(order: any) {
  if (order && order.assignedProvider && order.assignedProvider.user) {
    order.assignedProvider.fullName = order.assignedProvider.user.fullName;
    order.assignedProvider.commune = order.assignedProvider.user.commune;
  }
  return order;
}

export async function list(user: AuthPayload) {
  let orders;
  if (user.role === 'ADMIN') {
    orders = await prisma.commande.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  } else {
    const provider = await prisma.provider.findUnique({ where: { userId: user.userId } });
    orders = await prisma.commande.findMany({
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
  return orders.map(mapOrder);
}

export async function create(user: AuthPayload, data: {
  type: string;
  baseAmount: number;
  description?: string;
  requestedProfession?: string;
  requestedProductType?: string;
  requestedServices?: string[];
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
      description: data.description || null,
      requestedProfession: data.requestedProfession || null,
      requestedProductType: data.requestedProductType || null,
      requestedServices: data.requestedServices || [],
    },
  });

  logger.info('Orders', 'Order created', { orderId: order.id, clientId: user.userId, type: data.type });

  // Get client commune for intelligent matching
  const client = await prisma.user.findUnique({ where: { id: user.userId }, select: { commune: true } });
  const clientCommune = client?.commune;

  const assigned = await autoAssign(order.id, data.type, data.requestedProfession, data.requestedProductType, clientCommune);

  const updated = await prisma.commande.findUnique({
    where: { id: order.id },
    include: orderInclude,
  });

  if (assigned) {
    logger.info('Orders', 'Order auto-assigned', { orderId: order.id, providerId: assigned });
  } else {
    logger.info('Orders', 'No auto-assign found, awaiting admin', { orderId: order.id });
  }

  return updated ? mapOrder(updated) : null;
}

export async function updateStatus(orderId: string, user: AuthPayload, newStatus: string) {
  const order = await prisma.commande.findUnique({ where: { id: orderId }, include: orderInclude });
  if (!order) throw new NotFoundError('Order');

  const validTransitions: Record<string, string[]> = {
    PENDING_ASSIGNMENT: ['CANCELLED'],
    PENDING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  const allowed = validTransitions[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(400, `Cannot transition from ${order.status} to ${newStatus}`);
  }

  // Permission checks
  if (newStatus === 'PAID' && order.clientId !== user.userId) {
    throw new AppError(403, 'Only the client can pay');
  }
  if (newStatus === 'COMPLETED') {
    const provider = await prisma.provider.findUnique({ where: { userId: user.userId } });
    if (!provider || provider.id !== order.assignedProviderId) {
      // Allow client or assigned provider to complete
      if (order.clientId !== user.userId) {
        throw new AppError(403, 'Not authorized to complete this order');
      }
    }
  }

  const updated = await prisma.commande.update({
    where: { id: orderId },
    data: { status: newStatus as never },
    include: orderInclude,
  });

  logger.info('Orders', `Order status updated to ${newStatus}`, { orderId, userId: user.userId });
  return mapOrder(updated);
}

export async function pay(orderId: string, user: AuthPayload) {
  return updateStatus(orderId, user, 'PAID');
}
