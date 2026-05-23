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

export async function getMyProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await service.getMyProducts(req.user!.userId);
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    let provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } });
    if (!provider) {
      if (req.user!.role !== 'CLIENT' && req.user!.role !== 'ADMIN') {
        provider = await prisma.provider.create({
          data: { userId: req.user!.userId, type: req.user!.role as any, profession: '', experienceYears: 0 }
        });
      } else {
        throw new AppError(403, 'Only providers can create products');
      }
    }
    const product = await service.createProviderProduct(provider.id, req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } });
    if (!provider) {
      throw new AppError(403, 'Only providers can update products');
    }
    const product = await service.updateProduct(req.params.id as string, provider.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } });
    if (!provider) {
      throw new AppError(403, 'Only providers can delete products');
    }
    await service.deleteProduct(req.params.id as string, provider.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
