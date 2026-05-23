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

export async function cancelOrder(orderId: string) {
  const order = await prisma.commande.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order');

  const updated = await prisma.commande.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  });

  logger.info('Admin', 'Order cancelled by admin', { orderId });
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

  // Use a transaction to cleanly remove all related records
  await prisma.$transaction(async (tx) => {
    // Remove reviews written by this user
    await tx.review.deleteMany({ where: { clientId: id } });

    // If user is a provider, remove reviews targeting them and their products
    const provider = await tx.provider.findUnique({ where: { userId: id } });
    if (provider) {
      await tx.review.deleteMany({ where: { targetProviderId: provider.id } });
      await tx.product.deleteMany({ where: { providerId: provider.id } });
      // Unassign orders assigned to this provider
      await tx.commande.updateMany({
        where: { assignedProviderId: provider.id },
        data: { assignedProviderId: null, status: 'PENDING_ASSIGNMENT' },
      });
      await tx.provider.delete({ where: { id: provider.id } });
    }

    // Delete orders placed by this user (as a client)
    await tx.commande.deleteMany({ where: { clientId: id } });

    // Finally delete the user
    await tx.user.delete({ where: { id } });
  });

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

export async function getReports() {
  const [users, orders, settings] = await Promise.all([
    prisma.user.findMany({ select: { role: true } }),
    prisma.commande.findMany({
      select: {
        id: true,
        status: true,
        totalAmount: true,
        baseAmount: true,
        commissionRate: true,
        createdAt: true,
        type: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.platformSetting.findUnique({ where: { key: 'COMMISSION_RATE' } })
  ]);

  const commissionRate = settings ? parseFloat(settings.value) : 0.1;

  const userStats = {
    total: users.length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    artisans: users.filter(u => u.role === 'ARTISAN').length,
    fournisseurs: users.filter(u => u.role === 'FOURNISSEUR').length,
  };

  let totalRevenue = 0;
  let totalCommissionEarned = 0;
  const ordersByStatus: Record<string, number> = {};

  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      const amount = order.totalAmount || 0;
      totalRevenue += amount;
      
      const commRate = order.commissionRate ?? commissionRate;
      const base = order.baseAmount || 0;
      // Depending on how totalAmount is calculated (base * (1 + rate)), commission = totalAmount - base
      const commEarned = amount - base;
      totalCommissionEarned += commEarned > 0 ? commEarned : 0;
    }
  }

  const recentOperations = orders.slice(0, 20);

  return {
    financials: {
      totalRevenue,
      totalCommissionEarned,
      currentCommissionRate: commissionRate,
    },
    operations: {
      totalOrders: orders.length,
      ordersByStatus,
    },
    users: userStats,
    recentOperations
  };
}
