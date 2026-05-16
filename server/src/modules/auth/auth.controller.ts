import { Request, Response, NextFunction } from 'express';
import * as service from './auth.service.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, role, fullName, phone, commune } = req.body;
    const result = await service.register({ email, password, role, fullName, phone, commune });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await service.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
