import { Request, Response, NextFunction } from 'express';
import * as service from './orders.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await service.list(req.user!);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await service.create(req.user!, req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function pay(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await service.pay(req.params.id as string, req.user!);
    res.json(order);
  } catch (err) {
    next(err);
  }
}
