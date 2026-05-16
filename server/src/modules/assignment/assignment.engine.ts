import { prisma } from '../../config/db.js';
import { logger } from '../../middleware/logger.js';

interface ScoreResult {
  providerId: string;
  score: number;
  reasons: string[];
}

export async function autoAssign(orderId: string, type: string, requestedProfession?: string, requestedProductType?: string): Promise<string | null> {
  if (type === 'PRODUCT') {
    return assignForProduct(orderId, requestedProductType);
  }
  if (type === 'ARTISAN_SERVICE') {
    return assignForArtisan(orderId, requestedProfession);
  }
  return null;
}

async function assignForProduct(orderId: string, requestedProductType?: string): Promise<string | null> {
  const providers = await prisma.provider.findMany({
    where: { type: 'FOURNISSEUR' },
    include: {
      user: { select: { id: true, fullName: true, commune: true } },
      products: {
        where: {
          ...(requestedProductType ? { type: requestedProductType as never } : {}),
          stockQuantity: { gt: 0 },
        },
      },
    },
  });

  if (providers.length === 0) {
    logger.info('Assignment', 'No FOURNISSEUR providers found', { orderId });
    return null;
  }

  const scored = providers.map((p) => {
    const reasons: string[] = [];
    let score = 0;

    const ratingScore = Math.min(p.rating / 5, 1) * 40;
    score += ratingScore;
    if (p.rating > 0) reasons.push(`rating:${p.rating.toFixed(1)}/5`);

    const inStockCount = p.products.filter((pr) => pr.stockQuantity > 0).length;
    const stockScore = Math.min(inStockCount / Math.max(providers.length, 1), 1) * 30;
    score += stockScore;
    if (inStockCount > 0) reasons.push(`stock:${inStockCount} items`);

    const priceSum = p.products.reduce((sum, pr) => sum + pr.price, 0);
    const avgPrice = p.products.length > 0 ? priceSum / p.products.length : 0;
    const priceScore = avgPrice > 0 ? Math.min(50000 / avgPrice, 1) * 30 : 0;
    score += priceScore;
    if (avgPrice > 0) reasons.push(`avg_price:${avgPrice.toFixed(0)} DZD`);

    return { providerId: p.id, score: Math.min(score, 100), reasons };
  });

  return applyBestMatch(orderId, scored);
}

async function assignForArtisan(orderId: string, requestedProfession?: string): Promise<string | null> {
  const whereProfession = requestedProfession
    ? { profession: { contains: requestedProfession, mode: 'insensitive' as const } }
    : {};

  const providers = await prisma.provider.findMany({
    where: {
      type: 'ARTISAN',
      isSubscribed: true,
      ...whereProfession,
    },
    include: {
      user: { select: { id: true, fullName: true, commune: true } },
    },
  });

  if (providers.length === 0) {
    logger.info('Assignment', 'No subscribed ARTISAN providers found', { orderId, requestedProfession });
    return null;
  }

  const scored = providers.map((p) => {
    const reasons: string[] = [];
    let score = 0;

    const ratingScore = Math.min(p.rating / 5, 1) * 40;
    score += ratingScore;
    if (p.rating > 0) reasons.push(`rating:${p.rating.toFixed(1)}/5`);

    const expScore = p.experienceYears
      ? Math.min(p.experienceYears / 20, 1) * 30
      : 0;
    score += expScore;
    if (p.experienceYears && p.experienceYears > 0) reasons.push(`exp:${p.experienceYears}yrs`);

    const subScore = p.isSubscribed ? 30 : 0;
    score += subScore;
    if (p.isSubscribed) reasons.push('subscribed');

    if (requestedProfession && p.profession?.toLowerCase() === requestedProfession.toLowerCase()) {
      score += 10;
      reasons.push('exact_profession_match');
    }

    return { providerId: p.id, score: Math.min(score, 110), reasons };
  });

  return applyBestMatch(orderId, scored);
}

async function applyBestMatch(orderId: string, scored: ScoreResult[]): Promise<string | null> {
  if (scored.length === 0) return null;

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  await prisma.commande.update({
    where: { id: orderId },
    data: { assignedProviderId: best.providerId, status: 'PENDING_PAYMENT' },
  });

  logger.info('Assignment', 'Auto-assigned provider', {
    orderId,
    providerId: best.providerId,
    score: best.score.toFixed(2),
    reasons: best.reasons.join(', '),
  });

  return best.providerId;
}
