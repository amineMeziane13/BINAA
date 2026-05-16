import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { AppError } from '../../shared/errors.js';
import * as service from './products.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.query.type as string | undefined;
    const products = await service.list(type);
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await service.getById(req.params.id as string);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } });
    if (!provider) throw new AppError(403, 'Only providers can create products');
    const product = await service.createProviderProduct(provider.id, req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}
