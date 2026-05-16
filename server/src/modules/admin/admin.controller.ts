import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import * as service from './admin.service.js';

export async function listProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const providers = await prisma.provider.findMany({
      include: { user: { select: { id: true, fullName: true, commune: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(providers);
  } catch (err) {
    next(err);
  }
}

export async function assignOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await service.assignOrder(req.params.id as string, req.body.providerId);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function setCommission(req: Request, res: Response, next: NextFunction) {
  try {
    const setting = await service.setCommission(req.body.rate);
    res.json(setting);
  } catch (err) {
    next(err);
  }
}
