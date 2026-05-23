import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../shared/errors.js';
import { logger } from '../../middleware/logger.js';

export async function list() {
  return prisma.provider.findMany({
    where: { type: 'ARTISAN' },
    include: {
      user: { select: { id: true, fullName: true, phone: true, commune: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getById(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      user: { select: { id: true, fullName: true, phone: true, commune: true } },
      reviews: {
        select: { score: true, comment: true, createdAt: true, client: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!provider || provider.type !== 'ARTISAN') {
    throw new NotFoundError('Artisan');
  }

  return provider;
}

export async function getProviderByUserId(userId: string) {
  const provider = await prisma.provider.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, fullName: true, phone: true, commune: true } },
    },
  });
  if (!provider) throw new NotFoundError('Provider profile');
  return provider;
}

export async function updateProfile(userId: string, data: {
  profession?: string;
  professions?: string[];
  experienceYears?: number;
  skills?: string[];
  photos?: string[];
  phone?: string;
  commune?: string;
}) {
  const existing = await prisma.provider.findUnique({ where: { userId } });
  if (!existing) throw new NotFoundError('Provider profile');

  return prisma.provider.update({
    where: { userId },
    data: {
      ...(data.profession !== undefined && { profession: data.profession }),
      ...(data.professions !== undefined && { professions: data.professions }),
      ...(data.experienceYears !== undefined && { experienceYears: data.experienceYears }),
      ...(data.skills !== undefined && { skills: data.skills }),
      ...(data.photos !== undefined && { photos: data.photos }),
      ...((data.phone !== undefined || data.commune !== undefined) && {
        user: {
          update: {
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.commune !== undefined && { commune: data.commune }),
          },
        },
      }),
    },
    include: {
      user: { select: { id: true, fullName: true, phone: true, commune: true } },
    },
  });
}

export async function subscribe(providerId: string, data: { plan: 'monthly' | 'quarterly' }) {
  const profile = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!profile) throw new NotFoundError('Provider profile');

  const now = new Date();
  const months = data.plan === 'monthly' ? 1 : 3;
  const expiry = new Date(now.setMonth(now.getMonth() + months));

  const updated = await prisma.provider.update({
    where: { id: providerId },
    data: { isSubscribed: true, subscriptionExpiry: expiry },
  });

  logger.info('Artisan', 'Subscription activated', { providerId, plan: data.plan, expiry });
  return updated;
}
