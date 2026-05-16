import { Request, Response, NextFunction } from 'express';
import * as service from './artisans.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const artisans = await service.list();
    res.json(artisans);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const artisan = await service.getById(req.params.id as string);
    res.json(artisan);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await service.updateProfile(req.user!.userId, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const provider = await service.getProviderByUserId(req.user!.userId);
    const result = await service.subscribe(provider.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
