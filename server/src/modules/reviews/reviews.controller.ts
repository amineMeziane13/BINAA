import { Request, Response, NextFunction } from 'express';
import * as service from './reviews.service.js';

export async function getForTarget(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await service.getForTarget(req.params.targetProviderId as string);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await service.create(req.user!, req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}
