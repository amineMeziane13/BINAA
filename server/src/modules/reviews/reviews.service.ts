import { prisma } from '../../config/db.js';
import { AppError, NotFoundError } from '../../shared/errors.js';
import { AuthPayload } from '../../middleware/auth.js';
import { logger } from '../../middleware/logger.js';

export async function getForTarget(targetProviderId: string) {
  return prisma.review.findMany({
    where: { targetProviderId },
    select: {
      id: true, score: true, comment: true, createdAt: true,
      client: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(user: AuthPayload, data: { targetProviderId: string; score: number; comment?: string }) {
  if (user.role !== 'CLIENT') {
    throw new AppError(403, 'Only clients can create reviews');
  }
  if (data.score < 1 || data.score > 5) {
    throw new AppError(400, 'Score must be between 1 and 5');
  }

  const provider = await prisma.provider.findUnique({ where: { id: data.targetProviderId } });
  if (!provider) {
    throw new AppError(400, 'Provider not found');
  }

  const existing = await prisma.review.findUnique({
    where: { clientId_targetProviderId: { clientId: user.userId, targetProviderId: data.targetProviderId } },
  });
  if (existing) {
    throw new AppError(409, 'You have already reviewed this provider');
  }

  const review = await prisma.review.create({
    data: { clientId: user.userId, targetProviderId: data.targetProviderId, score: data.score, comment: data.comment },
  });

  const agg = await prisma.review.aggregate({
    where: { targetProviderId: data.targetProviderId },
    _avg: { score: true },
  });

  await prisma.provider.update({
    where: { id: data.targetProviderId },
    data: { rating: agg._avg.score ?? 0 },
  });

  logger.info('Reviews', 'Review created', { clientId: user.userId, targetProviderId: data.targetProviderId, score: data.score });
  return review;
}
