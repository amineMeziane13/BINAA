import { prisma } from '../../config/db.js';
import { logger } from '../../middleware/logger.js';

interface ScoreResult {
  providerId: string;
  score: number;
  reasons: string[];
}

export async function autoAssign(
  orderId: string,
  type: string,
  requestedProfession?: string,
  requestedProductType?: string,
  clientCommune?: string
): Promise<string | null> {
  const order = await prisma.commande.findUnique({ where: { id: orderId }, select: { keywords: true } });
  const orderKeywords = order?.keywords || [];

  if (type === 'PRODUCT') {
    return assignForProduct(orderId, requestedProductType, clientCommune, orderKeywords);
  }
  if (type === 'ARTISAN_SERVICE') {
    return assignForArtisan(orderId, requestedProfession, clientCommune, orderKeywords);
  }
  return null;
}

async function assignForProduct(orderId: string, requestedProductType?: string, clientCommune?: string, orderKeywords: string[] = []): Promise<string | null> {
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

    // Rating score (0-30)
    const ratingScore = Math.min(p.rating / 5, 1) * 30;
    score += ratingScore;
    if (p.rating > 0) reasons.push(`rating:${p.rating.toFixed(1)}/5`);

    // Stock availability score (0-25)
    const inStockCount = p.products.filter((pr) => pr.stockQuantity > 0).length;
    const stockScore = Math.min(inStockCount / Math.max(providers.length, 1), 1) * 25;
    score += stockScore;
    if (inStockCount > 0) reasons.push(`stock:${inStockCount} items`);

    // Price competitiveness (0-20)
    const priceSum = p.products.reduce((sum, pr) => sum + pr.price, 0);
    const avgPrice = p.products.length > 0 ? priceSum / p.products.length : 0;
    const priceScore = avgPrice > 0 ? Math.min(50000 / avgPrice, 1) * 20 : 0;
    score += priceScore;
    if (avgPrice > 0) reasons.push(`avg_price:${avgPrice.toFixed(0)} DZD`);

    // Commune match bonus (0-25) - same commune gets big bonus
    if (clientCommune && p.user.commune) {
      if (p.user.commune.toLowerCase() === clientCommune.toLowerCase()) {
        score += 25;
        reasons.push('same_commune');
      } else {
        // Partial bonus for being in Oran wilaya
        score += 5;
        reasons.push('same_wilaya');
      }
    }

    // Keyword matching score (0-20)
    let keywordMatches = 0;
    if (orderKeywords.length > 0) {
      p.products.forEach(pr => {
        pr.keywords.forEach(kw => {
          if (orderKeywords.includes(kw)) keywordMatches++;
        });
      });
      const kwScore = Math.min(keywordMatches * 5, 20);
      score += kwScore;
      if (kwScore > 0) reasons.push(`keyword_match:${keywordMatches}`);
    }

    return { providerId: p.id, score: Math.min(score, 130), reasons };
  });

  return applyBestMatch(orderId, scored);
}

async function assignForArtisan(orderId: string, requestedProfession?: string, clientCommune?: string, orderKeywords: string[] = []): Promise<string | null> {
  const allProviders = await prisma.provider.findMany({
    where: {
      type: 'ARTISAN',
    },
    include: {
      user: { select: { id: true, fullName: true, commune: true } },
    },
  });

  const reqProfLower = requestedProfession?.toLowerCase() || '';
  // Simple stemming function for French BTP terms (e.g., renovateur <-> renovation -> renov)
  const getRoot = (word: string) => word.length >= 5 ? word.substring(0, 5) : word;
  const reqProfRoot = getRoot(reqProfLower);

  const providers = requestedProfession
    ? allProviders.filter(p => {
        const profs = [p.profession, ...(p.professions || []), ...(p.skills || [])]
          .filter(Boolean)
          .map(prof => prof!.toLowerCase());
        
        return profs.some(prof => 
          prof.includes(reqProfLower) || 
          reqProfLower.includes(prof) ||
          getRoot(prof) === reqProfRoot
        );
      })
    : allProviders;

  if (providers.length === 0) {
    logger.info('Assignment', 'No ARTISAN providers found', { orderId, requestedProfession });
    return null;
  }

  const scored = providers.map((p) => {
    const reasons: string[] = [];
    let score = 0;

    // Rating score (0-25)
    const ratingScore = Math.min(p.rating / 5, 1) * 25;
    score += ratingScore;
    if (p.rating > 0) reasons.push(`rating:${p.rating.toFixed(1)}/5`);

    // Experience score (0-20)
    const expScore = p.experienceYears
      ? Math.min(p.experienceYears / 20, 1) * 20
      : 0;
    score += expScore;
    if (p.experienceYears && p.experienceYears > 0) reasons.push(`exp:${p.experienceYears}yrs`);

    // Subscription bonus (0-15)
    const subScore = p.isSubscribed ? 15 : 0;
    score += subScore;
    if (p.isSubscribed) reasons.push('subscribed');

    // Skills match (0-15) - check if artisan has relevant skills
    if (requestedProfession && p.skills && p.skills.length > 0) {
      const hasMatchingSkill = p.skills.some(
        s => s.toLowerCase().includes(requestedProfession.toLowerCase())
      );
      if (hasMatchingSkill) {
        score += 15;
        reasons.push('skill_match');
      }
    }

    // Exact profession match (0-10)
    if (requestedProfession && (p.profession?.toLowerCase() === requestedProfession.toLowerCase() || p.professions?.some(prof => prof.toLowerCase() === requestedProfession.toLowerCase()))) {
      score += 10;
      reasons.push('exact_profession_match');
    }

    // Commune match bonus (0-25) - same commune gets big bonus
    if (clientCommune && p.user.commune) {
      if (p.user.commune.toLowerCase() === clientCommune.toLowerCase()) {
        score += 25;
        reasons.push('same_commune');
      } else {
        score += 5;
        reasons.push('same_wilaya');
      }
    }

    // Keyword matching score (0-20)
    let keywordMatches = 0;
    if (orderKeywords.length > 0) {
      const providerKeywords = new Set([
        ...(p.skills || []),
        p.profession || '',
        ...(p.professions || [])
      ].filter(Boolean).map(s => s.toLowerCase().trim()));

      orderKeywords.forEach(kw => {
        if (Array.from(providerKeywords).some(pkw => pkw.includes(kw))) keywordMatches++;
      });

      const kwScore = Math.min(keywordMatches * 5, 20);
      score += kwScore;
      if (kwScore > 0) reasons.push(`keyword_match:${keywordMatches}`);
    }

    return { providerId: p.id, score: Math.min(score, 140), reasons };
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
